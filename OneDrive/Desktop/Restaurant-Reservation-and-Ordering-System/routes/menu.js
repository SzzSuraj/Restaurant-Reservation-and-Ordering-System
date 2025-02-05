const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const moment = require('moment');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

// GET route to fetch all menu items
router.get('/all', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// POST route to add a new menu item
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : 'dummy-photo.jpg';
        const newMenuItem = new MenuItem({ name, category, price, imageUrl });
        await newMenuItem.save();
        res.status(201).json({ message: 'Menu item added successfully', newMenuItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add menu item' });
    }
});

// DELETE route to remove a menu item by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

// PUT route to update a menu item by ID
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price } = req.body;
        const updates = { name, category, price };

        if (req.file) {
            updates.imageUrl = `/uploads/${req.file.filename}`;
        }

        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item updated successfully', menuItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

// PUT route to apply discount
router.put('/discount/:id', async (req, res) => {
    try {
        const { discountedPrice, discountPercentage, duration } = req.body;

        if (!discountedPrice || discountedPrice <= 0 || !discountPercentage || !duration) {
            return res.status(400).json({ error: 'Invalid discount details.' });
        }

        // Calculate the end time of the discount
        const discountEndTime = moment().add(duration, 'hours').toDate();

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { 
                price: discountedPrice, 
                discountPercentage, 
                discountEndTime 
            },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found.' });
        }

        res.json({ message: 'Discount applied successfully!', menuItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to apply discount.' });
    }
});


module.exports = router;
