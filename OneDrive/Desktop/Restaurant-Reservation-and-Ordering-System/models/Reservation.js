const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    numberOfPeople: { type: Number, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    tableLocation: { type: String, required: true },
    reminderOptIn: { type: Boolean, default: false },   // NEW FIELD for opt-in
    reminderSent: { type: Boolean, default: false },    // NEW FIELD to track if reminder was sent
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Reservation', reservationSchema);
