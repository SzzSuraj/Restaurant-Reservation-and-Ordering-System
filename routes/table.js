const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
// Initialize tables (creates 80 tables)
router.post('/initialize', async (req, res) => {
    try {
        const count = await Table.countDocuments();
        if (count > 0) {
            return res.status(400).json({ message: 'Tables are already initialized.' });
        }
        const tables = [];
        for (let i = 1; i <= 80; i++) {
            tables.push({
                tableNumber: i,
                capacity: i % 4 === 0 ? 4 : 6,
                isReserved: i <= 20,
                status: 'Available',
            });
        }
        await Table.insertMany(tables);
        res.status(200).json({ message: 'Tables initialized successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error initializing tables', details: error });
    }
});
// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find();
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tables', details: error });
    }
});
// Update table status
router.put('/:tableNumber', async (req, res) => {
    try {
        const { tableNumber } = req.params;
        const { status } = req.body;
        const table = await Table.findOneAndUpdate(
            { tableNumber },
            { status },
            { new: true }
        );
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.status(200).json({ message: 'Table status updated successfully!', table });
    } catch (error) {
        res.status(500).json({ error: 'Error updating table status', details: error });
    }
});
module.exports = router;