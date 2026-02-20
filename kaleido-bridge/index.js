/**
 * Kaleido Bridge Server
 *
 * HTTP server that accepts layout trigger requests and sends TSL 5.0 packets
 * to Kaleido multiviewer cards over TCP.
 *
 * Endpoint: POST /trigger
 * Body: { "ip": "192.168.x.x", "port": 8902, "index": 1 }
 *
 * The server sends Left Tally ON then OFF to trigger the layout change.
 */

const express = require('express');
const cors = require('cors');
const net = require('net');
const TSL5 = require('./tsl5');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test connection to a Kaleido card
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
 * Test TCP connection to a Kaleido card
 */
function testConnection(ip, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    }, timeout);

    socket.connect(port, ip, () => {
      clearTimeout(timer);
      socket.end();
      resolve({ success: true, message: `Connected to ${ip}:${port}` });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ success: false, error: `Connection failed: ${err.message}` });
    });
  });
}

/**
 * Send TSL 5.0 packets to trigger a layout change
 * Sends Left Tally ON, waits briefly, then sends Left Tally OFF
 */
function triggerLayout(ip, port, index) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ success: false, error: 'Operation timeout' });
    }, timeout);

    socket.connect(port, ip, async () => {
      try {
        // Build packets
        const onPacket = TSL5.buildLeftTallyOn(index);
        const offPacket = TSL5.buildLeftTallyOff(index);

        // Send Left Tally ON
        socket.write(onPacket);

        // Wait 100ms
        await delay(100);

        // Send Left Tally OFF
        socket.write(offPacket);

        // Wait for data to flush
        await delay(50);

        clearTimeout(timer);
        socket.end();

        resolve({
          success: true,
          message: `Triggered layout index ${index} on ${ip}:${port}`
        });
      } catch (err) {
        clearTimeout(timer);
        socket.destroy();
        resolve({ success: false, error: err.message });
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ success: false, error: `Connection failed: ${err.message}` });
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start server
app.listen(PORT, 'localhost', () => {
  console.log(`Kaleido Bridge running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  POST /test         - Test connection to Kaleido card');
  console.log('  POST /trigger      - Trigger single layout change');
  console.log('  POST /trigger-batch - Trigger multiple layout changes');
});
