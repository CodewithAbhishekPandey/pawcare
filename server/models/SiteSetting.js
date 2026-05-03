const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  key:   { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  label: { type: String },
  type:  { type: String, enum: ['text', 'number', 'boolean', 'json'], default: 'text' },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
