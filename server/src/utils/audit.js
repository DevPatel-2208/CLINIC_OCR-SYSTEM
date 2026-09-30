const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ userId, clinicId, action, entity, entityId, previousValue, newValue, metadata, ip }) => {
  try {
    await AuditLog.create({ userId, clinicId, action, entity, entityId, previousValue, newValue, metadata, ip });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { createAuditLog };