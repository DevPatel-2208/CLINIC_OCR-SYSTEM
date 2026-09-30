const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Clinic = require('../models/Clinic');
const PDFDocument = require('pdfkit');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');

exports.generatePrescriptionReport = async (req, res, next) => {
  try {
    let patientScope = null;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      patientScope = ownPatient._id;
    }
    const repCheck = await Prescription.findOne({ _id: req.params.prescriptionId, clinicId: req.user.clinicId }).select('patientId');
    if (repCheck && isPatient(req.user) && repCheck.patientId.toString() !== patientScope.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this prescription.' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.prescriptionId,
      clinicId: req.user.clinicId,
      processingStatus: 'APPROVED',
      ...(patientScope ? { patientId: patientScope } : {}),
    }).populate('patientId').populate('doctorId', 'name');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found or not approved' });
    }

    const clinic = await Clinic.findById(req.user.clinicId);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescription-${prescription._id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    });

    doc.fontSize(20).text(clinic?.name || 'Clinic', { align: 'center' });
    doc.fontSize(12).text(clinic?.address || '', { align: 'center' });
    doc.text(`Phone: ${clinic?.phone || ''} | Email: ${clinic?.email || ''}`);
    doc.moveDown();
    doc.text('PRESCRIPTION', { align: 'center', underline: true });
    doc.moveDown();

    doc.fontSize(11).text(`Patient: ${prescription.patientId?.name || 'N/A'}`);
    doc.text(`Date: ${prescription.prescriptionDate?.toLocaleDateString() || 'N/A'}`);
    doc.text(`Doctor: ${prescription.doctorId?.name || 'N/A'}`);
    doc.moveDown();

    if (prescription.ai?.summary) {
      doc.text('Summary:', { underline: true });
      doc.text(prescription.ai.summary);
      doc.moveDown();
    }

    if (prescription.ai?.medicines?.length) {
      doc.text('Medicines:', { underline: true });
      prescription.ai.medicines.forEach((m, i) => {
        doc.text(`${i + 1}. ${m.name} - ${m.dosage || ''} ${m.frequency || ''} ${m.duration || ''}`.trim());
      });
      doc.moveDown();
    }

    if (prescription.doctorNotes && !isPatient(req.user)) {
      doc.text(`Doctor's Notes: ${prescription.doctorNotes}`);
    }

    if (prescription.ai?.importantFindings?.length) {
      doc.moveDown();
      doc.text('Important Findings:', { underline: true });
      prescription.ai.importantFindings.forEach((f) => doc.text(`- ${f}`));
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.getPatientReports = async (req, res, next) => {
  try {
    let targetPatientId = req.params.patientId;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (targetPatientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      targetPatientId = ownPatient._id;
    }

    const prescriptionQuery = Prescription.find({
      patientId: targetPatientId,
      clinicId: req.user.clinicId,
      processingStatus: 'APPROVED',
    })
      .populate('doctorId', 'name')
      .sort('-prescriptionDate');

    if (isPatient(req.user)) {
      prescriptionQuery.select('prescriptionDate ai.summary important doctorId');
    } else {
      prescriptionQuery.select('prescriptionDate ai.summary doctorNotes important doctorId');
    }
    const prescriptions = await prescriptionQuery;

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};
