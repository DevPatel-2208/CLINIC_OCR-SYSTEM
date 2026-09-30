const router = require('express').Router();
const documentController = require('../controllers/document.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

router.get('/patient/:patientId', documentController.getPatientDocuments);
router.get('/:id', documentController.getById);
router.post('/upload', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), upload.single('file'), documentController.upload);
router.delete('/:id', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), documentController.delete);

module.exports = router;
