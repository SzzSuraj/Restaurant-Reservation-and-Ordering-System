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
    const { fullName, email, mobileNumber, numberOfPeople, reservationDate, reservationTime, tableLocation, reminderOptIn } = req.body;

    try {
        // Create new reservation with reminderOptIn preference
        const reservation = new Reservation({
            fullName,
            email,
            mobileNumber,
            numberOfPeople,
            reservationDate,
            reservationTime,
            tableLocation,
            reminderOptIn: reminderOptIn === 'on'  // Checkbox returns 'on' if checked
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

        // If customer opted in for reminders, schedule a reminder email
        if (reservation.reminderOptIn) {
            scheduleReminder(reservation);
        }

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
// Helper function to schedule reminder email
function scheduleReminder(reservation) {
    // Combine reservation date and time into a Date object
    const reservationDateTime = new Date(reservation.reservationDate);
    const [hours, minutes] = reservation.reservationTime.split(':');
    reservationDateTime.setHours(parseInt(hours), parseInt(minutes));

    // Define how long before the reservation to send a reminder (e.g., 1 hour)
    const REMINDER_BEFORE_MS = 60 * 60 * 1000; // 1 hour in milliseconds
    const reminderTime = new Date(reservationDateTime.getTime() - REMINDER_BEFORE_MS);

    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
        setTimeout(async () => {
            // Send reminder email
            const reminderMailOptions = {
                from: process.env.EMAIL_USER,
                to: reservation.email,
                subject: 'Reservation Reminder',
                text: `Dear ${reservation.fullName},\n\nThis is a reminder for your upcoming reservation at Mountain Fusion Bistro.\n\nDetails:\n- Date: ${reservationDateTime.toDateString()}\n- Time: ${reservation.reservationTime}\n- Table Location: ${reservation.tableLocation}\n\nWe look forward to serving you soon!\n\nBest Regards,\nMountain Fusion Bistro`
            };
            try {
                await transporter.sendMail(reminderMailOptions);
                reservation.reminderSent = true;
                await reservation.save();
                console.log(`Reminder sent to ${reservation.email}`);
            } catch (error) {
                console.error('Error sending reminder:', error);
            }
        }, delay);
    } else {
        console.log('Reminder time has already passed for reservation', reservation._id);
    }
}
module.exports = router;
