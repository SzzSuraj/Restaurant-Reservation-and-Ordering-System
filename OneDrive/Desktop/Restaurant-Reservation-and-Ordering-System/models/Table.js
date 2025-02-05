const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    isReserved: { type: Boolean, default: false },
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },
});

module.exports = mongoose.model('Table', tableSchema);
