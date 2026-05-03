const mongoose = require('mongoose');

const consultSessionSchema = new mongoose.Schema({
  petOwnerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vetRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: {
    type: String,
    enum: ['payment_pending', 'waiting', 'matched', 'in_call', 'completed', 'cancelled'],
    default: 'payment_pending'
  },

  petName: { type: String },
  petType: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'] },
  issue: { type: String, maxlength: 200 },

  meetRoomId: { type: String },

  fee: { type: Number, required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },

  duration: { type: Number }, // minutes, filled on complete
  ownerRating: { type: Number, min: 1, max: 5 },
  ownerReview: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ConsultSession', consultSessionSchema);
