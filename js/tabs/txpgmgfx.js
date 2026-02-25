// TX/PGM/GFX Tab — Transmission, Graphics (CG + Canvas), Program
const TxPgmGfxTab = (() => {
  function render(container) {
    const page = Utils.tabPage('TX / PGM / GFX', 'Transmission outputs, CG generators, Canvas inputs, and program assignments');

    // === TRANSMISSION SECTION ===
    page.appendChild(Utils.sectionHeader('TRANSMISSION:'));
    const txTable = renderTxTable();
    page.appendChild(txTable);

    // === GRAPHICS SECTION (CG + Canvas + Program) ===
    page.appendChild(Utils.sectionHeader('GRAPHICS:'));
    const gfxContainer = document.createElement('div');
    gfxContainer.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;';

    // Left column: CG + Canvas stacked
    const leftCol = document.createElement('div');

    // CG subsection
    const cgHeader = document.createElement('div');
    cgHeader.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent-green);margin-bottom:8px;';
    cgHeader.textContent = 'CG (1-6):';
    leftCol.appendChild(cgHeader);
    leftCol.appendChild(renderCgTable());

    // Canvas subsection (inside Graphics)
    const canvasHeader = document.createElement('div');
    canvasHeader.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent-blue);margin:16px 0 8px 0;';
    canvasHeader.textContent = 'CANVAS (1-8):';
    leftCol.appendChild(canvasHeader);
    leftCol.appendChild(renderCanvasTable());

    gfxContainer.appendChild(leftCol);

    // Right column: Program
    const rightCol = document.createElement('div');
    const pgmHeader = document.createElement('div');
    pgmHeader.style.cssText = 'font-size:11px;font-weight:600;color:#e74c3c;margin-bottom:8px;';
    pgmHeader.textContent = 'PROGRAM:';
    rightCol.appendChild(pgmHeader);
    rightCol.appendChild(renderPgmTable());
    gfxContainer.appendChild(rightCol);

    page.appendChild(gfxContainer);

    container.appendChild(page);
  }

  // Get Frame Sync options (FS 01 - FS 67)
  function getFsOptions() {
    const options = [];
    for (let i = 1; i <= 67; i++) {
      options.push(`FS ${String(i).padStart(2, '0')}`);
    }
    return options;
  }

  // Sync Frame Sync selection to CCU/FSY page
  function syncToFsy(fsName, txRow) {
    if (!fsName) return;
    const match = fsName.match(/FS\s*(\d+)/i);
    if (!match) return;
    const fsNum = parseInt(match[1], 10);
    if (fsNum < 1 || fsNum > 67) return;
    console.log(`TX${txRow.row} assigned to ${fsName}`);
  }

  function renderTxTable() {
    const data = Store.data.txPgmGfx.tx;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');

    const headerConfig = [
      { label: 'TX', width: '30px' },
      { label: 'DA INPUT', width: '70px' },
      { label: 'UMD NAME', width: '65px' },
      { label: 'ENG SOURCE', width: '80px' },
      { label: 'AUDIO SRC', width: '85px' },
      { label: 'FRAMESYNC', width: '65px' },
      { label: 'OUTPUT', width: '95px' },
      { label: '1', width: '25px', center: true },
      { label: '2', width: '25px', center: true },
      { label: '3', width: '25px', center: true },
      { label: '4', width: '25px', center: true },
      { label: 'I/O RTR OUT', width: '120px' }
    ];

    headerConfig.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      if (col.center) th.style.textAlign = 'center';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach((row, i) => {
      const tr = document.createElement('tr');

      // TX #
      const tdNum = document.createElement('td');
      tdNum.textContent = row.row;
      tdNum.className = 'row-num';
      tr.appendChild(tdNum);

      // DA INPUT
      tr.appendChild(createInputCell(row, 'daInput', i, 'txPgmGfx.tx'));

      // UMD NAME
      tr.appendChild(createInputCell(row, 'umdName', i, 'txPgmGfx.tx'));

      // ENG SOURCE
      tr.appendChild(createDeviceSelectCell(row, 'engSource', i, 'txPgmGfx.tx'));

      // AUDIO SOURCE
      tr.appendChild(createAudioSourceCell(row, 'audioSource', i, 'txPgmGfx.tx'));

      // FRAMESYNC
      tr.appendChild(createFramesyncCell(row, i));

      // OUTPUT
      tr.appendChild(createOutputFormatCell(row, 'output', i, 'txPgmGfx.tx'));

      // I/O COAX 1-4 (individual cells for alignment)
      ['ioCoax1', 'ioCoax2', 'ioCoax3', 'ioCoax4'].forEach(key => {
        tr.appendChild(createCheckboxCell(row, key, i, 'txPgmGfx.tx'));
      });

      // I/O RTR OUT (computed)
      tr.appendChild(createRoutingInfoCell(row));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function renderCgTable() {
    const data = Store.data.txPgmGfx.cg;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'DA INPUT', width: '65px' },
      { label: 'UMD', width: '60px' },
      { label: 'ENG SRC', width: '65px' },
      { label: 'KEY IN', width: '95px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = row.row;
      tdNum.className = 'row-num';
      tr.appendChild(tdNum);

      tr.appendChild(createInputCell(row, 'daInput', i, 'txPgmGfx.cg'));
      tr.appendChild(createInputCell(row, 'umdName', i, 'txPgmGfx.cg'));
      tr.appendChild(createDeviceSelectCell(row, 'engSource', i, 'txPgmGfx.cg'));
      tr.appendChild(createInputCell(row, 'keyIn', i, 'txPgmGfx.cg'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function renderCanvasTable() {
    const data = Store.data.txPgmGfx.canvas;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'RTR IN', width: '75px' },
      { label: 'UMD', width: '70px' },
      { label: 'ENG SRC', width: '70px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = row.row;
      tdNum.className = 'row-num';
      tr.appendChild(tdNum);

      tr.appendChild(createInputCell(row, 'rtrIn', i, 'txPgmGfx.canvas'));
      tr.appendChild(createInputCell(row, 'umdName', i, 'txPgmGfx.canvas'));
      tr.appendChild(createDeviceSelectCell(row, 'engSource', i, 'txPgmGfx.canvas'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  function renderPgmTable() {
    const data = Store.data.txPgmGfx.pgm;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '25px' },
      { label: 'DA INPUT', width: '65px' },
      { label: 'UMD', width: '60px' },
      { label: 'ENG SRC', width: '65px' },
      { label: 'AUDIO SRC', width: '85px' }
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = row.row;
      tdNum.className = 'row-num';
      tr.appendChild(tdNum);

      tr.appendChild(createInputCell(row, 'daInput', i, 'txPgmGfx.pgm'));
      tr.appendChild(createInputCell(row, 'umdName', i, 'txPgmGfx.pgm'));
      tr.appendChild(createDeviceSelectCell(row, 'engSource', i, 'txPgmGfx.pgm'));
      tr.appendChild(createAudioSourceCell(row, 'audioSource', i, 'txPgmGfx.pgm'));

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  }

  // Helper: text input cell
  function createInputCell(row, key, rowIdx, storePath) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`${storePath}.${rowIdx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    return td;
  }

  // Helper: device select (ENG SOURCE)
  function createDeviceSelectCell(row, key, rowIdx, storePath) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = '--';

    const dlId = `dev-${storePath.replace(/\./g, '-')}-${rowIdx}`;
    inp.setAttribute('list', dlId);
    const dl = document.createElement('datalist');
    dl.id = dlId;
    Utils.getDeviceOptions().forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value || o;
      dl.appendChild(opt);
    });

    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`${storePath}.${rowIdx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    td.appendChild(dl);
    return td;
  }

  // Helper: audio source dropdown
  function createAudioSourceCell(row, key, rowIdx, storePath) {
    const td = document.createElement('td');
    const sel = document.createElement('select');
    sel.innerHTML = '<option value="">--</option>';
    (Store.data.sheet8.audioSources || []).forEach(src => {
      const opt = document.createElement('option');
      opt.value = src;
      opt.textContent = src;
      if (row[key] === src) opt.selected = true;
      sel.appendChild(opt);
    });
    if (row[key] && !(Store.data.sheet8.audioSources || []).includes(row[key])) {
      const orphanOpt = document.createElement('option');
      orphanOpt.value = row[key];
      orphanOpt.textContent = row[key];
      orphanOpt.selected = true;
      sel.insertBefore(orphanOpt, sel.children[1]);
    }
    sel.addEventListener('change', () => {
      row[key] = sel.value;
      Store.set(`${storePath}.${rowIdx}.${key}`, sel.value);
    });
    td.appendChild(sel);
    return td;
  }

  // Helper: framesync dropdown
  function createFramesyncCell(row, rowIdx) {
    const td = document.createElement('td');
    const sel = document.createElement('select');
    sel.innerHTML = '<option value="">--</option>';
    getFsOptions().forEach(fs => {
      const opt = document.createElement('option');
      opt.value = fs;
      opt.textContent = fs;
      if (row.framesync === fs) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      row.framesync = sel.value;
      Store.set(`txPgmGfx.tx.${rowIdx}.framesync`, sel.value);
      syncToFsy(sel.value, row);
    });
    td.appendChild(sel);
    return td;
  }

  // Helper: output format dropdown
  function createOutputFormatCell(row, key, rowIdx, storePath) {
    const td = document.createElement('td');
    const sel = document.createElement('select');
    sel.innerHTML = '<option value="">--</option>';
    (Store.data.sheet8.videoFormats || []).forEach(fmt => {
      const opt = document.createElement('option');
      opt.value = fmt;
      opt.textContent = fmt;
      if (row[key] === fmt) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      row[key] = sel.value;
      Store.set(`${storePath}.${rowIdx}.${key}`, sel.value);
    });
    td.appendChild(sel);
    return td;
  }

  // Helper: single checkbox cell
  function createCheckboxCell(row, key, rowIdx, storePath) {
    const td = document.createElement('td');
    td.className = 'checkbox-cell';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = row[key] || false;
    chk.addEventListener('change', () => {
      row[key] = chk.checked;
      Store.set(`${storePath}.${rowIdx}.${key}`, chk.checked);
    });
    td.appendChild(chk);
    return td;
  }

  // Helper: routing info cell (computed)
  function createRoutingInfoCell(row) {
    const td = document.createElement('td');
    td.className = 'cell-computed';
    td.style.fontSize = '10px';
    const umdName = row.umdName || `TX${row.row} DA`;
    const routingInfo = Formulas.getTxRoutingInfo(umdName);
    td.textContent = routingInfo || '--';
    td.title = routingInfo || 'Not assigned in VIDEO I/O';
    return td;
  }

  return { render };
})();
