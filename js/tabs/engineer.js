// ENGINEER Tab — Tallyman UMD Updater with default positions by group
const EngineerTab = (() => {

  // Define all UMD position groups with default device names
  const umdGroups = {
    ccuFs1: {
      label: 'CCU / FRAMESYNC',
      columns: [
        ['CCU 01', 'CCU 02', 'CCU 03', 'CCU 04', 'CCU 05', 'CCU 06', 'CCU 07', 'CCU 08', 'CCU 09', 'CCU 10', 'CCU 11', 'CCU 12',
         'FS 01', 'FS 02', 'FS 03', 'FS 04', 'FS 05', 'FS 06', 'FS 07', 'FS 08', 'FS 09'],
        ['FS 10', 'FS 11', 'FS 12', 'FS 13', 'FS 14', 'FS 15', 'FS 16', 'FS 17', 'FS 18', 'FS 19', 'FS 20', 'FS 21',
         'FS 22', 'FS 23', 'FS 24', 'FS 25', 'FS 26', 'FS 27', 'FS 28', 'FS 29', 'FS 30']
      ]
    },
    evsCg: {
      label: 'EVS / CG',
      columns: [
        ['EVS 1-1 OUT', 'EVS 1-2 OUT', 'EVS 1-1 IN', 'EVS 1-2 IN', 'EVS 1-3 IN', 'EVS 1-4 IN', 'EVS 1-5 IN', 'EVS 1-6 IN',
         'EVS 2-1 OUT', 'EVS 2-2 OUT', 'EVS 2-1 IN', 'EVS 2-2 IN', 'EVS 2-3 IN', 'EVS 2-4 IN', 'EVS 2-5 IN', 'EVS 2-6 IN',
         'EVS 3-1 OUT', 'EVS 3-2 OUT', 'EVS 3-1 IN', 'EVS 3-2 IN', 'EVS 3-3 IN', 'EVS 3-4 IN', 'EVS 3-5 IN', 'EVS 3-6 IN',
         'CG 1', 'CG 2', 'CG 3', 'CG 4', 'CG 5', 'CG 6',
         'CANVAS 1', 'CANVAS 2', 'CANVAS 3', 'CANVAS 4', 'CANVAS 5', 'CANVAS 6', 'CANVAS 7', 'CANVAS 8'],
        [] // Empty right column for this section
      ]
    },
    switcherOuts: {
      label: 'SWITCHER OUTS',
      columns: [
        ['PGM A', 'CLEAN', 'PRESET', 'SWPVW',
         'ME1 PVW', 'ME1 A', 'ME1 B', 'ME1 C', 'ME1 D',
         'ME2 PVW', 'ME2 A', 'ME2 B', 'ME2 C', 'ME2 D',
         'ME3 PVW', 'ME3 A', 'ME3 B', 'ME3 C', 'ME3 D',
         'ME4 PVW', 'ME4 A', 'ME4 B', 'ME4 C', 'ME4 D',
         'AUX 1', 'AUX 2', 'AUX 3', 'AUX 4'],
        ['AUX 5', 'AUX 6', 'AUX 7', 'AUX 8', 'AUX 9', 'AUX 10', 'AUX 11', 'AUX 12',
         'IS 1', 'IS 2', 'IS 3', 'IS 4', 'IS 5', 'IS 6', 'IS 7', 'IS 8', 'IS 9', 'IS 10']
      ]
    },
    spareDeEmbed: {
      label: 'SPARE DE-EMBEDDING INPUTS',
      columns: [
        ['DEM 87', 'DEM 88', 'DEM 89', 'DEM 130', 'DEM 131', 'DEM 132', 'DEM 133', 'DEM 134'],
        []
      ]
    },
    txDa: {
      label: 'TRANSMISSION DA\'S',
      columns: [
        ['TX1 DA', 'TX2 DA', 'TX3 DA', 'TX4 DA', 'TX5 DA', 'TX6 DA', 'TX7 DA', 'TX8 DA'],
        []
      ]
    },
    ccuFs2: {
      label: 'CCU / FRAMESYNC (continued)',
      columns: [
        ['FS 31', 'FS 32', 'FS 33', 'FS 34', 'FS 35', 'FS 36', 'FS 37', 'FS 38', 'FS 39', 'FS 40',
         'FS 41', 'FS 42', 'FS 43', 'FS 44', 'FS 45', 'FS 46', 'FS 47', 'FS 48', 'FS 49', 'FS 50', 'FS 51'],
        ['FS 52', 'FS 53', 'FS 54', 'FS 55', 'FS 56', 'FS 57', 'FS 58', 'FS 59', 'FS 60', 'FS 61',
         'FS 62', 'FS 63', 'FS 64', 'FS 65', 'FS 66', 'FS 67']
      ]
    }
  };

  // Look up UMD name for a device position
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

    // Check EVS CONFIG page for EVS positions (EVS X-X IN, EVS X-X OUT)
    if (position.startsWith('EVS ') && (position.includes(' IN') || position.includes(' OUT'))) {
      const evsConfig = Store.data.evsConfig;
      if (evsConfig && evsConfig.servers) {
        // Parse position like "EVS 1-1 IN" or "EVS 2-2 OUT"
        const match = position.match(/EVS (\d)-(\d) (IN|OUT)/);
        if (match) {
          const serverNum = parseInt(match[1]);
          const chNum = parseInt(match[2]);
          const isOutput = match[3] === 'OUT';

          // Server index is serverNum - 1
          const server = evsConfig.servers[serverNum - 1];
          if (server && server.channels) {
            // For outputs, channel index is 6 + (chNum - 1), for inputs it's chNum - 1
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

    return ''; // No UMD assigned
  }

  function render(container) {
    const page = Utils.tabPage('ENGINEER', 'NV9000 Router Configuration and Tallyman UMD Updater');

    // === NV9000 CONFIG SECTION ===
    page.appendChild(Utils.sectionHeader('NV9000 Router Configuration Export'));
    const nvTable = document.createElement('table');
    nvTable.className = 'data-table';

    // Build headers: Src #, Show Name, UMD Name, Eng Source, Video, Audio 1-16
    const nvThead = document.createElement('thead');
    const nvHr = document.createElement('tr');
    const audioHeaders = [];
    for (let i = 1; i <= 16; i++) {
      audioHeaders.push(`Audio ${i}`);
    }
    ['Src #', 'Show Name', 'UMD Name', 'Eng Source', 'Video', ...audioHeaders].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      nvHr.appendChild(th);
    });
    nvThead.appendChild(nvHr);
    nvTable.appendChild(nvThead);

    const nvTbody = document.createElement('tbody');
    Store.data.sources.forEach(src => {
      if (!src.showName) return;
      // Exclude EVS CONFIG entries from NV9000 export
      if (src.category === 'EVS') return;
      const tr = document.createElement('tr');

      // Lookup VIDEO device from RTR I/O MASTER by engSource name
      const videoDevice = Formulas.rtrMasterLookup(src.engSource);

      // Lookup AUDIO device from RTR I/O MASTER by audioSource name
      const audioDevice = Formulas.rtrMasterLookup(src.audioSource);

      // Get audio levels from RTR Master based on audioSource
      const audioLevels = audioDevice ? audioDevice.audio : null;

      // Base columns
      const baseValues = [
        src.number,
        src.showName,
        src.umdName || src.showName,
        src.engSource || '—',
        videoDevice ? videoDevice.videoLevel : '—',
      ];

      // 16 audio channels - pull from RTR Master using audioSource lookup
      const audioValues = [];
      for (let i = 0; i < 16; i++) {
        audioValues.push(audioLevels && audioLevels[i] ? audioLevels[i] : '—');
      }

      [...baseValues, ...audioValues].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      nvTbody.appendChild(tr);
    });
    nvTable.appendChild(nvTbody);

    const nvWrapper = document.createElement('div');
    nvWrapper.className = 'table-scroll';
    nvWrapper.appendChild(nvTable);
    page.appendChild(nvWrapper);

    // NV9000 Export button
    const nvBtnRow = document.createElement('div');
    nvBtnRow.style.cssText = 'margin-top:12px;margin-bottom:40px;';
    const btnNv9000 = document.createElement('button');
    btnNv9000.className = 'btn btn-primary';
    btnNv9000.textContent = 'Export NV9000 CSV';
    btnNv9000.addEventListener('click', exportNv9000Csv);
    nvBtnRow.appendChild(btnNv9000);
    page.appendChild(nvBtnRow);

    // === TALLYMAN UMD UPDATER SECTION ===
    const title = document.createElement('h2');
    title.textContent = 'TALLYMAN UMD UPDATER';
    title.style.cssText = 'text-align:center;margin-bottom:20px;color:var(--text-primary);';
    page.appendChild(title);

    // Tallyman Bridge Controls
    const tallymanControls = document.createElement('div');
    tallymanControls.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:16px;margin-bottom:20px;';
    tallymanControls.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:12px;color:var(--text-secondary);">Tallyman Bridge:</span>
          <span id="tallyman-status" style="font-size:11px;padding:4px 10px;border-radius:12px;background:var(--bg-primary);color:var(--text-muted);">Checking...</span>
          <span style="font-size:11px;color:var(--text-muted);">Target: 192.168.23.20:8902</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="btn-tallyman-test" class="btn" style="padding:6px 12px;font-size:11px;">Test Connection</button>
          <button id="btn-tallyman-sync" class="btn btn-primary" style="padding:6px 12px;font-size:11px;">Sync All UMDs</button>
        </div>
      </div>
      <div id="tallyman-last-sync" style="margin-top:8px;font-size:10px;color:var(--text-muted);"></div>
    `;
    page.appendChild(tallymanControls);

    // Initialize Tallyman controls
    setTimeout(() => initTallymanControls(), 100);

    // === NV9000 ROUTER BRIDGE SECTION ===
    const nv9000Controls = document.createElement('div');
    nv9000Controls.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:16px;margin-bottom:20px;';
    nv9000Controls.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:12px;font-weight:600;color:var(--accent-blue);">NV9000 Router Bridge:</span>
          <span id="nv9000-status" style="font-size:11px;padding:4px 10px;border-radius:12px;background:var(--bg-primary);color:var(--text-muted);">Checking...</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="btn-nv9000-test-bridge" class="btn" style="padding:6px 12px;font-size:11px;">Test Bridge</button>
          <button id="btn-nv9000-test-router" class="btn" style="padding:6px 12px;font-size:11px;">Test NV9000</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <label style="font-size:11px;color:var(--text-secondary);min-width:70px;">Bridge URL:</label>
        <input id="nv9000-bridge-url" type="text" value="${NV9000Client.getBridgeUrl()}"
               style="flex:1;max-width:250px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
      </div>
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px;">
        <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">TEST ROUTE</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <input id="nv9000-test-source" type="text" placeholder="Source (e.g., CCU 01)"
                 style="width:140px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
          <span style="color:var(--text-muted);">→</span>
          <input id="nv9000-test-dest" type="text" placeholder="Dest (e.g., MV 1-1)"
                 style="width:140px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
          <button id="btn-nv9000-test-route" class="btn btn-primary" style="padding:6px 12px;font-size:11px;">Execute Route</button>
          <span id="nv9000-route-result" style="font-size:10px;color:var(--text-muted);"></span>
        </div>
      </div>
    `;
    page.appendChild(nv9000Controls);

    // Initialize NV9000 controls
    setTimeout(() => initNV9000Controls(), 100);

    // Render each UMD group
    Object.keys(umdGroups).forEach(groupKey => {
      const group = umdGroups[groupKey];
      page.appendChild(renderUmdGroup(group.label, group.columns));
    });

    // Export UMD button
    const umdBtnRow = document.createElement('div');
    umdBtnRow.style.cssText = 'margin-top:20px;display:flex;gap:12px;';

    const btnExportUmd = document.createElement('button');
    btnExportUmd.className = 'btn btn-primary';
    btnExportUmd.textContent = 'Export UMD List CSV';
    btnExportUmd.addEventListener('click', exportUmdCsv);
    umdBtnRow.appendChild(btnExportUmd);

    page.appendChild(umdBtnRow);

    container.appendChild(page);
  }

  function exportNv9000Csv() {
    const audioHeaders = [];
    for (let i = 1; i <= 16; i++) {
      audioHeaders.push(`Audio ${i}`);
    }
    const headers = ['Src #', 'Show Name', 'UMD Name', 'Eng Source', 'Video', ...audioHeaders];

    const csvRows = [];
    Store.data.sources.forEach(src => {
      if (!src.showName) return;
      // Exclude EVS CONFIG entries from NV9000 export
      if (src.category === 'EVS') return;
      // Lookup VIDEO device from RTR I/O MASTER by engSource name
      const videoDevice = Formulas.rtrMasterLookup(src.engSource);
      // Lookup AUDIO device from RTR I/O MASTER by audioSource name
      const audioDevice = Formulas.rtrMasterLookup(src.audioSource);
      // Get audio levels from RTR Master based on audioSource
      const audioLevels = audioDevice ? audioDevice.audio : null;

      const row = [
        src.number,
        src.showName,
        src.umdName || src.showName,
        src.engSource || '',
        videoDevice ? videoDevice.videoLevel : '',
      ];
      // 16 audio channels - pull from RTR Master using audioSource lookup
      for (let i = 0; i < 16; i++) {
        row.push(audioLevels && audioLevels[i] ? audioLevels[i] : '');
      }
      csvRows.push(row.map(c => `"${c}"`).join(','));
    });

    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NV9000_${Store.data.show.name || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('NV9000 config exported', 'success');
  }

  function renderUmdGroup(label, columns) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:20px;';

    // Section header
    const header = document.createElement('div');
    header.style.cssText = 'background:var(--bg-tertiary);color:var(--text-primary);font-weight:600;padding:8px 12px;text-align:center;border-radius:4px 4px 0 0;';
    header.textContent = label;
    section.appendChild(header);

    // Two-column layout
    const columnsDiv = document.createElement('div');
    columnsDiv.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--border);border-top:none;border-radius:0 0 4px 4px;overflow:hidden;';

    columns.forEach((col, colIdx) => {
      const colDiv = document.createElement('div');
      if (colIdx === 0 && columns[1].length > 0) {
        colDiv.style.borderRight = '1px solid var(--border)';
      }

      col.forEach(position => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);';

        // Position cell (device name)
        const posCell = document.createElement('div');
        posCell.style.cssText = 'padding:4px 8px;background:var(--bg-secondary);font-size:11px;font-family:var(--font-mono);';
        posCell.textContent = position;
        row.appendChild(posCell);

        // UMD cell (computed)
        const umdCell = document.createElement('div');
        umdCell.style.cssText = 'padding:4px 8px;background:var(--bg-primary);font-size:11px;font-family:var(--font-mono);color:var(--accent-cyan);';
        umdCell.textContent = getUmdForPosition(position) || '';
        row.appendChild(umdCell);

        colDiv.appendChild(row);
      });

      columnsDiv.appendChild(colDiv);
    });

    section.appendChild(columnsDiv);
    return section;
  }

  async function initTallymanControls() {
    const statusEl = document.getElementById('tallyman-status');
    const lastSyncEl = document.getElementById('tallyman-last-sync');
    const testBtn = document.getElementById('btn-tallyman-test');
    const syncBtn = document.getElementById('btn-tallyman-sync');

    if (!statusEl) return;

    // Check connection status
    async function updateStatus() {
      const health = await TallymanBridge.checkHealth();
      if (health && health.status === 'ok') {
        statusEl.textContent = 'Connected';
        statusEl.style.background = 'rgba(52, 211, 153, 0.15)';
        statusEl.style.color = 'var(--accent-green)';
      } else {
        statusEl.textContent = 'Offline';
        statusEl.style.background = 'rgba(251, 191, 36, 0.15)';
        statusEl.style.color = 'var(--accent-orange)';
      }
    }

    await updateStatus();

    // Update last sync display
    function updateLastSync() {
      const state = TallymanBridge.getState();
      if (state.lastSyncTime) {
        lastSyncEl.textContent = `Last sync: ${state.lastSyncTime.toLocaleTimeString()}`;
      }
    }

    // Test button
    testBtn.addEventListener('click', async () => {
      testBtn.textContent = 'Testing...';
      testBtn.disabled = true;
      await updateStatus();
      testBtn.textContent = 'Test Connection';
      testBtn.disabled = false;
    });

    // Sync button
    syncBtn.addEventListener('click', async () => {
      syncBtn.textContent = 'Syncing...';
      syncBtn.disabled = true;
      await TallymanBridge.syncAll();
      await updateStatus();
      updateLastSync();
      syncBtn.textContent = 'Sync All UMDs';
      syncBtn.disabled = false;
    });
  }

  async function initNV9000Controls() {
    const statusEl = document.getElementById('nv9000-status');
    const bridgeUrlInput = document.getElementById('nv9000-bridge-url');
    const testBridgeBtn = document.getElementById('btn-nv9000-test-bridge');
    const testRouterBtn = document.getElementById('btn-nv9000-test-router');
    const testSourceInput = document.getElementById('nv9000-test-source');
    const testDestInput = document.getElementById('nv9000-test-dest');
    const testRouteBtn = document.getElementById('btn-nv9000-test-route');
    const routeResultEl = document.getElementById('nv9000-route-result');

    if (!statusEl) return;

    // Check bridge connection status
    async function updateBridgeStatus() {
      const result = await NV9000Client.checkConnection();
      if (result.status === 'connected') {
        statusEl.textContent = 'Bridge Connected';
        statusEl.style.background = 'rgba(52, 211, 153, 0.15)';
        statusEl.style.color = 'var(--accent-green)';
      } else {
        statusEl.textContent = 'Bridge Offline';
        statusEl.style.background = 'rgba(251, 191, 36, 0.15)';
        statusEl.style.color = 'var(--accent-orange)';
      }
    }

    await updateBridgeStatus();

    // Bridge URL change
    bridgeUrlInput.addEventListener('change', () => {
      NV9000Client.setBridgeUrl(bridgeUrlInput.value);
      updateBridgeStatus();
    });

    // Test Bridge button
    testBridgeBtn.addEventListener('click', async () => {
      testBridgeBtn.textContent = 'Testing...';
      testBridgeBtn.disabled = true;
      await updateBridgeStatus();
      testBridgeBtn.textContent = 'Test Bridge';
      testBridgeBtn.disabled = false;
    });

    // Test NV9000 button
    testRouterBtn.addEventListener('click', async () => {
      testRouterBtn.textContent = 'Testing...';
      testRouterBtn.disabled = true;
      const result = await NV9000Client.testNV9000();
      if (result.success) {
        statusEl.textContent = 'NV9000 OK';
        statusEl.style.background = 'rgba(52, 211, 153, 0.15)';
        statusEl.style.color = 'var(--accent-green)';
        Utils.toast('NV9000 router is reachable', 'success');
      } else {
        statusEl.textContent = 'NV9000 Unreachable';
        statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
        statusEl.style.color = 'var(--accent-red)';
        Utils.toast(`NV9000 error: ${result.error || result.message}`, 'error');
      }
      testRouterBtn.textContent = 'Test NV9000';
      testRouterBtn.disabled = false;
    });

    // Test Route button
    testRouteBtn.addEventListener('click', async () => {
      const sourceName = testSourceInput.value.trim();
      const destName = testDestInput.value.trim();

      if (!sourceName || !destName) {
        routeResultEl.textContent = 'Enter source and destination';
        routeResultEl.style.color = 'var(--accent-orange)';
        return;
      }

      // Show IDs being used
      const srcId = NV9000Client.getSourceId(sourceName);
      const dstId = NV9000Client.getDestinationId(destName);

      if (!srcId) {
        routeResultEl.textContent = `Unknown source: ${sourceName}`;
        routeResultEl.style.color = 'var(--accent-red)';
        return;
      }
      if (!dstId) {
        routeResultEl.textContent = `Unknown dest: ${destName}`;
        routeResultEl.style.color = 'var(--accent-red)';
        return;
      }

      routeResultEl.textContent = `Routing ${srcId} → ${dstId}...`;
      routeResultEl.style.color = 'var(--text-muted)';

      testRouteBtn.textContent = 'Routing...';
      testRouteBtn.disabled = true;

      const result = await NV9000Client.route(sourceName, destName);

      if (result.success) {
        routeResultEl.textContent = `Success! ${sourceName} (${srcId}) → ${destName} (${dstId})`;
        routeResultEl.style.color = 'var(--accent-green)';
        Utils.toast(`Route executed: ${sourceName} → ${destName}`, 'success');
      } else {
        routeResultEl.textContent = `Failed: ${result.error || 'Unknown error'}`;
        routeResultEl.style.color = 'var(--accent-red)';
        Utils.toast(`Route failed: ${result.error}`, 'error');
      }

      testRouteBtn.textContent = 'Execute Route';
      testRouteBtn.disabled = false;
    });
  }

  function exportUmdCsv() {
    const rows = [['Position', 'UMD Name']];

    Object.keys(umdGroups).forEach(groupKey => {
      const group = umdGroups[groupKey];
      rows.push(['', '']); // Empty row
      rows.push([`=== ${group.label} ===`, '']);

      group.columns.forEach(col => {
        col.forEach(position => {
          rows.push([position, getUmdForPosition(position)]);
        });
      });
    });

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UMD_Updater_${Store.data.show.name || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('UMD list exported', 'success');
  }

  return { render };
})();
