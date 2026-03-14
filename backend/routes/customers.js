const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

// Get all customers with dynamic credit balance calculation
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    
    // Calculate credit balance for each customer based on draft invoices
    const customersWithCredit = await Promise.all(customers.map(async (customer) => {
      const drafts = await Invoice.find({ 
        'customer.phone': customer.phone, 
        status: 'draft' 
      });
      
      const creditBalance = drafts.reduce((sum, inv) => sum + inv.grandTotal, 0);
      
      const cObj = customer.toObject();
      return { 
        ...cObj, 
        id: cObj._id,
        creditBalance // Overwrite with dynamic calculation
      };
    }));

    res.json(customersWithCredit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a customer
router.post('/', async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
