
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST route for submitting reviews
router.post('/submit', async (req, res) => {
    try {
        // Create and save the review in the database
        const { name, message } = req.body;
        const newReview = new Review({ name, message });
        await newReview.save();

        // Redirect back to the reviews page
        res.redirect('/reviews.html');
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).send('Server Error');
    }
});

// GET route for fetching reviews as JSON
router.get('/all', async (req, res) => {
    try {
        // Fetch reviews sorted by creation date (most recent first)
        const reviews = await Review.find().sort({ date: -1 });
        res.json(reviews);  // Send reviews as JSON to be handled by the frontend
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
