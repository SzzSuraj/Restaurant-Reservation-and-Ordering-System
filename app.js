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
mongoose.connect('mongodb://localhost:27017/BistroDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML files from the 'html' directory
app.use('/html', express.static(path.join(__dirname, 'html')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());

// Session configuration
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use secure: true in production with HTTPS
}));

// Routes
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const contactRoutes = require('./routes/contact');
const reservationRoutes = require('./routes/reservation');
const reviewRoutes = require('./routes/review');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');

app.use('/admin', adminRoutes);        // Route for admin
app.use('/employee', employeeRoutes); // Route for employee functionalities
app.use('/contact', contactRoutes);   // Route for contact form
app.use('/reservation', reservationRoutes); // Route for reservations
app.use('/reviews', reviewRoutes);    // Route for reviews
app.use('/menu', menuRoutes);         // Route for menu
app.use('/orders', orderRoutes);      // Route for orders
app.use('/api', messageRoutes);

// Listen on Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
