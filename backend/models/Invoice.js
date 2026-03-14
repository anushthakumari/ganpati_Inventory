const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  gst: { type: Number, default: 18 },
});

const invoiceSchema = new mongoose.Schema({
  customer: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    gstin: { type: String },
  },
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  totalGst: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'cheque'], default: 'cash' },
  status: { type: String, enum: ['draft', 'finalized'], default: 'finalized' },
  stockDeducted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
