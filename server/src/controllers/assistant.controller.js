const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const FollowUp = require('../models/FollowUp');
const { assistantPrompt } = require('../prompts/assistant.prompt');
const { createAuditLog } = require('../utils/audit');
const { generateText, getProvider } = require('../config/ai');

exports.ask = async (req, res, next) => {
  try {
    const { query, message, prompt, question, patientId } = req.body;
    const normalizedQuery = query || message || prompt || question;
    if (!normalizedQuery || typeof normalizedQuery !== 'string' || !normalizedQuery.trim()) return res.status(400).json({ success: false, message: 'Query is required' });
    if (normalizedQuery.trim().length < 2) return res.status(400).json({ success: false, message: 'Query too short (min 2 chars)' });
    if (normalizedQuery.trim().length > 2000) return res.status(400).json({ success: false, message: 'Query too long (max 2000 chars)' });
    const finalQuery = normalizedQuery.trim();
    if (!patientId) return res.status(400).json({ success: false, message: 'Patient selection is required. Please select a patient first.' });
    if (!req.user.clinicId) return res.status(400).json({ success: false, message: 'No clinic associated with this account. Please contact admin.' });

    const patient = await Patient.findOne({ _id: patientId, clinicId: req.user.clinicId });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found in this clinic.' });

    const [prescriptions, medicines, followUps] = await Promise.all([
      Prescription.find({ patientId: patient._id, clinicId: req.user.clinicId, processingStatus: 'APPROVED' }).populate('doctorId', 'name').sort('-prescriptionDate').limit(10),
      Medicine.find({ patientId: patient._id, clinicId: req.user.clinicId }).populate('prescriptionId', 'prescriptionDate').sort('-createdAt').limit(50),
      FollowUp.find({ patientId: patient._id, clinicId: req.user.clinicId }).sort('-date').limit(10),
    ]);

    if (!prescriptions.length && !medicines.length && !followUps.length) {
      return res.json({ success: true, data: { answer: `No records found for ${patient.name}. Please ensure prescriptions have been processed and approved.`, sources: [] } });
    }

    const provider = getProvider();
    if (provider === 'none') {
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          success: true,
          data: {
            answer: `[Demo mode — No AI key configured]\n\nYour question: "${finalQuery}"\n\nPatient: ${patient.name} (${patient.age || 'N/A'}y, ${patient.gender || 'N/A'})\nPrescriptions (APPROVED): ${prescriptions.length}\nMedicines tracked: ${medicines.length}\nFollow-ups: ${followUps.length}\n\nSet GROQ_API_KEY (or GEMINI_API_KEY) in server/.env and restart server for live AI.\nCurrent prescriptions:\n${prescriptions.map((p) => `- ${p.prescriptionDate?.toISOString().slice(0, 10)} | ${p.ai?.summary || 'No summary'} | Meds: ${(p.ai?.medicines || []).map((m) => m.name).join(', ') || 'none'}`).join('\n')}`,
            sources: [
              ...prescriptions.map((p) => ({ type: 'PRESCRIPTION', id: p._id, date: p.prescriptionDate, doctor: p.doctorId?.name, summary: p.ai?.summary })),
              ...followUps.map((f) => ({ type: 'FOLLOW_UP', id: f._id, date: f.date, status: f.status, reason: f.reason })),
            ],
            patient: { id: patient._id, name: patient.name },
            demoMode: true,
            provider: 'none',
          },
        });
      }
      return res.status(503).json({ success: false, message: 'AI service not configured. Set GROQ_API_KEY in server/.env' });
    }

    const context = prescriptions.map((p) => ({
      date: p.prescriptionDate,
      doctor: p.doctorId?.name,
      summary: p.ai?.summary || '',
      medicines: p.ai?.medicines || [],
      findings: p.ai?.importantFindings || [],
      tags: p.ai?.tags || [],
      notes: p.doctorNotes || '',
    }));
    const medicineHistory = medicines.map((m) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration, date: m.prescriptionId?.prescriptionDate || m.createdAt }));
    const followUpHistory = followUps.map((f) => ({ date: f.date, reason: f.reason, notes: f.notes, status: f.status }));

    const aiPrompt = assistantPrompt(finalQuery, patient, context, medicineHistory, followUpHistory);
    const answerRaw = await generateText(aiPrompt, { temperature: 0.2, maxTokens: 2048 });
    const answer = answerRaw.replace(/```/g, '').trim();
    if (!answer) throw new Error('Groq returned empty response');

    const sources = [
      ...prescriptions.map((p) => ({ type: 'PRESCRIPTION', id: p._id, date: p.prescriptionDate, doctor: p.doctorId?.name, summary: p.ai?.summary })),
      ...followUps.map((f) => ({ type: 'FOLLOW_UP', id: f._id, date: f.date, status: f.status, reason: f.reason })),
    ];

    await createAuditLog({ userId: req.user._id, clinicId: req.user.clinicId, action: 'ASSISTANT_QUERY', entity: 'Patient', entityId: patient._id, newValue: { query: finalQuery.substring(0, 200), sourcesCount: sources.length, provider } });

    res.json({ success: true, data: { answer, sources, patient: { id: patient._id, name: patient.name }, provider } });
  } catch (error) {
    console.error('[Assistant] ask failed:', error.message, error.stack?.split('\n')[0]);
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid patient ID format' });
    if (error.message === 'NO_AI_KEY') return res.status(503).json({ success: false, message: 'AI not configured. Set GROQ_API_KEY in server/.env' });
    if (error.message && error.message.startsWith('GROQ_INVALID_KEY')) return res.status(503).json({ success: false, message: error.message.replace('GROQ_INVALID_KEY: ', '') });
    if (error.message && error.message.toLowerCase().includes('invalid api key')) return res.status(503).json({ success: false, message: 'Groq API key invalid — get new key at https://console.groq.com/keys' });
    if (error.statusCode === 429) return res.status(429).json({ success: false, message: 'AI rate limited — please try again shortly' });
    if (error.statusCode === 502 || (error.message && error.message.includes('Groq service error'))) return res.status(502).json({ success: false, message: 'AI provider temporarily unavailable. Please try again.' });
    if (error.message && error.message.includes('Groq API error')) return res.status(502).json({ success: false, message: 'AI provider temporarily unavailable. Please try again.' });
    if (error.message && error.message.includes('empty response')) return res.status(502).json({ success: false, message: 'AI returned empty response. Please try again.' });
    next(error);
  }
};
