const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const messageRoutes = require('./routes/message');

// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/BistroDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML files from the 'html' directory
app.use('/html', express.static(path.join(__dirname, 'html')));

// Serve static uploaded files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use body-parser middleware
app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use secure: true in production with HTTPS
}));

// Import Routes
const adminRoutes = require('./routes/admin');        // Admin functionalities
const employeeRoutes = require('./routes/employee');  // Employee functionalities
const contactRoutes = require('./routes/contact');    // Contact form
const reservationRoutes = require('./routes/reservation'); // Reservations
const reviewRoutes = require('./routes/review');      // Reviews
const menuRoutes = require('./routes/menu');          // Menu management
const orderRoutes = require('./routes/order');        // Order management

// Use Routes
app.use('/admin', adminRoutes);        // Routes for admin functionalities
app.use('/employee', employeeRoutes); // Routes for employee functionalities
app.use('/contact', contactRoutes);   // Routes for contact form
app.use('/reservation', reservationRoutes); // Routes for reservation system
app.use('/reviews', reviewRoutes);    // Routes for customer reviews
app.use('/menu', menuRoutes);         // Routes for menu management
app.use('/orders', orderRoutes);      // Routes for order management
app.use('/api', messageRoutes);       // Routes for messages and announcements

// Listen on Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
