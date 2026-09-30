const router = require('express').Router();
const medicineController = require('../controllers/medicine.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/history/:patientId', medicineController.getPatientMedicineHistory);
router.get('/search/:name', medicineController.searchByName);
router.get('/:id', medicineController.getById);

module.exports = router;
