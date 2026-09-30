const Prescription = require('../models/Prescription');
const AIProcessingLog = require('../models/AIProcessingLog');
const { prescriptionExtractionPrompt } = require('../prompts/prescription.prompt');
const { createAuditLog } = require('../utils/audit');
const { generateJSON, getProvider } = require('../config/ai');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validateExtractedMedicine = (medicine) => {
  const errors = [];
  if (!medicine.name || typeof medicine.name !== 'string') errors.push('Medicine name is required');
  if (medicine.confidence !== undefined) {
    const conf = Number(medicine.confidence);
    if (isNaN(conf) || conf < 0 || conf > 100) { errors.push('Confidence must be between 0 and 100'); medicine.confidence = 50; }
  }
  return errors;
};

exports.extract = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) return res.status(400).json({ success: false, message: 'Prescription ID required' });
    const prescription = await Prescription.findOne({ _id: prescriptionId, clinicId: req.user.clinicId });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (!prescription.ocr?.rawText) return res.status(400).json({ success: false, message: 'OCR text not available. Process OCR first.' });

    const provider = getProvider();
    if (provider === 'none') return res.status(503).json({ success: false, message: 'AI service not configured. Set GROQ_API_KEY in server/.env (or GEMINI_API_KEY)' });

    prescription.processingStatus = 'AI_PROCESSING';
    await prescription.save();

    const aiLog = await AIProcessingLog.findOne({ prescriptionId: prescription._id }).sort('-createdAt');
    if (aiLog) { aiLog.aiStartedAt = new Date(); await aiLog.save(); }

    let lastError = null;
    let parsed = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const extractionStarted = Date.now();
        const prompt = prescriptionExtractionPrompt(prescription.ocr.rawText);
        parsed = await generateJSON(prompt, { temperature: 0.1, maxTokens: 3000 });

        if (!parsed.medicines || !Array.isArray(parsed.medicines)) throw new Error('Invalid AI response: medicines array missing');
        for (const m of parsed.medicines) {
          const medErrors = validateExtractedMedicine(m);
          if (medErrors.length) console.warn('Medicine validation warnings:', medErrors);
        }

        prescription.ai = {
          correctedText: parsed.corrected_text || prescription.ocr.rawText,
          summary: parsed.summary || '',
          medicines: (parsed.medicines || []).map((m) => ({
            name: m.name || '', dosage: m.dosage || '', frequency: m.frequency || '', duration: m.duration || '',
            confidence: Math.min(100, Math.max(0, Number(m.confidence) || 50)), sourceText: m.source_text || '',
          })),
          importantFindings: parsed.important_findings || [],
          tags: parsed.tags || [],
          extractionTime: Date.now() - extractionStarted,
          rawResponse: JSON.stringify(parsed),
          provider,
        };
        prescription.processingStatus = 'NEEDS_REVIEW';
        prescription.addRevision('AI_EXTRACTED', req.user._id, { summary: prescription.ai.summary, medicinesCount: prescription.ai.medicines.length, tags: prescription.ai.tags, provider }, ['ai', 'processingStatus']);

        if (aiLog) {
          aiLog.aiCompletedAt = new Date();
          aiLog.aiProcessingTime = aiLog.aiCompletedAt - aiLog.aiStartedAt;
          aiLog.aiConfidence = parsed.medicines?.length ? parsed.medicines.reduce((acc, m) => acc + (Number(m.confidence) || 50), 0) / parsed.medicines.length : 50;
          aiLog.fieldsExtracted = parsed.medicines?.length || 0;
          aiLog.aiRawResponse = JSON.stringify(parsed);
          aiLog.totalProcessingTime = (aiLog.ocrProcessingTime || 0) + aiLog.aiProcessingTime;
          await aiLog.save();
        }
        await prescription.save();
        await createAuditLog({ userId: req.user._id, clinicId: req.user.clinicId, action: 'AI_EXTRACT', entity: 'Prescription', entityId: prescription._id, newValue: { medicinesCount: prescription.ai.medicines.length, attempt, provider } });
        return res.json({ success: true, message: `AI extraction completed via ${provider}`, data: { prescriptionId: prescription._id, summary: prescription.ai.summary, medicines: prescription.ai.medicines, importantFindings: prescription.ai.importantFindings, tags: prescription.ai.tags, provider } });
      } catch (aiError) {
        lastError = aiError;
        console.error(`AI extraction attempt ${attempt} failed [${provider}]:`, aiError.message);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
      }
    }

    prescription.processingStatus = 'PROCESSING_FAILED';
    if (aiLog) { aiLog.status = 'FAILED'; aiLog.error = `All ${MAX_RETRIES} attempts failed. Last error: ${lastError?.message}`; aiLog.errorStage = 'AI'; await aiLog.save(); }
    await prescription.save();
    await createAuditLog({ userId: req.user._id, clinicId: req.user.clinicId, action: 'AI_EXTRACT_FAILED', entity: 'Prescription', entityId: prescription._id, newValue: { error: lastError?.message, attempts: MAX_RETRIES } });
    const status = lastError?.message?.includes('GROQ_INVALID_KEY') || lastError?.message?.toLowerCase().includes('invalid api key') ? 503 : 500;
    const msg = status === 503 ? lastError.message.replace('GROQ_INVALID_KEY: ', '') : 'AI extraction failed after multiple attempts';
    res.status(status).json({ success: false, message: msg, data: { error: lastError?.message, canRetry: status !== 503 } });
  } catch (error) {
    if (error.message && error.message.startsWith('GROQ_INVALID_KEY')) return res.status(503).json({ success: false, message: error.message.replace('GROQ_INVALID_KEY: ', '') });
    next(error);
  }
};

exports.validateExtraction = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    const prescription = await Prescription.findOne({ _id: prescriptionId, clinicId: req.user.clinicId });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    const validation = { valid: true, uncertainMedicines: [], missingFields: [], lowConfidenceFields: [] };
    if (prescription.ai?.medicines) {
      prescription.ai.medicines.forEach((m, i) => {
        if (!m.name || m.name.startsWith('Possibly')) validation.uncertainMedicines.push({ index: i, name: m.name });
        if (!m.dosage && !m.frequency && !m.duration) validation.missingFields.push({ index: i, name: m.name, fields: ['dosage', 'frequency', 'duration'] });
        if (m.confidence < 50) validation.lowConfidenceFields.push({ index: i, name: m.name, confidence: m.confidence });
      });
    }
    validation.valid = validation.uncertainMedicines.length === 0 && validation.missingFields.length === 0 && validation.lowConfidenceFields.length === 0;
    res.json({ success: true, data: validation });
  } catch (error) { next(error); }
};
