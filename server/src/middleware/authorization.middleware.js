const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');

const requireClinicAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (!req.user.clinicId) {
    return res.status(403).json({ success: false, message: 'No clinic associated with this account.' });
  }
  next();
};

const requirePatientAccess = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const patientId = req.params[paramName];
      if (!patientId) {
        return res.status(400).json({ success: false, message: 'Patient ID required.' });
      }

      if (req.user.role === 'PATIENT') {
        const ownPatient = await Patient.findOne({ userId: req.user._id, clinicId: req.user.clinicId });
        if (!ownPatient || ownPatient._id.toString() !== patientId) {
          return res.status(403).json({ success: false, message: 'Access denied to this patient record.' });
        }
      } else {
        const patient = await Patient.findOne({ _id: patientId, clinicId: req.user.clinicId });
        if (!patient) {
          return res.status(404).json({ success: false, message: 'Patient not found in this clinic.' });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const requirePrescriptionAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const prescriptionId = req.params.id;
    if (!prescriptionId) {
      return res.status(400).json({ success: false, message: 'Prescription ID required.' });
    }

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      clinicId: req.user.clinicId,
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    if (req.user.role === 'PATIENT') {
      const ownPatient = await Patient.findOne({ userId: req.user._id, clinicId: req.user.clinicId });
      if (!ownPatient || !ownPatient._id.equals(prescription.patientId)) {
        return res.status(403).json({ success: false, message: 'Access denied to this prescription.' });
      }
    }

    req.prescription = prescription;
    next();
  } catch (error) {
    next(error);
  }
};

const requireDoctorOrReceptionist = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (!['DOCTOR', 'RECEPTIONIST'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Doctor or receptionist role required.' });
  }
  next();
};

const requireNotPatient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  if (req.user.role === 'PATIENT') {
    return res.status(403).json({ success: false, message: 'Patients cannot perform this action.' });
  }
  next();
};

module.exports = {
  requireClinicAccess,
  requirePatientAccess,
  requirePrescriptionAccess,
  requireDoctorOrReceptionist,
  requireNotPatient,
};
