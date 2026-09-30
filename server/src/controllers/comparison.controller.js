const Prescription = require('../models/Prescription');

exports.compare = async (req, res, next) => {
  try {
    const { prescriptionId, previousPrescriptionId } = req.params;

    const current = await Prescription.findOne({ _id: prescriptionId, clinicId: req.user.clinicId });
    const previous = await Prescription.findOne({ _id: previousPrescriptionId, clinicId: req.user.clinicId });

    if (!current || !previous) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const currentMeds = new Map(current.ai?.medicines?.map((m) => [m.name?.toLowerCase(), m]) || []);
    const previousMeds = new Map(previous.ai?.medicines?.map((m) => [m.name?.toLowerCase(), m]) || []);

    const added = [];
    const removed = [];
    const changed = [];

    currentMeds.forEach((m, name) => {
      if (!previousMeds.has(name)) {
        added.push(m);
      } else {
        const prev = previousMeds.get(name);
        const changes = {};
        if (m.dosage !== prev.dosage) changes.dosage = { previous: prev.dosage, current: m.dosage };
        if (m.frequency !== prev.frequency) changes.frequency = { previous: prev.frequency, current: m.frequency };
        if (m.duration !== prev.duration) changes.duration = { previous: prev.duration, current: m.duration };
        if (Object.keys(changes).length > 0) changed.push({ name: m.name, changes });
      }
    });

    previousMeds.forEach((m, name) => {
      if (!currentMeds.has(name)) removed.push(m);
    });

    res.json({
      success: true,
      data: {
        previous: { id: previous._id, date: previous.prescriptionDate },
        current: { id: current._id, date: current.prescriptionDate },
        added, removed, changed,
      },
    });
  } catch (error) {
    next(error);
  }
};