const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST route for submitting reviews
router.post('/submit', async (req, res) => {
    const { name, message } = req.body;
    try {
        // Create and save the review in the database
        const newReview = new Review({ name, message });
        await newReview.save();

        // Redirect to the reviews page after saving the review
        res.redirect('/html/reviews.html?success=true');
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(500).send('Server Error');
    }
});

// GET route for fetching reviews
router.get('/all', async (req, res) => {
    try {
        // Fetch reviews sorted by creation date (most recent first)
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);  // Return reviews as JSON to the frontend
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
