const router = require('express').Router();
const assistantController = require('../controllers/assistant.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);
router.use(roleMiddleware('DOCTOR'));

router.post('/ask', assistantController.ask);

module.exports = router;
