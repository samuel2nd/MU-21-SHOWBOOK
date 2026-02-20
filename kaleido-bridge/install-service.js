/**
 * Windows Service Installer for Kaleido Bridge
 *
 * Run with: node install-service.js
 * This will install the bridge as a Windows service that auto-starts with Windows.
 */

const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'Kaleido Bridge',
  description: 'TSL 5.0 bridge for Kaleido multiviewer layout control',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [],
  env: [{
    name: 'NODE_ENV',
    value: 'production'
  }]
});

// Listen for the "install" event
svc.on('install', () => {
  console.log('Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started!');
  console.log('The Kaleido Bridge is now running on http://localhost:3001');
  console.log('');
  console.log('To uninstall: npm run uninstall-service');
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed.');
  console.log('To reinstall, first run: npm run uninstall-service');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

// Install the service
console.log('Installing Kaleido Bridge as a Windows service...');
svc.install();
