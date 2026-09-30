const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const Patient = require('../models/Patient');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generatePatientId = (clinicCode, serial) => {
  const code = (clinicCode || 'CLI').toUpperCase();
  const num = String(serial || 1).padStart(4, '0');
  return `${code}-${num}`;
};

const sanitizeFilename = (original) => {
  const ext = original.split('.').pop();
  const name = crypto.randomBytes(16).toString('hex');
  return `${name}.${ext}`;
};

const isPatient = (user) => user && user.role === 'PATIENT';

const resolvePatientForUser = async (user) => {
  if (!isPatient(user)) return null;
  const patient = await Patient.findOne({ userId: user._id });
  if (!patient) {
    const err = new Error('No patient record linked to this account');
    err.statusCode = 400;
    throw err;
  }
  return patient;
};

module.exports = { generateToken, generateResetToken, generatePatientId, sanitizeFilename, isPatient, resolvePatientForUser };