const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Handle POST request to make a reservation
router.post('/submit', async (req, res) => {
  const { fullName, mobileNumber, numberOfPeople, reservationDate, reservationTime, tableNumber } = req.body;

  try {
    const reservation = new Reservation({
      fullName,
      mobileNumber,
      numberOfPeople,
      reservationDate,
      reservationTime,
      tableNumber
    });
    await reservation.save();
    
    // Redirect back to the reservation page with a success message
    res.redirect('/html/reservation.html?success=true');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
