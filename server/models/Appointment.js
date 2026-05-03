const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  petOwnerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  petName: { type: String, required: true },
  petType: { type: String, required: true },
  notes: { type: String },

  // Online appointment fields
  type: { type: String, enum: ['in_person', 'scheduled_online'], default: 'in_person' },
  meetRoomId: { type: String },
  meetLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
