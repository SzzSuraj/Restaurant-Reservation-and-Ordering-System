const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/BistroDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Serve static files
app.use(express.static('public'));

// Routes
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const reservationRoutes = require('./routes/reservation');
const reviewRoutes = require('./routes/review');

app.use('/admin', adminRoutes);
app.use('/contact', contactRoutes);
app.use('/reservation', reservationRoutes);
app.use('/reviews', reviewRoutes);

// Listen on Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
