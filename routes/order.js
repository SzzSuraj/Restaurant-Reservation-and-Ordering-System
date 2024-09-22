const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // Assuming you have an Order model

// POST route for saving orders
router.post('/submit', async (req, res) => {
    const { items, totalPrice } = req.body;
    try {
        const newOrder = new Order({ items, totalPrice });
        await newOrder.save();
        res.status(200).send('Order saved');
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// GET route for fetching all orders
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);  // Send orders to the frontend
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
