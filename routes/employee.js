const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const router = express.Router();
const Employee = require('../models/Employee');

// Session middleware (ensure app.js includes session management)
router.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true in production with HTTPS
}));

// Employee Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate user input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        // Check if employee exists
        const employee = await Employee.findOne({ email: username });
        if (!employee) {
            return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
        }

        // Set session
        req.session.employee = {
            id: employee._id,
            name: employee.name,
            email: employee.email
        };

        console.log(`Login successful for employee: ${employee.email}`);

        // Respond with success and redirect URL
        res.json({ success: true, redirectUrl: '/employee/dashboard' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Employee Dashboard Route (Protected)
router.get('/dashboard', (req, res) => {
    if (!req.session.employee) {
        return res.redirect('/html/employee-login.html');
    }
    res.sendFile(path.join(__dirname, '../html/employee-dashboard.html'));
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to generate a strong password
function generateStrongPassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}

// Employee Registration
router.post('/register', async (req, res) => {
    const { name, email } = req.body;

    try {
        console.log("Received registration request:", { name, email });

        const existingEmployee = await Employee.findOne({ email });
        console.log("Existing employee check:", existingEmployee);

        if (existingEmployee) {
            console.log("Employee already exists");
            return res.status(400).json({ success: false, message: 'Employee already exists' });
        }

        // Generate a strong password
        const password = generateStrongPassword();
        console.log("Generated password:", password);

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password created");

        const employee = new Employee({ name, email, password: hashedPassword });
        console.log("Saving new employee to database:", employee);
        await employee.save();

        console.log("Sending email to employee...");
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the Company',
            text: `Hello ${name},\n\nYour account has been created successfully.\nYour login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nCompany Team`
        });

        console.log("Employee registered and email sent successfully");
        res.status(201).json({ success: true, message: 'Employee registered successfully' });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});



// Employee Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        employee.resetToken = resetToken;
        employee.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await employee.save();

        const resetLink = `http://localhost:3000/html/employee-reset-password.html?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Employee Password Reset Request',
            text: `Click the link to reset your password: ${resetLink}`
        });

        res.status(200).json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Employee Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const employee = await Employee.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!employee) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        employee.password = await bcrypt.hash(newPassword, 10);
        employee.resetToken = null;
        employee.resetTokenExpiry = null;
        await employee.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Employee logout route
router.get('/employee-logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out');
        res.redirect('/html/employee-login.html');
    });
});

module.exports = router;
