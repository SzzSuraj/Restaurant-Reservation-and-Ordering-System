const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Handle POST request for contact form submission
router.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.redirect('/contact.html');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
