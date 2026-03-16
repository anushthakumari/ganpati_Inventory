const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an invoice
router.post('/', async (req, res) => {
  try {
    const invoiceData = { ...req.body, stockDeducted: true };
    const invoice = new Invoice(invoiceData);
    const newInvoice = await invoice.save();

    // Deduct stock for both draft and finalized
    for (const item of req.body.items) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.inventoryLocations && product.inventoryLocations.length > 0) {
          // Find the first location with enough stock, or just default to the first location
          let targetLoc = product.inventoryLocations.find(l => l.stock >= item.qty);
          if (!targetLoc) targetLoc = product.inventoryLocations[0];
          targetLoc.stock -= item.qty;
          await product.save();
        }
      }
    }

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Invoice Creation Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an invoice
router.put('/:id', async (req, res) => {
  try {
    const oldInvoice = await Invoice.findById(req.params.id);
    if (!oldInvoice) throw new Error('Invoice not found');

    const newInvoiceData = { ...req.body, stockDeducted: true };
    
    // 1. Revert stock ONLY if it was previously deducted
    if (oldInvoice.stockDeducted) {
      for (const item of oldInvoice.items) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product && product.inventoryLocations && product.inventoryLocations.length > 0) {
            product.inventoryLocations[0].stock += item.qty;
            await product.save();
          }
        }
      }
    }

    // 2. Always deduct new items stock (since we are updating and stockDeducted is always true now)
    for (const item of newInvoiceData.items) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.inventoryLocations && product.inventoryLocations.length > 0) {
          let targetLoc = product.inventoryLocations.find(l => l.stock >= item.qty);
          if (!targetLoc) targetLoc = product.inventoryLocations[0];
          targetLoc.stock -= item.qty;
          await product.save();
        }
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, newInvoiceData, { new: true });
    res.json(updatedInvoice);
  } catch (err) {
    console.error('Invoice Update Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) throw new Error('Invoice not found');

    // Revert stock ONLY if it was previously deducted
    if (invoice.stockDeducted) {
      for (const item of invoice.items) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (product && product.inventoryLocations && product.inventoryLocations.length > 0) {
            product.inventoryLocations[0].stock += item.qty;
            await product.save();
          }
        }
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record a payment installment on an invoice
router.post('/:id/payment', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const { amount, method, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

    // Add payment entry
    invoice.payments.push({ amount, method: method || 'cash', note: note || '' });
    invoice.amountPaid = (invoice.amountPaid || 0) + amount;

    // Update status
    if (invoice.amountPaid >= invoice.grandTotal) {
      invoice.status = 'fully_paid';
    } else {
      invoice.status = 'partially_paid';
    }

    const updated = await invoice.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
