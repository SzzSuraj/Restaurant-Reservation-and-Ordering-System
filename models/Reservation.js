const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    numberOfPeople: { type: Number, required: true },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    tableNumber: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
