const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    name: String,
    numberOfPeople: Number,
    date: Date,
    time: String,
    phone: String,
    dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
