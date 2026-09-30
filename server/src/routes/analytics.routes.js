const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/dashboard', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), analyticsController.getDashboard);
router.get('/ai-evaluation', roleMiddleware('ADMIN', 'DOCTOR'), analyticsController.getAIEvaluation);

module.exports = router;
