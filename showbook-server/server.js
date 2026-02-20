/**
 * MU-21 Showbook Local Server
 *
 * Serves the Showbook on the local network so anyone on the truck can access it.
 * Access via: http://<engineering-computer-ip>:8080
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from parent directory (the showbook root)
const showbookPath = path.join(__dirname, '..');
app.use(express.static(showbookPath));

// Start server on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  // Get local IP addresses
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  console.log('');
  console.log('========================================');
  console.log('  MU-21 SHOWBOOK SERVER RUNNING');
  console.log('========================================');
  console.log('');
  console.log('Access from this computer:');
  console.log(`  http://localhost:${PORT}`);
  console.log('');
  console.log('Access from other devices on the network:');
  addresses.forEach(addr => {
    console.log(`  http://${addr}:${PORT}`);
  });
  console.log('');
  console.log('Kaleido Bridge: http://localhost:3001');
  console.log('========================================');
});
