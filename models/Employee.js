const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
  },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
});

// Utility to generate a secure random password
function generatePassword() {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  return Array.from({ length }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length))
  ).join('');
}

// Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to register a new employee
employeeSchema.statics.registerEmployee = async function (email) {
  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  const newEmployee = new this({ username: email, password: hashedPassword });
  await newEmployee.save();

  const transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to the Team',
    text: `Your account has been created. Use these credentials to log in:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password.`,
  };

  await transporter.sendMail(mailOptions);
  return newEmployee;
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
