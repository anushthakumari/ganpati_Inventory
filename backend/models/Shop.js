const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
