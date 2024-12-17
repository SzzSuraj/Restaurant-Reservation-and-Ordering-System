const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // Correctly requiring the Order model

// POST route for saving orders
router.post('/submit', async (req, res) => {
    const { items, totalPrice } = req.body;

    try {
        // Log the received data to ensure it's correct
        console.log('Received Order Data:', req.body);

        const newOrder = new Order({ items, totalPrice });
        await newOrder.save();

        res.status(200).json({ message: 'Order saved successfully!' });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).send('Server Error');
    }
});

// GET route for fetching all orders
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Fetch orders in descending order
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
