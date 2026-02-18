// SOURCE Tab — 80 sources (2×40 layout) with validation
const SourceTab = (() => {
  // Persist autofill settings across re-renders
  const autofillState = {
    column: 'showName',
    prefix: '',
    startRow: 1,
    endRow: 10,
    startNum: 1
  };

  function render(container) {
    const page = Utils.tabPage('SOURCE', '80 sources — defines show names, UMD, engineering source, and audio assignments');
    const data = Store.data.sources;

    // Validation summary
    const warnings = validate(data);
    if (warnings.length > 0) {
      const warnBox = document.createElement('div');
      warnBox.style.cssText = 'background:rgba(255,152,0,0.1);border:1px solid var(--accent-orange);border-radius:4px;padding:10px;margin-bottom:12px;font-size:12px;';
      const warnTitle = document.createElement('div');
      warnTitle.style.cssText = 'font-weight:700;color:var(--accent-orange);margin-bottom:4px;';
      warnTitle.textContent = `${warnings.length} Validation Warning${warnings.length > 1 ? 's' : ''}`;
      warnBox.appendChild(warnTitle);
      warnings.forEach(w => {
        const line = document.createElement('div');
        line.style.cssText = 'color:var(--text-secondary);padding:1px 0;';
        line.textContent = w;
        warnBox.appendChild(line);
      });
      page.appendChild(warnBox);
    }

    // Autofill controls
    page.appendChild(createAutofillControls(data));

    // Sources 1-40
    page.appendChild(Utils.sectionHeader('Sources 1–40'));
    renderSourceTable(page, data.slice(0, 40), 0, data);

    // Sources 41-80
    page.appendChild(Utils.sectionHeader('Sources 41–80'));
    renderSourceTable(page, data.slice(40, 80), 40, data);

    container.appendChild(page);
  }

  // Helper to pad numbers with leading zero
  function padNum(n) {
    return String(n).padStart(2, '0');
  }

  function createAutofillControls(data) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:16px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:10px;color:var(--text-primary);';
    title.textContent = 'Autofill';
    wrapper.appendChild(title);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;';

    // Column select
    const colGroup = document.createElement('div');
    colGroup.innerHTML = '<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Column</label>';
    const colSelect = document.createElement('select');
    colSelect.style.cssText = 'padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    colSelect.innerHTML = '<option value="showName">Show Name</option><option value="umdName">UMD Name</option>';
    colSelect.value = autofillState.column;
    colGroup.appendChild(colSelect);
    row.appendChild(colGroup);

    // Prefix input
    const prefixGroup = document.createElement('div');
    prefixGroup.innerHTML = '<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Prefix</label>';
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.placeholder = 'CAM';
    prefixInput.maxLength = 6;
    prefixInput.value = autofillState.prefix;
    prefixInput.style.cssText = 'width:80px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    prefixGroup.appendChild(prefixInput);
    row.appendChild(prefixGroup);

    // Start row
    const startGroup = document.createElement('div');
    startGroup.innerHTML = '<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Start Row</label>';
    const startInput = document.createElement('input');
    startInput.type = 'number';
    startInput.min = 1;
    startInput.max = 80;
    startInput.value = autofillState.startRow;
    startInput.style.cssText = 'width:60px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    startGroup.appendChild(startInput);
    row.appendChild(startGroup);

    // End row
    const endGroup = document.createElement('div');
    endGroup.innerHTML = '<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">End Row</label>';
    const endInput = document.createElement('input');
    endInput.type = 'number';
    endInput.min = 1;
    endInput.max = 80;
    endInput.value = autofillState.endRow;
    endInput.style.cssText = 'width:60px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    endGroup.appendChild(endInput);
    row.appendChild(endGroup);

    // Start number
    const numGroup = document.createElement('div');
    numGroup.innerHTML = '<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Start #</label>';
    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.min = 1;
    numInput.value = autofillState.startNum;
    numInput.style.cssText = 'width:60px;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    numGroup.appendChild(numInput);
    row.appendChild(numGroup);

    // Apply button
    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn btn-primary';
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = 'padding:6px 16px;';
    applyBtn.addEventListener('click', () => {
      const col = colSelect.value;
      const prefix = prefixInput.value.trim();
      const startRow = Math.max(1, Math.min(80, parseInt(startInput.value) || 1));
      const endRow = Math.max(startRow, Math.min(80, parseInt(endInput.value) || startRow));
      const startNum = parseInt(numInput.value) || 1;

      if (!prefix) {
        Utils.toast('Please enter a prefix', 'warn');
        return;
      }

      // Save state for persistence across re-renders
      autofillState.column = col;
      autofillState.prefix = prefix;
      autofillState.startRow = startRow;
      autofillState.endRow = endRow;
      autofillState.startNum = startNum;

      let num = startNum;
      for (let i = startRow - 1; i < endRow; i++) {
        const value = `${prefix}${padNum(num)}`;
        data[i][col] = value;
        Store.set(`sources.${i}.${col}`, value);
        num++;
      }

      Utils.toast(`Filled ${col === 'showName' ? 'Show Name' : 'UMD Name'} for rows ${startRow}–${endRow}`, 'success');
      App.renderCurrentTab();
    });
    row.appendChild(applyBtn);

    wrapper.appendChild(row);

    // Preview text
    const preview = document.createElement('div');
    preview.style.cssText = 'margin-top:8px;font-size:11px;color:var(--text-secondary);';
    const updatePreview = () => {
      const prefix = prefixInput.value.trim() || 'CAM';
      const startNum = parseInt(numInput.value) || 1;
      preview.textContent = `Preview: ${prefix}${padNum(startNum)}, ${prefix}${padNum(startNum + 1)}, ${prefix}${padNum(startNum + 2)}...`;
    };
    updatePreview();
    prefixInput.addEventListener('input', updatePreview);
    numInput.addEventListener('input', updatePreview);
    wrapper.appendChild(preview);

    return wrapper;
  }

  function validate(data) {
    const warnings = [];
    // Duplicate show names
    const nameCount = {};
    data.forEach(s => {
      if (s.showName) {
        const key = s.showName.trim().toLowerCase();
        nameCount[key] = (nameCount[key] || 0) + 1;
      }
    });
    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) {
        const indices = data.filter(s => s.showName && s.showName.trim().toLowerCase() === name).map(s => s.number);
        warnings.push(`Duplicate show name "${data.find(s => s.showName && s.showName.trim().toLowerCase() === name).showName}" in sources: ${indices.join(', ')}`);
      }
    });

    // Orphaned eng source references
    const validDevices = new Set(Store.data.rtrMaster.filter(d => d.deviceName).map(d => d.deviceName));
    data.forEach(s => {
      if (s.engSource && !validDevices.has(s.engSource)) {
        warnings.push(`Source ${s.number}: Eng source "${s.engSource}" not found in RTR I/O Master`);
      }
    });

    return warnings;
  }

  function renderSourceTable(parent, rows, offset, allData) {
    // Precompute duplicate set for highlighting
    const dupeNames = new Set();
    const nameCount = {};
    allData.forEach(s => {
      if (s.showName) {
        const key = s.showName.trim().toLowerCase();
        nameCount[key] = (nameCount[key] || 0) + 1;
      }
    });
    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) dupeNames.add(name);
    });

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    [
      { label: '#', width: '35px' },
      { label: 'Show Name' },
      { label: 'UMD Name' },
      { label: 'Eng Source' },
      { label: 'Audio Source' },
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      if (col.width) th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((rowData, localIdx) => {
      const globalIdx = offset + localIdx;
      const tr = document.createElement('tr');

      // # column
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = globalIdx + 1;
      tr.appendChild(tdNum);

      // Show Name — with duplicate highlighting
      const tdShowName = document.createElement('td');
      const inpShowName = document.createElement('input');
      inpShowName.type = 'text';
      inpShowName.value = rowData.showName || '';
      inpShowName.placeholder = `SHOW ${String(globalIdx + 1).padStart(2, '0')}`;
      inpShowName.maxLength = 8;
      if (rowData.showName && dupeNames.has(rowData.showName.trim().toLowerCase())) {
        Utils.showCellWarning(tdShowName, 'Duplicate show name — each source should have a unique name');
      }
      inpShowName.addEventListener('change', () => {
        const val = inpShowName.value.trim();
        rowData.showName = val;
        inpShowName.value = val;
        Store.set(`sources.${globalIdx}.showName`, val);
        // Check for duplicate immediately
        const others = allData.filter((s, i) => i !== globalIdx && s.showName && s.showName.trim().toLowerCase() === val.toLowerCase());
        if (val && others.length > 0) {
          Utils.showCellWarning(tdShowName, `Duplicate: also used by source ${others.map(s => s.number).join(', ')}`);
          Utils.toast(`Duplicate show name "${val}" — also used by source ${others.map(s => s.number).join(', ')}`, 'warn');
        } else {
          Utils.clearCellWarning(tdShowName);
        }
      });
      tdShowName.appendChild(inpShowName);
      tr.appendChild(tdShowName);

      // UMD Name — with length warning
      const tdUmd = document.createElement('td');
      const inpUmd = document.createElement('input');
      inpUmd.type = 'text';
      inpUmd.value = rowData.umdName || '';
      inpUmd.placeholder = `SHOW ${String(globalIdx + 1).padStart(2, '0')}`;
      inpUmd.addEventListener('change', () => {
        rowData.umdName = inpUmd.value;
        Store.set(`sources.${globalIdx}.umdName`, inpUmd.value);
      });
      tdUmd.appendChild(inpUmd);
      tr.appendChild(tdUmd);

      // Eng Source — filterable input with datalist
      const tdEng = document.createElement('td');
      const inpEng = document.createElement('input');
      inpEng.type = 'text';
      inpEng.value = rowData.engSource || '';
      inpEng.placeholder = '--';
      const dlId = `eng-source-dl-${globalIdx}`;
      inpEng.setAttribute('list', dlId);
      const dl = document.createElement('datalist');
      dl.id = dlId;
      const deviceOpts = Utils.getDeviceOptions();
      deviceOpts.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.value;
        dl.appendChild(opt);
      });
      // Orphan detection
      const validDevices = new Set(deviceOpts.map(o => o.value));
      if (rowData.engSource && !validDevices.has(rowData.engSource)) {
        Utils.showCellWarning(tdEng, `Device "${rowData.engSource}" not found in RTR I/O Master`);
      }
      inpEng.addEventListener('change', () => {
        rowData.engSource = inpEng.value;
        Store.set(`sources.${globalIdx}.engSource`, inpEng.value);
        if (inpEng.value && !validDevices.has(inpEng.value)) {
          Utils.showCellWarning(tdEng, `Device "${inpEng.value}" not found in RTR I/O Master`);
        } else {
          Utils.clearCellWarning(tdEng);
        }
      });
      tdEng.appendChild(inpEng);
      tdEng.appendChild(dl);
      tr.appendChild(tdEng);

      // Audio Source dropdown from Sheet8 (lookup happens in RTR I/O Master)
      const tdAudio = document.createElement('td');
      const selAudio = document.createElement('select');
      selAudio.innerHTML = '<option value="">--</option>';
      (Store.data.sheet8.audioSources || []).forEach(src => {
        const opt = document.createElement('option');
        opt.value = src;
        opt.textContent = src;
        if (rowData.audioSource === src) opt.selected = true;
        selAudio.appendChild(opt);
      });
      // If current value not in list, add it so it's preserved
      if (rowData.audioSource && !(Store.data.sheet8.audioSources || []).includes(rowData.audioSource)) {
        const orphanOpt = document.createElement('option');
        orphanOpt.value = rowData.audioSource;
        orphanOpt.textContent = rowData.audioSource;
        orphanOpt.selected = true;
        selAudio.insertBefore(orphanOpt, selAudio.children[1]);
      }
      selAudio.addEventListener('change', () => {
        rowData.audioSource = selAudio.value;
        Store.set(`sources.${globalIdx}.audioSource`, selAudio.value);
      });
      tdAudio.appendChild(selAudio);
      tr.appendChild(tdAudio);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  return { render };
})();
