/**
 * Windows Service Uninstaller for Kaleido Bridge
 *
 * Run with: node uninstall-service.js
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'Kaleido Bridge',
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

console.log('Uninstalling Kaleido Bridge Windows service...');
svc.uninstall();
