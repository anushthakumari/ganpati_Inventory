const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

// Get Dashboard Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalInvoices = await Invoice.find();
    
    // Revenue & Profit
    const totalRevenue = totalInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalOrders = totalInvoices.length;
    
    // Low Stock Items
    const products = await Product.find();
    const lowStockItems = products.filter(p => (p.stockShop1 + p.stockShop2) < p.minAlertQty).length;

    // Simple net profit calculation (dummy for now, can be improved with purchase price)
    // Assuming 20% margin if purchase price isn't consistently tracked
    const netProfit = totalInvoices.reduce((sum, inv) => {
      const invoiceProfit = inv.items.reduce((pSum, item) => pSum + (item.price - (item.purchasePrice || item.price * 0.8)) * item.qty, 0);
      return sum + invoiceProfit;
    }, 0);

    res.json({
      totalRevenue,
      totalOrders,
      lowStockCount: lowStockItems,
      netProfit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Sales Chart Data (Last 7 Days)
router.get('/sales-chart', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const invoices = await Invoice.find({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Group by day
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];
    
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        
        const dayRevenue = invoices
            .filter(inv => new Date(inv.createdAt).toDateString() === d.toDateString())
            .reduce((sum, inv) => sum + inv.grandTotal, 0);
            
        chartData.push({ name: dayName, revenue: dayRevenue });
    }

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Top Products
router.get('/top-products', auth, async (req, res) => {
    try {
        // Aggregate top selling products from invoices
        const topProducts = await Invoice.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                name: { $first: "$items.name" },
                category: { $first: "$items.category" },
                sales: { $sum: "$items.qty" }
            }},
            { $sort: { sales: -1 } },
            { $limit: 5 }
        ]);

        // Get current stock for these products
        const productsWithStock = await Promise.all(topProducts.map(async (tp) => {
            const p = await Product.findById(tp._id);
            return {
                id: tp._id,
                name: tp.name,
                category: tp.category,
                sales: tp.sales,
                stock: p ? (p.stockShop1 + p.stockShop2) : 0
            };
        }));

        res.json(productsWithStock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Category Reports
router.get('/category-reports', auth, async (req, res) => {
    try {
        const report = await Invoice.aggregate([
            { $unwind: "$items" },
            { $group: {
                _id: "$items.category",
                sales: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
                profit: { $sum: { $multiply: [{ $subtract: ["$items.price", { $ifNull: ["$items.purchasePrice", { $multiply: ["$items.price", 0.8] }] }] }, "$items.qty"] } }
            }},
            { $project: {
                name: "$_id",
                sales: 1,
                profit: 1,
                _id: 0
            }}
        ]);
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
