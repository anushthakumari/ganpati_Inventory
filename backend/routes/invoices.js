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
  const session = await Invoice.startSession();
  session.startTransaction();
  try {
    const invoiceData = { ...req.body, stockDeducted: true };
    const invoice = new Invoice(invoiceData);
    const newInvoice = await invoice.save({ session });

    // Deduct stock for both draft and finalized
    for (const item of req.body.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockShop1: -item.qty } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    res.status(201).json(newInvoice);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// Update an invoice
router.put('/:id', async (req, res) => {
  const session = await Invoice.startSession();
  session.startTransaction();
  try {
    const oldInvoice = await Invoice.findById(req.params.id).session(session);
    if (!oldInvoice) throw new Error('Invoice not found');

    const newInvoiceData = { ...req.body, stockDeducted: true };
    
    // 1. Revert stock ONLY if it was previously deducted
    if (oldInvoice.stockDeducted) {
      for (const item of oldInvoice.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockShop1: item.qty } }, { session });
        }
      }
    }

    // 2. Always deduct new items stock (since we are updating and stockDeducted is always true now)
    for (const item of newInvoiceData.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stockShop1: -item.qty } }, { session });
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, newInvoiceData, { new: true, session });
    await session.commitTransaction();
    res.json(updatedInvoice);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  const session = await Invoice.startSession();
  session.startTransaction();
  try {
    const invoice = await Invoice.findById(req.params.id).session(session);
    if (!invoice) throw new Error('Invoice not found');

    // Revert stock ONLY if it was previously deducted
    if (invoice.stockDeducted) {
      for (const item of invoice.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockShop1: item.qty } }, { session });
        }
      }
    }

    await Invoice.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
