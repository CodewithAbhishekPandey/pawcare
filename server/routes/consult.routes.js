const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAvailableVets,
  createOrder,
  verifyPayment,
  getSession,
  completeSession,
  rateSession,
  getZegoToken,
  getMySessions,
  getVetSessions,
} = require('../controllers/consult.controller');

// Public
router.get('/available-vets', getAvailableVets);

// Auth required
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/session/:id', protect, getSession);
router.post('/complete', protect, completeSession);
router.post('/rate', protect, rateSession);
router.get('/zego-token', protect, getZegoToken);
router.get('/my-sessions', protect, getMySessions);
router.get('/vet-sessions', protect, getVetSessions);

module.exports = router;
