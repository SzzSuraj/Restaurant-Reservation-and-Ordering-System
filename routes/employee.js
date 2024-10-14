const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

// Initialize session middleware
router.use(session({
  secret: 'secure-employee-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // Session for 1 day
}));

// Employee Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid Username or Password' });
    }

    // Store employee details in session and redirect to dashboard
    req.session.employee = employee;
    return res.json({ success: true, redirectUrl: '/employee/dashboard' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Employee Dashboard Route (Protected)
router.get('/dashboard', (req, res) => {
  if (!req.session.employee) {
    return res.redirect('/html/employee-login.html'); // Redirect to login page if not authenticated
  }
  // Render the employee.html page (adjust path based on your project structure)
  res.sendFile(path.join(__dirname, '../public/html/employee.html'));  // Correct path to your employee.html file
});

// Employee Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.redirect('/html/employee-login.html');  // Redirect back to login page after logout
  });
});

module.exports = router;
