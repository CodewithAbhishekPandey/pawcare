const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getClinicAppointments,
  updateStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/me', protect, getMyAppointments);
router.get('/clinic/:clinicId', protect, getClinicAppointments);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
