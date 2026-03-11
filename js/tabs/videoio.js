// VIDEO I/O Tab — Fiber RTR Outputs, Coax RTR Outputs, Tie Lines, JFS MUX
const VideoIoTab = (() => {

  function render(container) {
    const page = Utils.tabPage('VIDEO I/O', 'Router outputs, tie lines, and JFS MUX assignments. Fiber assignments auto-populate FIBER TAC page.');

    // I/O RTR OUTPUT Section
    page.appendChild(Utils.sectionHeader('I/O RTR OUTPUT'));
    const rtrOutputRow = document.createElement('div');
    rtrOutputRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;';

    // Fiber RTR Outputs (16)
    const fiberSection = document.createElement('div');
    const fiberTitle = document.createElement('h4');
    fiberTitle.textContent = 'FIBER (1–16)';
    fiberTitle.style.cssText = 'margin:0 0 8px 0;color:var(--accent-blue);';
    fiberSection.appendChild(fiberTitle);
    renderFiberRtrTable(fiberSection, Store.data.videoIo.fiberRtrOut);
    rtrOutputRow.appendChild(fiberSection);

    // Coax RTR Outputs (16)
    const coaxSection = document.createElement('div');
    const coaxTitle = document.createElement('h4');
    coaxTitle.textContent = 'COAX (1–16)';
    coaxTitle.style.cssText = 'margin:0 0 8px 0;color:var(--accent-orange);';
    coaxSection.appendChild(coaxTitle);
    renderCoaxRtrTable(coaxSection, Store.data.videoIo.coaxRtrOut);
    rtrOutputRow.appendChild(coaxSection);

    page.appendChild(rtrOutputRow);

    // TIE LINES Section
    page.appendChild(Utils.sectionHeader('TIE LINES'));
    const tieLinesRow = document.createElement('div');
    tieLinesRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;';

    // Coax I/O Tie Lines (48)
    const ioTieSection = document.createElement('div');
    const ioTieTitle = document.createElement('h4');
    ioTieTitle.textContent = 'COAX I/O TIE LINES (1–48)';
    ioTieTitle.style.cssText = 'margin:0 0 8px 0;color:var(--accent-green);';
    ioTieSection.appendChild(ioTieTitle);
    renderIoTieLinesTable(ioTieSection, Store.data.videoIo.coaxIoTieLines);
    tieLinesRow.appendChild(ioTieSection);

    // Coax Truck Tie Lines (48)
    const truckTieSection = document.createElement('div');
    const truckTieTitle = document.createElement('h4');
    truckTieTitle.textContent = 'COAX TRUCK TIE LINES (1–48)';
    truckTieTitle.style.cssText = 'margin:0 0 8px 0;color:var(--text-secondary);';
    truckTieSection.appendChild(truckTieTitle);
    renderTruckTieLinesTable(truckTieSection, Store.data.videoIo.coaxTruckTieLines);
    tieLinesRow.appendChild(truckTieSection);

    page.appendChild(tieLinesRow);

    // JFS MUX Section
    page.appendChild(Utils.sectionHeader('FIBER JFS MUX'));
    const jfsMuxRow = document.createElement('div');
    jfsMuxRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;';

    // JFS MUX 1 (12 rows)
    const mux1Section = document.createElement('div');
    const mux1Title = document.createElement('h4');
    mux1Title.textContent = 'JFS MUX 1 (1–12)';
    mux1Title.style.cssText = 'margin:0 0 8px 0;color:var(--accent-blue);';
    mux1Section.appendChild(mux1Title);
    renderJfsMuxTable(mux1Section, Store.data.videoIo.jfsMux1, 'jfsMux1');
    jfsMuxRow.appendChild(mux1Section);

    // JFS MUX 2 (6 rows)
    const mux2Section = document.createElement('div');
    const mux2Title = document.createElement('h4');
    mux2Title.textContent = 'JFS MUX 2 (1–6)';
    mux2Title.style.cssText = 'margin:0 0 8px 0;color:var(--accent-blue);';
    mux2Section.appendChild(mux2Title);
    renderJfsMuxTable(mux2Section, Store.data.videoIo.jfsMux2, 'jfsMux2');
    jfsMuxRow.appendChild(mux2Section);

    page.appendChild(jfsMuxRow);

    container.appendChild(page);
  }

  function renderFiberRtrTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'Source', width: '80px' },
      { label: 'Dest', width: '80px' },
      { label: 'TAC', width: '55px' },
      { label: 'FIB', width: '35px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Source (with datalist)
      tr.appendChild(makeSourceInput(row, idx, 'fiberRtrOut', 'source'));

      // Destination
      tr.appendChild(makeTextInput(row, idx, 'fiberRtrOut', 'destination'));

      // TAC (dropdown for TAC panels)
      tr.appendChild(makeTacSelect(row, idx, 'fiberRtrOut', 'tac'));

      // FIB-A (strand dropdown with sync)
      tr.appendChild(makeFibInput(row, idx, 'fiberRtrOut', 'fibA'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '400px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderCoaxRtrTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'Source', width: '80px' },
      { label: 'Dest', width: '80px' },
      { label: 'MULT', width: '40px' },
      { label: 'COAX', width: '40px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Source
      tr.appendChild(makeSourceInput(row, idx, 'coaxRtrOut', 'source'));

      // Destination
      tr.appendChild(makeTextInput(row, idx, 'coaxRtrOut', 'destination'));

      // MULT (dropdown with sync)
      tr.appendChild(makeMultInput(row, idx, 'coaxRtrOut', 'mult'));

      // COAX (dropdown)
      tr.appendChild(makeCoaxInput(row, idx, 'coaxRtrOut', 'coax'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '400px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderIoTieLinesTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'Source', width: '80px' },
      { label: 'Dest', width: '80px' },
      { label: 'MULT', width: '40px' },
      { label: 'COAX', width: '40px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Source
      tr.appendChild(makeSourceInput(row, idx, 'coaxIoTieLines', 'source'));

      // Destination (editable)
      tr.appendChild(makeTextInput(row, idx, 'coaxIoTieLines', 'destination'));

      // MULT (dropdown with sync)
      tr.appendChild(makeMultInput(row, idx, 'coaxIoTieLines', 'mult'));

      // COAX (dropdown)
      tr.appendChild(makeCoaxInput(row, idx, 'coaxIoTieLines', 'coax'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '500px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  // Position labels for truck tie lines (same as original destinations)
  const TRUCK_TIE_POSITIONS = [
    'P1-1', 'P1-2', 'P1-3', 'P1-4', 'P1-5', 'P1-6', 'P1-7', 'P1-8',
    'P2-1', 'P2-2', 'P2-3', 'P2-4', 'P2-5', 'P2-6', 'P2-7', 'P2-8',
    'P3-1', 'P3-2', 'P3-3', 'P3-4', 'P3-5', 'P3-6', 'P3-7', 'P3-8',
    'FEVS-1', 'FEVS-2', 'FEVS-3', 'FEVS-4', 'FEVS-5', 'FEVS-6',
    'FEVS-7', 'FEVS-8', 'FEVS-9', 'FEVS-10', 'FEVS-11', 'FEVS-12',
    'REVS-1', 'REVS-2', 'REVS-3', 'REVS-4', 'REVS-5', 'REVS-6',
    'REVS-7', 'REVS-8', 'REVS-9', 'REVS-10', 'REVS-11', 'REVS-12',
  ];

  function renderTruckTieLinesTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: 'POS', width: '55px' },
      { label: 'Source', width: '90px' },
      { label: 'Dest', width: '90px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Position label (replaces row number)
      const tdPos = document.createElement('td');
      tdPos.className = 'row-num';
      tdPos.textContent = TRUCK_TIE_POSITIONS[idx] || row.row;
      tr.appendChild(tdPos);

      // Source
      tr.appendChild(makeSourceInput(row, idx, 'coaxTruckTieLines', 'source'));

      // Destination (editable)
      tr.appendChild(makeTextInput(row, idx, 'coaxTruckTieLines', 'destination'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '500px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderJfsMuxTable(parent, data, storePath) {
    // TAC + Strand assignment for entire MUX unit
    const assignmentRow = document.createElement('div');
    assignmentRow.style.cssText = 'display:flex;align-items:center;gap:16px;margin-bottom:8px;padding:8px;background:var(--bg-secondary);border-radius:4px;';

    // TAC dropdown (dark)
    const tacGroup = document.createElement('div');
    tacGroup.style.cssText = 'display:flex;align-items:center;gap:6px;';
    const tacLabel = document.createElement('label');
    tacLabel.textContent = 'TAC:';
    tacLabel.style.cssText = 'font-size:12px;color:var(--text-secondary);';
    const tacOptions = [{ value: '', label: '--' }];
    Utils.getTacOptions().forEach(tac => tacOptions.push({ value: tac, label: tac }));
    const tacDropdown = Utils.createDarkDropdown(tacOptions, data.tac || '', (val) => {
      data.tac = val;
      Store.set(`videoIo.${storePath}.tac`, val);
      if (data.tac && data.fibA) {
        Utils.syncToFiberTac(data.tac, data.fibA, { type: 'JFS', unit: storePath === 'jfsMux1' ? 1 : 2, dest: '' });
      }
    }, { placeholder: '--', width: '80px' });
    tacGroup.appendChild(tacLabel);
    tacGroup.appendChild(tacDropdown);
    assignmentRow.appendChild(tacGroup);

    // FIB-A dropdown (dark)
    const fibGroup = document.createElement('div');
    fibGroup.style.cssText = 'display:flex;align-items:center;gap:6px;';
    const fibLabel = document.createElement('label');
    fibLabel.textContent = 'FIB-A:';
    fibLabel.style.cssText = 'font-size:12px;color:var(--text-secondary);';
    const fibOptions = [{ value: '', label: '--' }];
    Utils.getFiberStrandOptions().forEach(s => fibOptions.push({ value: s, label: s }));
    const fibDropdown = Utils.createDarkDropdown(fibOptions, data.fibA || '', (val) => {
      data.fibA = val;
      Store.set(`videoIo.${storePath}.fibA`, val);
      if (data.tac && data.fibA) {
        Utils.syncToFiberTac(data.tac, data.fibA, { type: 'JFS', unit: storePath === 'jfsMux1' ? 1 : 2, dest: '' });
      }
    }, { placeholder: '--', width: '60px' });
    fibGroup.appendChild(fibLabel);
    fibGroup.appendChild(fibDropdown);
    assignmentRow.appendChild(fibGroup);

    parent.appendChild(assignmentRow);

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'Source', width: '80px' },
      { label: 'Dest', width: '80px' },
      { label: 'FXD', width: '35px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.rows.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Source
      tr.appendChild(makeJfsMuxInput(row, idx, storePath, 'source'));

      // Destination
      tr.appendChild(makeJfsMuxInput(row, idx, storePath, 'destination', ''));

      // FAXED (checkbox)
      const tdFaxed = document.createElement('td');
      tdFaxed.style.textAlign = 'center';
      const chkFaxed = document.createElement('input');
      chkFaxed.type = 'checkbox';
      chkFaxed.checked = row.faxed || false;
      chkFaxed.addEventListener('change', () => {
        row.faxed = chkFaxed.checked;
        Store.set(`videoIo.${storePath}.rows.${idx}.faxed`, chkFaxed.checked);
      });
      tdFaxed.appendChild(chkFaxed);
      tr.appendChild(tdFaxed);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  // Get the RTR I/O Master output device name for JFS MUX routing
  function getMuxRtrOutputName(storePath, rowNum) {
    if (storePath === 'jfsMux1') {
      return `MUX 1-${rowNum}`;
    } else if (storePath === 'jfsMux2') {
      return `MUX 2-${rowNum}`;
    }
    return null;
  }

  // Helper for JFS MUX inputs (different store path)
  function makeJfsMuxInput(row, idx, storePath, key, placeholder = '') {
    const td = document.createElement('td');
    if (key === 'source') {
      const deviceOpts = Utils.getDeviceOptions();
      const options = [{ value: '', label: '--' }];
      const validDevices = new Set(deviceOpts.map(o => o.value));
      if (row[key] && !validDevices.has(row[key])) {
        options.push({ value: row[key], label: row[key] });
      }
      deviceOpts.forEach(o => options.push({ value: o.value, label: o.label || o.value }));
      const dropdown = Utils.createDarkDropdown(options, row[key] || '', async (val) => {
        row[key] = val;
        Store.set(`videoIo.${storePath}.rows.${idx}.${key}`, val);
        // Route using the RTR I/O Master output name for MUX
        const rtrDest = getMuxRtrOutputName(storePath, row.row);
        if (val && rtrDest) {
          const result = await NV9000Client.handleRoute(val, rtrDest, 'videoio');
          if (result.success) {
            if (result.staged) {
              Utils.toast(`Staged: ${val} → ${rtrDest}`, 'info');
            } else {
              Utils.toast(`Routed: ${val} → ${rtrDest}`, 'success');
            }
          }
        }
      }, { placeholder: '--' });
      td.appendChild(dropdown);
    } else {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = row[key] || '';
      inp.placeholder = placeholder;
      inp.addEventListener('change', () => {
        row[key] = inp.value;
        Store.set(`videoIo.${storePath}.rows.${idx}.${key}`, inp.value);
      });
      td.appendChild(inp);
    }
    return td;
  }

  // Get the RTR I/O Master output device name for routing
  function getRtrOutputName(section, rowNum) {
    switch (section) {
      case 'fiberRtrOut':
        return `IO FIB${String(rowNum).padStart(2, '0')}`;
      case 'coaxRtrOut':
        return `IO BNC ${rowNum}`;
      default:
        return null;
    }
  }

  // Helper: Source input (dark dropdown) - uses RTR I/O MASTER devices
  function makeSourceInput(row, idx, section, key) {
    const td = document.createElement('td');
    const deviceOpts = Utils.getDeviceOptions();
    const options = [{ value: '', label: '--' }];
    const validDevices = new Set(deviceOpts.map(o => o.value));
    if (row[key] && !validDevices.has(row[key])) {
      options.push({ value: row[key], label: row[key] });
    }
    deviceOpts.forEach(o => {
      options.push({ value: o.value, label: o.label || o.value });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', async (val) => {
      row[key] = val;
      Store.set(`videoIo.${section}.${idx}.${key}`, val);
      // Route using the RTR I/O Master output name based on section and row
      const rtrDest = getRtrOutputName(section, row.row);
      if (key === 'source' && val && rtrDest) {
        const result = await NV9000Client.handleRoute(val, rtrDest, 'videoio');
        if (result.success) {
          if (result.staged) {
            Utils.toast(`Staged: ${val} → ${rtrDest}`, 'info');
          } else {
            Utils.toast(`Routed: ${val} → ${rtrDest}`, 'success');
          }
        }
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: Text input
  function makeTextInput(row, idx, section, key, placeholder = '') {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = placeholder;
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`videoIo.${section}.${idx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    return td;
  }

  // Helper: TAC dropdown (dark)
  function makeTacSelect(row, idx, section, key) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getTacOptions().forEach(tac => {
      options.push({ value: tac, label: tac });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', (val) => {
      Utils.syncToFiberTac(null, null, { type: 'RTR', rtrRow: row.row, clear: true });
      row[key] = val;
      Store.set(`videoIo.${section}.${idx}.${key}`, val);
      if (row.tac && row.fibA) {
        Utils.syncToFiberTac(row.tac, row.fibA, {
          type: 'RTR', rtrRow: row.row, source: row.source || '', dest: row.destination || ''
        });
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: FIB-A dropdown (dark)
  function makeFibInput(row, idx, section, key) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getFiberStrandOptions().forEach(s => {
      options.push({ value: s, label: s });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', (val) => {
      Utils.syncToFiberTac(null, null, { type: 'RTR', rtrRow: row.row, clear: true });
      row[key] = val;
      Store.set(`videoIo.${section}.${idx}.${key}`, val);
      if (row.tac && val) {
        Utils.syncToFiberTac(row.tac, val, {
          type: 'RTR', rtrRow: row.row, source: row.source || '', dest: row.destination || ''
        });
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: MULT dropdown (dark)
  function makeMultInput(row, idx, section, key) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getMultOptions().forEach(m => {
      options.push({ value: m, label: m });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', (val) => {
      row[key] = val;
      Store.set(`videoIo.${section}.${idx}.${key}`, val);
      if (val) {
        Utils.syncToCoaxMult(val, { type: 'RTR', rtrRow: row.row, source: row.source || '' });
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: COAX dropdown (dark)
  function makeCoaxInput(row, idx, section, key) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getCoaxOptions().forEach(c => {
      options.push({ value: c, label: c });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', (val) => {
      row[key] = val;
      Store.set(`videoIo.${section}.${idx}.${key}`, val);
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  return { render };
})();
