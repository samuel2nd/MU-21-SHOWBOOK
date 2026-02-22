/**
 * Kaleido Bridge Server
 *
 * HTTP server that accepts layout trigger requests and sends TSL 5.0 packets
 * to Kaleido multiviewer cards over UDP.
 *
 * Endpoint: POST /trigger
 * Body: { "ip": "192.168.x.x", "port": 8902, "index": 1 }
 *
 * The server sends Left Tally ON then OFF to trigger the layout change.
 */

const express = require('express');
const cors = require('cors');
const dgram = require('dgram');
const TSL5 = require('./tsl5');

const app = express();
const PORT = 3001;

// Create a reusable UDP socket
const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', (err) => {
  console.error('UDP socket error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test connection to a Kaleido card (for UDP, we just verify we can send)
app.post('/test', async (req, res) => {
  const { ip, port = 8902 } = req.body;

  if (!ip) {
    return res.status(400).json({ success: false, error: 'IP address required' });
  }

  try {
    const result = await testConnection(ip, port);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger layout change
app.post('/trigger', async (req, res) => {
  const { ip, port = 8902, index } = req.body;

  if (!ip) {
    return res.status(400).json({ success: false, error: 'IP address required' });
  }

  if (typeof index !== 'number' || index < 1) {
    return res.status(400).json({ success: false, error: 'Valid index required (1 or higher)' });
  }

  try {
    const result = await triggerLayout(ip, port, index);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch trigger multiple layout changes
app.post('/trigger-batch', async (req, res) => {
  const { triggers } = req.body;

  if (!Array.isArray(triggers) || triggers.length === 0) {
    return res.status(400).json({ success: false, error: 'Triggers array required' });
  }

  const results = [];

  for (const trigger of triggers) {
    const { ip, port = 8902, index, cardId } = trigger;

    if (!ip || typeof index !== 'number' || index < 1) {
      results.push({
        cardId,
        ip,
        index,
        success: false,
        error: 'Invalid trigger parameters'
      });
      continue;
    }

    try {
      const result = await triggerLayout(ip, port, index);
      results.push({ cardId, ip, index, ...result });
    } catch (error) {
      results.push({ cardId, ip, index, success: false, error: error.message });
    }
  }

  const allSuccess = results.every(r => r.success);
  res.json({
    success: allSuccess,
    results
  });
});

/**
 * Test UDP connectivity to a Kaleido card
 * Sends a simple packet and checks for send errors
 */
function testConnection(ip, port) {
  return new Promise((resolve) => {
    // Build a simple tally off packet as a test
    const testPacket = TSL5.buildLeftTallyOff(1);

    udpSocket.send(testPacket, 0, testPacket.length, port, ip, (err) => {
      if (err) {
        resolve({ success: false, error: `Send failed: ${err.message}` });
      } else {
        resolve({ success: true, message: `UDP packet sent to ${ip}:${port}` });
      }
    });
  });
}

/**
 * Send TSL 5.0 packets over UDP to trigger a layout change
 * Sends Left Tally ON, waits briefly, then sends Left Tally OFF
 */
function triggerLayout(ip, port, index) {
  return new Promise((resolve) => {
    // Build packets
    const onPacket = TSL5.buildLeftTallyOn(index);
    const offPacket = TSL5.buildLeftTallyOff(index);

    // Log packet details for debugging
    console.log('=== TRIGGER LAYOUT ===');
    console.log(`Target: ${ip}:${port}`);
    console.log(`Index: ${index}`);
    console.log(`ON packet (hex):  ${onPacket.toString('hex')}`);
    console.log(`OFF packet (hex): ${offPacket.toString('hex')}`);
    console.log(`ON packet bytes:  [${Array.from(onPacket).join(', ')}]`);
    console.log(`OFF packet bytes: [${Array.from(offPacket).join(', ')}]`);

    // Send Left Tally ON
    udpSocket.send(onPacket, 0, onPacket.length, port, ip, (err) => {
      if (err) {
        console.log(`ERROR sending ON: ${err.message}`);
        resolve({ success: false, error: `Send ON failed: ${err.message}` });
        return;
      }
      console.log('Sent ON packet');

      // Wait 100ms then send OFF
      setTimeout(() => {
        udpSocket.send(offPacket, 0, offPacket.length, port, ip, (err) => {
          if (err) {
            console.log(`ERROR sending OFF: ${err.message}`);
            resolve({ success: false, error: `Send OFF failed: ${err.message}` });
          } else {
            console.log('Sent OFF packet');
            console.log('=== COMPLETE ===\n');
            resolve({
              success: true,
              message: `Triggered layout index ${index} on ${ip}:${port}`
            });
          }
        });
      }, 100);
    });
  });
}

// Start server (listen on all interfaces so remote browsers can connect)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kaleido Bridge running on http://localhost:${PORT}`);
  console.log('Using UDP for TSL 5.0 communication');
  console.log('Endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  POST /test         - Test UDP send to Kaleido card');
  console.log('  POST /trigger      - Trigger single layout change');
  console.log('  POST /trigger-batch - Trigger multiple layout changes');
});
