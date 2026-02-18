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
    ['#', 'Source', 'Destination', 'TAC', 'FIB-A'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '30px';
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

      // FIB-A (strand assignment)
      tr.appendChild(makeTextInput(row, idx, 'fiberRtrOut', 'fibA', 'Strand'));

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
    ['#', 'Source', 'Destination', 'MULT', 'COAX'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '30px';
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

      // MULT
      tr.appendChild(makeTextInput(row, idx, 'coaxRtrOut', 'mult', 'Mult'));

      // COAX
      tr.appendChild(makeTextInput(row, idx, 'coaxRtrOut', 'coax', 'Coax #'));

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
    ['#', 'Source', 'Destination', 'MULT', 'COAX'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '30px';
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

      // Destination (fixed, read-only)
      const tdDest = document.createElement('td');
      tdDest.textContent = row.destination || '';
      tdDest.style.color = 'var(--text-secondary)';
      tr.appendChild(tdDest);

      // MULT
      tr.appendChild(makeTextInput(row, idx, 'coaxIoTieLines', 'mult', 'Mult'));

      // COAX
      tr.appendChild(makeTextInput(row, idx, 'coaxIoTieLines', 'coax', 'Coax #'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '500px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderTruckTieLinesTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Source', 'Destination'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '30px';
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
      tr.appendChild(makeSourceInput(row, idx, 'coaxTruckTieLines', 'source'));

      // Destination (fixed, read-only)
      const tdDest = document.createElement('td');
      tdDest.textContent = row.destination || '';
      tdDest.style.color = 'var(--text-secondary)';
      tr.appendChild(tdDest);

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

    // TAC dropdown
    const tacGroup = document.createElement('div');
    tacGroup.style.cssText = 'display:flex;align-items:center;gap:6px;';
    const tacLabel = document.createElement('label');
    tacLabel.textContent = 'TAC:';
    tacLabel.style.cssText = 'font-size:12px;color:var(--text-secondary);';
    const tacSelect = document.createElement('select');
    tacSelect.style.cssText = 'padding:4px 8px;';
    tacSelect.innerHTML = '<option value="">--</option>';
    (Store.data.sheet8.tacPanels || []).forEach(tac => {
      const opt = document.createElement('option');
      opt.value = tac;
      opt.textContent = tac;
      if (data.tac === tac) opt.selected = true;
      tacSelect.appendChild(opt);
    });
    tacSelect.addEventListener('change', () => {
      data.tac = tacSelect.value;
      Store.set(`videoIo.${storePath}.tac`, tacSelect.value);
    });
    tacGroup.appendChild(tacLabel);
    tacGroup.appendChild(tacSelect);
    assignmentRow.appendChild(tacGroup);

    // FIB-A (strand) input
    const fibGroup = document.createElement('div');
    fibGroup.style.cssText = 'display:flex;align-items:center;gap:6px;';
    const fibLabel = document.createElement('label');
    fibLabel.textContent = 'FIB-A:';
    fibLabel.style.cssText = 'font-size:12px;color:var(--text-secondary);';
    const fibInput = document.createElement('input');
    fibInput.type = 'text';
    fibInput.value = data.fibA || '';
    fibInput.placeholder = 'Strand';
    fibInput.style.cssText = 'width:70px;padding:4px 8px;';
    fibInput.addEventListener('change', () => {
      data.fibA = fibInput.value;
      Store.set(`videoIo.${storePath}.fibA`, fibInput.value);
    });
    fibGroup.appendChild(fibLabel);
    fibGroup.appendChild(fibInput);
    assignmentRow.appendChild(fibGroup);

    parent.appendChild(assignmentRow);

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Source', 'Destination', 'FAXED'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (lbl === '#') th.style.width = '30px';
      if (lbl === 'FAXED') th.style.width = '50px';
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

  // Helper for JFS MUX inputs (different store path)
  function makeJfsMuxInput(row, idx, storePath, key, placeholder = '') {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = placeholder;
    if (key === 'source') {
      const dlId = `jfsmux-${storePath}-${idx}-${key}`;
      inp.setAttribute('list', dlId);
      const dl = document.createElement('datalist');
      dl.id = dlId;
      Utils.getDeviceOptions().forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.value;
        dl.appendChild(opt);
      });
      td.appendChild(dl);
    }
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`videoIo.${storePath}.rows.${idx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    return td;
  }

  // Helper: Source input with datalist (filterable) - uses RTR I/O MASTER devices
  function makeSourceInput(row, idx, section, key) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = '';
    const dlId = `videoio-${section}-${idx}-${key}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getDeviceOptions().forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      dl.appendChild(opt);
    });
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`videoIo.${section}.${idx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    td.appendChild(dl);
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

  // Helper: TAC panel select
  function makeTacSelect(row, idx, section, key) {
    const td = document.createElement('td');
    const sel = document.createElement('select');
    sel.innerHTML = '<option value="">--</option>';
    (Store.data.sheet8.tacPanels || []).forEach(tac => {
      const opt = document.createElement('option');
      opt.value = tac;
      opt.textContent = tac;
      if (row[key] === tac) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      row[key] = sel.value;
      Store.set(`videoIo.${section}.${idx}.${key}`, sel.value);
    });
    td.appendChild(sel);
    return td;
  }

  return { render };
})();
