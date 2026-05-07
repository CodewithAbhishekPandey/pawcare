const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail, resendOTPEmail } = require('../utils/otpService');

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'pawcare_super_secret_key_2026', { expiresIn: '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'pet_owner',
      phone,
      isVerified: false,
      otp,
      otpExpiry,
      otpAttempts: 0
    });

    console.log(`[OTP] Generated verification OTP for ${user.email} is: ${otp}`);
    sendOTPEmail(user.email, otp, user.name)
      .catch(err => console.error('OTP email failed:', err));

    return res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for the verification code.',
      data: {
        userId: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned. Contact support@pawcare.in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
        needsVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    const token = signToken(user._id, user.role);
    return res.json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Already verified', alreadyVerified: true });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.', expired: true });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({ success: false, message: `Incorrect OTP. ${remaining} attempts remaining.` });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    const token = signToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to PawCare.',
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified.' });
    }

    // Rate limit - check if last OTP was sent less than 60 seconds ago:
    if (user.otpExpiry && (user.otpExpiry.getTime() - 10 * 60 * 1000) > Date.now() - 60 * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    console.log(`[OTP] Resent verification OTP for ${user.email} is: ${otp}`);
    resendOTPEmail(user.email, otp, user.name)
      .catch(err => console.error('Resend OTP email failed:', err));

    return res.status(200).json({
      success: true,
      message: `A new OTP has been sent to ${user.email}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/verification-status/:userId
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('isVerified email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      data: { isVerified: user.isVerified, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Aliases for older route file
exports.registerUser = exports.register;
exports.loginUser = exports.login;
