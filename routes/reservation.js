const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Handle POST request to make a reservation
router.post('/submit', async (req, res) => {
    const { fullName, email, mobileNumber, numberOfPeople, reservationDate, reservationTime, tableLocation } = req.body;

    try {
        // Save reservation details in the database
        const reservation = new Reservation({
            fullName,
            email,
            mobileNumber,
            numberOfPeople,
            reservationDate,
            reservationTime,
            tableLocation
        });
        await reservation.save();

        // Send email confirmation to the user
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Reservation at Mountain Fusion Bistro',
            text: `Dear ${fullName},\n\nThank you for making a reservation at Mountain Fusion Bistro.\n\nDetails of your reservation:\n- Full Name: ${fullName}\n- Mobile Number: ${mobileNumber}\n- Number of People: ${numberOfPeople}\n- Date: ${reservationDate}\n- Time: ${reservationTime}\n- Table Location: ${tableLocation}\n\nWe look forward to welcoming you.\n\nBest Regards,\nMountain Fusion Bistro`
        };

        await transporter.sendMail(mailOptions);

        // Redirect back to the reservation page with a success message
        res.redirect('/html/reservation.html?success=true');
    } catch (error) {
        console.error('Error saving reservation or sending email:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations); // Send reservations as JSON
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).send('Server Error');
    }
});

router.put('/api/update/:id', async (req, res) => {
    const { id } = req.params;
    const { numberOfPeople, reservationDate, reservationTime, tableLocation } = req.body;

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { numberOfPeople, reservationDate, reservationTime, tableLocation },
            { new: true } // Return the updated document
        );

        if (!updatedReservation) {
            return res.status(404).send('Reservation not found');
        }

        res.json(updatedReservation); // Send the updated reservation as response
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).send('Server Error');
    }
});

router.delete('/api/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedReservation = await Reservation.findByIdAndDelete(id);

        if (!deletedReservation) {
            return res.status(404).send('Reservation not found');
        }

        res.send({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
