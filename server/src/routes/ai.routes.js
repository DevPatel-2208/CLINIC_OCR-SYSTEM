const router = require('express').Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);

router.post('/extract', roleMiddleware('DOCTOR'), aiController.extract);
router.post('/validate', roleMiddleware('DOCTOR'), aiController.validateExtraction);

module.exports = router;
