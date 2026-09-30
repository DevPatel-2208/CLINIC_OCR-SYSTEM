const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  age: { type: Number },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String, trim: true },
  bloodGroup: { type: String },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medicalHistory: { type: String },
  allergies: [{ type: String }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

patientSchema.index({ phone: 1, clinicId: 1 }, { unique: true });
patientSchema.index({ name: 'text', phone: 'text' });
patientSchema.index({ clinicId: 1, assignedDoctor: 1 });
patientSchema.index({ clinicId: 1, patientId: 1 });

patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();
  try {
    const count = await mongoose.model('Patient').countDocuments({ clinicId: this.clinicId });
    const Clinic = mongoose.model('Clinic');
    const clinic = await Clinic.findById(this.clinicId).select('name');
    const code = (clinic?.name || 'CLI').substring(0, 3).toUpperCase();
    this.patientId = `${code}-${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Patient', patientSchema);
