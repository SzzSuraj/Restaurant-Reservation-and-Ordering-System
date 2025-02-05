const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
var cors = require('cors')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/BistroDB', {
    useNewUrlParser: true,git commit -m "Describe your changes here"

    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

// Session Configuration
app.use(
  session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use secure: true in production with HTTPS
  })
);

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const contactRoutes = require('./routes/contact');
const reservationRoutes = require('./routes/reservation');
const reviewRoutes = require('./routes/review');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const messageRoutes = require('./routes/message');
const tableRoutes = require('./routes/table');
const { scheduleReminders } = require('./cron/reminderScheduler');

app.use('/admin', adminRoutes);
app.use('/employee', employeeRoutes);
app.use('/contact', contactRoutes);
app.use('/reservation', reservationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tables', tableRoutes);

// Real-Time Updates using Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for table status updates and broadcast to all clients
  socket.on('updateTableStatus', (data) => {
    io.emit('tableStatusUpdated', data); // Broadcast updated status to all clients
  });

  // Listen for order updates and broadcast to all clients
  socket.on('orderUpdated', (data) => {
    io.emit('orderUpdated', data); // Broadcast updated order to all clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start reminder scheduler
scheduleReminders();

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
