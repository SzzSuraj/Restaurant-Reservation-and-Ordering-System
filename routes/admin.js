const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path'); // Import the path module

// Initialize session middleware
router.use(session({
  secret: 'secure-secret-key',  // Secure key for production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // Session for 1 day
}));

// Admin Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    const admin = await Admin.findOne({ username });
    console.log("Found Admin: ", admin);
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password Match: ", isMatch);
    if (!isMatch) {  
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }
    console.log("Login Successful");
    // Store admin details in session and redirect to admin.html
    req.session.admin = admin;
    return res.json({ success: true, redirectUrl: '/admin/dashboard' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});
