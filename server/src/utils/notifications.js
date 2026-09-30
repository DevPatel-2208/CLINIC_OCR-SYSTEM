const Notification = require('../models/Notification');

const createNotification = async ({ userId, clinicId, type, title, message, entityType, entityId }) => {
  try {
    if (!userId) {
      console.warn('Notification skipped: no userId provided');
      return null;
    }

    const validTypes = ['FOLLOW_UP', 'PRESCRIPTION', 'REVIEW', 'SYSTEM', 'REPORT'];
    const notificationType = validTypes.includes(type) ? type : 'SYSTEM';

    const notification = await Notification.create({
      userId,
      clinicId,
      type: notificationType,
      title,
      message,
      relatedEntity: (entityType && entityId) ? { entityType, entityId } : undefined,
    });

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error.message);
    return null;
  }
};

const getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({ userId, read: false });
  } catch (error) {
    console.error('Unread count error:', error.message);
    return 0;
  }
};

module.exports = { createNotification, getUnreadCount };
