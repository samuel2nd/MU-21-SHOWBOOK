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

  // Refresh the staged routes panel without full page re-render
  function refreshStagedPanel() {
    const existingPanel = document.getElementById('nv9000-staged-panel');
    if (existingPanel) {
      const newPanel = renderStagedRoutesPanel();
      existingPanel.replaceWith(newPanel);
    }
  }

  // Staged Routes Panel for NV9000
  function renderStagedRoutesPanel() {
    const stagedRoutes = NV9000Client.getStagedRoutes();
    const entries = Object.entries(stagedRoutes);
    const mode = NV9000Client.getTriggerMode();

    // Only show in staged mode
    if (mode !== 'staged') {
      const hidden = document.createElement('div');
      hidden.id = 'nv9000-staged-panel';
      hidden.style.cssText = 'margin-bottom:16px;padding:8px 12px;background:var(--bg-secondary);border-radius:6px;font-size:11px;color:var(--text-muted);';
      hidden.textContent = 'Staged routes panel hidden (Mode: Immediate)';
      return hidden;
    }

    const section = document.createElement('div');
    section.id = 'nv9000-staged-panel';
    section.style.cssText = `
      background: var(--bg-secondary);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      border: 1px solid ${entries.length > 0 ? 'var(--accent-orange)' : 'var(--border)'};
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin:0;font-size:12px;color:var(--accent-orange);';
    title.textContent = `STAGED ROUTER ROUTES (${entries.length})`;
    header.appendChild(title);

    if (entries.length > 0) {
      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:6px;';

      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'btn-nv9000-take-all';
      triggerBtn.className = 'btn';
      triggerBtn.style.cssText = 'padding:4px 12px;font-size:11px;background:var(--accent-orange);color:#000;font-weight:700;';
      triggerBtn.textContent = 'TAKE ALL';
      triggerBtn.addEventListener('click', async () => {
        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Taking...';
        const result = await NV9000Client.triggerAllStaged();
        if (result.success) {
          triggerBtn.textContent = 'Done!';
          triggerBtn.style.background = '#22c55e';
          Utils.toast(`${entries.length} routes executed`, 'success');
          setTimeout(() => App.renderCurrentTab(), 1000);
        } else {
          triggerBtn.textContent = 'Failed';
          triggerBtn.style.background = '#ef4444';
          Utils.toast(`Route error: ${result.error}`, 'error');
          setTimeout(() => {
            triggerBtn.disabled = false;
            triggerBtn.textContent = 'TAKE ALL';
            triggerBtn.style.background = 'var(--accent-orange)';
          }, 2000);
        }
      });
      btnGroup.appendChild(triggerBtn);

      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn';
      clearBtn.style.cssText = 'padding:4px 8px;font-size:10px;';
      clearBtn.textContent = 'Clear All';
      clearBtn.addEventListener('click', () => {
        NV9000Client.clearStagedRoutes();
        App.renderCurrentTab();
      });
      btnGroup.appendChild(clearBtn);

      header.appendChild(btnGroup);
    }

    section.appendChild(header);

    // Staged items list
    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'font-size:11px;color:var(--text-muted);';
      empty.textContent = 'No staged routes. Make routes from Video I/O or Monitor Wall pages to stage them here.';
      section.appendChild(empty);
    } else {
      const list = document.createElement('div');
      list.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

      entries.forEach(([destName, staged]) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:4px;padding:4px 8px;background:var(--bg-primary);border-radius:3px;font-size:10px;border:1px solid var(--accent-orange);';

        const info = document.createElement('span');
        info.style.cssText = 'color:var(--text-primary);';
        info.innerHTML = `<span style="color:var(--accent-cyan)">${staged.source}</span> → <span style="color:var(--accent-orange)">${staged.destination}</span>`;
        item.appendChild(info);

        const removeBtn = document.createElement('button');
        removeBtn.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:0 2px;line-height:1;';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';
        removeBtn.addEventListener('click', () => {
          NV9000Client.unstageRoute(destName);
          App.renderCurrentTab();
        });
        item.appendChild(removeBtn);

        list.appendChild(item);
      });

      section.appendChild(list);
    }

    return section;
  }

  function render(container) {
    const page = Utils.tabPage('ENGINEER', 'NV9000 Router Configuration and Tallyman UMD Updater');

    // === EIC QC MONITORS SECTION ===
    page.appendChild(Utils.sectionHeader('EIC QC Monitors'));
    const eicSection = document.createElement('div');
    eicSection.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px;';

    const eicMonitors = [
      { id: 'eic-qc-1', label: 'EIC QC 1', dest: 'EIC QC 1' },
      { id: 'eic-qc-2', label: 'EIC QC 2', dest: 'EIC QC 2' }
    ];

    eicMonitors.forEach(mon => {
      const monEl = document.createElement('div');
      monEl.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

      const storedSource = Store.data.eicQcMonitors?.[mon.id] || '';

      monEl.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">${mon.label}</div>
        <div style="position:relative;">
          <input type="text" class="eic-qc-input" data-mon-id="${mon.id}" data-dest="${mon.dest}"
                 value="${storedSource}" placeholder="Type to filter sources..." autocomplete="off"
                 style="width:100%;padding:6px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
          <div class="eic-qc-dropdown" style="display:none;position:absolute;top:100%;left:0;width:100%;max-height:200px;overflow-y:auto;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;z-index:100;"></div>
        </div>
        <div style="margin-top:6px;font-size:9px;color:var(--text-muted);">Dest: ${mon.dest}</div>
      `;

      eicSection.appendChild(monEl);
    });

    page.appendChild(eicSection);

    // Initialize EIC QC filtering dropdowns after DOM is ready
    setTimeout(() => initEicQcControls(), 100);

    // === NV9000 ROUTER BRIDGE SECTION (Collapsible) ===
    const nv9000Section = Utils.collapsibleSection('NV9000 Router Bridge', 'nv9000-bridge-collapsed', (content) => {
      content.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:12px;font-weight:600;color:var(--accent-blue);">Bridge Status:</span>
            <span id="nv9000-status" style="font-size:11px;padding:4px 10px;border-radius:12px;background:var(--bg-primary);color:var(--text-muted);">Checking...</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button id="btn-nv9000-test-bridge" class="btn" style="padding:6px 12px;font-size:11px;">Test Bridge</button>
            <button id="btn-nv9000-test-router" class="btn" style="padding:6px 12px;font-size:11px;">Test NV9000</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <label style="font-size:11px;color:var(--text-secondary);min-width:70px;">Bridge URL:</label>
          <input id="nv9000-bridge-url" type="text" value="${NV9000Client.getBridgeUrl()}"
                 style="flex:1;max-width:250px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
        </div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:10px;color:var(--text-secondary);">Global Mode:</span>
            <select id="nv9000-trigger-mode" style="padding:3px 6px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
              <option value="immediate" ${NV9000Client.getTriggerMode() === 'immediate' ? 'selected' : ''}>Immediate</option>
              <option value="staged" ${NV9000Client.getTriggerMode() === 'staged' ? 'selected' : ''}>Staged</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:10px;color:var(--text-secondary);">Video I/O:</span>
            <select id="nv9000-mode-videoio" style="padding:3px 6px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
              <option value="global" ${NV9000Client.getPageMode('videoio') === 'global' ? 'selected' : ''}>Global</option>
              <option value="immediate" ${NV9000Client.getPageMode('videoio') === 'immediate' ? 'selected' : ''}>Immediate</option>
              <option value="staged" ${NV9000Client.getPageMode('videoio') === 'staged' ? 'selected' : ''}>Staged</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:10px;color:var(--text-secondary);">Monitor Walls:</span>
            <select id="nv9000-mode-monitors" style="padding:3px 6px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
              <option value="global" ${NV9000Client.getPageMode('monitors') === 'global' ? 'selected' : ''}>Global</option>
              <option value="immediate" ${NV9000Client.getPageMode('monitors') === 'immediate' ? 'selected' : ''}>Immediate</option>
              <option value="staged" ${NV9000Client.getPageMode('monitors') === 'staged' ? 'selected' : ''}>Staged</option>
            </select>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px;">
          <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">TEST ROUTE</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="position:relative;">
              <input id="nv9000-test-source" type="text" placeholder="Source..." autocomplete="off"
                     style="width:180px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
              <div id="nv9000-source-dropdown" class="nv9000-dropdown" style="display:none;position:absolute;top:100%;left:0;width:100%;max-height:200px;overflow-y:auto;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;z-index:100;"></div>
            </div>
            <span style="color:var(--text-muted);">→</span>
            <div style="position:relative;">
              <input id="nv9000-test-dest" type="text" placeholder="Destination..." autocomplete="off"
                     style="width:180px;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
              <div id="nv9000-dest-dropdown" class="nv9000-dropdown" style="display:none;position:absolute;top:100%;left:0;width:100%;max-height:200px;overflow-y:auto;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;z-index:100;"></div>
            </div>
            <button id="btn-nv9000-test-route" class="btn btn-primary" style="padding:6px 12px;font-size:11px;">Execute Route</button>
            <span id="nv9000-route-result" style="font-size:10px;color:var(--text-muted);"></span>
          </div>
        </div>
      `;
    });
    page.appendChild(nv9000Section);

    // Staged Routes Panel
    page.appendChild(renderStagedRoutesPanel());

    // Initialize NV9000 controls
    setTimeout(() => initNV9000Controls(), 100);

    // === NV9000 SHOW SOURCES SECTION ===
    page.appendChild(Utils.sectionHeader('NV9000 Show Sources'));
    const showSourcesInfo = document.createElement('div');
    showSourcesInfo.style.cssText = 'font-size:11px;color:var(--text-secondary);margin-bottom:12px;';
    showSourcesInfo.textContent = 'Show sources from SOURCE page with RTR IDs. Copy names or levels to clipboard for router configuration.';
    page.appendChild(showSourcesInfo);

    // Define the 4 SHOW source groups as they exist in the router
    const showGroups = [
      { label: 'SHOW 01-20', start: 1, end: 20, rtrIdStart: 865 },
      { label: 'SHOW 21-40', start: 21, end: 40, rtrIdStart: 1171 },
      { label: 'SHOW 41-60', start: 41, end: 60, rtrIdStart: 1202 },
      { label: 'SHOW 61-80', start: 61, end: 80, rtrIdStart: 1222 },
    ];

    showGroups.forEach(group => {
      page.appendChild(renderShowSourceGroup(group));
    });

    // Export all button
    const nvBtnRow = document.createElement('div');
    nvBtnRow.style.cssText = 'margin-top:12px;margin-bottom:40px;display:flex;gap:12px;';
    const btnNv9000 = document.createElement('button');
    btnNv9000.className = 'btn btn-primary';
    btnNv9000.textContent = 'Export Full NV9000 CSV';
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

  // Render a group of SHOW sources with copy buttons
  function renderShowSourceGroup(group) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:20px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;overflow:hidden;';

    // Header with copy buttons
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);';

    const title = document.createElement('span');
    title.style.cssText = 'font-weight:600;color:var(--text-primary);font-size:12px;';
    title.textContent = group.label;
    header.appendChild(title);

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex;gap:8px;';

    // Copy Names button
    const copyNamesBtn = document.createElement('button');
    copyNamesBtn.className = 'btn';
    copyNamesBtn.style.cssText = 'padding:4px 10px;font-size:10px;';
    copyNamesBtn.textContent = 'Copy Names';
    copyNamesBtn.addEventListener('click', () => copyShowNames(group));
    btnGroup.appendChild(copyNamesBtn);

    // Copy Levels button
    const copyLevelsBtn = document.createElement('button');
    copyLevelsBtn.className = 'btn';
    copyLevelsBtn.style.cssText = 'padding:4px 10px;font-size:10px;';
    copyLevelsBtn.textContent = 'Copy Levels';
    copyLevelsBtn.addEventListener('click', () => copyShowLevels(group));
    btnGroup.appendChild(copyLevelsBtn);

    header.appendChild(btnGroup);
    section.appendChild(header);

    // Table
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = 'margin:0;border-radius:0;';

    // Table header
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['RTR ID', 'Src #', 'Show Name', 'Eng Source', 'Video', 'A1', 'A2', 'A3', 'A4'].forEach((lbl, i) => {
      const th = document.createElement('th');
      th.textContent = lbl;
      th.style.fontSize = '10px';
      if (i === 0) th.style.width = '50px';
      if (i >= 4) th.style.width = '40px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    for (let i = group.start; i <= group.end; i++) {
      const src = Store.data.sources[i - 1];
      const rtrId = group.rtrIdStart + (i - group.start);
      const tr = document.createElement('tr');

      // Lookup video/audio from RTR Master
      const videoDevice = src.engSource ? Formulas.rtrMasterLookup(src.engSource) : null;
      const audioDevice = src.audioSource ? Formulas.rtrMasterLookup(src.audioSource) : null;
      const audioLevels = audioDevice ? audioDevice.audio : [];

      // RTR ID
      const tdRtrId = document.createElement('td');
      tdRtrId.textContent = rtrId;
      tdRtrId.style.cssText = 'color:var(--text-muted);font-size:10px;';
      tr.appendChild(tdRtrId);

      // Src #
      const tdNum = document.createElement('td');
      tdNum.textContent = i;
      tdNum.className = 'row-num';
      tr.appendChild(tdNum);

      // Show Name
      const tdName = document.createElement('td');
      tdName.textContent = src.showName || '—';
      tdName.style.cssText = src.showName ? 'color:var(--accent-cyan);' : 'color:var(--text-muted);';
      tr.appendChild(tdName);

      // Eng Source
      const tdEng = document.createElement('td');
      tdEng.textContent = src.engSource || '—';
      tdEng.style.cssText = 'font-size:10px;';
      tr.appendChild(tdEng);

      // Video Level
      const tdVideo = document.createElement('td');
      tdVideo.textContent = videoDevice ? videoDevice.videoLevel : '—';
      tdVideo.style.cssText = 'font-size:10px;';
      tr.appendChild(tdVideo);

      // Audio 1-4 (show first 4 for preview)
      for (let a = 0; a < 4; a++) {
        const tdAudio = document.createElement('td');
        tdAudio.textContent = audioLevels[a] || '—';
        tdAudio.style.cssText = 'font-size:9px;color:var(--text-secondary);';
        tr.appendChild(tdAudio);
      }

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.cssText = 'max-height:300px;';
    wrapper.appendChild(table);
    section.appendChild(wrapper);

    return section;
  }

  // Copy show names to clipboard (one per line)
  function copyShowNames(group) {
    const names = [];
    for (let i = group.start; i <= group.end; i++) {
      const src = Store.data.sources[i - 1];
      names.push(src.showName || '');
    }
    const text = names.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Utils.toast(`Copied ${group.label} names to clipboard`, 'success');
    }).catch(err => {
      Utils.toast('Failed to copy to clipboard', 'error');
      console.error('Clipboard error:', err);
    });
  }

  // Copy video + audio levels to clipboard (tab-separated)
  function copyShowLevels(group) {
    const lines = [];
    for (let i = group.start; i <= group.end; i++) {
      const src = Store.data.sources[i - 1];
      const videoDevice = src.engSource ? Formulas.rtrMasterLookup(src.engSource) : null;
      const audioDevice = src.audioSource ? Formulas.rtrMasterLookup(src.audioSource) : null;
      const audioLevels = audioDevice ? audioDevice.audio : Array(16).fill('');

      // Video level + 16 audio levels, tab-separated
      const video = videoDevice ? videoDevice.videoLevel : '';
      const audioStr = audioLevels.map(a => a || '').join('\t');
      lines.push(`${video}\t${audioStr}`);
    }
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Utils.toast(`Copied ${group.label} levels to clipboard`, 'success');
    }).catch(err => {
      Utils.toast('Failed to copy to clipboard', 'error');
      console.error('Clipboard error:', err);
    });
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
    const sourceDropdown = document.getElementById('nv9000-source-dropdown');
    const destDropdown = document.getElementById('nv9000-dest-dropdown');
    const testRouteBtn = document.getElementById('btn-nv9000-test-route');
    const routeResultEl = document.getElementById('nv9000-route-result');

    if (!statusEl) return;

    // Get sources from rtrMaster and destinations from rtrOutputs
    const sources = (Store.data.rtrMaster || []).map(d => d.deviceName).filter(n => n);
    const destinations = (Store.data.rtrOutputs || []).map(d => d.deviceName).filter(n => n);

    // Setup filtered dropdown for an input
    function setupFilteredDropdown(input, dropdown, items, onSelect) {
      let selectedIndex = -1;

      function showDropdown(filter = '') {
        const filterLower = filter.toLowerCase();
        const filtered = items.filter(item => item.toLowerCase().includes(filterLower)).slice(0, 50);

        if (filtered.length === 0) {
          dropdown.style.display = 'none';
          return;
        }

        dropdown.innerHTML = '';
        filtered.forEach((item, idx) => {
          const div = document.createElement('div');
          div.textContent = item;
          div.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer;';
          div.addEventListener('mouseenter', () => {
            div.style.background = 'var(--bg-tertiary)';
          });
          div.addEventListener('mouseleave', () => {
            div.style.background = idx === selectedIndex ? 'var(--bg-tertiary)' : '';
          });
          div.addEventListener('click', () => {
            input.value = item;
            dropdown.style.display = 'none';
            if (onSelect) onSelect(item);
          });
          dropdown.appendChild(div);
        });
        dropdown.style.display = 'block';
        selectedIndex = -1;
      }

      function hideDropdown() {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
      }

      input.addEventListener('focus', () => showDropdown(input.value));
      input.addEventListener('input', () => showDropdown(input.value));
      input.addEventListener('blur', hideDropdown);

      input.addEventListener('keydown', (e) => {
        const children = dropdown.children;
        if (dropdown.style.display === 'none' || children.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, children.length - 1);
          Array.from(children).forEach((c, i) => c.style.background = i === selectedIndex ? 'var(--bg-tertiary)' : '');
          children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          Array.from(children).forEach((c, i) => c.style.background = i === selectedIndex ? 'var(--bg-tertiary)' : '');
          children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && children[selectedIndex]) {
            input.value = children[selectedIndex].textContent;
            dropdown.style.display = 'none';
            if (onSelect) onSelect(input.value);
          }
        } else if (e.key === 'Escape') {
          dropdown.style.display = 'none';
        }
      });
    }

    // Initialize dropdowns
    setupFilteredDropdown(testSourceInput, sourceDropdown, sources);
    setupFilteredDropdown(testDestInput, destDropdown, destinations);

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

    // Trigger mode change
    const triggerModeSelect = document.getElementById('nv9000-trigger-mode');
    if (triggerModeSelect) {
      triggerModeSelect.addEventListener('change', () => {
        NV9000Client.setTriggerMode(triggerModeSelect.value);
        App.renderCurrentTab();
      });
    }

    // Per-page mode changes
    const videoioModeSelect = document.getElementById('nv9000-mode-videoio');
    if (videoioModeSelect) {
      videoioModeSelect.addEventListener('change', () => {
        NV9000Client.setPageMode('videoio', videoioModeSelect.value);
      });
    }

    const monitorsModeSelect = document.getElementById('nv9000-mode-monitors');
    if (monitorsModeSelect) {
      monitorsModeSelect.addEventListener('change', () => {
        NV9000Client.setPageMode('monitors', monitorsModeSelect.value);
      });
    }

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

  // Initialize EIC QC monitor filtering dropdowns
  function initEicQcControls() {
    const sources = (Store.data.rtrMaster || []).map(d => d.deviceName).filter(n => n);

    document.querySelectorAll('.eic-qc-input').forEach(input => {
      const dropdown = input.parentElement.querySelector('.eic-qc-dropdown');
      const monId = input.dataset.monId;
      const dest = input.dataset.dest;
      let selectedIndex = -1;

      function showDropdown(filter = '') {
        const filterLower = filter.toLowerCase();
        const filtered = sources.filter(item => item.toLowerCase().includes(filterLower)).slice(0, 50);

        if (filtered.length === 0) {
          dropdown.style.display = 'none';
          return;
        }

        dropdown.innerHTML = '';
        filtered.forEach((item, idx) => {
          const div = document.createElement('div');
          div.textContent = item;
          div.style.cssText = 'padding:4px 8px;font-size:11px;cursor:pointer;';
          div.addEventListener('mouseenter', () => {
            div.style.background = 'var(--bg-tertiary)';
          });
          div.addEventListener('mouseleave', () => {
            div.style.background = idx === selectedIndex ? 'var(--bg-tertiary)' : '';
          });
          div.addEventListener('click', async () => {
            input.value = item;
            dropdown.style.display = 'none';
            await triggerRoute(item, dest, monId);
          });
          dropdown.appendChild(div);
        });
        dropdown.style.display = 'block';
        selectedIndex = -1;
      }

      function hideDropdown() {
        setTimeout(() => { dropdown.style.display = 'none'; }, 150);
      }

      async function triggerRoute(source, destName, monitorId) {
        // Store selection
        if (!Store.data.eicQcMonitors) Store.data.eicQcMonitors = {};
        Store.data.eicQcMonitors[monitorId] = source;
        Store.set(`eicQcMonitors.${monitorId}`, source);

        // Trigger route
        if (source) {
          console.log(`[EIC QC] Routing: ${source} → ${destName}`);
          const result = await NV9000Client.handleRoute(source, destName, 'monitors');
          console.log(`[EIC QC] Result:`, result);
          if (result.success) {
            Utils.toast(result.staged ? `Staged: ${source} → ${destName}` : `Routed: ${source} → ${destName}`, 'success');
            // Refresh staged panel if in staged mode
            if (result.staged) {
              refreshStagedPanel();
            }
          } else {
            // Show detailed error
            const errorMsg = result.error || result.message || 'Unknown error';
            Utils.toast(`Route failed: ${errorMsg}`, 'error');
            console.error(`[EIC QC] Route failed:`, result);
          }
        }
      }

      input.addEventListener('focus', () => showDropdown(input.value));
      input.addEventListener('input', () => showDropdown(input.value));
      input.addEventListener('blur', hideDropdown);

      input.addEventListener('keydown', async (e) => {
        const children = dropdown.children;
        if (dropdown.style.display === 'none' || children.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, children.length - 1);
          Array.from(children).forEach((c, i) => c.style.background = i === selectedIndex ? 'var(--bg-tertiary)' : '');
          children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          Array.from(children).forEach((c, i) => c.style.background = i === selectedIndex ? 'var(--bg-tertiary)' : '');
          children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && children[selectedIndex]) {
            const source = children[selectedIndex].textContent;
            input.value = source;
            dropdown.style.display = 'none';
            await triggerRoute(source, dest, monId);
          }
        } else if (e.key === 'Escape') {
          dropdown.style.display = 'none';
        }
      });
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
