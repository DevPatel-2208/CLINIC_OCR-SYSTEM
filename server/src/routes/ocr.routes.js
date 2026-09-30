const router = require('express').Router();
const ocrController = require('../controllers/ocr.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);

router.post('/process', roleMiddleware('DOCTOR', 'RECEPTIONIST'), ocrController.processImage);
router.get('/status/:prescriptionId', ocrController.getProcessingStatus);

module.exports = router;
