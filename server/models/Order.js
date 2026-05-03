const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      qty:        { type: Number, required: true },
      price:      { type: Number, required: true }
    }
  ],
  total:   { type: Number, required: true },
  status:  { type: String, enum: ['placed', 'processing', 'delivered', 'cancelled'], default: 'placed' },
  address: { type: String, required: true },

  // Cancellation & Refund
  isCancelled:       { type: Boolean, default: false },
  cancelledBy:       { type: String, enum: ['customer', 'admin'], default: null },
  cancellationReason:{ type: String, default: null },
  cancelledAt:       { type: Date, default: null },
  paymentMethod:     { type: String, enum: ['cod', 'prepaid'], default: 'cod' },
  refundStatus:      { type: String, enum: ['na', 'pending', 'processed'], default: 'na' },
  refundAmount:      { type: Number, default: 0 },

  // Delivery Agent
  assignedAgent:     { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent', default: null },
  assignedAt:        { type: Date, default: null },
  estimatedDelivery: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
