const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// PATCH /api/users/me — update name + phone
router.patch('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select('-password').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/me — get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/users/me/online-status — vet toggles online/offline
router.patch('/me/online-status', protect, async (req, res) => {
  try {
    if (req.user.role !== 'vet') {
      return res.status(403).json({ success: false, message: 'Only vets can toggle online status' });
    }

    const { isOnline } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isOnline },
      { new: true }
    ).select('-password').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Emit socket event via io attached to app
    const io = req.app.get('io');
    if (io) {
      if (isOnline) {
        io.to('consult_lobby').emit('vet_came_online', {
          vetId: user._id,
          name: user.name,
          consultFee: user.consultFee,
          specializations: user.specializations,
          rating: user.rating,
          totalRatings: user.totalRatings,
        });
      } else {
        io.to('consult_lobby').emit('vet_went_offline', { vetId: user._id });
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/users/me/consult-fee — vet sets their consultation fee
router.patch('/me/consult-fee', protect, async (req, res) => {
  try {
    if (req.user.role !== 'vet') {
      return res.status(403).json({ success: false, message: 'Only vets can set consult fee' });
    }
    const { consultFee } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { consultFee },
      { new: true }
    ).select('-password').lean();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
