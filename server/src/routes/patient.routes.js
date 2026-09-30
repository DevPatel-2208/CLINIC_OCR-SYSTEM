const router = require('express').Router();
const patientController = require('../controllers/patient.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { createPatientSchema, updatePatientSchema } = require('../validators/patient.validator');

router.use(authenticate);

router.get('/', patientController.list);
router.get('/search', patientController.search);
router.get('/me', patientController.getMe);
router.post('/', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), validate(createPatientSchema), patientController.create);
router.get('/:id', patientController.getById);
router.put('/:id', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), validate(updatePatientSchema), patientController.update);
router.get('/:id/prescriptions', patientController.getPrescriptions);
router.get('/:id/timeline', patientController.getTimeline);
router.get('/:id/medicines', patientController.getMedicineHistory);
router.get('/:id/followups', patientController.getFollowUps);
router.get('/:id/documents', patientController.getDocuments);

module.exports = router;
