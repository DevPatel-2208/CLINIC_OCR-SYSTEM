const router = require('express').Router();
const comparisonController = require('../controllers/comparison.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/:prescriptionId/with/:previousPrescriptionId', roleMiddleware('DOCTOR'), comparisonController.compare);

module.exports = router;
