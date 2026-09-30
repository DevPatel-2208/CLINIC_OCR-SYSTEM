const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const authenticate = require('../middleware/auth.middleware');
const { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/me', authenticate.optional, authController.getMe);
router.patch('/me', authenticate, authController.updateProfile);

module.exports = router;
