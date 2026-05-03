const mongoose = require('mongoose');

const availableSlotSchema = new mongoose.Schema({
  day:      { type: String, required: true },
  time:     { type: String, required: true },
  isBooked: { type: Boolean, default: false }
}, { _id: false });

const clinicSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  ownerRef:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address:         { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  specializations: [{ type: String }],
  availableSlots:  [availableSlotSchema],
  timings: {
    open:  { type: String },
    close: { type: String }
  },
  isVerified: { type: Boolean, default: false },
  isDeleted:  { type: Boolean, default: false },
}, { timestamps: true });

clinicSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Clinic', clinicSchema);
