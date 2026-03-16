const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  sizeVariant: { type: String },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  inventoryLocations: [{
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    shopName: { type: String, required: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, required: true }
  }],
  minAlertQty: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
