const multer = require('multer');

const ALLOWED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};

const FILE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  pdf: [0x25, 0x50, 0x44, 0x46],
};

function getFileSignature(buffer) {
  if (buffer.length < 4) return null;
  const bytes = Array.from(buffer.slice(0, 4));
  for (const [type, sig] of Object.entries(FILE_SIGNATURES)) {
    if (sig.every((byte, i) => bytes[i] === byte)) return type;
  }
  return null;
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  const allowedExts = ALLOWED_TYPES[file.mimetype];

  if (!allowedExts) {
    return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: JPEG, PNG, PDF`), false);
  }

  if (!allowedExts.includes(ext)) {
    return cb(new Error(`File extension ${ext} does not match MIME type ${file.mimetype}`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

const validateFileSignature = (req, res, next) => {
  if (!req.file) return next();

  const signature = getFileSignature(req.file.buffer);
  const expectedType = req.file.mimetype === 'image/jpeg' ? 'jpeg'
    : req.file.mimetype === 'image/png' ? 'png'
    : req.file.mimetype === 'application/pdf' ? 'pdf'
    : null;

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Could not verify file signature. File may be corrupted.',
    });
  }

  if (expectedType && signature !== expectedType) {
    return res.status(400).json({
      success: false,
      message: `File signature (${signature}) does not match declared type (${req.file.mimetype})`,
    });
  }

  next();
};

module.exports = upload;
module.exports.validateFileSignature = validateFileSignature;
