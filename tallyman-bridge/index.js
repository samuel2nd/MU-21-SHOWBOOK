/**
 * Tallyman UMD Bridge Server
 *
 * HTTP server that accepts UMD text updates from the Showbook and sends
 * TSL 5.0 DMSG packets to Tallyman over UDP.
 *
 * Default Tallyman: 192.168.23.20:8901
 *
 * Endpoints:
 *   POST /umd           - Update single UMD
 *   POST /umd-batch     - Update multiple UMDs
 *   POST /umd-sync      - Sync all UMDs from showbook data
 *   GET  /health        - Health check
 *   GET  /mapping       - Get position-to-index mapping
 */

const express = require('express');
const cors = require('cors');
const dgram = require('dgram');
const TSL5_UMD = require('./tsl5-umd');

const app = express();
const PORT = 3002;

// Default Tallyman settings
const TALLYMAN_IP = process.env.TALLYMAN_IP || '192.168.23.20';
const TALLYMAN_PORT = 8901;  // Hardcoded - Tallyman TSL 5.0 port

// Create reusable UDP socket
const udpSocket = dgram.createSocket('udp4');

udpSocket.on('error', (err) => {
  console.error('UDP socket error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// POSITION TO INDEX MAPPING
// Based on Tallyman UMD configuration (Screen 0)
// ============================================================

const POSITION_INDEX_MAP = {
  // CCU 1-12 (Index 1-12)
  'CCU 01': 1, 'CCU 02': 2, 'CCU 03': 3, 'CCU 04': 4,
  'CCU 05': 5, 'CCU 06': 6, 'CCU 07': 7, 'CCU 08': 8,
  'CCU 09': 9, 'CCU 10': 10, 'CCU 11': 11, 'CCU 12': 12,

  // FSY 1-20 (Index 13-32)
  'FS 01': 13, 'FS 02': 14, 'FS 03': 15, 'FS 04': 16,
  'FS 05': 17, 'FS 06': 18, 'FS 07': 19, 'FS 08': 20,
  'FS 09': 21, 'FS 10': 22, 'FS 11': 23, 'FS 12': 24,
  'FS 13': 25, 'FS 14': 26, 'FS 15': 27, 'FS 16': 28,
  'FS 17': 29, 'FS 18': 30, 'FS 19': 31, 'FS 20': 32,

  // EVS 1 (Index 33-40)
  'EVS 1-1 OUT': 33, 'EVS 1-2 OUT': 34,
  'EVS 1-1 IN': 35, 'EVS 1-2 IN': 36, 'EVS 1-3 IN': 37,
  'EVS 1-4 IN': 38, 'EVS 1-5 IN': 39, 'EVS 1-6 IN': 40,

  // EVS 2 (Index 41-48)
  'EVS 2-1 OUT': 41, 'EVS 2-2 OUT': 42,
  'EVS 2-1 IN': 43, 'EVS 2-2 IN': 44, 'EVS 2-3 IN': 45,
  'EVS 2-4 IN': 46, 'EVS 2-5 IN': 47, 'EVS 2-6 IN': 48,

  // EVS 3 (Index 49-56)
  'EVS 3-1 OUT': 49, 'EVS 3-2 OUT': 50,
  'EVS 3-1 IN': 51, 'EVS 3-2 IN': 52, 'EVS 3-3 IN': 53,
  'EVS 3-4 IN': 54, 'EVS 3-5 IN': 55, 'EVS 3-6 IN': 56,

  // SWITCHER OUTS (Index 57-80)
  'PGM A': 57, 'CLEAN': 58, 'PRESET': 59, 'SWPVW': 60,
  'ME1 PVW': 61, 'ME1 A': 62, 'ME1 B': 63, 'ME1 C': 64, 'ME1 D': 65,
  'ME2 PVW': 66, 'ME2 A': 67, 'ME2 B': 68, 'ME2 C': 69, 'ME2 D': 70,
  'ME3 PVW': 71, 'ME3 A': 72, 'ME3 B': 73, 'ME3 C': 74, 'ME3 D': 75,
  'ME4 PVW': 76, 'ME4 A': 77, 'ME4 B': 78, 'ME4 C': 79, 'ME4 D': 80,

  // AUX 1-12 (Index 81-92)
  'AUX 1': 81, 'AUX 2': 82, 'AUX 3': 83, 'AUX 4': 84,
  'AUX 5': 85, 'AUX 6': 86, 'AUX 7': 87, 'AUX 8': 88,
  'AUX 9': 89, 'AUX 10': 90, 'AUX 11': 91, 'AUX 12': 92,

  // IS 1-10 (Index 93-102)
  'IS 1': 93, 'IS 2': 94, 'IS 3': 95, 'IS 4': 96, 'IS 5': 97,
  'IS 6': 98, 'IS 7': 99, 'IS 8': 100, 'IS 9': 101, 'IS 10': 102,

  // FS 21-24 (Index 103-106)
  'FS 21': 103, 'FS 22': 104, 'FS 23': 105, 'FS 24': 106,

  // CG 1-6 (Index 107-112)
  'CG 1': 107, 'CG 2': 108, 'CG 3': 109, 'CG 4': 110, 'CG 5': 111, 'CG 6': 112,

  // CANVAS 1-8 (Index 113-120)
  'CANVAS 1': 113, 'CANVAS 2': 114, 'CANVAS 3': 115, 'CANVAS 4': 116,
  'CANVAS 5': 117, 'CANVAS 6': 118, 'CANVAS 7': 119, 'CANVAS 8': 120,

  // FS 25-28 / STB 01-04 (Index 121-124)
  'FS 25': 121, 'FS 26': 122, 'FS 27': 123, 'FS 28': 124,

  // FS 29-44 (Index 125-140)
  'FS 29': 125, 'FS 30': 126, 'FS 31': 127, 'FS 32': 128,
  'FS 33': 129, 'FS 34': 130, 'FS 35': 131, 'FS 36': 132,
  'FS 37': 133, 'FS 38': 134, 'FS 39': 135, 'FS 40': 136,
  'FS 41': 137, 'FS 42': 138, 'FS 43': 139, 'FS 44': 140,

  // FS 45-62 (Index 141-158)
  'FS 45': 141, 'FS 46': 142, 'FS 47': 143, 'FS 48': 144,
  'FS 49': 145, 'FS 50': 146, 'FS 51': 147, 'FS 52': 148,
  'FS 53': 149, 'FS 54': 150, 'FS 55': 151, 'FS 56': 152,
  'FS 57': 153, 'FS 58': 154, 'FS 59': 155, 'FS 60': 156,
  'FS 61': 157, 'FS 62': 158,

  // TX DA 1-8 (Index 159-166)
  'TX1 DA': 159, 'TX2 DA': 160, 'TX3 DA': 161, 'TX4 DA': 162,
  'TX5 DA': 163, 'TX6 DA': 164, 'TX7 DA': 165, 'TX8 DA': 166
};

// Reverse lookup: index to position
const INDEX_POSITION_MAP = Object.fromEntries(
  Object.entries(POSITION_INDEX_MAP).map(([pos, idx]) => [idx, pos])
);

// ============================================================
// API ENDPOINTS
// ============================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    tallyman: { ip: TALLYMAN_IP, port: TALLYMAN_PORT }
  });
});

// Debug: Show packet hex for a test message (compare with Wireshark capture)
app.get('/debug-packet', (req, res) => {
  const index = parseInt(req.query.index) || 1;
  const text = req.query.text || '41 - DANI';
  const packet = TSL5_UMD.buildUmdText(index, text, 0);
  res.json({
    index,
    text,
    packetHex: packet.toString('hex'),
    packetBytes: Array.from(packet).map(b => b.toString(16).padStart(2, '0')).join(' '),
    length: packet.length
  });
});

// Get position-to-index mapping
app.get('/mapping', (req, res) => {
  res.json({
    positionToIndex: POSITION_INDEX_MAP,
    indexToPosition: INDEX_POSITION_MAP,
    totalPositions: Object.keys(POSITION_INDEX_MAP).length
  });
});

// Update single UMD by position name
app.post('/umd', async (req, res) => {
  const { position, text, ip = TALLYMAN_IP, port = TALLYMAN_PORT } = req.body;

  if (!position) {
    return res.status(400).json({ success: false, error: 'Position required' });
  }

  const index = POSITION_INDEX_MAP[position];
  if (!index) {
    return res.status(400).json({
      success: false,
      error: `Unknown position: ${position}`,
      validPositions: Object.keys(POSITION_INDEX_MAP)
    });
  }

  try {
    const result = await sendUmdUpdate(ip, port, index, text || '');
    res.json({ ...result, position, index });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update UMD by direct index
app.post('/umd-index', async (req, res) => {
  const { index, text, ip = TALLYMAN_IP, port = TALLYMAN_PORT } = req.body;

  if (typeof index !== 'number' || index < 1) {
    return res.status(400).json({ success: false, error: 'Valid index required (1+)' });
  }

  try {
    const result = await sendUmdUpdate(ip, port, index, text || '');
    res.json({ ...result, position: INDEX_POSITION_MAP[index] || 'unknown', index });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch update multiple UMDs
app.post('/umd-batch', async (req, res) => {
  const { updates, ip = TALLYMAN_IP, port = TALLYMAN_PORT } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, error: 'Updates array required' });
  }

  const results = [];
  let successCount = 0;

  for (const update of updates) {
    const { position, index: directIndex, text } = update;

    let index = directIndex;
    if (!index && position) {
      index = POSITION_INDEX_MAP[position];
    }

    if (!index) {
      results.push({
        position,
        success: false,
        error: position ? `Unknown position: ${position}` : 'No position or index provided'
      });
      continue;
    }

    try {
      const result = await sendUmdUpdate(ip, port, index, text || '');
      results.push({ position: position || INDEX_POSITION_MAP[index], index, text, ...result });
      if (result.success) successCount++;
    } catch (error) {
      results.push({ position, index, success: false, error: error.message });
    }
  }

  res.json({
    success: successCount === updates.length,
    sent: successCount,
    total: updates.length,
    results
  });
});

// Sync all UMDs from showbook data (receives full map from browser)
app.post('/umd-sync', async (req, res) => {
  const { umdData, ip = TALLYMAN_IP, port = TALLYMAN_PORT } = req.body;

  if (!umdData || typeof umdData !== 'object') {
    return res.status(400).json({ success: false, error: 'umdData object required' });
  }

  const updates = [];

  for (const [position, text] of Object.entries(umdData)) {
    const index = POSITION_INDEX_MAP[position];
    if (index) {
      updates.push({ position, index, text: text || '' });
    }
  }

  console.log(`=== UMD SYNC: ${updates.length} positions ===`);

  const results = [];
  let successCount = 0;

  for (const update of updates) {
    try {
      const result = await sendUmdUpdate(ip, port, update.index, update.text);
      results.push({ ...update, ...result });
      if (result.success) successCount++;
    } catch (error) {
      results.push({ ...update, success: false, error: error.message });
    }
  }

  console.log(`=== SYNC COMPLETE: ${successCount}/${updates.length} sent ===\n`);

  res.json({
    success: successCount === updates.length,
    sent: successCount,
    total: updates.length,
    tallymanIp: ip,
    tallymanPort: port
  });
});

// ============================================================
// UDP SEND FUNCTION
// ============================================================

function sendUmdUpdate(ip, port, index, text) {
  return new Promise((resolve) => {
    const packet = TSL5_UMD.buildUmdText(index, text, 0);

    console.log(`UMD [${index}] -> "${text}" @ ${ip}:${port}`);

    udpSocket.send(packet, 0, packet.length, port, ip, (err) => {
      if (err) {
        console.error(`  ERROR: ${err.message}`);
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('========================================');
  console.log('  TALLYMAN UMD BRIDGE RUNNING');
  console.log('========================================');
  console.log(`Server:   http://localhost:${PORT}`);
  console.log(`Tallyman: ${TALLYMAN_IP}:${TALLYMAN_PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health      - Health check');
  console.log('  GET  /mapping     - Position-to-index mapping');
  console.log('  POST /umd         - Update single UMD by position');
  console.log('  POST /umd-index   - Update single UMD by index');
  console.log('  POST /umd-batch   - Batch update multiple UMDs');
  console.log('  POST /umd-sync    - Sync all UMDs from showbook');
  console.log('========================================');
  console.log('');
});
