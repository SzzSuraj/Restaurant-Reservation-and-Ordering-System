const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Reservation = require('../models/Reservation');

const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendReminder(reservation) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reservation.email,
            subject: 'Reservation Reminder',
            text: `Hello ${reservation.fullName}, this is a reminder for your reservation at ${reservation.reservationTime} on ${new Date(reservation.reservationDate).toLocaleDateString()}.`,
        };

        await transporter.sendMail(mailOptions);

        // Update reminderSent to true
        reservation.reminderSent = true;
        await reservation.save();

        console.log(`Reminder sent to ${reservation.fullName}`);
    } catch (error) {
        console.error('Error sending reminder:', error);
    }
}


// Function to send reminders
function scheduleReminders() {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const oneHourBefore = new Date(now.getTime() + 60 * 60 * 1000); // Current time + 1 hour

        // Find reservations that are exactly 1 hour from now and reminder hasn't been sent
        const reservations = await Reservation.find({
            reservationDate: {
                $lte: oneHourBefore,
                $gt: now,
            },
            reminderSent: false,
        });

        // Send reminder for each reservation found
        for (const reservation of reservations) {
            await sendReminder(reservation);
        }
    });
}

module.exports = { scheduleReminders };
