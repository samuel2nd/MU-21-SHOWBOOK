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
    ['#', 'Device', 'TAC', 'FIB-A', 'FIB-B', 'Show Name', 'B', 'S', 'W', 'DOLLY', 'HAND', 'Notes'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '35px';
      if (['B', 'S', 'W', 'DOLLY', 'HAND'].includes(lbl)) th.style.width = '40px';
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
      ['lensB', 'lensS', 'lensW', 'lensDolly', 'lensHand'].forEach(key => {
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

  function renderFsyTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Format', 'TAC', 'FIB-A', 'Show Name', 'Source', 'MULT', 'COAX', 'Fixed', 'JS', 'Notes'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '35px';
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

      // Format dropdown
      tr.appendChild(makeFormatDropdown(row, idx));

      // TAC dropdown
      tr.appendChild(makeTacDropdown(row, idx, fsName, 'fsy'));

      // FIB-A dropdown
      tr.appendChild(makeFibDropdown(row, idx, 'fibA', fsName, 'fsy'));

      // Show Name (computed)
      const tdShow = document.createElement('td');
      tdShow.className = 'cell-computed';
      tdShow.textContent = Formulas.getSourceNamesForDevice(fsName);
      tr.appendChild(tdShow);

      // Source (computed)
      const tdSource = document.createElement('td');
      tdSource.className = 'cell-computed';
      tdSource.textContent = Formulas.getSourceNamesForDevice(fsName) ? fsName : '';
      tr.appendChild(tdSource);

      // MULT dropdown
      tr.appendChild(makeMultDropdown(row, idx, fsName));

      // COAX dropdown
      tr.appendChild(makeCoaxDropdown(row, idx));

      // Fixed
      tr.appendChild(makeTextInput(row, idx, 'fixed', 'fsy'));

      // JS
      tr.appendChild(makeTextInput(row, idx, 'js', 'fsy'));

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

  // Helper: Format dropdown
  function makeFormatDropdown(row, idx) {
    const td = document.createElement('td');
    const sel = document.createElement('select');
    sel.innerHTML = '<option value="">--</option>';
    (Store.data.sheet8.videoFormats || []).forEach(fmt => {
      const opt = document.createElement('option');
      opt.value = fmt;
      opt.textContent = fmt;
      if (row.format === fmt) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      row.format = sel.value;
      Store.set(`ccuFsy.fsy.${idx}.format`, sel.value);
    });
    td.appendChild(sel);
    return td;
  }

  // Helper: Get show name for a device
  function getShowNameForDevice(deviceName) {
    return Formulas.getSourceNamesForDevice(deviceName) || '';
  }

  // Helper: TAC dropdown with filter
  function makeTacDropdown(row, idx, deviceName, section = 'ccu') {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row.tac || '';
    inp.placeholder = 'TAC';
    inp.style.width = '70px';

    const dlId = `tac-${section}-${idx}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getTacOptions().forEach(tac => {
      const opt = document.createElement('option');
      opt.value = tac;
      dl.appendChild(opt);
    });

    inp.addEventListener('change', () => {
      const showName = getShowNameForDevice(deviceName);

      // Clear old assignments first (by syncing with clear flag)
      if (section === 'ccu') {
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: 'A', clear: true });
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: 'B', clear: true });
      } else {
        Utils.syncToFiberTac(null, null, { type: 'FSY', unit: row.unit, clear: true });
      }

      row.tac = inp.value;
      Store.set(`ccuFsy.${section}.${idx}.tac`, inp.value);

      // Sync new assignment if both TAC and FIB-A are set
      if (row.tac && row.fibA) {
        if (section === 'ccu') {
          Utils.syncToFiberTac(row.tac, row.fibA, {
            type: 'CCU', unit: row.unit, fibSide: 'A', showName: showName
          });
        } else {
          Utils.syncToFiberTac(row.tac, row.fibA, {
            type: 'FSY', unit: row.unit, showName: showName
          });
        }
      }
      // Also sync FIB-B for CCU if set
      if (section === 'ccu' && row.tac && row.fibB) {
        Utils.syncToFiberTac(row.tac, row.fibB, {
          type: 'CCU', unit: row.unit, fibSide: 'B', showName: showName
        });
      }
    });

    td.appendChild(inp);
    td.appendChild(dl);
    return td;
  }

  // Helper: FIB dropdown with filter
  function makeFibDropdown(row, idx, key, deviceName, section = 'ccu') {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = '1-24';
    inp.style.width = '50px';

    const dlId = `fib-${section}-${idx}-${key}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getFiberStrandOptions().forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      dl.appendChild(opt);
    });

    inp.addEventListener('change', () => {
      const showName = getShowNameForDevice(deviceName);
      const fibSide = key === 'fibA' ? 'A' : 'B';

      // Clear old assignment first
      if (section === 'ccu') {
        Utils.syncToFiberTac(null, null, { type: 'CCU', unit: row.unit, fibSide: fibSide, clear: true });
      } else {
        Utils.syncToFiberTac(null, null, { type: 'FSY', unit: row.unit, clear: true });
      }

      row[key] = inp.value;
      Store.set(`ccuFsy.${section}.${idx}.${key}`, inp.value);

      // Sync new assignment if both TAC and this FIB are set
      if (row.tac && inp.value) {
        if (section === 'ccu') {
          Utils.syncToFiberTac(row.tac, inp.value, {
            type: 'CCU', unit: row.unit, fibSide: fibSide, showName: showName
          });
        } else {
          Utils.syncToFiberTac(row.tac, inp.value, {
            type: 'FSY', unit: row.unit, showName: showName
          });
        }
      }
    });

    td.appendChild(inp);
    td.appendChild(dl);
    return td;
  }

  // Helper: MULT dropdown with filter and sync
  function makeMultDropdown(row, idx, deviceName) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row.mult || '';
    inp.placeholder = '1-40';
    inp.style.width = '50px';

    const dlId = `mult-fsy-${idx}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getMultOptions().forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      dl.appendChild(opt);
    });

    inp.addEventListener('change', () => {
      row.mult = inp.value;
      Store.set(`ccuFsy.fsy.${idx}.mult`, inp.value);
      // Sync to COAX MULTS with detailed info
      if (inp.value) {
        const showName = getShowNameForDevice(deviceName);
        Utils.syncToCoaxMult(inp.value, {
          type: 'FSY',
          unit: row.unit,
          showName: showName
        });
      }
    });

    td.appendChild(inp);
    td.appendChild(dl);
    return td;
  }

  // Helper: COAX dropdown with filter
  function makeCoaxDropdown(row, idx) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row.coax || '';
    inp.placeholder = '1-40';
    inp.style.width = '50px';

    const dlId = `coax-fsy-${idx}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getCoaxOptions().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      dl.appendChild(opt);
    });

    inp.addEventListener('change', () => {
      row.coax = inp.value;
      Store.set(`ccuFsy.fsy.${idx}.coax`, inp.value);
    });

    td.appendChild(inp);
    td.appendChild(dl);
    return td;
  }

  return { render };
})();
