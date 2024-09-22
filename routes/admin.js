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

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {  
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }
    // Store admin details in session and redirect to admin.html
    req.session.admin = admin;
    return res.json({ success: true, redirectUrl: '/admin/dashboard' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Admin Dashboard Route (Protected)
router.get('/dashboard', (req, res) => {
  if (!req.session.admin) {
    return res.redirect('/html/admin-login.html'); // Redirect to login page if not authenticated
  }
  // Render the admin.html page (adjust path based on your project structure)
  res.sendFile(path.join(__dirname, '../public/html/admin-dashboard.html'));  // Correct path to your admin.html file
});

// Admin Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/html/admin-login.html');  // Redirect back to login page after logout
  });
});

module.exports = router;
