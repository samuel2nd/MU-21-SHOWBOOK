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
    urlInput.value = Store.data.kaleidoConfig.bridgeUrl || 'http://localhost:3001';
    urlInput.style.cssText = 'flex:1;padding:4px 8px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);max-width:300px;';
    urlInput.addEventListener('change', () => {
      Store.set('kaleidoConfig.bridgeUrl', urlInput.value);
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

  // MV Windows Section (original functionality)
  function renderMvWindowsSection() {
    const wrapper = document.createElement('div');

    Store.data.multiviewer.forEach((mv, mvIdx) => {
      const mvSection = document.createElement('div');
      mvSection.style.cssText = 'margin-bottom:16px;';

      mvSection.appendChild(Utils.sectionHeader(`MV ${mv.mv}`));

      // Visual 4x4 grid
      const grid = document.createElement('div');
      grid.className = 'monitor-wall';
      grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      grid.style.maxWidth = '500px';

      mv.windows.forEach((win, wIdx) => {
        const cell = document.createElement('div');
        cell.className = 'monitor-cell' + (win.source ? ' active' : '');
        cell.style.minHeight = '45px';

        const wLabel = document.createElement('div');
        wLabel.className = 'mon-label';
        wLabel.textContent = `W${win.window}`;

        const wSource = document.createElement('div');
        wSource.className = 'mon-source';
        wSource.style.fontSize = '10px';
        wSource.textContent = win.source || '-';

        cell.appendChild(wLabel);
        cell.appendChild(wSource);

        cell.addEventListener('click', () => {
          const source = prompt(`MV${mv.mv} Window ${win.window} - Source:`, win.source || '');
          if (source === null) return;
          win.source = source;
          win.label = source;
          Store.set(`multiviewer.${mvIdx}.windows.${wIdx}`, { ...win });
          App.renderCurrentTab();
        });

        grid.appendChild(cell);
      });

      mvSection.appendChild(grid);

      // Detail table (collapsible)
      const detailToggle = document.createElement('button');
      detailToggle.className = 'btn';
      detailToggle.textContent = 'Show/Hide Detail Table';
      detailToggle.style.cssText = 'margin:8px 0;font-size:11px;';

      const detailDiv = document.createElement('div');
      detailDiv.style.display = 'none';

      detailToggle.addEventListener('click', () => {
        detailDiv.style.display = detailDiv.style.display === 'none' ? 'block' : 'none';
      });

      mvSection.appendChild(detailToggle);

      const columns = [
        { key: '_rowNum', label: 'Win', width: '35px' },
        { key: 'source', label: 'Source', type: 'select', options: () => Utils.getSourceOptions() },
        { key: 'label', label: 'Label' },
      ];

      Utils.renderEditableTable(detailDiv, columns, `multiviewer.${mvIdx}.windows`, mv.windows);
      mvSection.appendChild(detailDiv);

      wrapper.appendChild(mvSection);
    });

    return wrapper;
  }

  return { render };
})();
