// EVS CONFIG — 4 EVS servers (2101, 2102, 2103, 2105) + XFILE gateway
const EvsConfigTab = (() => {

  function render(container) {
    // Ensure evsConfig data exists with new structure
    if (!Store.data.evsConfig || !Store.data.evsConfig.servers) {
      Store.data.evsConfig = getDefaultEvsConfig();
      Store.save();
    }

    const page = Utils.tabPage('EVS CONFIG', 'EVS replay server configuration — channel assignments, network settings, and Wohler audio monitoring.');

    // EVS Servers Grid (4 servers side by side)
    const serversGrid = document.createElement('div');
    serversGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;margin-bottom:24px;';

    Store.data.evsConfig.servers.forEach((server, sIdx) => {
      serversGrid.appendChild(renderServerCard(server, sIdx));
    });
    page.appendChild(serversGrid);

    // XFILE 1 Gateway section
    page.appendChild(Utils.sectionHeader('XFILE 1 Gateway'));
    page.appendChild(renderXfileCard(Store.data.evsConfig.xfile));

    // SHOW SOURCES reference section
    page.appendChild(Utils.sectionHeader('Show Sources Reference'));
    page.appendChild(renderShowSourcesTable());

    container.appendChild(page);
  }

  function renderServerCard(server, sIdx) {
    const card = document.createElement('div');
    card.className = 'evs-server-card';
    card.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:12px;';

    // Header row: EVS ID, OP, S.N.
    const header = document.createElement('div');
    header.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;background:var(--accent);padding:6px;border-radius:3px;';

    const evsLabel = document.createElement('div');
    evsLabel.innerHTML = `<strong style="color:var(--text-primary);">EVS ${server.id}</strong>`;
    header.appendChild(evsLabel);

    const opField = createLabeledField('OP:', server.op, (val) => {
      server.op = val;
      Store.set(`evsConfig.servers.${sIdx}.op`, val);
    });
    header.appendChild(opField);

    const snField = document.createElement('div');
    snField.innerHTML = `<span style="font-size:10px;color:var(--text-secondary);">S.N.</span> <span style="color:var(--text-primary);font-size:11px;">${server.sn}</span>`;
    header.appendChild(snField);

    card.appendChild(header);

    // Config row: 8CH, POS, MOD
    const configRow = document.createElement('div');
    configRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;font-size:11px;';

    configRow.innerHTML = `
      <div><span style="color:var(--text-secondary);">8CH</span></div>
      <div><span style="color:var(--text-secondary);">POS:</span> <span style="color:var(--accent-bright);">${server.pos}</span></div>
      <div><span style="color:var(--text-secondary);">MOD:</span> <span style="color:var(--text-primary);">${server.mod}</span></div>
    `;
    card.appendChild(configRow);

    // Config type and names row
    const namesRow = document.createElement('div');
    namesRow.style.cssText = 'display:grid;grid-template-columns:auto 1fr 1fr;gap:8px;margin-bottom:12px;align-items:center;';

    const configType = document.createElement('div');
    configType.innerHTML = `<span style="font-size:12px;font-weight:bold;color:var(--accent-bright);">${server.config}</span>`;
    namesRow.appendChild(configType);

    const showNameInput = createCompactInput('Show Name', server.showName, (val) => {
      server.showName = val;
      Store.set(`evsConfig.servers.${sIdx}.showName`, val);
    });
    namesRow.appendChild(showNameInput);

    const engNameDisplay = document.createElement('div');
    engNameDisplay.innerHTML = `<span style="font-size:10px;color:var(--text-secondary);">ENG:</span> <span style="font-size:11px;color:var(--text-secondary);">${server.engName}</span>`;
    namesRow.appendChild(engNameDisplay);

    card.appendChild(namesRow);

    // Channel I/O Table
    const channelTable = renderChannelTable(server, sIdx);
    card.appendChild(channelTable);

    // Network Info
    const networkSection = document.createElement('div');
    networkSection.style.cssText = 'margin-top:12px;padding:8px;background:var(--bg-tertiary);border-radius:3px;';

    const netGrid = document.createElement('div');
    netGrid.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:4px 8px;font-size:11px;';

    netGrid.innerHTML = `
      <span style="color:var(--text-secondary);">PC LAN</span>
      <span style="color:var(--text-primary);">${server.network.pcLan}</span>
      <span style="color:var(--text-secondary);">10G</span>
      <span style="color:var(--text-primary);">${server.network.tenG}</span>
      <span style="color:var(--text-secondary);">XNET</span>
      <span style="color:var(--accent-bright);">${server.network.xnet}</span>
    `;
    networkSection.appendChild(netGrid);
    card.appendChild(networkSection);

    // Wohler Table
    const wohlerSection = document.createElement('div');
    wohlerSection.style.cssText = 'margin-top:12px;';

    const wohlerHeader = document.createElement('div');
    wohlerHeader.style.cssText = 'font-size:11px;font-weight:bold;color:var(--text-secondary);margin-bottom:4px;';
    wohlerHeader.textContent = server.id === '2105' ? 'WOHLER (ANALOG)' : 'WOHLER (RTR OUT)';
    wohlerSection.appendChild(wohlerHeader);

    wohlerSection.appendChild(renderWohlerTable(server, sIdx));
    card.appendChild(wohlerSection);

    return card;
  }

  function renderChannelTable(server, sIdx) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-height:280px;overflow-y:auto;';

    const table = document.createElement('table');
    table.className = 'data-table compact';
    table.style.cssText = 'font-size:11px;';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:25px;text-align:center;">#</th>
        <th>Show Name</th>
        <th>Eng Name</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    server.channels.forEach((ch, chIdx) => {
      const tr = document.createElement('tr');

      // Row number - outputs get subtle styling
      const tdNum = document.createElement('td');
      tdNum.style.cssText = 'text-align:center;font-weight:bold;';
      if (ch.isOutput) {
        tdNum.style.color = 'var(--accent-cyan)';
      }
      tdNum.textContent = ch.channel;
      tr.appendChild(tdNum);

      // Show Name (editable) - syncs to sources array
      const tdShow = document.createElement('td');
      const showInput = document.createElement('input');
      showInput.type = 'text';
      showInput.value = ch.showName || '';
      showInput.placeholder = ch.engName || '';
      showInput.style.cssText = 'width:100%;font-size:11px;padding:2px 4px;';
      showInput.addEventListener('change', () => {
        ch.showName = showInput.value;
        Store.set(`evsConfig.servers.${sIdx}.channels.${chIdx}.showName`, showInput.value);
        // Sync to sources array for lookups throughout the app
        syncEvsChannelToSources(ch.engName, showInput.value);
      });
      tdShow.appendChild(showInput);
      tr.appendChild(tdShow);

      // Eng Name (display only)
      const tdEng = document.createElement('td');
      tdEng.style.color = 'var(--text-secondary)';
      tdEng.textContent = ch.engName || '';
      if (ch.isOutput) {
        tdEng.style.fontStyle = 'italic';
      }
      tr.appendChild(tdEng);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    return wrapper;
  }

  // Sync EVS channel show name to sources array for app-wide lookups
  function syncEvsChannelToSources(engName, showName) {
    if (!engName) return;

    // Find existing source with this engSource
    const existingIdx = Store.data.sources.findIndex(s => s.engSource === engName);

    if (showName) {
      if (existingIdx >= 0) {
        // Update existing
        Store.data.sources[existingIdx].showName = showName;
        Store.set(`sources.${existingIdx}.showName`, showName);
      } else {
        // Add new source entry for this EVS channel
        const newSource = {
          number: Store.data.sources.length + 1,
          engSource: engName,
          showName: showName,
          umdName: '',
          rtrName: '',
          swrInput: '',
          category: 'EVS',
        };
        Store.data.sources.push(newSource);
        Store.save();
      }
    } else if (existingIdx >= 0) {
      // Clear show name if emptied
      Store.data.sources[existingIdx].showName = '';
      Store.set(`sources.${existingIdx}.showName`, '');
    }
  }

  function renderWohlerTable(server, sIdx) {
    const table = document.createElement('table');
    table.className = 'data-table compact';
    table.style.cssText = 'font-size:10px;';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width:20px;">CH</th>
        <th>Description</th>
        <th>${server.id === '2105' ? 'ANALOG' : 'RTR OUT'}</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    server.wohler.forEach((w, wIdx) => {
      const tr = document.createElement('tr');

      const tdCh = document.createElement('td');
      tdCh.textContent = w.channel;
      tdCh.style.textAlign = 'center';
      tr.appendChild(tdCh);

      const tdDesc = document.createElement('td');
      const descInput = document.createElement('input');
      descInput.type = 'text';
      descInput.value = w.description || '';
      descInput.style.cssText = 'width:100%;font-size:10px;padding:2px;';
      descInput.addEventListener('change', () => {
        w.description = descInput.value;
        Store.set(`evsConfig.servers.${sIdx}.wohler.${wIdx}.description`, descInput.value);
      });
      tdDesc.appendChild(descInput);
      tr.appendChild(tdDesc);

      const tdRtr = document.createElement('td');
      const rtrInput = document.createElement('input');
      rtrInput.type = 'text';
      rtrInput.value = w.rtrOut || '';
      rtrInput.style.cssText = 'width:100%;font-size:10px;padding:2px;';
      rtrInput.addEventListener('change', () => {
        w.rtrOut = rtrInput.value;
        Store.set(`evsConfig.servers.${sIdx}.wohler.${wIdx}.rtrOut`, rtrInput.value);
      });
      tdRtr.appendChild(rtrInput);
      tr.appendChild(tdRtr);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  }

  function renderXfileCard(xfile) {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:16px;display:inline-block;min-width:300px;';

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:bold;color:var(--accent-bright);margin-bottom:12px;font-size:14px;';
    header.textContent = xfile.name;
    card.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:12px;';

    grid.innerHTML = `
      <span style="color:var(--text-secondary);">PC LAN</span>
      <span style="color:var(--text-primary);">${xfile.pcLan}</span>
      <span style="color:var(--text-secondary);">10G</span>
      <span style="color:var(--text-primary);">${xfile.tenG}</span>
      <span style="color:var(--text-secondary);">INET</span>
      <span style="color:var(--text-primary);">${xfile.inet}</span>
      <span style="color:var(--text-secondary);font-weight:bold;margin-top:8px;">GATEWAYS</span>
      <span></span>
      <span style="color:var(--text-secondary);padding-left:12px;">PC LAN</span>
      <span style="color:var(--text-primary);">${xfile.gateways.pcLan}</span>
      <span style="color:var(--text-secondary);padding-left:12px;">10G</span>
      <span style="color:var(--text-primary);">${xfile.gateways.tenG}</span>
    `;
    card.appendChild(grid);

    return card;
  }

  function renderShowSourcesTable() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;';

    const columnLabels = ['EVS 2101', 'EVS 2102', 'EVS 2103', 'EVS 2105', 'Overflow'];

    Store.data.evsConfig.showSources.forEach((col, colIdx) => {
      const colDiv = document.createElement('div');

      const colHeader = document.createElement('div');
      colHeader.style.cssText = 'font-size:11px;font-weight:bold;color:var(--accent);margin-bottom:6px;text-align:center;padding:4px;background:var(--bg-secondary);border-radius:3px;';
      colHeader.textContent = columnLabels[colIdx] || `Column ${colIdx + 1}`;
      colDiv.appendChild(colHeader);

      const table = document.createElement('table');
      table.className = 'data-table compact';
      table.style.cssText = 'font-size:10px;';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>ENG SRC</th>
          <th>Show Name</th>
          <th>Audio</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      col.forEach((src, rowIdx) => {
        const tr = document.createElement('tr');

        const tdEng = document.createElement('td');
        tdEng.textContent = src.engSource;
        tdEng.style.color = 'var(--text-secondary)';
        tr.appendChild(tdEng);

        const tdShow = document.createElement('td');
        const showInput = document.createElement('input');
        showInput.type = 'text';
        showInput.value = src.showName || '';
        showInput.style.cssText = 'width:100%;font-size:10px;padding:1px 2px;';
        showInput.addEventListener('change', () => {
          src.showName = showInput.value;
          Store.set(`evsConfig.showSources.${colIdx}.${rowIdx}.showName`, showInput.value);
          // Sync to sources array for lookups throughout the app
          syncEvsChannelToSources(src.engSource, showInput.value);
        });
        tdShow.appendChild(showInput);
        tr.appendChild(tdShow);

        const tdAudio = document.createElement('td');
        const audioInput = document.createElement('input');
        audioInput.type = 'text';
        audioInput.value = src.audio || '';
        audioInput.style.cssText = 'width:100%;font-size:10px;padding:1px 2px;';
        audioInput.addEventListener('change', () => {
          src.audio = audioInput.value;
          Store.set(`evsConfig.showSources.${colIdx}.${rowIdx}.audio`, audioInput.value);
        });
        tdAudio.appendChild(audioInput);
        tr.appendChild(tdAudio);

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'table-scroll';
      tableWrapper.style.maxHeight = '350px';
      tableWrapper.appendChild(table);
      colDiv.appendChild(tableWrapper);

      wrapper.appendChild(colDiv);
    });

    return wrapper;
  }

  function createLabeledField(label, value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:4px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:10px;color:var(--text-secondary);';
    lbl.textContent = label;
    wrapper.appendChild(lbl);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.style.cssText = 'width:60px;font-size:11px;padding:2px 4px;';
    input.addEventListener('change', () => onChange(input.value));
    wrapper.appendChild(input);

    return wrapper;
  }

  function createCompactInput(placeholder, value, onChange) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.placeholder = placeholder;
    input.style.cssText = 'width:100%;font-size:11px;padding:2px 4px;';
    input.addEventListener('change', () => onChange(input.value));
    return input;
  }

  // Fallback default data generator (mirrors store.js defaultEvsConfig)
  function getDefaultEvsConfig() {
    const serverDefs = [
      { id: '2101', sn: '310160', mod: 'XT VIA', pos: 'REVS 1', config: '6X2', xnet: 1 },
      { id: '2102', sn: '310170', mod: 'XT VIA', pos: 'FEVS 2', config: '6X2', xnet: 2 },
      { id: '2103', sn: '310140', mod: 'XT VIA', pos: 'FEVS 1', config: '6X2', xnet: 3 },
      { id: '2105', sn: '310110', mod: 'Xs VIA', pos: 'TD', config: '0X4', xnet: 20 },
    ];

    // Default channel names - MATCHES RTR I/O MASTER naming
    // ENG names: Inputs use EVSx-Xin format, Outputs use EVS x-Xs format
    const channelDefaults = {
      '2101': [
        { ch: 1, engName: 'EVS1-Ain', showName: 'EVS 1-1 IN' },
        { ch: 2, engName: 'EVS1-Bin', showName: 'EVS 1-2 IN' },
        { ch: 3, engName: 'EVS1-Cin', showName: 'EVS 1-3 IN' },
        { ch: 4, engName: 'EVS1-Din', showName: 'EVS 1-4 IN' },
        { ch: 5, engName: 'EVS1-Ein', showName: 'EVS 1-5 IN' },
        { ch: 6, engName: 'EVS1-Fin', showName: 'EVS 1-6 IN' },
        { ch: 7, engName: 'EVS 1-As', showName: '', isOutput: true },
        { ch: 8, engName: 'EVS 1-Bs', showName: '', isOutput: true },
      ],
      '2102': [
        { ch: 1, engName: 'EVS2-Ain', showName: 'EVS 2-1 IN' },
        { ch: 2, engName: 'EVS2-Bin', showName: 'EVS 2-2 IN' },
        { ch: 3, engName: 'EVS2-Cin', showName: 'EVS 2-3 IN' },
        { ch: 4, engName: 'EVS2-Din', showName: 'EVS 2-4 IN' },
        { ch: 5, engName: 'EVS2-Ein', showName: 'EVS 2-5 IN' },
        { ch: 6, engName: 'EVS2-Fin', showName: 'EVS 2-6 IN' },
        { ch: 7, engName: 'EVS 2-As', showName: '', isOutput: true },
        { ch: 8, engName: 'EVS 2-Bs', showName: '', isOutput: true },
      ],
      '2103': [
        { ch: 1, engName: 'EVS3-Ain', showName: 'EVS 3-1 IN' },
        { ch: 2, engName: 'EVS3-Bin', showName: 'EVS 3-2 IN' },
        { ch: 3, engName: 'EVS3-Cin', showName: 'EVS 3-3 IN' },
        { ch: 4, engName: 'EVS3-Din', showName: 'EVS 3-4 IN' },
        { ch: 5, engName: 'EVS3-Ein', showName: 'EVS 3-5 IN' },
        { ch: 6, engName: 'EVS3-Fin', showName: 'EVS 3-6 IN' },
        { ch: 7, engName: 'EVS 3-As', showName: 'EVS 3-1 OUT', isOutput: true },
        { ch: 8, engName: 'EVS 3-Bs', showName: 'EVS 3-2 OUT', isOutput: true },
      ],
      '2105': [
        { ch: 1, engName: 'SPOT 1', showName: 'SPOT 1' },
        { ch: 2, engName: 'SPOT 2', showName: 'SPOT 2' },
        { ch: 3, engName: 'SPOT 3', showName: 'SPOT 3' },
        { ch: 4, engName: 'SPOT 4', showName: 'SPOT 4' },
        { ch: 5, engName: '', showName: '' },
        { ch: 6, engName: '', showName: '' },
        { ch: 7, engName: '', showName: '' },
        { ch: 8, engName: '', showName: '' },
      ],
    };

    const wohlerDefaults = {
      '2101': ['REVS 1-1', 'REVS 1-2', 'REVS 1-3', 'REVS 1-4', 'REVS 2-1', 'REVS 2-2', 'REVS 2-3', 'REVS 2-4'],
      '2102': ['FEVS 3-1', 'FEVS 3-2', 'FEVS 3-3', 'FEVS 3-4', 'FEVS 4-1', 'FEVS 4-2', 'FEVS 4-3', 'FEVS 4-4'],
      '2103': ['FEVS 1-1', 'FEVS 1-2', 'FEVS 1-3', 'FEVS 1-4', 'FEVS 2-1', 'FEVS 2-2', 'FEVS 2-3', 'FEVS 2-4'],
      '2105': ['TD WOHLER 1', 'TD WOHLER 2', 'TD WOHLER 3', 'TD WOHLER 4', 'TD WOHLER 5', 'TD WOHLER 6', 'TD WOHLER 7', 'TD WOHLER 8'],
    };

    const servers = serverDefs.map((def, idx) => ({
      id: def.id,
      op: '',
      sn: def.sn,
      mod: def.mod,
      pos: def.pos,
      config: def.config,
      showName: '',
      engName: `EVS ${idx + 1}`,
      channels: channelDefaults[def.id].map(ch => ({
        channel: ch.ch,
        engName: ch.engName,
        showName: ch.showName,
        isOutput: ch.isOutput || false,
      })),
      network: {
        pcLan: `10.5.21.1${idx + 1}/16`,
        tenG: `192.168.201.21${idx + 1}/24`,
        xnet: def.xnet,
      },
      wohler: Array.from({ length: 8 }, (_, i) => ({
        channel: i + 1,
        description: '',  // User fills in description
        rtrOut: wohlerDefaults[def.id][i] || '',  // Default router output name
        isAnalog: def.id === '2105',
      })),
    }));

    const xfile = {
      name: 'XFILE 1',
      pcLan: '10.5.21.10/16',
      tenG: '192.168.201.230/24',
      inet: 'DHCP',
      gateways: { pcLan: '10.5.21.1', tenG: '192.168.201.1' },
    };

    const showSourcesDefaults = [
      ['CCU 01', 'FS 01', 'SHOW03', 'SHOW04', 'SHOW05', 'SHOW06', 'SHOW07', 'SHOW08', 'SHOW09', 'SHOW10', 'SHOW11', 'SHOW12', 'SHOW13', 'SHOW14'],
      ['SHOW15', 'SHOW16', 'SHOW17', 'SHOW18', 'SHOW19', 'SHOW20', 'SHOW21', 'SHOW22', 'SHOW23', 'SHOW24', 'SHOW25', 'SHOW26', 'SHOW27', 'SHOW28'],
      ['SHOW29', 'SHOW30', 'SHOW31', 'SHOW32', 'SHOW33', 'SHOW34', 'SHOW35', 'SHOW36', 'SHOW37', 'SHOW38', 'SHOW39', 'SHOW40', 'SHOW41', 'SHOW42'],
      ['SHOW41', 'SHOW42', 'SHOW43', 'SHOW44', 'SHOW45', 'SHOW46', 'SHOW47', 'SHOW48', 'SHOW49', 'SHOW50', 'SHOW51', 'SHOW52', 'SHOW53', 'SHOW54'],
      ['SHOW55', 'SHOW56', 'SHOW57', 'SHOW58', 'SHOW59', 'SHOW60', 'SHOW61', 'SHOW62', 'SHOW63', 'SHOW64', 'SHOW65', 'SHOW66', 'SHOW67', 'SHOW68'],
    ];

    const showSources = showSourcesDefaults.map(col =>
      col.map(engSource => ({ engSource, showName: '', audio: '*CNSLCAM' }))
    );

    return { servers, xfile, showSources };
  }

  return { render, getDefaultEvsConfig };
})();
