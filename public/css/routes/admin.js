const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin'); // Import the Admin model
const bcrypt = require('bcrypt');
const session = require('express-session'); // For session management

// Initialize session
router.use(session({
  secret: 'secret-key',  // Use a more secure key for production
  resave: false,
  saveUninitialized: false
}));

// Admin Login (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).send('Invalid Username or Password');
    }

    // Check if the password is valid
    const isMatch = await admin.isValidPassword(password);
    if (!isMatch) {
      return res.status(400).send('Invalid Username or Password');
    }

    // Set up session
    req.session.admin = admin;
    return res.redirect('/admin-dashboard'); // Redirect to admin dashboard after login
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Admin Dashboard (protected route)
router.get('/dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/admin.html'); // Redirect to login if not authenticated
  }

  // Render admin dashboard (replace with actual view or HTML)
  res.send('Welcome to Admin Dashboard');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Server Error');
    }
    res.redirect('/admin.html'); // Redirect to login after logout
  });
});

module.exports = router;
