const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const FollowUp = require('../models/FollowUp');
const Document = require('../models/Document');
const { createAuditLog } = require('../utils/audit');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      return res.json({ success: true, data: [ownPatient], meta: { total: 1, page: 1, totalPages: 1 } });
    }

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

    res.json({
      success: true,
      data: patients,
      meta: { total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      return res.json({ success: true, data: [ownPatient] });
    }

    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const patients = await Patient.find({
      clinicId: req.user.clinicId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    }).populate('assignedDoctor', 'name').limit(10);

    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot create patient records' });
    }

    const assignedDoctor = req.body.assignedDoctor || (req.user.role === 'DOCTOR' ? req.user._id : undefined);

    const patient = await Patient.create({
      ...req.body,
      clinicId: req.user.clinicId,
      assignedDoctor,
    });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'CREATE_PATIENT', entity: 'Patient', entityId: patient._id,
      newValue: { name: patient.name, phone: patient.phone },
    });

    res.status(201).json({ success: true, message: 'Patient created', data: patient });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const ownPatient = await resolvePatientForUser(req.user);
    if (!ownPatient) return res.status(404).json({ success: false, message: 'Patient record not found' });
    const patient = await Patient.findById(ownPatient._id)
      .populate('assignedDoctor', 'name email phone specialization');
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        await createAuditLog({ userId: req.user._id, clinicId: req.user.clinicId, action: 'UNAUTHORIZED_ACCESS', entity: 'Patient', entityId: targetPatientId, newValue: { attemptedId: targetPatientId } });
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }
    const patient = await Patient.findOne({ _id: targetPatientId, clinicId: req.user.clinicId })
      .populate('assignedDoctor', 'name email phone specialization');

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const [prescriptionCount, upcomingFollowUp] = await Promise.all([
      Prescription.countDocuments({ patientId: patient._id }),
      FollowUp.findOne({ patientId: patient._id, status: 'UPCOMING', date: { $gte: new Date() } }).sort('date'),
    ]);

    res.json({
      success: true,
      data: { ...patient.toObject(), prescriptionCount, upcomingFollowUp },
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot update records' });
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    res.json({ success: true, message: 'Patient updated', data: patient });
  } catch (error) {
    next(error);
  }
};

exports.getPrescriptions = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const query = {
      patientId: targetPatientId,
      clinicId: req.user.clinicId,
    };
    if (isPatient(req.user)) query.processingStatus = 'APPROVED';

    let prescriptionsQuery = Prescription.find(query).populate('doctorId', 'name').sort('-prescriptionDate');
    if (isPatient(req.user)) {
      prescriptionsQuery = prescriptionsQuery.select('-ocr -processedImage -doctorReview -doctorNotes');
    }
    const prescriptions = await prescriptionsQuery;

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

exports.getTimeline = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const prescriptions = await Prescription.find({
      patientId: targetPatientId,
      clinicId: req.user.clinicId,
      processingStatus: 'APPROVED',
    }).populate('doctorId', 'name').sort('prescriptionDate');

    const followUps = await FollowUp.find({
      patientId: targetPatientId,
      clinicId: req.user.clinicId,
    }).sort('date');

    const timeline = [];

    prescriptions.forEach((p) => {
      timeline.push({
        date: p.prescriptionDate,
        type: 'PRESCRIPTION',
        title: 'Prescription',
        description: p.ai?.summary || 'No summary',
        data: { prescriptionId: p._id },
        doctor: p.doctorId?.name,
      });

      if (p.ai?.medicines) {
        p.ai.medicines.forEach((m) => {
          timeline.push({
            date: p.prescriptionDate,
            type: 'MEDICINE',
            title: `Medicine: ${m.name}`,
            description: `${m.dosage || ''} ${m.frequency || ''} ${m.duration || ''}`.trim(),
          });
        });
      }
    });

    followUps.forEach((f) => {
      timeline.push({
        date: f.date,
        type: 'FOLLOW_UP',
        title: `Follow-up: ${f.status}`,
        description: f.reason || 'Follow-up visit',
        data: { followUpId: f._id },
      });
    });

    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, data: timeline });
  } catch (error) {
    next(error);
  }
};

exports.getMedicineHistory = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const medicines = await Medicine.find({ patientId: targetPatientId, clinicId: req.user.clinicId })
      .populate('prescriptionId', 'prescriptionDate')
      .sort('-createdAt');

    const grouped = {};
    medicines.forEach((m) => {
      if (!grouped[m.name]) grouped[m.name] = [];
      grouped[m.name].push({
        date: m.prescriptionId?.prescriptionDate || m.createdAt,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        confidence: m.confidence,
      });
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    next(error);
  }
};

exports.getFollowUps = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const followUps = await FollowUp.find({ patientId: targetPatientId, clinicId: req.user.clinicId })
      .sort('-date');
    res.json({ success: true, data: followUps });
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    let targetPatientId = req.params.id;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const documentQuery = { patientId: targetPatientId, clinicId: req.user.clinicId };
    if (isPatient(req.user)) documentQuery.type = 'REPORT';

    const documents = await Document.find(documentQuery)
      .sort('-createdAt');
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};
