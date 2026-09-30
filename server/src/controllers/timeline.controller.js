const Prescription = require('../models/Prescription');
const FollowUp = require('../models/FollowUp');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');

exports.getPatientTimeline = async (req, res, next) => {
  try {
    let { patientId } = req.params;

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (patientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      patientId = ownPatient._id;
    }

    const prescriptions = await Prescription.find({
      patientId,
      clinicId: req.user.clinicId,
      processingStatus: 'APPROVED',
    }).populate('doctorId', 'name').sort('prescriptionDate');

    const followUps = await FollowUp.find({ patientId, clinicId: req.user.clinicId }).sort('date');

    const events = [];

    prescriptions.forEach((p) => {
      events.push({
        date: p.prescriptionDate,
        type: 'PRESCRIPTION',
        title: 'Prescription',
        description: `Dr. ${p.doctorId?.name || 'Unknown'} - ${p.ai?.summary || 'No summary'}`,
        prescriptionId: p._id,
        important: p.important,
      });

      if (p.ai?.medicines) {
        p.ai.medicines.forEach((m) => {
          events.push({
            date: p.prescriptionDate,
            type: 'MEDICINE',
            title: m.name,
            description: `${m.dosage || ''} ${m.frequency || ''} ${m.duration || ''}`.trim(),
            prescriptionId: p._id,
          });
        });
      }
    });

    followUps.forEach((f) => {
      events.push({
        date: f.date,
        type: 'FOLLOW_UP',
        title: `Follow-up: ${f.status}`,
        description: f.reason || '',
        followUpId: f._id,
      });
    });

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};