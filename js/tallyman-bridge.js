// ============================================
// Tallyman UMD Bridge Client
// ============================================
// Communicates with the tallyman-bridge server to send UMD text updates
// to Tallyman via TSL 5.0 UDP protocol.

const TallymanBridge = (() => {
  // Bridge server URL (running on same machine)
  const BRIDGE_URL = 'http://localhost:3002';

  // Track connection state
  let connected = false;
  let lastSyncTime = null;

  // ============================================================
  // POSITION TO INDEX MAPPING (matches tallyman-bridge/index.js)
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

  /**
   * Check if bridge server is reachable
   */
  async function checkHealth() {
    try {
      const resp = await fetch(`${BRIDGE_URL}/health`, { method: 'GET' });
      if (resp.ok) {
        connected = true;
        return await resp.json();
      }
    } catch (e) {
      console.warn('Tallyman Bridge not reachable:', e.message);
    }
    connected = false;
    return null;
  }

  /**
   * Get UMD text for a position using the Engineer tab's lookup logic
   * (Same as getUmdForPosition in engineer.js)
   */
  function getUmdForPosition(position) {
    // Check SWR I/O outputs for switcher outs (PGM, CLEAN, ME buses, AUX, IS)
    const switcherOuts = ['PGM A', 'CLEAN', 'PRESET', 'SWPVW',
      'ME1 PVW', 'ME1 A', 'ME1 B', 'ME1 C', 'ME1 D',
      'ME2 PVW', 'ME2 A', 'ME2 B', 'ME2 C', 'ME2 D',
      'ME3 PVW', 'ME3 A', 'ME3 B', 'ME3 C', 'ME3 D',
      'ME4 PVW', 'ME4 A', 'ME4 B', 'ME4 C', 'ME4 D',
      'AUX 1', 'AUX 2', 'AUX 3', 'AUX 4', 'AUX 5', 'AUX 6', 'AUX 7', 'AUX 8',
      'AUX 9', 'AUX 10', 'AUX 11', 'AUX 12',
      'IS 1', 'IS 2', 'IS 3', 'IS 4', 'IS 5', 'IS 6', 'IS 7', 'IS 8', 'IS 9', 'IS 10'];

    if (switcherOuts.includes(position)) {
      const swrOut = Store.data.swrIo.outputs.find(o => o.defaultShow === position);
      if (swrOut) {
        return swrOut.umd || swrOut.show || '';
      }
    }

    // Check EVS CONFIG page for EVS positions
    if (position.startsWith('EVS ') && (position.includes(' IN') || position.includes(' OUT'))) {
      const evsConfig = Store.data.evsConfig;
      if (evsConfig && evsConfig.servers) {
        const match = position.match(/EVS (\d)-(\d) (IN|OUT)/);
        if (match) {
          const serverNum = parseInt(match[1]);
          const chNum = parseInt(match[2]);
          const isOutput = match[3] === 'OUT';
          const server = evsConfig.servers[serverNum - 1];
          if (server && server.channels) {
            const channelIdx = isOutput ? (6 + chNum - 1) : (chNum - 1);
            const channel = server.channels[channelIdx];
            if (channel && channel.showName) {
              return channel.showName;
            }
          }
        }
      }
    }

    // Check SOURCE page for CCU, FS positions
    const src = Store.data.sources.find(s => s.engSource === position);
    if (src && (src.umdName || src.showName)) {
      return src.umdName || src.showName;
    }

    // Check TX/PGM/GFX for TX DA positions
    if (position.startsWith('TX') && position.includes('DA')) {
      const txMatch = position.match(/TX(\d)/);
      if (txMatch) {
        const txIdx = parseInt(txMatch[1]) - 1;
        const txRow = Store.data.txPgmGfx.tx[txIdx];
        if (txRow && txRow.umdName) {
          return txRow.umdName;
        }
      }
    }

    // Check TX/PGM/GFX for CG positions
    if (position.startsWith('CG ')) {
      const cgMatch = position.match(/CG (\d)/);
      if (cgMatch) {
        const cgIdx = parseInt(cgMatch[1]) - 1;
        const cgRow = Store.data.txPgmGfx.cg[cgIdx];
        if (cgRow && cgRow.umdName) {
          return cgRow.umdName;
        }
      }
    }

    // Check TX/PGM/GFX for Canvas positions
    if (position.startsWith('CANVAS ')) {
      const canvasMatch = position.match(/CANVAS (\d)/);
      if (canvasMatch) {
        const canvasIdx = parseInt(canvasMatch[1]) - 1;
        const canvasRow = Store.data.txPgmGfx.canvas[canvasIdx];
        if (canvasRow && canvasRow.umdName) {
          return canvasRow.umdName;
        }
      }
    }

    return '';
  }

  /**
   * Build UMD data map for all positions
   */
  function buildUmdData() {
    const umdData = {};

    for (const position of Object.keys(POSITION_INDEX_MAP)) {
      const text = getUmdForPosition(position);
      umdData[position] = text;
    }

    return umdData;
  }

  /**
   * Sync all UMD data to Tallyman
   */
  async function syncAll() {
    const umdData = buildUmdData();

    try {
      const resp = await fetch(`${BRIDGE_URL}/umd-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ umdData })
      });

      const result = await resp.json();

      if (result.success) {
        connected = true;
        lastSyncTime = new Date();
        Utils.toast(`Tallyman sync complete: ${result.sent} UMDs updated`, 'success');
      } else {
        Utils.toast(`Tallyman sync partial: ${result.sent}/${result.total} sent`, 'warn');
      }

      return result;
    } catch (e) {
      connected = false;
      Utils.toast('Tallyman Bridge not reachable', 'error');
      console.error('Tallyman sync failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Update single UMD by position
   */
  async function updatePosition(position, text) {
    try {
      const resp = await fetch(`${BRIDGE_URL}/umd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, text })
      });

      const result = await resp.json();
      connected = result.success;
      return result;
    } catch (e) {
      connected = false;
      console.error('Tallyman update failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      connected,
      lastSyncTime,
      bridgeUrl: BRIDGE_URL,
      positionCount: Object.keys(POSITION_INDEX_MAP).length
    };
  }

  return {
    checkHealth,
    syncAll,
    updatePosition,
    buildUmdData,
    getUmdForPosition,
    getState,
    get connected() { return connected; },
    get lastSyncTime() { return lastSyncTime; },
    POSITION_INDEX_MAP
  };
})();
