const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const AIProcessingLog = require('../models/AIProcessingLog');
const cloudinary = require('../config/cloudinary');
const config = require('../config/env');
const { createAuditLog } = require('../utils/audit');
const { createNotification } = require('../utils/notifications');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');
const Patient = require('../models/Patient');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    if (!req.user.clinicId) {
      return res.status(400).json({ success: false, message: 'No clinic associated with this account. Please contact admin.' });
    }

    const { patientId, prescriptionDate } = req.body;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const patient = await Patient.findOne({ _id: patientId, clinicId: req.user.clinicId }).select('_id');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found in this clinic' });
    }

    let result;
    try {
      const cloudName = config.cloudinary.cloudName;
      const hasCloudinary = cloudName && cloudName !== 'your-cloud-name' && config.cloudinary.apiKey && config.cloudinary.apiSecret;
      if (hasCloudinary) {
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `clinicocr/${req.user.clinicId}/prescriptions`, resource_type: 'image' },
            (err, r) => err ? reject(err) : resolve(r)
          );
          uploadStream.end(req.file.buffer);
        });
      } else {
        throw new Error('Cloudinary not configured');
      }
    } catch (cloudErr) {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.resolve(__dirname, '../../../uploads/prescriptions');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      const baseUrl = config.publicUrl || `${req.protocol}://${req.get('host')}`;
      result = { secure_url: `${baseUrl}/uploads/prescriptions/${filename}`, public_id: `local/${filename}` };
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      clinicId: req.user.clinicId,
      originalImage: { url: result.secure_url, publicId: result.public_id, filename: req.file.originalname },
      prescriptionDate: prescriptionDate || new Date(),
      processingStatus: 'UPLOADED',
    });

    prescription.addRevision('UPLOAD', req.user._id, { originalImage: prescription.originalImage }, ['originalImage']);
    await prescription.save();

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'UPLOAD_PRESCRIPTION', entity: 'Prescription', entityId: prescription._id,
      newValue: { patientId, filename: req.file.originalname },
    });

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded. Processing started.',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { patientId } = req.query;
    const query = { clinicId: req.user.clinicId };

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      query.patientId = ownPatient._id;
      query.processingStatus = 'APPROVED';
    } else if (patientId) {
      query.patientId = patientId;
    }

    let prescriptionsQuery = Prescription.find(query)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name')
      .sort('-prescriptionDate')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (isPatient(req.user)) {
      prescriptionsQuery = prescriptionsQuery.select('-ocr -processedImage -doctorReview -doctorNotes -revisionHistory');
    }
    const prescriptions = await prescriptionsQuery;

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: prescriptions,
      meta: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
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
    const existing = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).select('patientId');
    if (existing && isPatient(req.user) && existing.patientId.toString() !== patientScope.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this prescription.' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      clinicId: req.user.clinicId,
      ...(patientScope ? { patientId: patientScope } : {}),
      ...(patientScope ? { processingStatus: 'APPROVED' } : {}),
    })
      .populate('patientId', 'name phone age gender')
      .populate('doctorId', 'name specialization')
      .populate('doctorReview.reviewedBy', 'name');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const data = prescription.toObject();
    if (isPatient(req.user)) {
      delete data.ocr;
      delete data.processedImage;
      delete data.doctorReview;
      delete data.doctorNotes;
      delete data.revisionHistory;
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.review = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.processingStatus !== 'NEEDS_REVIEW' && prescription.processingStatus !== 'AI_PROCESSING') {
      return res.status(400).json({ success: false, message: 'Prescription is not in a reviewable state.' });
    }

    const { corrections, doctorNotes, important } = req.body;

    prescription.doctorReview.corrections = (corrections || []).map((c) => ({
      ...c,
      correctedAt: new Date(),
    }));
    prescription.doctorNotes = doctorNotes || prescription.doctorNotes;
    if (important !== undefined) prescription.important = important;
    prescription.doctorReview.status = 'NEEDS_REVIEW';
    prescription.doctorReview.reviewedBy = req.user._id;
    prescription.doctorReview.reviewedAt = new Date();

    if (corrections && corrections.length > 0) {
      prescription.addRevision('DOCTOR_CORRECTED', req.user._id, {
        corrections,
        previousMedicines: prescription.ai?.medicines ? [...prescription.ai.medicines] : [],
      }, corrections.map((c) => c.field));
    } else {
      prescription.addRevision('DOCTOR_REVIEWED', req.user._id, { doctorNotes, important });
    }

    await prescription.save();

    if (corrections && corrections.length > 0) {
      const aiLog = await AIProcessingLog.findOne({ prescriptionId: prescription._id }).sort('-createdAt');
      if (aiLog) {
        aiLog.fieldsCorrected = (aiLog.fieldsCorrected || 0) + corrections.length;
        await aiLog.save();
      }
    }

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'REVIEW_PRESCRIPTION', entity: 'Prescription', entityId: prescription._id,
      newValue: { corrections: corrections?.length || 0, doctorNotes },
    });

    res.json({ success: true, message: 'Review saved', data: prescription });
  } catch (error) {
    next(error);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.processingStatus === 'APPROVED') {
      return res.json({ success: true, message: 'Prescription already approved', data: prescription });
    }

    if (prescription.processingStatus !== 'NEEDS_REVIEW') {
      const statusLabels = {
        UPLOADED: 'Upload complete — awaiting AI processing. Run OCR/AI extract first.',
        IMAGE_PROCESSING: 'Image is still processing.',
        OCR_PROCESSING: 'OCR is still processing.',
        AI_PROCESSING: 'AI extraction in progress. Please wait.',
        REJECTED: 'Prescription was rejected and cannot be approved directly.',
        PROCESSING_FAILED: 'Processing failed. Use Retry first.',
      };
      const hint = statusLabels[prescription.processingStatus] || `Current status: ${prescription.processingStatus}`;
      return res.status(400).json({ success: false, message: `Prescription must be in NEEDS_REVIEW state to approve. ${hint}` });
    }

    const { doctorNotes, important, corrections } = req.body;

    if (Array.isArray(corrections) && corrections.length) {
      prescription.doctorReview.corrections = corrections.map((c) => ({
        ...c,
        correctedAt: new Date(),
      }));
    }

    if (corrections && corrections.length > 0 && prescription.ai?.medicines) {
      for (const corr of corrections) {
        if (corr.field && corr.field.startsWith('medicine.') && corr.correctedValue !== undefined) {
          const parts = corr.field.split('.');
          const medIndex = parseInt(parts[1], 10);
          const medField = parts[2];
          if (!isNaN(medIndex) && prescription.ai.medicines[medIndex] && medField) {
            prescription.ai.medicines[medIndex][medField] = corr.correctedValue;
          }
        }
      }
    }

    prescription.doctorReview.status = 'APPROVED';
    prescription.doctorReview.reviewedBy = req.user._id;
    prescription.doctorReview.reviewedAt = new Date();
    prescription.processingStatus = 'APPROVED';
    if (doctorNotes) prescription.doctorNotes = doctorNotes;
    if (important !== undefined) prescription.important = important;

    prescription.addRevision('APPROVED', req.user._id, {
      finalMedicines: prescription.ai?.medicines,
      doctorNotes,
      important,
    }, ['processingStatus', 'doctorReview.status']);

    await prescription.save();

    if (Array.isArray(corrections) && corrections.length) {
      const aiLog = await AIProcessingLog.findOne({ prescriptionId: prescription._id }).sort('-createdAt');
      if (aiLog) {
        aiLog.fieldsCorrected = (aiLog.fieldsCorrected || 0) + corrections.length;
        await aiLog.save();
      }
    }

    if (prescription.ai?.medicines) {
      const existingCount = await Medicine.countDocuments({ prescriptionId: prescription._id });
      if (existingCount === 0) {
        const medicineDocs = prescription.ai.medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          confidence: m.confidence,
          prescriptionId: prescription._id,
          patientId: prescription.patientId,
          clinicId: prescription.clinicId,
        }));
        await Medicine.insertMany(medicineDocs);
      } else {
        for (const m of prescription.ai.medicines) {
          await Medicine.findOneAndUpdate(
            { prescriptionId: prescription._id, name: m.name, clinicId: prescription.clinicId },
            { dosage: m.dosage, frequency: m.frequency, duration: m.duration, confidence: m.confidence },
            { upsert: true }
          );
        }
      }
    }

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'APPROVE_PRESCRIPTION', entity: 'Prescription', entityId: prescription._id,
    });

    try {
      const { upsertEmbedding } = require('../services/vectorSearch.service');
      await upsertEmbedding(prescription);
    } catch (_) {}

    const patient = await Patient.findById(prescription.patientId);
    if (patient?.userId) {
      await createNotification({
        userId: patient.userId,
        clinicId: prescription.clinicId,
        type: 'PRESCRIPTION',
        title: 'Prescription approved',
        message: `Dr. ${req.user.name} approved a new prescription for you.`,
        entityType: 'Prescription',
        entityId: prescription._id,
      });
    }

    res.json({ success: true, message: 'Prescription approved', data: prescription });
  } catch (error) {
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.processingStatus !== 'NEEDS_REVIEW') {
      return res.status(400).json({ success: false, message: 'Prescription must be in NEEDS_REVIEW state to reject.' });
    }

    const { rejectionReason } = req.body;

    prescription.doctorReview.status = 'REJECTED';
    prescription.doctorReview.reviewedBy = req.user._id;
    prescription.doctorReview.reviewedAt = new Date();
    prescription.doctorReview.rejectionReason = rejectionReason || 'Rejected by doctor';
    prescription.processingStatus = 'REJECTED';

    prescription.addRevision('REJECTED', req.user._id, { rejectionReason }, ['processingStatus']);

    await prescription.save();

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'REJECT_PRESCRIPTION', entity: 'Prescription', entityId: prescription._id,
      newValue: { rejectionReason },
    });

    res.json({ success: true, message: 'Prescription rejected', data: prescription });
  } catch (error) {
    next(error);
  }
};

exports.retry = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.processingStatus !== 'PROCESSING_FAILED') {
      return res.status(400).json({ success: false, message: 'Only failed prescriptions can be retried.' });
    }

    prescription.processingStatus = 'IMAGE_PROCESSING';
    prescription.addRevision('RETRY', req.user._id, { previousStatus: 'PROCESSING_FAILED' }, ['processingStatus']);
    await prescription.save();

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'RETRY_PRESCRIPTION', entity: 'Prescription', entityId: prescription._id,
    });

    res.json({ success: true, message: 'Retry initiated', data: prescription });
  } catch (error) {
    next(error);
  }
};

exports.compare = async (req, res, next) => {
  try {
    let patientScope = null;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      patientScope = ownPatient._id;
    }
    const checkPres = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).select('patientId');
    if (checkPres && isPatient(req.user) && checkPres.patientId.toString() !== patientScope.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to access this prescription.' });
    }

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      clinicId: req.user.clinicId,
      ...(patientScope ? { patientId: patientScope } : {}),
    });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const previous = await Prescription.findOne({
      patientId: prescription.patientId,
      clinicId: req.user.clinicId,
      processingStatus: 'APPROVED',
      _id: { $ne: prescription._id },
    }).sort('-prescriptionDate');

    if (!previous) {
      return res.json({ success: true, data: { message: 'No previous prescription to compare' } });
    }

    const normalize = (str) => (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const currentMeds = new Map((prescription.ai?.medicines || []).map((m) => [normalize(m.name), m]));
    const previousMeds = new Map((previous.ai?.medicines || []).map((m) => [normalize(m.name), m]));

    const added = [];
    const removed = [];
    const changed = [];

    currentMeds.forEach((m, name) => {
      if (!previousMeds.has(name)) {
        added.push(m);
      } else {
        const prev = previousMeds.get(name);
        const diffs = {};
        if (normalize(m.dosage) !== normalize(prev.dosage)) diffs.dosage = { previous: prev.dosage, current: m.dosage };
        if (normalize(m.frequency) !== normalize(prev.frequency)) diffs.frequency = { previous: prev.frequency, current: m.frequency };
        if (normalize(m.duration) !== normalize(prev.duration)) diffs.duration = { previous: prev.duration, current: m.duration };
        if (Object.keys(diffs).length > 0) {
          changed.push({ name: m.name, ...diffs });
        }
      }
    });

    previousMeds.forEach((m, name) => {
      if (!currentMeds.has(name)) removed.push(m);
    });

    let aiExplanation = null;
    try {
      const { generateText, getProvider } = require('../config/ai');
      if (getProvider() !== 'none' && (added.length || removed.length || changed.length)) {
        const prompt = `Explain prescription changes concisely for a doctor (no diagnosis). Added: ${JSON.stringify(added.map(m=>m.name))}. Removed: ${JSON.stringify(removed.map(m=>m.name))}. Changed: ${JSON.stringify(changed)}. Keep under 80 words.`;
        aiExplanation = await generateText(prompt, { temperature: 0.2, maxTokens: 200 });
      }
    } catch (_) {}
    res.json({
      success: true,
      data: {
        previousPrescriptionId: previous._id,
        previousDate: previous.prescriptionDate,
        currentDate: prescription.prescriptionDate,
        added,
        removed,
        changed,
        aiExplanation,
        deterministic: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleImportant = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, clinicId: req.user.clinicId },
      [{ $set: { important: { $not: '$important' } } }],
      { new: true }
    );
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

exports.getRevisions = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, clinicId: req.user.clinicId })
      .select('revisionHistory patientId prescriptionDate')
      .populate('revisionHistory.performedBy', 'name role');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, data: prescription.revisionHistory });
  } catch (error) {
    next(error);
  }
};
