// MULTIVIEWER CONFIGURATION — MV 1-25 with 16 windows each + Kaleido Control
const MultiviewerTab = (() => {

  // Ensure kaleidoConfig exists in store
  function ensureKaleidoConfig() {
    if (!Store.data.kaleidoConfig) {
      Store.data.kaleidoConfig = {
        bridgeUrl: 'http://localhost:3001',
        triggerMode: 'staged',
        cards: Array.from({ length: 22 }, (_, i) => ({
          cardId: i + 1,
          ip: `192.168.23.${201 + i}`,
          port: 8902,
          enabled: true,
        })),
        stagedLayouts: {},
      };
      Store.save();
    }
  }

  function render(container) {
    ensureKaleidoConfig();

    const page = Utils.tabPage('MULTIVIEWER CONFIGURATION', '25 multiviewer outputs with Kaleido control');

    // Kaleido Configuration Section
    page.appendChild(renderKaleidoConfigSection());

    // Staged Layout Changes Panel
    page.appendChild(renderStagedLayoutsPanel());

    // MV Windows Configuration (original functionality)
    page.appendChild(Utils.sectionHeader('MV WINDOW ASSIGNMENTS'));
    page.appendChild(renderMvWindowsSection());

    container.appendChild(page);
  }

  // Kaleido Configuration Section
  function renderKaleidoConfigSection() {
    const section = document.createElement('div');
    section.style.cssText = `
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-bottom: 16px;
    `;

    // Header with status
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin:0;font-size:13px;color:var(--accent-blue);';
    title.textContent = 'KALEIDO CONFIGURATION';
    header.appendChild(title);

    // Bridge Status and Controls
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

    // Status indicator
    const statusWrapper = document.createElement('div');
    statusWrapper.style.cssText = 'display:flex;align-items:center;gap:4px;';
    const statusDot = document.createElement('span');
    statusDot.id = 'kaleido-status-dot';
    statusDot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#666;';
    const statusText = document.createElement('span');
    statusText.id = 'kaleido-status-text';
    statusText.style.cssText = 'font-size:10px;color:var(--text-secondary);';
    statusText.textContent = 'Checking...';
    statusWrapper.appendChild(statusDot);
    statusWrapper.appendChild(statusText);
    controls.appendChild(statusWrapper);

    // Test Connection Button
    const testBtn = document.createElement('button');
    testBtn.className = 'btn';
    testBtn.style.cssText = 'padding:4px 8px;font-size:10px;';
    testBtn.textContent = 'Test Connection';
    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      const result = await KaleidoClient.checkConnection();
      updateConnectionStatus(result.status === 'connected');
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    });
    controls.appendChild(testBtn);

    // Trigger Mode Toggle
    const modeWrapper = document.createElement('div');
    modeWrapper.style.cssText = 'display:flex;align-items:center;gap:4px;';
    const modeLabel = document.createElement('span');
    modeLabel.style.cssText = 'font-size:10px;color:var(--text-secondary);';
    modeLabel.textContent = 'Mode:';
    modeWrapper.appendChild(modeLabel);

    const modeSelect = document.createElement('select');
    modeSelect.style.cssText = 'padding:3px 6px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';
    ['staged', 'immediate'].forEach(mode => {
      const opt = document.createElement('option');
      opt.value = mode;
      opt.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      if (KaleidoClient.getTriggerMode() === mode) opt.selected = true;
      modeSelect.appendChild(opt);
    });
    modeSelect.addEventListener('change', () => {
      KaleidoClient.setTriggerMode(modeSelect.value);
      App.renderCurrentTab();
    });
    modeWrapper.appendChild(modeSelect);
    controls.appendChild(modeWrapper);

    header.appendChild(controls);
    section.appendChild(header);

    // Bridge URL input
    const urlRow = document.createElement('div');
    urlRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';
    const urlLabel = document.createElement('label');
    urlLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);min-width:70px;';
    urlLabel.textContent = 'Bridge URL:';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    // Use localStorage so each computer has its own bridge URL (not synced)
    urlInput.value = localStorage.getItem('kaleidoBridgeUrl') || 'http://localhost:3001';
    urlInput.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);max-width:300px;';
    urlInput.addEventListener('change', () => {
      KaleidoClient.setBridgeUrl(urlInput.value);
    });
    urlRow.appendChild(urlLabel);
    urlRow.appendChild(urlInput);
    section.appendChild(urlRow);

    // Card Configuration Table
    const cardSection = document.createElement('div');
    const cardHeader = document.createElement('div');
    cardHeader.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
    const cardTitle = document.createElement('span');
    cardTitle.style.cssText = 'font-size:11px;font-weight:600;color:var(--text-primary);';
    cardTitle.textContent = 'KALEIDO CARDS (22 total)';
    cardHeader.appendChild(cardTitle);

    // Toggle for showing/hiding card table
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn';
    toggleBtn.style.cssText = 'padding:2px 6px;font-size:9px;';
    toggleBtn.textContent = 'Show/Hide';
    cardHeader.appendChild(toggleBtn);

    cardSection.appendChild(cardHeader);

    const cardTable = document.createElement('div');
    cardTable.id = 'kaleido-card-table';
    cardTable.style.cssText = 'display:none;';

    toggleBtn.addEventListener('click', () => {
      cardTable.style.display = cardTable.style.display === 'none' ? 'block' : 'none';
    });

    // Create table
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:10px;';

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Card', 'IP Address', 'Port', 'Enabled', 'Test'].forEach(col => {
      const th = document.createElement('th');
      th.style.cssText = 'padding:4px 6px;text-align:left;border-bottom:1px solid var(--border);color:var(--text-secondary);font-weight:600;';
      th.textContent = col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Card rows
    const tbody = document.createElement('tbody');
    const cards = Store.data.kaleidoConfig.cards || [];

    cards.forEach((card, idx) => {
      const row = document.createElement('tr');

      // Card ID
      const tdCard = document.createElement('td');
      tdCard.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);';
      tdCard.textContent = `MV ${card.cardId}`;
      row.appendChild(tdCard);

      // IP Address
      const tdIp = document.createElement('td');
      tdIp.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);';
      const ipInput = document.createElement('input');
      ipInput.type = 'text';
      ipInput.value = card.ip;
      ipInput.style.cssText = 'width:120px;padding:2px 4px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:2px;color:var(--text-primary);';
      ipInput.addEventListener('change', () => {
        Store.set(`kaleidoConfig.cards.${idx}.ip`, ipInput.value);
      });
      tdIp.appendChild(ipInput);
      row.appendChild(tdIp);

      // Port
      const tdPort = document.createElement('td');
      tdPort.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);';
      const portInput = document.createElement('input');
      portInput.type = 'number';
      portInput.value = card.port;
      portInput.style.cssText = 'width:60px;padding:2px 4px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:2px;color:var(--text-primary);';
      portInput.addEventListener('change', () => {
        Store.set(`kaleidoConfig.cards.${idx}.port`, parseInt(portInput.value) || 8902);
      });
      tdPort.appendChild(portInput);
      row.appendChild(tdPort);

      // Enabled checkbox
      const tdEnabled = document.createElement('td');
      tdEnabled.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);';
      const enabledCb = document.createElement('input');
      enabledCb.type = 'checkbox';
      enabledCb.checked = card.enabled;
      enabledCb.addEventListener('change', () => {
        Store.set(`kaleidoConfig.cards.${idx}.enabled`, enabledCb.checked);
      });
      tdEnabled.appendChild(enabledCb);
      row.appendChild(tdEnabled);

      // Test button
      const tdTest = document.createElement('td');
      tdTest.style.cssText = 'padding:4px 6px;border-bottom:1px solid var(--border);';
      const testCardBtn = document.createElement('button');
      testCardBtn.className = 'btn';
      testCardBtn.style.cssText = 'padding:2px 6px;font-size:9px;';
      testCardBtn.textContent = 'Test';
      testCardBtn.addEventListener('click', async () => {
        testCardBtn.disabled = true;
        testCardBtn.textContent = '...';
        const result = await KaleidoClient.testCard(ipInput.value, parseInt(portInput.value) || 8902);
        testCardBtn.textContent = result.success ? 'OK' : 'Fail';
        testCardBtn.style.background = result.success ? '#22c55e' : '#ef4444';
        testCardBtn.style.color = 'white';
        setTimeout(() => {
          testCardBtn.disabled = false;
          testCardBtn.textContent = 'Test';
          testCardBtn.style.background = '';
          testCardBtn.style.color = '';
        }, 2000);
      });
      tdTest.appendChild(testCardBtn);
      row.appendChild(tdTest);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    cardTable.appendChild(table);
    cardSection.appendChild(cardTable);
    section.appendChild(cardSection);

    // Check connection status on render
    setTimeout(async () => {
      const result = await KaleidoClient.checkConnection();
      updateConnectionStatus(result.status === 'connected');
    }, 100);

    return section;
  }

  // Update connection status display
  function updateConnectionStatus(connected) {
    const dot = document.getElementById('kaleido-status-dot');
    const text = document.getElementById('kaleido-status-text');
    if (dot && text) {
      dot.style.background = connected ? '#22c55e' : '#ef4444';
      text.textContent = connected ? 'Connected' : 'Disconnected';
      text.style.color = connected ? '#22c55e' : '#ef4444';
    }
  }

  // Staged Layout Changes Panel
  function renderStagedLayoutsPanel() {
    const stagedLayouts = KaleidoClient.getStagedLayouts();
    const entries = Object.entries(stagedLayouts);
    const mode = KaleidoClient.getTriggerMode();

    // Only show in staged mode
    if (mode !== 'staged') {
      const hidden = document.createElement('div');
      hidden.style.cssText = 'margin-bottom:16px;padding:8px 12px;background:var(--bg-secondary);border-radius:var(--radius-md);font-size:11px;color:var(--text-muted);';
      hidden.textContent = 'Staged layout panel hidden (Mode: Immediate)';
      return hidden;
    }

    const section = document.createElement('div');
    section.style.cssText = `
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: 12px;
      margin-bottom: 16px;
      border: 1px solid ${entries.length > 0 ? 'var(--accent-yellow)' : 'var(--border)'};
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;';

    const title = document.createElement('h3');
    title.style.cssText = 'margin:0;font-size:12px;color:var(--accent-yellow);';
    title.textContent = `STAGED LAYOUT CHANGES (${entries.length})`;
    header.appendChild(title);

    if (entries.length > 0) {
      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:6px;';

      const triggerBtn = document.createElement('button');
      triggerBtn.className = 'btn';
      triggerBtn.style.cssText = 'padding:4px 10px;font-size:10px;background:var(--accent-yellow);color:#000;font-weight:600;';
      triggerBtn.textContent = 'TRIGGER ALL';
      triggerBtn.addEventListener('click', async () => {
        triggerBtn.disabled = true;
        triggerBtn.textContent = 'Triggering...';
        const result = await KaleidoClient.triggerAllStaged();
        if (result.success) {
          triggerBtn.textContent = 'Done!';
          triggerBtn.style.background = '#22c55e';
          setTimeout(() => App.renderCurrentTab(), 1000);
        } else {
          triggerBtn.textContent = 'Failed';
          triggerBtn.style.background = '#ef4444';
          setTimeout(() => {
            triggerBtn.disabled = false;
            triggerBtn.textContent = 'TRIGGER ALL';
            triggerBtn.style.background = 'var(--accent-yellow)';
          }, 2000);
        }
      });
      btnGroup.appendChild(triggerBtn);

      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn';
      clearBtn.style.cssText = 'padding:4px 8px;font-size:10px;';
      clearBtn.textContent = 'Clear All';
      clearBtn.addEventListener('click', () => {
        KaleidoClient.clearStagedLayouts();
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
      empty.textContent = 'No staged layout changes. Change layouts in monitor wall pages to stage them here.';
      section.appendChild(empty);
    } else {
      const list = document.createElement('div');
      list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

      entries.forEach(([mvId, staged]) => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:var(--bg-primary);border-radius:3px;font-size:10px;';

        const info = document.createElement('span');
        info.style.cssText = 'color:var(--text-primary);';
        info.innerHTML = `<strong>MV ${mvId}</strong>: ${staged.from} → <span style="color:var(--accent-yellow)">${staged.to}</span>`;
        item.appendChild(info);

        const removeBtn = document.createElement('button');
        removeBtn.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:0 4px;';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remove';
        removeBtn.addEventListener('click', () => {
          KaleidoClient.unstagLayoutChange(mvId);
          App.renderCurrentTab();
        });
        item.appendChild(removeBtn);

        list.appendChild(item);
      });

      section.appendChild(list);
    }

    return section;
  }

  // Layout definitions (same as proddigital.js)
  const LAYOUTS = {
    '9_SPLIT': {
      name: '9 SPLIT', positions: 9,
      template: '"p1 p2 p3" "p4 p5 p6" "p7 p8 p9"',
      colSizes: '1fr 1fr 1fr', rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' }, { pos: 9, area: 'p9' },
      ],
    },
    '9_SPLIT_R': {
      name: '9 SPLIT R', positions: 9,
      template: '"p1 p2 p3 p4 p5 p6" "p7 p9 p9 p9 p9 p9" "p8 p9 p9 p9 p9 p9"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr', rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' }, { pos: 9, area: 'p9', vip: true },
      ],
    },
    '9_SPLIT_L': {
      name: '9 SPLIT L', positions: 9,
      template: '"p1 p2 p3 p4 p5 p6" "p9 p9 p9 p9 p9 p7" "p9 p9 p9 p9 p9 p8"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr', rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' }, { pos: 9, area: 'p9', vip: true },
      ],
    },
    '6_SPLIT_R': {
      name: '6 SPLIT R', positions: 6,
      template: '"p1 p2 p3" "p4 p5 p5" "p6 p5 p5"',
      colSizes: '1fr 1fr 1fr', rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5', vip: true }, { pos: 6, area: 'p6' },
      ],
    },
    '6_SPLIT_L': {
      name: '6 SPLIT L', positions: 6,
      template: '"p1 p2 p3" "p4 p4 p5" "p4 p4 p6"',
      colSizes: '1fr 1fr 1fr', rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4', vip: true }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
      ],
    },
    '5_SPLIT': {
      name: '5 SPLIT', positions: 5,
      template: '"p1 p1 p2 p2 p3 p3" "p4 p4 p4 p5 p5 p5"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr', rowSizes: '1fr 2fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4', vip: true }, { pos: 5, area: 'p5', vip: true },
      ],
    },
    '4_SPLIT': {
      name: '4 SPLIT', positions: 4,
      template: '"p1 p2" "p3 p4"',
      colSizes: '1fr 1fr', rowSizes: '1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' },
        { pos: 3, area: 'p3' }, { pos: 4, area: 'p4' },
      ],
    },
  };

  // Get all source options from RTR Master
  function getAllSourceOptions() {
    const sources = [];
    const rtrMaster = (Store.data && Store.data.rtrMaster) ? Store.data.rtrMaster : [];
    if (Array.isArray(rtrMaster)) {
      rtrMaster.forEach(device => {
        if (device && device.deviceName) {
          sources.push({ value: device.deviceName, label: device.deviceName });
        }
      });
    }
    return sources;
  }

  // MV Cards Section - mirrors monitor wall MVs
  function renderMvWindowsSection() {
    const wrapper = document.createElement('div');

    // Ensure prodDigital data exists
    if (!Store.data.prodDigital || !Store.data.prodDigital.multiviewers) {
      const notice = document.createElement('div');
      notice.style.cssText = 'padding:12px;background:var(--bg-secondary);border-radius:var(--radius-md);color:var(--text-muted);';
      notice.textContent = 'No multiviewer data. Visit a monitor wall page first to initialize MV configurations.';
      wrapper.appendChild(notice);
      return wrapper;
    }

    const multiviewers = Store.data.prodDigital.multiviewers;

    // Group by card (1-22)
    const cards = {};
    multiviewers.forEach((mv, idx) => {
      const cardId = mv.cardId;
      if (!cards[cardId]) cards[cardId] = [];
      cards[cardId].push({ ...mv, _idx: idx });
    });

    // Render each card
    Object.keys(cards).sort((a, b) => parseInt(a) - parseInt(b)).forEach(cardId => {
      const cardMvs = cards[cardId];
      const cardSection = document.createElement('div');
      cardSection.style.cssText = 'margin-bottom:16px;background:var(--bg-secondary);border-radius:var(--radius-md);padding:12px;';

      // Card header
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap;';

      const cardLabel = document.createElement('span');
      cardLabel.style.cssText = 'font-weight:700;font-size:13px;color:var(--accent-blue);';
      cardLabel.textContent = `MV ${cardId}`;
      header.appendChild(cardLabel);

      // Show which pages use this MV
      const usedOn = findMvUsage(cardId);
      if (usedOn.length > 0) {
        const usageLabel = document.createElement('span');
        usageLabel.style.cssText = 'font-size:10px;color:var(--text-muted);';
        usageLabel.textContent = `Used on: ${usedOn.join(', ')}`;
        header.appendChild(usageLabel);
      }

      cardSection.appendChild(header);

      // Render both sides
      const sidesContainer = document.createElement('div');
      sidesContainer.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';

      cardMvs.forEach(mv => {
        const sideEl = renderMvSide(mv, cardMvs);
        sidesContainer.appendChild(sideEl);
      });

      cardSection.appendChild(sidesContainer);
      wrapper.appendChild(cardSection);
    });

    return wrapper;
  }

  // Find which pages use a specific MV card
  function findMvUsage(cardId) {
    const usage = [];

    // Check PROD Digital PXMs
    if (Store.data.prodDigital && Store.data.prodDigital.pxms) {
      Store.data.prodDigital.pxms.forEach(pxm => {
        if (pxm.assignmentType === 'mv' && pxm.mvId) {
          const [card] = pxm.mvId.split('-');
          if (parseInt(card) === parseInt(cardId)) {
            usage.push('PROD Digital');
          }
        }
      });
    }

    // Check other walls
    if (Store.data.monitorWallsV2) {
      const wallNames = { 'p2p3': 'P2-P3', 'evs': 'EVS', 'aud': 'AUD' };
      Object.entries(Store.data.monitorWallsV2).forEach(([wallKey, wallData]) => {
        if (wallData.monitors) {
          wallData.monitors.forEach(mon => {
            if (mon.mvId) {
              const [card] = mon.mvId.split('-');
              if (parseInt(card) === parseInt(cardId)) {
                usage.push(wallNames[wallKey] || wallKey);
              }
            }
          });
        }
      });
    }

    return [...new Set(usage)];
  }

  // Render a single MV side
  function renderMvSide(mv, cardMvs) {
    const mvIdx = mv._idx;
    const side = mv.side;
    const pairedMv = cardMvs.find(m => m.side !== side);

    const container = document.createElement('div');
    container.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;padding:8px;';

    // Side header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap;';

    const sideLabel = document.createElement('span');
    sideLabel.style.cssText = 'font-weight:600;font-size:11px;color:var(--text-primary);';
    sideLabel.textContent = `Side ${side} (${mv.id})`;
    header.appendChild(sideLabel);

    // Check for staged change
    const stagedLayouts = (typeof KaleidoClient !== 'undefined') ? KaleidoClient.getStagedLayouts() : {};
    const isStaged = stagedLayouts[mv.id] !== undefined;

    // Layout selector
    const layoutSelect = document.createElement('select');
    layoutSelect.style.cssText = `flex:1;padding:3px 6px;font-size:10px;background:var(--bg-secondary);border:1px solid ${isStaged ? 'var(--accent-yellow)' : 'var(--border)'};border-radius:3px;color:var(--text-primary);min-width:80px;`;

    if (isStaged) {
      layoutSelect.title = `Staged: ${stagedLayouts[mv.id].from} → ${stagedLayouts[mv.id].to}`;
    }

    // Calculate available inputs for side 2
    let availableInputs = 9;
    if (side === 2 && pairedMv && pairedMv.layout) {
      const pairedLayout = LAYOUTS[pairedMv.layout];
      availableInputs = pairedLayout ? 9 - pairedLayout.positions : 9;
    }

    // Add layout options
    const noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = '-- None --';
    if (!mv.layout) noneOpt.selected = true;
    layoutSelect.appendChild(noneOpt);

    Object.entries(LAYOUTS).forEach(([key, l]) => {
      if (side === 2 && l.positions > availableInputs) return;
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${l.name} (${l.positions})`;
      if (mv.layout === key) opt.selected = true;
      layoutSelect.appendChild(opt);
    });

    layoutSelect.addEventListener('change', async () => {
      const newLayout = layoutSelect.value;
      const oldLayout = mv.layout;

      Store.data.prodDigital.multiviewers[mvIdx].layout = newLayout || null;
      Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, newLayout || null);

      // Handle Kaleido trigger
      if (typeof KaleidoClient !== 'undefined' && newLayout && mv.cardId) {
        await KaleidoClient.handleLayoutChange(mv.id, oldLayout || '', newLayout, mv.cardId);
      }

      App.renderCurrentTab();
    });

    header.appendChild(layoutSelect);

    if (side === 2 && pairedMv && pairedMv.layout) {
      const availInfo = document.createElement('span');
      availInfo.style.cssText = 'font-size:9px;color:var(--text-muted);';
      availInfo.textContent = `(${availableInputs} avail)`;
      header.appendChild(availInfo);
    }

    container.appendChild(header);

    // Layout grid
    const layout = mv.layout ? LAYOUTS[mv.layout] : null;
    if (layout) {
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-areas: ${layout.template};
        grid-template-columns: ${layout.colSizes};
        grid-template-rows: ${layout.rowSizes};
        gap: 2px;
        height: 100px;
      `;

      layout.cells.forEach(cell => {
        const cellEl = document.createElement('div');
        const sourceValue = mv.inputs ? mv.inputs[cell.pos - 1] || '' : '';
        const baseBg = cell.vip ? 'linear-gradient(135deg, #3b4a6b 0%, #2a3a5b 100%)' : '#252836';

        cellEl.style.cssText = `
          grid-area: ${cell.area};
          background: ${baseBg};
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: ${sourceValue ? '#34d399' : (cell.vip ? '#5b9aff' : 'var(--text-secondary)')};
          cursor: pointer;
          padding: 2px;
          transition: all 0.15s ease;
        `;

        const displayLabel = `${mv.cardId}-${cell.pos}`;
        if (sourceValue) {
          const srcName = document.createElement('div');
          srcName.style.cssText = 'font-size:9px;text-align:center;line-height:1.1;';
          srcName.textContent = sourceValue;
          cellEl.appendChild(srcName);
          const posLabel = document.createElement('div');
          posLabel.style.cssText = 'font-size:7px;color:var(--text-muted);';
          posLabel.textContent = displayLabel;
          cellEl.appendChild(posLabel);
        } else {
          cellEl.textContent = displayLabel;
        }

        // Click to edit source
        cellEl.addEventListener('click', (e) => {
          e.stopPropagation();
          showSourcePicker(cellEl, (source) => {
            if (!Store.data.prodDigital.multiviewers[mvIdx].inputs) {
              Store.data.prodDigital.multiviewers[mvIdx].inputs = Array(9).fill('');
            }
            Store.data.prodDigital.multiviewers[mvIdx].inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);
            App.renderCurrentTab();
          });
        });

        // Drag and drop
        cellEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          cellEl.style.background = 'linear-gradient(135deg, #4a6b3b 0%, #3a5b2a 100%)';
        });
        cellEl.addEventListener('dragleave', () => {
          cellEl.style.background = baseBg;
        });
        cellEl.addEventListener('drop', (e) => {
          e.preventDefault();
          cellEl.style.background = baseBg;
          const source = e.dataTransfer.getData('text/plain');
          if (source) {
            if (!Store.data.prodDigital.multiviewers[mvIdx].inputs) {
              Store.data.prodDigital.multiviewers[mvIdx].inputs = Array(9).fill('');
            }
            Store.data.prodDigital.multiviewers[mvIdx].inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);
            App.renderCurrentTab();
          }
        });

        grid.appendChild(cellEl);
      });

      container.appendChild(grid);
    } else {
      const empty = document.createElement('div');
      empty.style.cssText = 'height:100px;display:flex;align-items:center;justify-content:center;background:#1a1a1a;border-radius:3px;font-size:10px;color:var(--text-muted);';
      empty.textContent = 'Select a layout';
      container.appendChild(empty);
    }

    return container;
  }

  // Source picker popup
  function showSourcePicker(anchorEl, onSelect) {
    const existing = document.querySelector('.source-picker-popup');
    if (existing) existing.remove();

    const sources = getAllSourceOptions();

    const popup = document.createElement('div');
    popup.className = 'source-picker-popup';
    popup.style.cssText = `
      position: fixed;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      min-width: 180px;
      display: flex;
      flex-direction: column;
    `;

    const filterWrapper = document.createElement('div');
    filterWrapper.style.cssText = 'padding:6px;border-bottom:1px solid var(--border);';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter sources...';
    filterInput.style.cssText = 'width:100%;padding:6px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);box-sizing:border-box;';
    filterWrapper.appendChild(filterInput);
    popup.appendChild(filterWrapper);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'max-height:200px;overflow-y:auto;';

    let currentFiltered = sources;

    function renderOptions(filterText = '') {
      optionsContainer.innerHTML = '';
      const terms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t);

      const clearOpt = document.createElement('div');
      clearOpt.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:11px;color:var(--text-muted);border-bottom:1px solid var(--border);';
      clearOpt.textContent = '-- Clear --';
      clearOpt.addEventListener('click', () => { onSelect(''); popup.remove(); });
      clearOpt.addEventListener('mouseenter', () => clearOpt.style.background = 'var(--bg-secondary)');
      clearOpt.addEventListener('mouseleave', () => clearOpt.style.background = '');
      optionsContainer.appendChild(clearOpt);

      currentFiltered = terms.length > 0
        ? sources.filter(src => terms.every(t => src.label.toLowerCase().includes(t)))
        : sources;

      currentFiltered.forEach((src, i) => {
        const isFirst = i === 0 && terms.length > 0;
        const opt = document.createElement('div');
        opt.style.cssText = `padding:6px 10px;cursor:pointer;font-size:11px;color:var(--text-primary);${isFirst ? 'background:var(--accent-blue);color:white;' : ''}`;
        opt.textContent = src.label;
        if (!isFirst) {
          opt.addEventListener('mouseenter', () => opt.style.background = 'var(--bg-secondary)');
          opt.addEventListener('mouseleave', () => opt.style.background = '');
        }
        opt.addEventListener('click', () => { onSelect(src.value); popup.remove(); });
        optionsContainer.appendChild(opt);
      });
    }

    renderOptions();
    popup.appendChild(optionsContainer);

    filterInput.addEventListener('input', () => renderOptions(filterInput.value));
    filterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentFiltered.length > 0) {
        e.preventDefault();
        onSelect(currentFiltered[0].value);
        popup.remove();
      }
    });

    const rect = anchorEl.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 190) + 'px';
    popup.style.top = Math.min(rect.bottom + 2, window.innerHeight - 260) + 'px';

    document.body.appendChild(popup);
    setTimeout(() => filterInput.focus(), 10);

    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);

    document.addEventListener('keydown', function keyHandler(e) {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    });
  }

  return { render };
})();
