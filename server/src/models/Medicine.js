const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, trim: true },
  frequency: { type: String, trim: true },
  duration: { type: String, trim: true },
  confidence: { type: Number, min: 0, max: 100 },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
}, { timestamps: true });

medicineSchema.index({ name: 1, patientId: 1 });
medicineSchema.index({ patientId: 1, clinicId: 1 });
medicineSchema.index({ prescriptionId: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);