const mongoose = require('mongoose');

const VALID_TRANSITIONS = {
  UPLOADED: ['IMAGE_PROCESSING', 'PROCESSING_FAILED'],
  IMAGE_PROCESSING: ['OCR_PROCESSING', 'PROCESSING_FAILED'],
  OCR_PROCESSING: ['AI_PROCESSING', 'PROCESSING_FAILED'],
  AI_PROCESSING: ['NEEDS_REVIEW', 'PROCESSING_FAILED'],
  NEEDS_REVIEW: ['APPROVED', 'REJECTED', 'AI_PROCESSING'],
  APPROVED: ['NEEDS_REVIEW'],
  REJECTED: ['AI_PROCESSING'],
  PROCESSING_FAILED: ['IMAGE_PROCESSING'],
};

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },

  originalImage: {
    url: { type: String },
    publicId: { type: String },
    filename: { type: String },
  },

  processedImage: {
    url: { type: String },
  },

  imageQuality: {
    score: { type: Number, min: 0, max: 100 },
    issues: [{ type: String }],
    analyzedAt: { type: Date },
  },

  ocr: {
    rawText: { type: String },
    cleanedText: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    processingTime: { type: Number },
    wordCount: { type: Number },
  },

  ai: {
    correctedText: { type: String },
    summary: { type: String },
    medicines: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String },
      confidence: { type: Number, min: 0, max: 100 },
      sourceText: { type: String },
    }],
    importantFindings: [{ type: String }],
    tags: [{ type: String }],
    extractionTime: { type: Number },
    rawResponse: { type: String },
  },

  doctorReview: {
    status: {
      type: String,
      enum: ['PENDING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    corrections: [{
      field: { type: String },
      originalValue: { type: mongoose.Schema.Types.Mixed },
      correctedValue: { type: mongoose.Schema.Types.Mixed },
      reason: { type: String },
      correctedAt: { type: Date },
    }],
    notes: { type: String },
    rejectionReason: { type: String },
  },

  revisionHistory: [{
    action: { type: String, enum: ['UPLOAD', 'OCR_PROCESSED', 'AI_EXTRACTED', 'DOCTOR_REVIEWED', 'DOCTOR_CORRECTED', 'APPROVED', 'REJECTED', 'REVISION', 'RETRY', 'TRANSITIONED_TO_IMAGE_PROCESSING', 'TRANSITIONED_TO_OCR_PROCESSING', 'TRANSITIONED_TO_AI_PROCESSING', 'TRANSITIONED_TO_NEEDS_REVIEW', 'TRANSITIONED_TO_APPROVED', 'TRANSITIONED_TO_REJECTED', 'TRANSITIONED_TO_PROCESSING_FAILED', 'TRANSITIONED_TO_UPLOADED'] },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    snapshot: { type: mongoose.Schema.Types.Mixed },
    changedFields: [{ type: String }],
  }],

  processingStatus: {
    type: String,
    enum: ['UPLOADED', 'IMAGE_PROCESSING', 'OCR_PROCESSING', 'AI_PROCESSING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING_FAILED'],
    default: 'UPLOADED',
  },

  doctorNotes: { type: String },
  important: { type: Boolean, default: false },
  prescriptionDate: { type: Date, default: Date.now },
  embedding: { type: [Number], select: false },
  embeddingUpdatedAt: { type: Date },

}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ clinicId: 1 });
prescriptionSchema.index({ clinicId: 1, processingStatus: 1 });
prescriptionSchema.index({ 'ai.tags': 1 });
prescriptionSchema.index({ processingStatus: 1 });
prescriptionSchema.index({ important: 1, patientId: 1 });

prescriptionSchema.methods.canTransitionTo = function (newStatus) {
  const allowed = VALID_TRANSITIONS[this.processingStatus];
  return allowed && allowed.includes(newStatus);
};

prescriptionSchema.methods.transitionTo = function (newStatus, performedBy, snapshot, changedFields) {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(`Invalid transition from ${this.processingStatus} to ${newStatus}`);
  }
  this.processingStatus = newStatus;
  if (newStatus === 'APPROVED') {
    this.doctorReview.status = 'APPROVED';
  } else if (newStatus === 'REJECTED') {
    this.doctorReview.status = 'REJECTED';
  }
  if (snapshot) {
    this.revisionHistory.push({
      action: `TRANSITIONED_TO_${newStatus}`,
      performedBy,
      timestamp: new Date(),
      snapshot,
      changedFields: changedFields || [],
    });
  }
};

prescriptionSchema.methods.addRevision = function (action, performedBy, snapshot, changedFields) {
  this.revisionHistory.push({
    action,
    performedBy,
    timestamp: new Date(),
    snapshot,
    changedFields: changedFields || [],
  });
};

module.exports = mongoose.model('Prescription', prescriptionSchema);
