/**
 * Windows Service Uninstaller for NV9000 Router Bridge
 *
 * Run with: node uninstall-service.js
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'NV9000 Router Bridge',
  script: path.join(__dirname, 'index.js')
});

svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
});

svc.on('stop', () => {
  console.log('Service stopped.');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

console.log('Uninstalling NV9000 Router Bridge Windows service...');
svc.uninstall();
