const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['pet_owner', 'vet', 'admin'], default: 'pet_owner' },
  phone: { type: String },

  // Vet-only fields
  specializations: { type: [String], default: [] },
  consultFee: { type: Number, default: 0 },       // ₹ fee per teleconsult session
  isOnline: { type: Boolean, default: false },     // available for instant consult
  totalEarnings: { type: Number, default: 0 },    // lifetime earnings from consults
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  profilePic: { type: String, default: '' },

  // Admin management fields
  isBanned:    { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  isDeleted:   { type: Boolean, default: false },

  // OTP verification fields
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String,  default: null },
  otpExpiry:   { type: Date,    default: null },
  otpAttempts: { type: Number,  default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
