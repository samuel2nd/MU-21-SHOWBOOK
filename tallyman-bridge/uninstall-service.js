/**
 * Uninstall Tallyman Bridge Windows Service
 *
 * Run as Administrator:
 *   node uninstall-service.js
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'MU21 Tallyman Bridge',
  script: path.join(__dirname, 'index.js')
});

svc.on('uninstall', () => {
  console.log('Service uninstalled.');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

console.log('Uninstalling Tallyman Bridge service...');
svc.uninstall();
