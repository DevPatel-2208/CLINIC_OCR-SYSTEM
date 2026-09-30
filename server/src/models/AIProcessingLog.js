const mongoose = require('mongoose');

const aiProcessingLogSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },

  ocrStartedAt: { type: Date },
  ocrCompletedAt: { type: Date },
  ocrProcessingTime: { type: Number },

  aiStartedAt: { type: Date },
  aiCompletedAt: { type: Date },
  aiProcessingTime: { type: Number },

  totalProcessingTime: { type: Number },

  ocrConfidence: { type: Number },
  aiConfidence: { type: Number },

  fieldsExtracted: { type: Number },
  fieldsCorrected: { type: Number },

  rawOcrText: { type: String },
  aiRawResponse: { type: String },

  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PARTIAL'], default: 'SUCCESS' },
  error: { type: String },
  errorStage: { type: String, enum: ['OCR', 'AI', 'VALIDATION', 'STORAGE'] },
}, { timestamps: true });

aiProcessingLogSchema.index({ prescriptionId: 1 });
aiProcessingLogSchema.index({ clinicId: 1, createdAt: -1 });
aiProcessingLogSchema.index({ status: 1 });

module.exports = mongoose.model('AIProcessingLog', aiProcessingLogSchema);