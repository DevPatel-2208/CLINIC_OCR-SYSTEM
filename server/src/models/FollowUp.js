const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  date: { type: Date, required: true },
  reason: { type: String, trim: true },
  notes: { type: String, trim: true },
  status: {
    type: String,
    enum: ['UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED'],
    default: 'UPCOMING',
  },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
}, { timestamps: true });

followUpSchema.index({ patientId: 1, date: -1 });
followUpSchema.index({ doctorId: 1, date: -1 });
followUpSchema.index({ clinicId: 1, status: 1 });
followUpSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);