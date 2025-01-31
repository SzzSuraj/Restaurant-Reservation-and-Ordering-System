const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const messageRoutes = require('./routes/message');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/BistroDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use body-parser middleware
app.use(bodyParser.json());

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

// Schemas and Models
const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  orderItems: [{ itemName: String, quantity: Number }],
  orderTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Preparing', 'Served'], default: 'Pending' },
});

const Order = mongoose.model('Order', orderSchema);

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

app.use('/admin', adminRoutes);
app.use('/employee', employeeRoutes);
app.use('/contact', contactRoutes);
app.use('/reservation', reservationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tables', tableRoutes);

// Orders API
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    io.emit('orderUpdated', newOrder); // Real-time update
    res.status(201).send(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Served' } }); // Exclude "Served" orders
    res.status(200).send(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (updatedOrder) {
      io.emit('orderUpdated', updatedOrder); // Real-time update
      res.status(200).send(updatedOrder);
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal Server Error');
  }
});

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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

