const crypto = require('crypto');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateToken } = require('../utils/helpers');
const { createAuditLog } = require('../utils/audit');
const config = require('../config/env');
const { sendResetEmail } = require('../config/email');

const sessionCookieOptions = {
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: config.cookieSecure ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const setSessionCookie = (res, token) => res.cookie('clinicocr_token', token, sessionCookieOptions);

const linkPatientToUser = async (user) => {
  if (user.role !== 'PATIENT') return;
  const existing = await Patient.findOne({ userId: user._id });
  if (existing) return;
  const byEmail = await Patient.findOne({ email: user.email });
  if (byEmail) {
    byEmail.userId = user._id;
    await byEmail.save();
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, clinicId, phone } = req.body;

    if (role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be self-registered' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role, clinicId, phone });
    await linkPatientToUser(user);
    const token = generateToken(user._id);
    setSessionCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await linkPatientToUser(user);

    const token = generateToken(user._id);
    setSessionCookie(res, token);

    await createAuditLog({
      userId: user._id,
      clinicId: user.clinicId,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('clinicocr_token', { ...sessionCookieOptions, maxAge: undefined });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${config.clientUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    try {
      await sendResetEmail({ to: user.email, toName: user.name, resetUrl });
    } catch (mailErr) {
      console.error('[Email] forgot-password send failed:', mailErr.message);
      if (config.nodeEnv === 'development') {
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent (email delivery failed — see server log)',
          resetToken,
          resetUrl,
          emailError: mailErr.message,
        });
      }
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    await createAuditLog({
      userId: user._id,
      clinicId: user.clinicId,
      action: 'FORGOT_PASSWORD',
      entity: 'User',
      entityId: user._id,
    });

    res.json({
      success: true,
      message: 'Reset link sent to your email',
      ...(config.nodeEnv === 'development' && { resetToken, resetUrl }),
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await createAuditLog({
      userId: user._id,
      clinicId: user.clinicId,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user._id,
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user || null } });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'specialization', 'professionalInfo'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, clinicId: req.user.clinicId },
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};
