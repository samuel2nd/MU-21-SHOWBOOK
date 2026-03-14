/**
 * Install Tallyman Bridge as a Windows Service
 *
 * Run as Administrator:
 *   node install-service.js
 */

const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'MU21 Tallyman Bridge',
  description: 'Tallyman UMD Bridge for MU-21 Showbook - TSL 5.0 UDP',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [],
  env: [
    { name: 'TALLYMAN_IP', value: '192.168.23.20' },
    { name: 'TALLYMAN_PORT', value: '8901' }
  ]
});

svc.on('install', () => {
  console.log('Service installed. Starting...');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started.');
  console.log('Tallyman Bridge running on http://localhost:3002');
});

svc.on('alreadyinstalled', () => {
  console.log('Service already installed.');
});

svc.on('error', (err) => {
  console.error('Service error:', err);
});

console.log('Installing Tallyman Bridge service...');
svc.install();
