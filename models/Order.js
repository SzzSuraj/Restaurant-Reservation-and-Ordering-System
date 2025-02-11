const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: false }, // From the second schema
    items: [
        {
            name: { type: String, required: true }, // From the first schema
            quantity: { type: Number, required: true }, // From the first schema
            price: { type: Number, required: true } // From the first schema
        }
    ],
    totalPrice: { type: Number, required: true }, // From the first schema
    orderItems: [{ itemName: String, quantity: Number }], // From the second schema (optional, can be integrated with 'items')
    orderTime: { type: Date, default: Date.now }, // From the second schema
    status: { type: String, enum: ['Pending', 'Preparing', 'Served'], default: 'Pending' }, // From the second schema
    createdAt: { type: Date, default: Date.now }, // From the first schema
});
module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);