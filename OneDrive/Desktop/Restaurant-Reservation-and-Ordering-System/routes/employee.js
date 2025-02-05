const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

// Employee Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const employee = await Employee.findOne({ username });
    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    req.session.employee = employee;
    res.json({ success: true, redirectUrl: '/employee/dashboard' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Employee Dashboard
router.get('/dashboard', (req, res) => {
  if (!req.session.employee) {
    return res.redirect('/html/employee-login.html');
  }
  res.sendFile(path.join(__dirname, '../public/html/employee-dashboard.html'));
});

// Employee Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/html/employee-login.html');
  });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const employee = await Employee.findOne({ username: email });
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    employee.resetPasswordToken = token;
    employee.resetPasswordExpires = Date.now() + 3600000;
    await employee.save();

    const transporter = nodemailer.createTransport({
      service: 'Yahoo',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: http://${req.headers.host}/employee/reset/${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Reset Password
router.get('/reset/:token', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!employee) {
      return res.status(400).send('Invalid or expired token');
    }
    res.sendFile(path.join(__dirname, '../public/html/employee-reset-password.html'));
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/reset/:token', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }
    employee.password = req.body.password;
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpires = undefined;
    await employee.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Employee Registration
router.post('/employee-registration', async (req, res) => {
  try {
    const { username } = req.body;
    if (await Employee.findOne({ username })) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const newEmployee = await Employee.registerEmployee(username);
    res.json({ success: true, message: 'Employee registered', employee: newEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

module.exports = router;
