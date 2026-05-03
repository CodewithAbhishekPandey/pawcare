const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['food', 'medicine', 'accessory', 'toy'], required: true },
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  stock: { type: Number, default: 0 },
  brand: { type: String },

  // Admin management fields
  isFeatured: { type: Boolean, default: false },
  isDeleted:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
