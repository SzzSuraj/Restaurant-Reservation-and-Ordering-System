const express = require('express');
const router = express.Router();

let notificationMessage = ''; // Temporary storage for the message

// Save message
router.post('/save-message', (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            console.log('Validation Error: Empty message received.');
            return res.status(400).json({ error: 'Message cannot be empty.' });
        }

        notificationMessage = message.trim();
        console.log('Message saved:', notificationMessage);
        res.json({ message: 'Notification message saved successfully!' });
    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// Get message
router.get('/get-message', (req, res) => {
    res.json({ message: notificationMessage });
});

module.exports = router;
