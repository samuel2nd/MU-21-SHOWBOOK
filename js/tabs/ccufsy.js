// CCU/FSY INPUT Tab — CCU 1-12, Frame Sync 1-67
// Computed SHOW NAME and SOURCE fields pull from SOURCE tab
const CcuFsyTab = (() => {
  function render(container) {
    const page = Utils.tabPage('CCU / FSY INPUT', 'Camera Control Units (1–12) and Frame Synchronizers (1–67). Fiber/Coax assignments auto-sync to FIBER TAC and COAX MULTS pages.');

    // CCU Section
    page.appendChild(Utils.sectionHeader('CCU 1–12'));
    renderCcuTable(page, Store.data.ccuFsy.ccu);

    // Frame Sync Section
    page.appendChild(Utils.sectionHeader('Frame Sync 1–67'));
    renderFsyTable(page, Store.data.ccuFsy.fsy);

    container.appendChild(page);
  }

  function renderCcuTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '35px' },
      { label: 'Device', width: '70px' },
      { label: 'TAC', width: '65px' },
      { label: 'FIB-A', width: '50px' },
      { label: 'FIB-B', width: '50px' },
      { label: 'Show Name', width: '100px' },
      { label: 'B', width: '30px' },
      { label: 'S', width: '30px' },
      { label: 'W', width: '30px' },
      { label: 'DOLLY', width: '45px' },
      { label: 'Notes', width: 'auto' }
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
      const ccuName = 'CCU ' + String(row.unit).padStart(2, '0');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.unit;
      tr.appendChild(tdNum);

      // Device
      tr.appendChild(makeTextInput(row, idx, 'device'));

      // TAC dropdown
      tr.appendChild(makeTacDropdown(row, idx, ccuName));

      // FIB-A dropdown
      tr.appendChild(makeFibDropdown(row, idx, 'fibA', ccuName));

      // FIB-B dropdown
      tr.appendChild(makeFibDropdown(row, idx, 'fibB', ccuName));

      // Show Name (computed)
      const tdShow = document.createElement('td');
      tdShow.className = 'cell-computed';
      tdShow.textContent = Formulas.getSourceNamesForDevice(ccuName);
      tr.appendChild(tdShow);

      // Lens checkboxes
      ['lensB', 'lensS', 'lensW', 'lensDolly'].forEach(key => {
        tr.appendChild(makeCheckbox(row, idx, key));
      });

      // Notes
      tr.appendChild(makeTextInput(row, idx, 'notes'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  // Get device name for Frame Sync unit
  function getFsDevice(unit) {
    if (unit >= 1 && unit <= 4) return 'AJA FS4-1';
    if (unit >= 5 && unit <= 8) return 'AJA FS4-2';
    if (unit >= 9 && unit <= 12) return 'AJA FS4-3';
    if (unit >= 13 && unit <= 16) return 'AJA FS4-4';
    if (unit >= 17 && unit <= 20) return 'AJA FS4-5';
    if (unit >= 21 && unit <= 24) return 'AJA FS4-6';
    if (unit >= 25 && unit <= 28) return 'AJA FS4-7';
    if (unit >= 29 && unit <= 30) return 'AJA FS2-1';
    if (unit >= 31 && unit <= 67) return 'EVS NEURON';
    return '';
  }

  function renderFsyTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '35px' },
      { label: 'Device', width: '75px' },
      { label: 'Format', width: '120px' },
      { label: 'TAC', width: '65px' },
      { label: 'FIB-A', width: '50px' },
      { label: 'Show Name', width: '100px' },
      { label: 'MULT', width: '50px' },
      { label: 'COAX', width: '50px' },
      { label: 'Notes', width: 'auto' }
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
      const fsName = 'FS ' + String(row.unit).padStart(2, '0');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.unit;
      tr.appendChild(tdNum);

      // Device (computed based on unit number, styled like text input)
      const tdDevice = document.createElement('td');
      const deviceInp = document.createElement('input');
      deviceInp.type = 'text';
      deviceInp.value = getFsDevice(row.unit);
      deviceInp.readOnly = true;
      deviceInp.style.backgroundColor = 'var(--bg-secondary)';
      deviceInp.style.cursor = 'default';
      tdDevice.appendChild(deviceInp);
      tr.appendChild(tdDevice);

      // Format dropdown
      tr.appendChild(makeFormatDropdown(row, idx));

      // TAC dropdown
      tr.appendChild(makeTacDropdown(row, idx, fsName, 'fsy'));

      // FIB-A dropdown
      tr.appendChild(makeFibDropdown(row, idx, 'fibA', fsName, 'fsy'));

      // Show Name (computed) - checks SOURCE page first, then TX/PGM/GFX assignments
      const tdShow = document.createElement('td');
      tdShow.className = 'cell-computed';
      tdShow.textContent = Formulas.getShowNameForFs(fsName);
      tr.appendChild(tdShow);

      // MULT dropdown
      tr.appendChild(makeMultDropdown(row, idx, fsName));

      // COAX dropdown
      tr.appendChild(makeCoaxDropdown(row, idx));

      // Notes
      tr.appendChild(makeTextInput(row, idx, 'notes', 'fsy'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  // Helper: Text input
  function makeTextInput(row, idx, key, section = 'ccu') {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`ccuFsy.${section}.${idx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    return td;
  }

  // Helper: Checkbox
  function makeCheckbox(row, idx, key, section = 'ccu') {
    const td = document.createElement('td');
    td.style.textAlign = 'center';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!row[key];
    cb.addEventListener('change', () => {
      row[key] = cb.checked;
      Store.set(`ccuFsy.${section}.${idx}.${key}`, cb.checked);
    });
    td.appendChild(cb);
    return td;
  }

  // Helper: Format dropdown (dark)
  function makeFormatDropdown(row, idx) {
    const td = document.createElement('td');
    const formats = Store.data.sheet8.videoFormats || [];
    const options = [{ value: '', label: '--' }];
    formats.forEach(fmt => {
      options.push({ value: fmt, label: fmt });
    });
    const dropdown = Utils.createDarkDropdown(options, row.format || '', (val) => {
      row.format = val;
      Store.set(`ccuFsy.fsy.${idx}.format`, val);
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: Get show name for a device
  function getShowNameForDevice(deviceName) {
    return Formulas.getSourceNamesForDevice(deviceName) || '';
  }

  // Helper: TAC dropdown (dark)
  function makeTacDropdown(row, idx, deviceName, section = 'ccu') {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getTacOptions().forEach(tac => {
      options.push({ value: tac, label: tac });
    });
    const dropdown = Utils.createDarkDropdown(options, row.tac || '', (val) => {
      const showName = getShowNameForDevice(deviceName);
      if (section === 'ccu') {
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: 'A', clear: true });
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: 'B', clear: true });
      } else {
        Utils.syncToFiberTac(null, null, { type: 'FSY', unit: row.unit, clear: true });
      }
      row.tac = val;
      Store.set(`ccuFsy.${section}.${idx}.tac`, val);
      if (row.tac && row.fibA) {
        if (section === 'ccu') {
          Utils.syncToFiberTac(row.tac, row.fibA, { type: 'CCU', unit: row.unit, fibSide: 'A', showName: showName });
        } else {
          Utils.syncToFiberTac(row.tac, row.fibA, { type: 'FSY', unit: row.unit, showName: showName });
        }
      }
      if (section === 'ccu' && row.tac && row.fibB) {
        Utils.syncToFiberTac(row.tac, row.fibB, { type: 'CCU', unit: row.unit, fibSide: 'B', showName: showName });
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: FIB dropdown (dark)
  function makeFibDropdown(row, idx, key, deviceName, section = 'ccu') {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getFiberStrandOptions().forEach(s => {
      options.push({ value: s, label: s });
    });
    const dropdown = Utils.createDarkDropdown(options, row[key] || '', (val) => {
      const showName = getShowNameForDevice(deviceName);
      const fibSide = key === 'fibA' ? 'A' : 'B';
      if (section === 'ccu') {
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: fibSide, clear: true });
      } else {
        Utils.syncToFiberTac(null, null, { type: 'FSY', unit: row.unit, clear: true });
      }
      row[key] = val;
      Store.set(`ccuFsy.${section}.${idx}.${key}`, val);
      if (row.tac && val) {
        if (section === 'ccu') {
          Utils.syncToFiberTac(row.tac, val, { type: 'CCU', unit: row.unit, fibSide: fibSide, showName: showName });
        } else {
          Utils.syncToFiberTac(row.tac, val, { type: 'FSY', unit: row.unit, showName: showName });
        }
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: MULT dropdown (dark)
  function makeMultDropdown(row, idx, deviceName) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getMultOptions().forEach(m => {
      options.push({ value: m, label: m });
    });
    const dropdown = Utils.createDarkDropdown(options, row.mult || '', (val) => {
      row.mult = val;
      Store.set(`ccuFsy.fsy.${idx}.mult`, val);
      if (val) {
        const showName = getShowNameForDevice(deviceName);
        Utils.syncToCoaxMult(val, { type: 'FSY', unit: row.unit, showName: showName });
      }
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  // Helper: COAX dropdown (dark)
  function makeCoaxDropdown(row, idx) {
    const td = document.createElement('td');
    const options = [{ value: '', label: '--' }];
    Utils.getCoaxOptions().forEach(c => {
      options.push({ value: c, label: c });
    });
    const dropdown = Utils.createDarkDropdown(options, row.coax || '', (val) => {
      row.coax = val;
      Store.set(`ccuFsy.fsy.${idx}.coax`, val);
    }, { placeholder: '--' });
    td.appendChild(dropdown);
    return td;
  }

  return { render };
})();
