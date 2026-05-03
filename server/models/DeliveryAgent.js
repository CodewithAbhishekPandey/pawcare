const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  phone:           { type: String, required: true },
  email:           { type: String },
  vehicleType:     { type: String, enum: ['bike', 'cycle', 'auto', 'car'], default: 'bike' },
  area:            { type: String },
  isActive:        { type: Boolean, default: true },
  totalDeliveries: { type: Number, default: 0 },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
