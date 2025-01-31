const QRCode = require('qrcode');
const os = require('os');

// Function to get the local IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let address of interfaces[iface]) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address; // Returns the local IP
      }
    }
  }
  return '127.0.0.1'; // Fallback to localhost if IP can't be found
}

// Replace the port with the port your app is running on (e.g., 3000)
const PORT = 3000;

// Generate the URL using the local IP address
const localIp = getLocalIp();
const url = `http://${localIp}:${PORT}`;

console.log(`Your local URL for other devices: ${url}`);

// Generate the QR Code
QRCode.toFile('localhost_qr.png', url, {
  errorCorrectionLevel: 'H', // High error correction for better readability
  margin: 2, // Add margin around the QR code
  scale: 8, // Increase scale for better resolution
}, function (err) {
  if (err) {
    console.error('Failed to generate QR Code:', err);
  } else {
    console.log('QR Code saved as localhost_qr.png');
  }
});