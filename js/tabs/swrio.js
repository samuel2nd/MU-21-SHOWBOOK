// SWR I/O Tab — Switcher inputs, outputs, tally, GPI
const SwrIoTab = (() => {

  // Lookup show name from SOURCE tab by engSource
  function lookupShowName(engSource) {
    if (!engSource) return '';
    const source = Store.data.sources.find(s => s.engSource === engSource && s.showName);
    return source ? source.showName : '';
  }

  function render(container) {
    const page = Utils.tabPage('SWR I/O', 'Switcher I/O mapping — inputs, outputs, tally groups, and GPI triggers. Show names auto-fill from SOURCE tab.');

    // Switcher Inputs (1-120) - displayed in 3 columns side by side
    page.appendChild(Utils.sectionHeader('Switcher Inputs (1–120)'));
    renderInputsTable(page, Store.data.swrIo.inputs);

    // Switcher Outputs (1-46)
    page.appendChild(Utils.sectionHeader('Switcher Outputs (1–46)'));
    renderOutputsTable(page, Store.data.swrIo.outputs);

    // Two-column layout for Tally and GPI
    const groupRow = document.createElement('div');
    groupRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;';

    // SWR Tally Group (1-24)
    const tallySection = document.createElement('div');
    tallySection.appendChild(Utils.sectionHeader('SWR Tally Group (1–24)'));
    renderTallyTable(tallySection, Store.data.swrIo.tally);
    groupRow.appendChild(tallySection);

    // SWR GPI Group (1-12)
    const gpiSection = document.createElement('div');
    gpiSection.appendChild(Utils.sectionHeader('SWR GPI Group (1–12)'));
    renderGpiTable(gpiSection, Store.data.swrIo.gpi);
    groupRow.appendChild(gpiSection);

    page.appendChild(groupRow);

    container.appendChild(page);
  }

  function renderInputsTable(parent, data) {
    // Split into 3 groups: 1-48, 49-96, 97-120
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;';

    const groups = [
      { start: 0, end: 48 },
      { start: 48, end: 96 },
      { start: 96, end: 120 },
    ];

    groups.forEach(group => {
      const table = document.createElement('table');
      table.className = 'data-table';

      const thead = document.createElement('thead');
      const hr = document.createElement('tr');
      ['#', 'Show Source', 'Eng Source'].forEach(lbl => {
        const th = document.createElement('th');
        th.textContent = lbl;
        if (lbl === '#') th.style.width = '35px';
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (let i = group.start; i < group.end; i++) {
        const row = data[i];
        if (!row) continue;
        const tr = document.createElement('tr');

        // Row number
        const tdNum = document.createElement('td');
        tdNum.className = 'row-num';
        tdNum.textContent = row.row;
        tr.appendChild(tdNum);

        // Show Source (computed from SOURCE tab lookup)
        const tdShow = document.createElement('td');
        const showName = lookupShowName(row.engSource);
        tdShow.textContent = showName || '';
        tdShow.className = 'cell-computed';
        tr.appendChild(tdShow);

        // Eng Source (fixed default - read only)
        const tdEng = document.createElement('td');
        tdEng.textContent = row.engSource || '';
        tdEng.style.color = 'var(--text-secondary)';
        tr.appendChild(tdEng);

        tbody.appendChild(tr);
      }
      table.appendChild(tbody);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'table-scroll';
      tableWrapper.style.maxHeight = '500px';
      tableWrapper.appendChild(table);
      wrapper.appendChild(tableWrapper);
    });

    parent.appendChild(wrapper);
  }

  function renderOutputsTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Default Show', 'Show'].forEach(lbl => {
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

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Default Show (fixed - read only)
      const tdDefault = document.createElement('td');
      tdDefault.textContent = row.defaultShow || '';
      tdDefault.style.color = 'var(--text-secondary)';
      tr.appendChild(tdDefault);

      // Show (editable - user can override)
      const tdShow = document.createElement('td');
      const inpShow = document.createElement('input');
      inpShow.type = 'text';
      inpShow.value = row.show || '';
      inpShow.placeholder = row.defaultShow || '';
      inpShow.addEventListener('change', () => {
        row.show = inpShow.value;
        Store.set(`swrIo.outputs.${idx}.show`, inpShow.value);
      });
      tdShow.appendChild(inpShow);
      tr.appendChild(tdShow);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.maxHeight = '400px';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderTallyTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Default', 'Show'].forEach(lbl => {
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

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Default (read-only)
      const tdDefault = document.createElement('td');
      tdDefault.textContent = row.default || '';
      tdDefault.style.color = 'var(--text-secondary)';
      tr.appendChild(tdDefault);

      // Show (editable)
      const tdShow = document.createElement('td');
      const inpShow = document.createElement('input');
      inpShow.type = 'text';
      inpShow.value = row.show || '';
      inpShow.placeholder = row.default || '';
      inpShow.addEventListener('change', () => {
        row.show = inpShow.value;
        Store.set(`swrIo.tally.${idx}.show`, inpShow.value);
      });
      tdShow.appendChild(inpShow);
      tr.appendChild(tdShow);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    parent.appendChild(wrapper);
  }

  function renderGpiTable(parent, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['#', 'Default', 'Show'].forEach(lbl => {
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

      // Row number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = row.row;
      tr.appendChild(tdNum);

      // Default (read-only)
      const tdDefault = document.createElement('td');
      tdDefault.textContent = row.default || '';
      tdDefault.style.color = 'var(--text-secondary)';
      tr.appendChild(tdDefault);

      // Show (editable)
      const tdShow = document.createElement('td');
      const inpShow = document.createElement('input');
      inpShow.type = 'text';
      inpShow.value = row.show || '';
      inpShow.placeholder = row.default || '';
      inpShow.addEventListener('change', () => {
        row.show = inpShow.value;
        Store.set(`swrIo.gpi.${idx}.show`, inpShow.value);
      });
      tdShow.appendChild(inpShow);
      tr.appendChild(tdShow);

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
