const User = require('../models/User');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const AuditLog = require('../models/AuditLog');
const Clinic = require('../models/Clinic');
const AIProcessingLog = require('../models/AIProcessingLog');
const { createAuditLog } = require('../utils/audit');

exports.getDashboard = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;

    const [doctors, staff, patients, prescriptions, pendingAI, todayFollowUps] = await Promise.all([
      User.countDocuments({ clinicId, role: 'DOCTOR', status: 'ACTIVE' }),
      User.countDocuments({ clinicId, role: 'RECEPTIONIST', status: 'ACTIVE' }),
      Patient.countDocuments({ clinicId }),
      Prescription.countDocuments({ clinicId }),
      Prescription.countDocuments({ clinicId, processingStatus: 'NEEDS_REVIEW' }),
      Prescription.countDocuments({
        clinicId,
        prescriptionDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    res.json({
      success: true,
      data: {
        doctors, staff, patients, prescriptions,
        pendingAI, todayFollowUps,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ clinicId: req.user.clinicId, role: 'DOCTOR' })
      .sort('-createdAt');
    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, professionalInfo } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const doctor = await User.create({
      name, email, password, phone, specialization, professionalInfo,
      role: 'DOCTOR', clinicId: req.user.clinicId,
    });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'CREATE_DOCTOR', entity: 'User', entityId: doctor._id,
      newValue: { name, email },
    });

    res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, clinicId: req.user.clinicId, role: 'DOCTOR' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'specialization', 'professionalInfo', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId, role: 'DOCTOR' },
      updates,
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'UPDATE_DOCTOR', entity: 'User', entityId: doctor._id,
      newValue: updates,
    });

    res.json({ success: true, message: 'Doctor updated', data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.toggleDoctorStatus = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, clinicId: req.user.clinicId, role: 'DOCTOR' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.status = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await doctor.save();

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'TOGGLE_DOCTOR_STATUS', entity: 'User', entityId: doctor._id,
      newValue: { status: doctor.status },
    });

    res.json({ success: true, message: `Doctor ${doctor.status.toLowerCase()}`, data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ clinicId: req.user.clinicId, role: 'RECEPTIONIST' }).sort('-createdAt');
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.addStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const staff = await User.create({
      name, email, password, phone,
      role: 'RECEPTIONIST', clinicId: req.user.clinicId,
    });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'CREATE_STAFF', entity: 'User', entityId: staff._id,
    });

    res.status(201).json({ success: true, message: 'Staff added', data: staff });
  } catch (error) {
    next(error);
  }
};

exports.getStaffMember = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, clinicId: req.user.clinicId, role: 'RECEPTIONIST' });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId, role: 'RECEPTIONIST' },
      updates,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.toggleStaffStatus = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, clinicId: req.user.clinicId, role: 'RECEPTIONIST' });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    staff.status = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { clinicId: req.user.clinicId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    res.json({ success: true, data: patients, meta: { total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getPatientDetails = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.user.clinicId })
      .populate('assignedDoctor', 'name email phone specialization');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;

    const [patientGrowth, prescriptionVolume, processingStats, ocrStats] = await Promise.all([
      Patient.aggregate([
        { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Prescription.aggregate([
        { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Prescription.aggregate([
        { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
        { $group: { _id: '$processingStatus', count: { $sum: 1 } } },
      ]),
      AIProcessingLog.aggregate([
        { $match: { clinicId: new (require('mongoose').Types.ObjectId)(clinicId) } },
        { $group: { _id: null, avgOcrConfidence: { $avg: '$ocrConfidence' }, avgAiConfidence: { $avg: '$aiConfidence' }, total: { $sum: 1 } } },
      ]),
    ]);

    res.json({ success: true, data: { patientGrowth, prescriptionVolume, processingStats, ocrStats: ocrStats[0] || {} } });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find({ clinicId: req.user.clinicId })
      .populate('userId', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments({ clinicId: req.user.clinicId });

    res.json({ success: true, data: logs, meta: { total, page, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.user.clinicId);
    res.json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'logo', 'address', 'phone', 'email', 'settings'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const clinic = await Clinic.findByIdAndUpdate(req.user.clinicId, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Settings updated', data: clinic });
  } catch (error) {
    next(error);
  }
};
