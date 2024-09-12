const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Handle POST request for reservation
router.post('/book', async (req, res) => {
  const { name, numberOfPeople, date, time, phone } = req.body;

  try {
    const reservation = new Reservation({ name, numberOfPeople, date, time, phone });
    await reservation.save();
    res.redirect('/reservation.html');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
