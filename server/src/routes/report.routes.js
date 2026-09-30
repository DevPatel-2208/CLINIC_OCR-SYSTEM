const router = require('express').Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/prescription/:prescriptionId', reportController.generatePrescriptionReport);
router.get('/patient/:patientId', reportController.getPatientReports);

module.exports = router;
