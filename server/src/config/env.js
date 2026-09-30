const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/clinicocr',
  jwtSecret: process.env.JWT_SECRET || 'clinicocr-jwt-secret-dev',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  publicUrl: (process.env.PUBLIC_URL || '').replace(/\/$/, ''),
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  pythonAiServiceUrl: process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
    fromName: process.env.FROM_NAME || 'ClinicOCR',
    fromEmail: process.env.FROM_EMAIL || process.env.SMTP_EMAIL,
  },
};
