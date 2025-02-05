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

router.post('/', async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
  
      io.emit('orderUpdated', newOrder); // Real-time update
      res.status(201).send(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.get('/', async (req, res) => {
    try {
      const orders = await Order.find({ status: { $ne: 'Served' } }); // Exclude "Served" orders
      res.status(200).send(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
  
      if (updatedOrder) {
        io.emit('orderUpdated', updatedOrder); // Real-time update
        res.status(200).send(updatedOrder);
      } else {
        res.status(404).send('Order not found');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  

module.exports = router;
