// SOURCE Tab — 80 sources (2×40 layout) with validation
const SourceTab = (() => {
  // Persist autofill settings across re-renders
  const autofillState = {
    column: 'showName',
    prefix: '',
    startRow: 1,
    endRow: 10,
    startNum: 1,
    audioValue: '',
    mode: 'increment' // 'increment' or 'repeat'
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

  // Helper: Find sequential devices from RTR I/O Master
  // e.g., "CAM 1" → finds "CAM 2", "CAM 3", etc.
  function findSequentialDevices(startDevice, count) {
    const allDevices = Utils.getDeviceOptions().map(o => o.value).filter(v => v);

    // Extract prefix and number from start device
    // Handles: "CAM 1", "CAM1", "CAM-1", "CAM_1", "CAMERA 01"
    const match = startDevice.match(/^(.+?)[\s\-_]*(\d+)$/);
    if (!match) return [startDevice]; // No number pattern, just return the one device

    const prefix = match[1];
    const startNum = parseInt(match[2]);
    const numPadding = match[2].length; // Preserve padding (01 vs 1)

    const results = [];
    for (let i = 0; i < count && results.length < count; i++) {
      const targetNum = startNum + i;
      // Try different formats to find matching device
      const formats = [
        `${prefix}${String(targetNum).padStart(numPadding, '0')}`,  // CAM01
        `${prefix} ${String(targetNum).padStart(numPadding, '0')}`, // CAM 01
        `${prefix}${targetNum}`,  // CAM1
        `${prefix} ${targetNum}`, // CAM 1
        `${prefix}-${targetNum}`, // CAM-1
        `${prefix}_${targetNum}`, // CAM_1
      ];

      const found = allDevices.find(d =>
        formats.some(f => d.toLowerCase() === f.toLowerCase())
      );

      if (found) {
        results.push(found);
      }
    }

    return results;
  }

  function createAutofillControls(data) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;padding:12px;margin-bottom:16px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:10px;color:var(--text-primary);';
    title.textContent = 'Quick Fill';
    wrapper.appendChild(title);

    // Get all devices and audio sources
    const allDevices = Utils.getDeviceOptions().map(o => o.value).filter(v => v);
    const audioSources = Store.data.sheet8.audioSources || [];

    // === SIMPLE LAYOUT: 3 sections side by side ===
    const sectionsRow = document.createElement('div');
    sectionsRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;';

    // --- SECTION 1: Show Name / UMD ---
    const nameSection = document.createElement('div');
    nameSection.style.cssText = 'padding:10px;background:var(--bg-primary);border-radius:4px;border:1px solid var(--border);';
    nameSection.innerHTML = `<div style="font-size:11px;font-weight:600;color:var(--accent-blue);margin-bottom:8px;">SHOW NAME / UMD</div>`;

    const nameRow = document.createElement('div');
    nameRow.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';

    const namePrefix = document.createElement('input');
    namePrefix.type = 'text';
    namePrefix.placeholder = 'CAM';
    namePrefix.style.cssText = 'width:60px;padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const nameStart = document.createElement('input');
    nameStart.type = 'number';
    nameStart.value = '1';
    nameStart.min = '1';
    nameStart.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const nameArrow = document.createElement('span');
    nameArrow.textContent = '→';
    nameArrow.style.cssText = 'color:var(--text-secondary);';

    const nameEnd = document.createElement('input');
    nameEnd.type = 'number';
    nameEnd.value = '10';
    nameEnd.min = '1';
    nameEnd.max = '80';
    nameEnd.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    let nameColValue = 'showName';
    const nameColOptions = [
      { value: 'showName', label: 'Show' },
      { value: 'umdName', label: 'UMD' },
      { value: 'both', label: 'Both' }
    ];
    const nameColSelect = Utils.createDarkDropdown(nameColOptions, nameColValue, (val) => {
      nameColValue = val;
    }, { placeholder: 'Show', width: '70px' });

    const nameBtn = document.createElement('button');
    nameBtn.className = 'btn btn-primary';
    nameBtn.textContent = 'Fill';
    nameBtn.style.cssText = 'padding:4px 12px;font-size:11px;';

    nameRow.appendChild(namePrefix);
    nameRow.appendChild(nameStart);
    nameRow.appendChild(nameArrow);
    nameRow.appendChild(nameEnd);
    nameRow.appendChild(nameColSelect);
    nameRow.appendChild(nameBtn);
    nameSection.appendChild(nameRow);

    const namePreview = document.createElement('div');
    namePreview.style.cssText = 'font-size:10px;color:var(--text-secondary);margin-top:6px;';
    namePreview.textContent = 'CAM01, CAM02, CAM03...';
    nameSection.appendChild(namePreview);

    // Update preview
    const updateNamePreview = () => {
      const prefix = namePrefix.value || 'CAM';
      const start = parseInt(nameStart.value) || 1;
      namePreview.textContent = `${prefix}${padNum(start)}, ${prefix}${padNum(start+1)}, ${prefix}${padNum(start+2)}...`;
    };
    namePrefix.addEventListener('input', updateNamePreview);
    nameStart.addEventListener('input', updateNamePreview);

    // Fill handler
    nameBtn.addEventListener('click', () => {
      const prefix = namePrefix.value.trim();
      if (!prefix) { Utils.toast('Enter a prefix', 'warn'); return; }

      const startRow = Math.max(1, Math.min(80, parseInt(nameStart.value) || 1));
      const endRow = Math.max(startRow, Math.min(80, parseInt(nameEnd.value) || startRow));
      const col = nameColValue;

      let num = 1;
      for (let i = startRow - 1; i < endRow; i++) {
        const value = `${prefix}${padNum(num)}`;
        if (col === 'both' || col === 'showName') {
          data[i].showName = value;
          Store.set(`sources.${i}.showName`, value);
        }
        if (col === 'both' || col === 'umdName') {
          data[i].umdName = value;
          Store.set(`sources.${i}.umdName`, value);
        }
        num++;
      }
      Utils.toast(`Filled rows ${startRow}–${endRow}`, 'success');
      App.renderCurrentTab();
    });

    sectionsRow.appendChild(nameSection);

    // --- SECTION 2: Eng Source ---
    const engSection = document.createElement('div');
    engSection.style.cssText = 'padding:10px;background:var(--bg-primary);border-radius:4px;border:1px solid var(--border);';
    engSection.innerHTML = `<div style="font-size:11px;font-weight:600;color:var(--accent-green);margin-bottom:8px;">ENG SOURCE</div>`;

    const engRow = document.createElement('div');
    engRow.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';

    let engSelectValue = '';
    const engOptions = [{ value: '', label: 'Start device...' }];
    allDevices.forEach(d => {
      engOptions.push({ value: d, label: d });
    });
    const engSelect = Utils.createDarkDropdown(engOptions, engSelectValue, (val) => {
      engSelectValue = val;
      updateEngPreview();
    }, { placeholder: 'Start device...', width: '140px' });

    const engCount = document.createElement('input');
    engCount.type = 'number';
    engCount.value = '10';
    engCount.min = '1';
    engCount.max = '80';
    engCount.title = 'Number of rows';
    engCount.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const engStartRow = document.createElement('input');
    engStartRow.type = 'number';
    engStartRow.value = '1';
    engStartRow.min = '1';
    engStartRow.max = '80';
    engStartRow.title = 'Starting row';
    engStartRow.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const engBtn = document.createElement('button');
    engBtn.className = 'btn btn-primary';
    engBtn.textContent = 'Fill ↓';
    engBtn.style.cssText = 'padding:4px 12px;font-size:11px;';

    const engCountLabel = document.createElement('span');
    engCountLabel.textContent = '×';
    engCountLabel.style.cssText = 'color:var(--text-secondary);font-size:11px;';

    const engRowLabel = document.createElement('span');
    engRowLabel.textContent = '@row';
    engRowLabel.style.cssText = 'color:var(--text-secondary);font-size:10px;';

    engRow.appendChild(engSelect);
    engRow.appendChild(engCountLabel);
    engRow.appendChild(engCount);
    engRow.appendChild(engRowLabel);
    engRow.appendChild(engStartRow);
    engRow.appendChild(engBtn);
    engSection.appendChild(engRow);

    const engPreview = document.createElement('div');
    engPreview.style.cssText = 'font-size:10px;color:var(--text-secondary);margin-top:6px;';
    engPreview.textContent = 'Select a device to see sequence';
    engSection.appendChild(engPreview);

    // Update eng preview
    const updateEngPreview = () => {
      const device = engSelectValue;
      const count = parseInt(engCount.value) || 1;
      if (!device) {
        engPreview.textContent = 'Select a device to see sequence';
        return;
      }
      const seq = findSequentialDevices(device, Math.min(count, 5));
      engPreview.textContent = seq.join(', ') + (count > 5 ? '...' : '');
      if (seq.length < count) {
        engPreview.textContent += ` (${seq.length} found)`;
      }
    };
    engCount.addEventListener('input', updateEngPreview);

    // Fill handler
    engBtn.addEventListener('click', () => {
      const device = engSelectValue;
      if (!device) { Utils.toast('Select a starting device', 'warn'); return; }

      const count = parseInt(engCount.value) || 1;
      const startRow = Math.max(1, Math.min(80, parseInt(engStartRow.value) || 1));
      const devices = findSequentialDevices(device, count);

      if (devices.length === 0) {
        Utils.toast('No matching devices found', 'warn');
        return;
      }

      devices.forEach((d, idx) => {
        const row = startRow - 1 + idx;
        if (row < 80) {
          data[row].engSource = d;
          Store.set(`sources.${row}.engSource`, d);
        }
      });

      Utils.toast(`Filled ${devices.length} devices starting row ${startRow}`, 'success');
      App.renderCurrentTab();
    });

    sectionsRow.appendChild(engSection);

    // --- SECTION 3: Audio Source ---
    const audioSection = document.createElement('div');
    audioSection.style.cssText = 'padding:10px;background:var(--bg-primary);border-radius:4px;border:1px solid var(--border);';
    audioSection.innerHTML = `<div style="font-size:11px;font-weight:600;color:var(--accent-orange);margin-bottom:8px;">AUDIO SOURCE</div>`;

    const audioRow = document.createElement('div');
    audioRow.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';

    let audioSelectValue = '';
    const audioSelectOptions = [{ value: '', label: 'Select...' }];
    audioSources.forEach(s => {
      audioSelectOptions.push({ value: s, label: s });
    });
    const audioSelect = Utils.createDarkDropdown(audioSelectOptions, audioSelectValue, (val) => {
      audioSelectValue = val;
    }, { placeholder: 'Select...', width: '140px' });

    const audioStart = document.createElement('input');
    audioStart.type = 'number';
    audioStart.value = '1';
    audioStart.min = '1';
    audioStart.max = '80';
    audioStart.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const audioArrow = document.createElement('span');
    audioArrow.textContent = '→';
    audioArrow.style.cssText = 'color:var(--text-secondary);';

    const audioEnd = document.createElement('input');
    audioEnd.type = 'number';
    audioEnd.value = '10';
    audioEnd.min = '1';
    audioEnd.max = '80';
    audioEnd.style.cssText = 'width:45px;padding:4px 6px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';

    const audioBtn = document.createElement('button');
    audioBtn.className = 'btn btn-primary';
    audioBtn.textContent = 'Fill';
    audioBtn.style.cssText = 'padding:4px 12px;font-size:11px;';

    audioRow.appendChild(audioSelect);
    audioRow.appendChild(audioStart);
    audioRow.appendChild(audioArrow);
    audioRow.appendChild(audioEnd);
    audioRow.appendChild(audioBtn);
    audioSection.appendChild(audioRow);

    const audioPreview = document.createElement('div');
    audioPreview.style.cssText = 'font-size:10px;color:var(--text-secondary);margin-top:6px;';
    audioPreview.textContent = 'Repeats same value for all rows';
    audioSection.appendChild(audioPreview);

    // Fill handler
    audioBtn.addEventListener('click', () => {
      const source = audioSelectValue;
      if (!source) { Utils.toast('Select an audio source', 'warn'); return; }

      const startRow = Math.max(1, Math.min(80, parseInt(audioStart.value) || 1));
      const endRow = Math.max(startRow, Math.min(80, parseInt(audioEnd.value) || startRow));

      for (let i = startRow - 1; i < endRow; i++) {
        data[i].audioSource = source;
        Store.set(`sources.${i}.audioSource`, source);
      }
      Utils.toast(`Filled rows ${startRow}–${endRow} with "${source}"`, 'success');
      App.renderCurrentTab();
    });

    sectionsRow.appendChild(audioSection);
    wrapper.appendChild(sectionsRow);

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
      { label: 'Show Name', width: '120px' },
      { label: 'UMD Name', width: '100px' },
      { label: 'Eng Source', width: '100px' },
      { label: 'Audio Source', width: '100px' },
    ].forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      th.style.width = col.width;
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

      // Eng Source (dark dropdown)
      const tdEng = document.createElement('td');
      const deviceOpts = Utils.getDeviceOptions();
      const engOptions = [{ value: '', label: '--' }];
      // Add orphan if current value isn't in list
      const validDevices = new Set(deviceOpts.map(o => o.value));
      if (rowData.engSource && !validDevices.has(rowData.engSource)) {
        engOptions.push({ value: rowData.engSource, label: rowData.engSource });
      }
      deviceOpts.forEach(o => {
        engOptions.push({ value: o.value, label: o.label || o.value });
      });
      const engDropdown = Utils.createDarkDropdown(engOptions, rowData.engSource || '', (val) => {
        rowData.engSource = val;
        Store.set(`sources.${globalIdx}.engSource`, val);
      }, { placeholder: '--' });
      tdEng.appendChild(engDropdown);
      tr.appendChild(tdEng);

      // Audio Source dropdown (dark) from Sheet8
      const tdAudio = document.createElement('td');
      const audioSources = Store.data.sheet8.audioSources || [];
      const audioOptions = [{ value: '', label: '--' }];
      // Add orphan if current value isn't in list
      if (rowData.audioSource && !audioSources.includes(rowData.audioSource)) {
        audioOptions.push({ value: rowData.audioSource, label: rowData.audioSource });
      }
      audioSources.forEach(src => {
        audioOptions.push({ value: src, label: src });
      });
      const audioDropdown = Utils.createDarkDropdown(audioOptions, rowData.audioSource || '', (val) => {
        rowData.audioSource = val;
        Store.set(`sources.${globalIdx}.audioSource`, val);
      }, { placeholder: '--' });
      tdAudio.appendChild(audioDropdown);
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
