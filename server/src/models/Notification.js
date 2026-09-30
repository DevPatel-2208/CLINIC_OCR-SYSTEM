const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  type: { type: String, enum: ['FOLLOW_UP', 'PRESCRIPTION', 'REVIEW', 'SYSTEM', 'REPORT'], default: 'SYSTEM' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedEntity: {
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);