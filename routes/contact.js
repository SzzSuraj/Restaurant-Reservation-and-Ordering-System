const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Handle POST request for contact form submissions
router.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const contactMessage = new Contact({ name, email, message });
    await contactMessage.save();
    res.redirect('/html/contact.html?success=true'); // Add a query parameter for success
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
