const router = require('express').Router();
const followUpController = require('../controllers/followup.controller');
const authenticate = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { createFollowUpSchema, updateFollowUpSchema } = require('../validators/followup.validator');

router.use(authenticate);

router.get('/', followUpController.list);
router.post('/', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), validate(createFollowUpSchema), followUpController.create);
router.get('/:id', followUpController.getById);
router.put('/:id', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), validate(updateFollowUpSchema), followUpController.update);
router.put('/:id/status', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), followUpController.updateStatus);
router.delete('/:id', roleMiddleware('ADMIN', 'DOCTOR'), followUpController.remove);

module.exports = router;
