const axios = require('axios');
const config = require('../config/env');
const Prescription = require('../models/Prescription');
const AIProcessingLog = require('../models/AIProcessingLog');
const { createAuditLog } = require('../utils/audit');

const QUALITY_THRESHOLD = 30;

exports.processImage = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    if (!prescriptionId) return res.status(400).json({ success: false, message: 'Prescription ID required' });

    if (!req.user.clinicId) {
      return res.status(400).json({ success: false, message: 'No clinic associated with this account. Please contact admin.' });
    }

    const prescription = await Prescription.findOne({ _id: prescriptionId, clinicId: req.user.clinicId });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (prescription.processingStatus === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Cannot reprocess an approved prescription.' });
    }

    if (prescription.processingStatus !== 'PROCESSING_FAILED' && prescription.processingStatus !== 'UPLOADED') {
      return res.status(400).json({ success: false, message: 'Prescription is already being processed.' });
    }

    if (!prescription.originalImage?.url) {
      return res.status(400).json({ success: false, message: 'No original image found for this prescription.' });
    }

    prescription.processingStatus = 'IMAGE_PROCESSING';
    await prescription.save();

    const aiLog = await AIProcessingLog.create({
      prescriptionId: prescription._id,
      clinicId: prescription.clinicId,
      ocrStartedAt: new Date(),
      status: 'SUCCESS',
    });

    try {
      const ocrStarted = Date.now();
      const ocrResponse = await axios.post(`${config.pythonAiServiceUrl}/ocr/process`, {
        image_url: prescription.originalImage.url,
      }, { timeout: 120000 });
      const ocrElapsed = Date.now() - ocrStarted;

      const { quality_score, quality_issues, raw_text, cleaned_text, confidence, processed_image_url, word_count } = ocrResponse.data;

      prescription.imageQuality = { score: quality_score, issues: quality_issues || [], analyzedAt: new Date() };

      if (quality_score < QUALITY_THRESHOLD) {
        prescription.processingStatus = 'PROCESSING_FAILED';
        prescription.doctorReview.status = 'REJECTED';
        prescription.doctorReview.rejectionReason = `Image quality too low (score: ${quality_score}). Issues: ${(quality_issues || []).join(', ')}`;
        aiLog.status = 'FAILED';
        aiLog.error = `Quality threshold not met: ${quality_score}/${QUALITY_THRESHOLD}`;
        aiLog.errorStage = 'VALIDATION';
        await prescription.save();
        await aiLog.save();

        return res.status(422).json({
          success: false,
          message: 'Image quality too low for processing',
          data: {
            qualityScore: quality_score,
            qualityIssues: quality_issues,
            reason: 'Prescription image quality is insufficient. Please upload a clearer image.',
            recommendedAction: 'Retake photo with better lighting and focus',
          },
        });
      }

      const processedImageUrl = processed_image_url
        ? processed_image_url.replace(/\\/g, '/').replace(/^.*?(uploads)/, '/uploads')
        : undefined;

      prescription.processedImage = { url: processedImageUrl };
      prescription.ocr = {
        rawText: raw_text,
        cleanedText: cleaned_text || raw_text,
        confidence: confidence,
        processingTime: ocrElapsed,
        wordCount: word_count,
      };
      prescription.processingStatus = 'OCR_PROCESSING';

      prescription.addRevision('OCR_PROCESSED', req.user._id, {
        qualityScore: quality_score,
        confidence,
        wordCount: word_count,
      }, ['ocr', 'imageQuality', 'processingStatus']);

      aiLog.ocrCompletedAt = new Date();
      aiLog.ocrConfidence = confidence;
      aiLog.ocrProcessingTime = (aiLog.ocrCompletedAt - aiLog.ocrStartedAt);
      aiLog.rawOcrText = raw_text;

      await prescription.save();
      await aiLog.save();

      res.json({
        success: true,
        message: 'OCR processing completed',
        data: {
          prescriptionId: prescription._id,
          quality: { score: quality_score, issues: quality_issues },
          confidence,
          rawText: raw_text,
          wordCount: word_count,
        },
      });
    } catch (pyError) {
      prescription.processingStatus = 'PROCESSING_FAILED';
      aiLog.status = 'FAILED';
      aiLog.error = pyError.response?.data?.detail || pyError.message;
      aiLog.errorStage = 'OCR';
      await prescription.save();
      await aiLog.save();

      await createAuditLog({
        userId: req.user._id, clinicId: req.user.clinicId,
        action: 'OCR_FAILED', entity: 'Prescription', entityId: prescription._id,
        newValue: { error: aiLog.error, stage: 'OCR' },
      });

      const pyStatus = pyError.response?.status;
      const statusCode = pyStatus === 503 ? 503 : 500;
      const message = pyStatus === 503 ? 'OCR service unavailable — Tesseract not installed' : 'OCR processing failed';
      res.status(statusCode).json({ success: false, message, data: { error: aiLog.error } });
    }
  } catch (error) {
    next(error);
  }
};

exports.getProcessingStatus = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.prescriptionId, clinicId: req.user.clinicId })
      .select('processingStatus imageQuality ocr.confidence ai.confidence');
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};
