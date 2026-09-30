const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimit.middleware');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const patientRoutes = require('./routes/patient.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const medicineRoutes = require('./routes/medicine.routes');
const timelineRoutes = require('./routes/timeline.routes');
const comparisonRoutes = require('./routes/comparison.routes');
const searchRoutes = require('./routes/search.routes');
const followUpRoutes = require('./routes/followup.routes');
const documentRoutes = require('./routes/document.routes');
const reportRoutes = require('./routes/report.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const ocrRoutes = require('./routes/ocr.routes');
const aiRoutes = require('./routes/ai.routes');
const assistantRoutes = require('./routes/assistant.routes');

const app = express();

// Render/nginx terminate TLS, so X-Forwarded-* headers must be trusted for
// correct protocol detection, secure cookies and reliable rate limiting.
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (config.clientUrl || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiLimiter);

// Session restoration (`GET /auth/me`) must remain available to authenticated
// clients. Apply the tighter limit only to endpoints that accept credentials
// or reset tokens, while the normal API limiter still protects every route.
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/documents', uploadLimiter, documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assistant', assistantRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ClinicOCR API is running', timestamp: new Date().toISOString() });
});

const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

app.use(errorHandler);

module.exports = app;
