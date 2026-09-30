const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', notificationController.list);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
