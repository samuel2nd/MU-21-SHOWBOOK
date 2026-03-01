/**
 * NV9000 Router Bridge Server
 *
 * HTTP server that accepts route commands from the Showbook and sends
 * GWT-RPC SendTake packets to the NV9000 Web GUI.
 *
 * Default NV9000: http://localhost (runs on engineering computer)
 *
 * Endpoints:
 *   POST /route        - Execute a single crosspoint route
 *   POST /route-batch  - Execute multiple routes
 *   GET  /health       - Health check
 *   GET  /test-nv9000  - Test connection to NV9000
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3003;

// Default NV9000 settings (local to engineering computer)
const NV9000_BASE_URL = process.env.NV9000_URL || 'http://localhost';
const NV9000_DISPATCH_PATH = '/nv9000status/dispatch';

// GWT-RPC constants from Wireshark capture
const GWT_RPC = {
  moduleBase: 'nv9000status/',
  strongName: '291210D4461525E3F4AF9C9A7F7452A6',
  service: 'com.gwtplatform.dispatch.shared.DispatchService',
  method: 'execute',
  contentType: 'text/x-gwt-rpc; charset=utf-8',
};

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// GWT-RPC PACKET BUILDER
// ============================================================

/**
 * Build a GWT-RPC SendTake packet
 * @param {number} sourceId - NV9000 source ID (1-288)
 * @param {number} destinationId - NV9000 destination ID (289+)
 * @returns {string} - GWT-RPC payload string
 */
function buildSendTakePacket(sourceId, destinationId) {
  // GWT-RPC format from Wireshark capture of NV9000 Web GUI
  // The packet structure uses a string table with indices
  const parts = [
    GWT_RPC.moduleBase,
    GWT_RPC.strongName,
    GWT_RPC.service,
    GWT_RPC.method,
    'java.lang.String/2004016611',
    'com.gwtplatform.dispatch.shared.Action',
    'nv.gwt.actions.SendTakeAction/943856818',
    'java.util.HashMap/1797211028',
    'java.lang.Integer/3438268394',
    // String table indices and data
    '1', '2', '3', '4', '2', '5', '6', '0',
    // Route data: 7|{DEST}|8|1|9|-1|-3|{SRC}|1|
    '7', String(destinationId),
    '8', '1',
    '9', '-1', '-3', String(sourceId), '1'
  ];

  return parts.join('|') + '|';
}

// ============================================================
// API ENDPOINTS
// ============================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nv9000: { baseUrl: NV9000_BASE_URL }
  });
});

// Test NV9000 connection
app.get('/test-nv9000', async (req, res) => {
  try {
    // Try to reach the NV9000 web interface
    const testUrl = `${NV9000_BASE_URL}/nv9000status/`;
    const response = await fetch(testUrl, {
      method: 'GET',
      timeout: 5000
    });

    res.json({
      success: true,
      status: response.status,
      message: 'NV9000 Web GUI is reachable'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Cannot reach NV9000 Web GUI'
    });
  }
});

// Debug: Show packet for a test route
app.get('/debug-packet', (req, res) => {
  const source = parseInt(req.query.source) || 1;
  const destination = parseInt(req.query.destination) || 289;
  const packet = buildSendTakePacket(source, destination);

  res.json({
    source,
    destination,
    packet,
    packetLength: packet.length
  });
});

// Execute a single route (crosspoint)
app.post('/route', async (req, res) => {
  const { source, destination, nv9000Url = NV9000_BASE_URL } = req.body;

  if (typeof source !== 'number' || source < 1) {
    return res.status(400).json({
      success: false,
      error: 'Valid source ID required (1+)'
    });
  }

  if (typeof destination !== 'number' || destination < 1) {
    return res.status(400).json({
      success: false,
      error: 'Valid destination ID required (1+)'
    });
  }

  try {
    const result = await sendRoute(nv9000Url, source, destination);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute multiple routes (batch)
app.post('/route-batch', async (req, res) => {
  const { routes, nv9000Url = NV9000_BASE_URL } = req.body;

  if (!Array.isArray(routes) || routes.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Routes array required'
    });
  }

  const results = [];
  let successCount = 0;

  for (const route of routes) {
    const { source, destination } = route;

    if (typeof source !== 'number' || typeof destination !== 'number') {
      results.push({
        source,
        destination,
        success: false,
        error: 'Invalid source or destination'
      });
      continue;
    }

    try {
      const result = await sendRoute(nv9000Url, source, destination);
      results.push({ source, destination, ...result });
      if (result.success) successCount++;
    } catch (error) {
      results.push({ source, destination, success: false, error: error.message });
    }
  }

  res.json({
    success: successCount === routes.length,
    sent: successCount,
    total: routes.length,
    results
  });
});

// ============================================================
// SEND ROUTE FUNCTION
// ============================================================

async function sendRoute(baseUrl, sourceId, destinationId) {
  const packet = buildSendTakePacket(sourceId, destinationId);
  const url = `${baseUrl}${NV9000_DISPATCH_PATH}`;

  console.log(`ROUTE [${sourceId}] -> [${destinationId}] @ ${baseUrl}`);
  console.log(`  Packet: ${packet.substring(0, 80)}...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': GWT_RPC.contentType,
        'X-GWT-Module-Base': `${baseUrl}/${GWT_RPC.moduleBase}`,
        'X-GWT-Permutation': GWT_RPC.strongName,
      },
      body: packet,
      timeout: 10000
    });

    const responseText = await response.text();

    // GWT-RPC success responses typically start with "//OK"
    const isSuccess = response.ok && responseText.startsWith('//OK');

    if (isSuccess) {
      console.log(`  SUCCESS`);
    } else {
      console.log(`  RESPONSE: ${response.status} - ${responseText.substring(0, 100)}`);
    }

    return {
      success: isSuccess,
      httpStatus: response.status,
      response: responseText.substring(0, 200)
    };
  } catch (error) {
    console.error(`  ERROR: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('========================================');
  console.log('  NV9000 ROUTER BRIDGE RUNNING');
  console.log('========================================');
  console.log(`Server:   http://localhost:${PORT}`);
  console.log(`NV9000:   ${NV9000_BASE_URL}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  GET  /test-nv9000  - Test NV9000 connection');
  console.log('  GET  /debug-packet - Show packet hex');
  console.log('  POST /route        - Execute single route');
  console.log('  POST /route-batch  - Execute multiple routes');
  console.log('========================================');
  console.log('');
});
