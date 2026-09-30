const router = require('express').Router();
const prescriptionController = require('../controllers/prescription.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validation.middleware');
const { reviewSchema, approveSchema } = require('../validators/prescription.validator');

router.use(authenticate);

router.post('/upload', roleMiddleware('DOCTOR', 'RECEPTIONIST'), upload.single('image'), upload.validateFileSignature, prescriptionController.upload);
router.get('/', prescriptionController.list);
router.get('/:id', prescriptionController.getById);
router.post('/:id/review', roleMiddleware('DOCTOR'), validate(reviewSchema), prescriptionController.review);
router.post('/:id/approve', roleMiddleware('DOCTOR'), validate(approveSchema), prescriptionController.approve);
router.post('/:id/reject', roleMiddleware('DOCTOR'), prescriptionController.reject);
router.post('/:id/retry', roleMiddleware('DOCTOR', 'RECEPTIONIST'), prescriptionController.retry);
router.get('/:id/compare', roleMiddleware('DOCTOR'), prescriptionController.compare);
router.get('/:id/revisions', roleMiddleware('DOCTOR'), prescriptionController.getRevisions);
router.put('/:id/important', roleMiddleware('DOCTOR'), prescriptionController.toggleImportant);

module.exports = router;
