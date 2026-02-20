/**
 * Windows Service Uninstaller for Showbook Server
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'MU-21 Showbook Server',
  script: path.join(__dirname, 'server.js')
});

svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

console.log('Uninstalling MU-21 Showbook Server...');
svc.uninstall();
