const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  sizeVariant: { type: String },
  unit: { type: String, default: 'Piece' },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockShop1: { type: Number, default: 0 },
  stockShop2: { type: Number, default: 0 },
  minAlertQty: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
