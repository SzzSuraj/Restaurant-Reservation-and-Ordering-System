const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Session middleware with cookie settings
router.use(session({
  secret: 'your-very-secure-secret-key',  // Update this with a secure key for production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // Session lasts for 1 day
}));

// Admin Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).send('Invalid Username or Password');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).send('Invalid Username or Password');

    // Store admin details in the session
    req.session.admin = admin;
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Admin Dashboard Route
router.get('/dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/html/admin.html');  // Redirect to login page if not logged in
  }
  res.send('Welcome to the Admin Dashboard!');
});

// Admin Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/html/admin.html');
  });
});

module.exports = router;
