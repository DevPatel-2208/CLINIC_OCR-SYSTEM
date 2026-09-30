const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const FollowUp = require('../models/FollowUp');
const AIProcessingLog = require('../models/AIProcessingLog');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;
    const isDoctor = req.user.role === 'DOCTOR';

    const baseQuery = clinicId ? (isDoctor ? { clinicId, doctorId: req.user._id } : { clinicId }) : {};

    const [totalPatients, totalPrescriptions, pendingReviews, todayPrescriptions, upcomingFollowUps] = await Promise.all([
      isDoctor
        ? Patient.countDocuments({ ...(clinicId ? { clinicId } : {}), assignedDoctor: req.user._id })
        : (clinicId ? Patient.countDocuments({ clinicId }) : Promise.resolve(0)),
      Prescription.countDocuments(baseQuery),
      Prescription.countDocuments({ ...baseQuery, processingStatus: 'NEEDS_REVIEW' }),
      Prescription.countDocuments({
        ...baseQuery,
        prescriptionDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      FollowUp.countDocuments({
        ...(clinicId ? { clinicId } : {}),
        ...(isDoctor ? { doctorId: req.user._id } : {}),
        status: 'UPCOMING',
        date: { $gte: new Date() },
      }),
    ]);

    res.json({
      success: true,
      data: { totalPatients, totalPrescriptions, pendingReviews, todayPrescriptions, upcomingFollowUps },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAIEvaluation = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;

    if (!clinicId) {
      return res.json({ success: true, data: { stats: {}, logs: [] } });
    }

    const stats = await AIProcessingLog.aggregate([
      { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: 1 },
          avgOcrConfidence: { $avg: '$ocrConfidence' },
          avgAiConfidence: { $avg: '$aiConfidence' },
          totalFieldsExtracted: { $sum: '$fieldsExtracted' },
          totalFieldsCorrected: { $sum: '$fieldsCorrected' },
          successCount: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          avgProcessingTime: { $avg: '$totalProcessingTime' },
        },
      },
    ]);

    const logs = await AIProcessingLog.find({ clinicId })
      .populate('prescriptionId', 'processingStatus')
      .sort('-createdAt')
      .limit(50);

    res.json({ success: true, data: { stats: stats[0] || {}, logs } });
  } catch (error) {
    next(error);
  }
};