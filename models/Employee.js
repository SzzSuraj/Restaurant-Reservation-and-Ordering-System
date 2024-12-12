const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExpiry: {
        type: Date,
        default: null
    }
});

// Hash password before saving
EmployeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
EmployeeSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Employee', EmployeeSchema);
