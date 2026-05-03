const Appointment = require('../models/Appointment');

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { clinicRef, date, timeSlot, petName, petType, notes } = req.body;

    // Conflict check
    const conflict = await Appointment.findOne({
      clinicRef,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This slot is already booked. Please choose another time.' });
    }

    const appointment = await Appointment.create({
      petOwnerRef: req.user.id,
      clinicRef,
      date: new Date(date),
      timeSlot,
      petName,
      petType,
      notes
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/me
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ petOwnerRef: req.user.id })
      .populate('clinicRef', 'name address location')
      .sort({ date: -1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/clinic/:clinicId  (vet only)
exports.getClinicAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ clinicRef: req.params.clinicId })
      .populate('petOwnerRef', 'name email phone')
      .sort({ date: 1 })
      .lean();
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const role = req.user.role;
    const userId = req.user.id;

    // Authorization: pet_owner can only cancel their own, vet can do confirmed/completed/cancelled
    if (role === 'pet_owner') {
      if (appointment.petOwnerRef.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not your appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Pet owners can only cancel appointments' });
      }
    } else if (role !== 'vet' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    appointment.status = status;
    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
