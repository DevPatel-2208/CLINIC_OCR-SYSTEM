const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');
const config = require('../config/env');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');
const { createAuditLog } = require('../utils/audit');

exports.getPatientDocuments = async (req, res, next) => {
  try {
    let { patientId } = req.params;
    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      if (patientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this patient record.' });
      }
      patientId = ownPatient._id;
    }

    const query = { patientId, clinicId: req.user.clinicId };
    if (isPatient(req.user)) query.type = { $in: ['REPORT', 'LAB_RESULT'] };

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    let query = { _id: req.params.id, clinicId: req.user.clinicId };

    if (isPatient(req.user)) {
      const ownPatient = await resolvePatientForUser(req.user);
      const docCheck = await Document.findOne({ _id: req.params.id, clinicId: req.user.clinicId }).select('patientId');
      if (docCheck && docCheck.patientId.toString() !== ownPatient._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to access this document.' });
      }
      query.patientId = ownPatient._id;
      query.type = { $in: ['REPORT', 'LAB_RESULT'] };
    }

    const document = await Document.findOne(query).populate('uploadedBy', 'name');
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

exports.upload = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot upload documents' });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

    const Patient = require('../models/Patient');
    const patient = await Patient.findOne({ _id: req.body.patientId, clinicId: req.user.clinicId }).select('_id');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found in this clinic' });

    let result;
    try {
      const config = require('../config/env');
      const hasCloudinary = config.cloudinary.cloudName && config.cloudinary.cloudName !== 'your-cloud-name' && config.cloudinary.apiKey;
      if (hasCloudinary) {
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: `clinicocr/${req.user.clinicId}/documents` },
            (err, r) => err ? reject(err) : resolve(r)
          );
          uploadStream.end(req.file.buffer);
        });
      } else throw new Error('no cloudinary');
    } catch (e) {
      const fs = require('fs'); const path = require('path');
      const uploadsDir = path.resolve(__dirname, '../../../uploads/documents');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(req.file.originalname) || '';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      const baseUrl = config.publicUrl || `${req.protocol}://${req.get('host')}`;
      result = { secure_url: `${baseUrl}/uploads/documents/${filename}`, public_id: `local/${filename}` };
    }

    const document = await Document.create({
      patientId: req.body.patientId,
      type: req.body.type || 'OTHER',
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      fileUrl: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      clinicId: req.user.clinicId,
      important: req.body.important === 'true',
    });

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'UPLOAD_DOCUMENT', entity: 'Document', entityId: document._id,
      newValue: { title: document.title, type: document.type },
    });

    res.status(201).json({ success: true, message: 'Document uploaded', data: document });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    if (isPatient(req.user)) {
      return res.status(403).json({ success: false, message: 'Patients cannot delete documents' });
    }

    const document = await Document.findOne({ _id: req.params.id, clinicId: req.user.clinicId });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (document.publicId) {
      try {
        await cloudinary.uploader.destroy(document.publicId);
      } catch (e) {
        console.error('Cloudinary delete error:', e);
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user._id, clinicId: req.user.clinicId,
      action: 'DELETE_DOCUMENT', entity: 'Document', entityId: req.params.id,
      newValue: { title: document.title },
    });

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};
