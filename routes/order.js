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

// Fetch the last 10 orders (excluding Prepared)
router.get('/latest', async (req, res) => {
    try {
        const orders = await Order.find({ status: { $ne: "Prepared" } })
            .sort({ orderTime: -1 }) // Newest first
            .limit(10); // Get last 10
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Server error");
    }
});

// Update order status
router.put('/update/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });

        res.send("Order updated");

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("Server error");
    }
});

// ✅ Add a Separate Route for Kitchen Display - Mark as Prepared & Remove from List
router.put('/mark-prepared/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: "Prepared" },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ success: true, message: "Order marked as prepared" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
