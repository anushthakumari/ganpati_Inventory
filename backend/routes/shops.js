const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

// Get all active shops
router.get('/', async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a shop
router.post('/', async (req, res) => {
  const shop = new Shop(req.body);
  try {
    const newShop = await shop.save();
    res.status(201).json(newShop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a shop
router.put('/:id', async (req, res) => {
  try {
    const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedShop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a shop (soft delete or hard delete depending on requirement, doing soft here)
router.delete('/:id', async (req, res) => {
  try {
    await Shop.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Shop deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
