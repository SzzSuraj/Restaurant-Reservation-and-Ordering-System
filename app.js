const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const messageRoutes = require('./routes/message');
const fs = require('fs');

// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/BistroDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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
const chartRoutes = require('./routes/charts');       // charts on dashboard




// Use Routes
app.use('/admin', adminRoutes);        // Routes for admin functionalities
app.use('/employee', employeeRoutes); // Routes for employee functionalities
app.use('/contact', contactRoutes);   // Routes for contact form
app.use('/reservation', reservationRoutes); // Routes for reservation system
app.use('/reviews', reviewRoutes);    // Routes for customer reviews
app.use('/menu', menuRoutes);         // Routes for menu management
app.use('/orders', orderRoutes);      // Routes for order management
app.use('/api', messageRoutes);       // Routes for messages and announcements
app.use('/api/orders', orderRoutes);
app.use('/charts', chartRoutes);      // routes for charts on dashboard





// Wildcard route to serve HTML files
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'public', 'html', `${page}.html`);

  console.log('Looking for file at:', filePath); // Debugging

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Page not found');
  }
});

// Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Listen on Port
const PORT = process.env.PORT || 3000;

// Bind the server to 0.0.0.0 to allow access from other devices
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

