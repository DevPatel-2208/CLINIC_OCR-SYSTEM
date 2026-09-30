const router = require('express').Router();
const timelineController = require('../controllers/timeline.controller');
const authenticate = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/patient/:patientId', timelineController.getPatientTimeline);

module.exports = router;
