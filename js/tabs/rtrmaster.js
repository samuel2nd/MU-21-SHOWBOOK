// RTR I/O MASTER SHEET — Device library with video + 16 audio levels
// Split into ROUTER INPUTS / ROUTER OUTPUTS sub-tabs
const RtrMasterTab = (() => {
  let activeSubTab = 'inputs';

  function render(container) {
    const page = Utils.tabPage('RTR I/O MASTER SHEET', 'Device library — maps each device to video level and 16 audio channels. This feeds SOURCE dropdowns and ENGINEER lookups.');

    // Sub-tab toggle buttons
    const toggleBar = document.createElement('div');
    toggleBar.className = 'subtab-toggle';

    const btnInputs = document.createElement('button');
    btnInputs.className = 'subtab-btn' + (activeSubTab === 'inputs' ? ' active' : '');
    btnInputs.textContent = 'ROUTER INPUTS';
    btnInputs.addEventListener('click', () => {
      activeSubTab = 'inputs';
      container.innerHTML = '';
      render(container);
    });

    const btnOutputs = document.createElement('button');
    btnOutputs.className = 'subtab-btn' + (activeSubTab === 'outputs' ? ' active' : '');
    btnOutputs.textContent = 'ROUTER OUTPUTS';
    btnOutputs.addEventListener('click', () => {
      activeSubTab = 'outputs';
      container.innerHTML = '';
      render(container);
    });

    toggleBar.appendChild(btnInputs);
    toggleBar.appendChild(btnOutputs);
    page.appendChild(toggleBar);

    if (activeSubTab === 'inputs') {
      renderTable(page, Store.data.rtrMaster, 'rtrMaster');
    } else {
      renderTable(page, Store.data.rtrOutputs, 'rtrOutputs');
    }

    container.appendChild(page);
  }

  function renderTable(page, data, storePath) {
    // Validation warnings
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

    // Precompute duplicates for cell highlighting
    const dupeDevices = new Set();
    const nameCount = {};
    data.forEach(d => {
      if (d.deviceName) {
        const key = d.deviceName.trim().toLowerCase();
        nameCount[key] = (nameCount[key] || 0) + 1;
      }
    });
    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) dupeDevices.add(name);
    });

    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Device Name', 'Description', 'Video Level',
      ...Array.from({ length: 16 }, (_, i) => `A${i + 1}`)
    ].forEach((lbl, i) => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (i === 0) th.style.width = '35px';
      if (i >= 4) th.style.width = '55px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = idx + 1;
      tr.appendChild(tdNum);

      // Device Name — with duplicate detection
      const tdName = document.createElement('td');
      const inpName = document.createElement('input');
      inpName.type = 'text';
      inpName.value = row.deviceName || '';
      inpName.placeholder = 'Device name...';
      inpName.maxLength = 32;
      if (row.deviceName && dupeDevices.has(row.deviceName.trim().toLowerCase())) {
        Utils.showCellWarning(tdName, 'Duplicate device name — each device must be unique for lookups to work');
      }
      inpName.addEventListener('change', () => {
        const val = inpName.value.trim();
        row.deviceName = val;
        inpName.value = val;
        Store.set(`${storePath}.${idx}.deviceName`, val);
        const others = data.filter((d, i) => i !== idx && d.deviceName && d.deviceName.trim().toLowerCase() === val.toLowerCase());
        if (val && others.length > 0) {
          Utils.showCellWarning(tdName, `Duplicate: also on row ${others.map(d => data.indexOf(d) + 1).join(', ')}`);
          Utils.toast(`Duplicate device name "${val}" — INDEX/MATCH lookups will only find the first instance`, 'warn');
        } else {
          Utils.clearCellWarning(tdName);
        }
      });
      tdName.appendChild(inpName);
      tr.appendChild(tdName);

      // Description
      tr.appendChild(makeInputTd(row, 'deviceDesc', idx, storePath, 'Description...', 64));
      // Video Level
      tr.appendChild(makeInputTd(row, 'videoLevel', idx, storePath, 'Video lvl...', 20));

      // 16 audio channels
      for (let a = 0; a < 16; a++) {
        const td = document.createElement('td');
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = row.audio[a] || '';
        inp.placeholder = '';
        inp.style.width = '45px';
        inp.maxLength = 20;
        const audioIdx = a;
        inp.addEventListener('change', () => {
          row.audio[audioIdx] = inp.value;
          Store.set(`${storePath}.${idx}.audio`, [...row.audio]);
        });
        td.appendChild(inp);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    page.appendChild(wrapper);
  }

  function validate(data) {
    const warnings = [];
    // Duplicate device names
    const nameCount = {};
    data.forEach(d => {
      if (d.deviceName) {
        const key = d.deviceName.trim().toLowerCase();
        nameCount[key] = (nameCount[key] || 0) + 1;
      }
    });
    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) {
        const rows = data.filter(d => d.deviceName && d.deviceName.trim().toLowerCase() === name).map(d => d.row);
        warnings.push(`Duplicate device name "${data.find(d => d.deviceName && d.deviceName.trim().toLowerCase() === name).deviceName}" on rows: ${rows.join(', ')} — INDEX/MATCH will only find the first`);
      }
    });

    // Count devices with no description or video level (summarize instead of listing each)
    const noDesc = data.filter(d => d.deviceName && !d.deviceDesc);
    if (noDesc.length > 0 && noDesc.length <= 5) {
      noDesc.forEach(d => warnings.push(`Row ${d.row}: Device "${d.deviceName}" has no description`));
    } else if (noDesc.length > 5) {
      warnings.push(`${noDesc.length} devices have no description — fill in as needed for NV9000 export`);
    }

    const noVideo = data.filter(d => d.deviceName && !d.videoLevel);
    if (noVideo.length > 0 && noVideo.length <= 5) {
      noVideo.forEach(d => warnings.push(`Row ${d.row}: Device "${d.deviceName}" has no video level assigned`));
    } else if (noVideo.length > 5) {
      warnings.push(`${noVideo.length} devices have no video level — assign levels for router configuration`);
    }

    return warnings;
  }

  function makeInputTd(row, key, idx, storePath, placeholder, maxLen) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = row[key] || '';
    inp.placeholder = placeholder;
    if (maxLen) inp.maxLength = maxLen;
    inp.addEventListener('change', () => {
      row[key] = inp.value;
      Store.set(`${storePath}.${idx}.${key}`, inp.value);
    });
    td.appendChild(inp);
    return td;
  }

  return { render };
})();
