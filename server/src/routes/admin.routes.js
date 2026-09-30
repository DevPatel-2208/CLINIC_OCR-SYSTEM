const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authenticate);
router.use(roleMiddleware('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/doctors', adminController.getDoctors);
router.post('/doctors', adminController.addDoctor);
router.get('/doctors/:id', adminController.getDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.put('/doctors/:id/status', adminController.toggleDoctorStatus);

router.get('/staff', adminController.getStaff);
router.post('/staff', adminController.addStaff);
router.get('/staff/:id', adminController.getStaffMember);
router.put('/staff/:id', adminController.updateStaff);
router.put('/staff/:id/status', adminController.toggleStaffStatus);

router.get('/patients', adminController.getPatients);
router.get('/patients/:id', adminController.getPatientDetails);

router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
