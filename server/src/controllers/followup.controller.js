const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const { createAuditLog } = require('../utils/audit');
const { createNotification } = require('../utils/notifications');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { status, patientId, search, dateFrom, dateTo, sortBy = 'date', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
    const query = { clinicId: req.user.clinicId };

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      query.patientId = ownPatient._id;
    } else {
      if (status) query.status = status;
      if (patientId) query.patientId = patientId;
      if (search) {
        const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const matchedPatients = await Patient.find({ clinicId: req.user.clinicId, name: regex }).select('_id').limit(50);
        const patientIds = matchedPatients.map((p) => p._id);
        query.$or = [{ reason: regex }, { notes: regex }, { patientId: { $in: patientIds } }];
      }
      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = new Date(dateFrom);
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          query.date.$lte = end;
        }
      }
    }

    await autoMarkMissed({ clinicId: req.user.clinicId, status: 'UPCOMING', date: { $lt: new Date() } });

    const sortField = ['date', 'createdAt', 'status'].includes(sortBy) ? sortBy : 'date';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const followUps = await FollowUp.find(query)
      .populate('patientId', 'name phone patientId')
      .populate('doctorId', 'name')
      .sort({ [sortField]: sortDir })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await FollowUp.countDocuments(query);
    const statsAgg = await FollowUp.aggregate([
      { $match: { clinicId: req.user.clinicId, ...(isPatient(req.user) ? {} : {}) } },
    ]);

    res.json({ success: true, data: followUps, meta: { total, page: pageNum, totalPages: Math.ceil(total / limitNum), limit: limitNum } });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot create follow-ups' });
    }

    const { patientId, date, reason, notes, prescriptionId } = req.body;
    const scheduledDate = new Date(date);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(422).json({ success: false, message: 'Invalid date format' });
    }

    const patient = await Patient.findOne({ _id: patientId, clinicId: req.user.clinicId });
    if (!patient) {
      return res.status(422).json({ success: false, message: 'Patient not found in this clinic' });
    }

    const followUp = await FollowUp.create({
      patientId,
      prescriptionId: prescriptionId || undefined,
      date: scheduledDate,
      reason: reason?.trim(),
      notes: notes?.trim(),
      doctorId: req.user._id,
      clinicId: req.user.clinicId,
      status: 'UPCOMING',
    });

    if (patient.userId) {
      await createNotification({
        userId: patient.userId,
        clinicId: followUp.clinicId,
        type: 'FOLLOW_UP',
        title: 'Follow-up scheduled',
        message: `A follow-up visit is scheduled for ${scheduledDate.toLocaleDateString()}${reason ? ` (${reason})` : ''}.`,
        entityType: 'FollowUp',
        entityId: followUp._id,
      });
    }

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'CREATE_FOLLOWUP', entity: 'FollowUp', entityId: followUp._id,
      newValue: { patientId, date: scheduledDate, reason },
    });

    const populated = await FollowUp.findById(followUp._id).populate('patientId', 'name phone patientId').populate('doctorId', 'name');
    res.status(201).json({ success: true, message: 'Follow-up created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    let patientScope = null;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      patientScope = ownPatient._id;
    }
    const fuCheck = await FollowUp.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).select('patientId');
    if (fuCheck && isPatient(req.user) && fuCheck.patientId.toString() !== patientScope.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this record.' });
    }

    const followUp = await FollowUp.findOne({
      _id: req.params.id,
      clinicId: req.user.clinicId,
      ...(patientScope ? { patientId: patientScope } : {}),
    })
      .populate('patientId', 'name phone patientId')
      .populate('doctorId', 'name');
    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });
    res.json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot update follow-ups' });
    }

    const { patientId, date, reason, notes, status } = req.body;
    const update = {};
    if (patientId !== undefined) {
      const patient = await Patient.findOne({ _id: patientId, clinicId: req.user.clinicId });
      if (!patient) return res.status(422).json({ success: false, message: 'Patient not found in this clinic' });
      update.patientId = patientId;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (isNaN(d.getTime())) return res.status(422).json({ success: false, message: 'Invalid date' });
      update.date = d;
    }
    if (reason !== undefined) update.reason = reason?.trim();
    if (notes !== undefined) update.notes = notes?.trim();
    if (status !== undefined) {
      update.status = status;
      if (status === 'COMPLETED') { update.completedAt = new Date(); update.cancelledAt = null; }
      if (status === 'CANCELLED') { update.cancelledAt = new Date(); update.completedAt = null; }
      if (status === 'UPCOMING') { update.completedAt = null; update.cancelledAt = null; }
    }

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      update,
      { new: true, runValidators: true }
    ).populate('patientId', 'name phone patientId').populate('doctorId', 'name');
    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'UPDATE_FOLLOWUP', entity: 'FollowUp', entityId: followUp._id,
      newValue: update,
    });

    res.json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot update follow-ups' });
    }

    const { status } = req.body;
    if (!['UPCOMING', 'COMPLETED', 'CANCELLED', 'MISSED'].includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status' });
    }
    const update = { status };
    if (status === 'COMPLETED') { update.completedAt = new Date(); update.cancelledAt = null; }
    else if (status === 'CANCELLED') { update.cancelledAt = new Date(); update.completedAt = null; }
    else { update.completedAt = null; update.cancelledAt = null; }

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      update,
      { new: true }
    ).populate('patientId', 'name phone patientId').populate('doctorId', 'name');
    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'UPDATE_FOLLOWUP_STATUS', entity: 'FollowUp', entityId: followUp._id,
      newValue: { status },
    });

    res.json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot delete follow-ups' });
    }
    const followUp = await FollowUp.findOneAndDelete({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });
    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'DELETE_FOLLOWUP', entity: 'FollowUp', entityId: followUp._id,
    });
    res.json({ success: true, message: 'Follow-up deleted' });
  } catch (error) {
    next(error);
  }
};

async function autoMarkMissed(baseQuery) {
  try {
    await FollowUp.updateMany(baseQuery, { status: 'MISSED' });
  } catch (error) {
    console.error('Auto-mark missed error:', error);
  }
}
