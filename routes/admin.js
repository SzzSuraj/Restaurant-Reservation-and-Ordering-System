const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path'); // Import the path module
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
// Password Reset Request Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  console.log('Received password reset request for email:', email);

  try {
      // Check if the admin exists
      const admin = await Admin.findOne({ username: email });
      if (!admin) {
          console.log('Email not found in the database.');
          return res.status(400).json({ success: false, message: 'Email not found in the database.' });
      }

      console.log('Admin found:', admin);

      // Generate a reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      console.log('Generated reset token:', resetToken);

      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      // Save the admin document with the reset token
      await admin.save();
      console.log('Reset token saved to admin document.');

      // Set up the email transporter
      const transporter = nodemailer.createTransport({
          host: 'smtp.mail.yahoo.com',
          port: 465,
          secure: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      console.log('Nodemailer transporter configured.');

      const mailOptions = {
          to: admin.username,
          from: process.env.EMAIL_USER,
          subject: 'Password Reset',
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
          http://${req.headers.host}/admin/reset/${resetToken}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      // Send the email
      try {
          await transporter.sendMail(mailOptions);
          console.log('Password reset email sent successfully.');
          res.json({ success: true });
      } catch (emailError) {
          console.error('Error sending password reset email:', emailError);
          res.status(500).json({ success: false, message: 'Failed to send password reset email.' });
      }
  } catch (error) {
      console.error('Error during password reset request:', error);
      res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
  }
});


// Password Reset Route
router.get('/reset/:token', async (req, res) => {
  try {
      const admin = await Admin.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() } // Ensure the token is not expired
      });

      if (!admin) {
          return res.status(400).send('Password reset token is invalid or has expired.');
      }

      res.sendFile(path.join(__dirname, '../public/html/reset-password.html')); // Serve a reset password page
  } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).send('Server Error');
  }
});

// Handle new password submission
router.post('/reset/:token', async (req, res) => {
  try {
      const admin = await Admin.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() }
      });

      if (!admin) {
          return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
      }

      const { password } = req.body;
      admin.password = password; // Password hashing is done by pre-save hook in Admin schema
      admin.resetPasswordToken = undefined; // Clear the reset token
      admin.resetPasswordExpires = undefined;
      await admin.save();

      res.json({ success: true, message: 'Password successfully updated.' });
  } catch (error) {
      console.error('Error while updating password:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Manage Announcements Page Route
router.get('/manage-announcements', (req, res) => {
  if (!req.session.admin) {
      return res.redirect('/html/admin-login.html'); // Redirect to login page if not authenticated
  }
  res.sendFile(path.join(__dirname, '../public/html/manage-announcements.html'));
});

// Handle Announcement Submission
router.post('/manage-announcements', async (req, res) => {
  if (!req.session.admin) {
      return res.redirect('/html/admin-login.html');
  }
  try {
      const { announcement } = req.body;
      await Announcement.findOneAndUpdate({}, { text: announcement }, { upsert: true });
      res.redirect('/admin/dashboard');
  } catch (error) {
      console.error('Error saving announcement:', error);
      res.status(500).send('Server Error');
  }
});

module.exports = router;
