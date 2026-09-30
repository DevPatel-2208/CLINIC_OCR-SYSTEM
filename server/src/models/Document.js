const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  type: { type: String, enum: ['REPORT', 'LAB_RESULT', 'SCAN', 'OTHER'], default: 'OTHER' },
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String },
  mimeType: { type: String },
  fileSize: { type: Number },
  important: { type: Boolean, default: false },
}, { timestamps: true });

documentSchema.index({ patientId: 1 });
documentSchema.index({ clinicId: 1 });

module.exports = mongoose.model('Document', documentSchema);