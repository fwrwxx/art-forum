const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validateUpdateProfile, validateChangePassword } = require('../middleware/validationMiddleware');

router.get('/me', protect, profileController.getMyProfile);
router.put('/me', protect, validateUpdateProfile, profileController.updateProfile);
router.put('/me/change-password', protect, validateChangePassword, profileController.changePassword);

module.exports = router;