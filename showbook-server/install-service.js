/**
 * Windows Service Installer for Showbook Server
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'MU-21 Showbook Server',
  description: 'Local web server for MU-21 Showbook',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: [],
  env: [{
    name: 'NODE_ENV',
    value: 'production'
  }]
});

svc.on('install', () => {
  console.log('Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started!');
  console.log('');
  console.log('MU-21 Showbook is now accessible on port 8080');
  console.log('');
  console.log('To uninstall: npm run uninstall-service');
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed.');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

console.log('Installing MU-21 Showbook Server as a Windows service...');
svc.install();
