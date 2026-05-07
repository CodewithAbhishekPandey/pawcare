const express = require('express');
const { registerUser, loginUser, verifyOTP, resendOTP, checkVerificationStatus } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/verification-status/:userId', checkVerificationStatus);

module.exports = router;
