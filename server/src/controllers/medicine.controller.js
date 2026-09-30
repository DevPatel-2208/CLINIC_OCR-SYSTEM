const Medicine = require('../models/Medicine');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');

exports.getPatientMedicineHistory = async (req, res, next) => {
  try {
    let patientId = req.params.patientId;

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (patientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      patientId = ownPatient._id;
    }

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required' });
    }

    const medicines = await Medicine.find({ patientId, clinicId: req.user.clinicId })
      .populate('prescriptionId', 'prescriptionDate')
      .sort({ name: 1, 'prescriptionId.prescriptionDate': -1 });

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

    const summary = Object.entries(grouped).map(([name, entries]) => ({
      name,
      firstRecorded: entries[entries.length - 1]?.date,
      lastRecorded: entries[0]?.date,
      totalPrescriptions: entries.length,
      history: entries,
    }));

    res.json({ success: true, data: summary });
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
    const medCheck = await Medicine.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).select('patientId');
    if (medCheck && isPatient(req.user) && medCheck.patientId.toString() !== patientScope.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this record.' });
    }

    const medicine = await Medicine.findOne({
      _id: req.params.id,
      clinicId: req.user.clinicId,
      ...(patientScope ? { patientId: patientScope } : {}),
    })
      .populate('prescriptionId', 'prescriptionDate')
      .populate('patientId', 'name');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

exports.searchByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const query = { name: { $regex: name, $options: 'i' }, clinicId: req.user.clinicId };

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      query.patientId = ownPatient._id;
    }

    const medicines = await Medicine.find(query)
      .populate('patientId', 'name')
      .limit(20);
    res.json({ success: true, data: medicines });
  } catch (error) {
    next(error);
  }
};