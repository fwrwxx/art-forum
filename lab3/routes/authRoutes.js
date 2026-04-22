const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', validateRegistration, authController.register);
router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;