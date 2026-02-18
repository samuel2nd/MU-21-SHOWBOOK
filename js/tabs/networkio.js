// NETWORK I/O — 2×24 patchbay with IP validation
const NetworkIoTab = (() => {
  function render(container) {
    const page = Utils.tabPage('NETWORK I/O', 'Network patchbay — Patch A and Patch B (24 ports each)');

    page.appendChild(Utils.sectionHeader('Patch A (Ports 1–24)'));
    renderPatchTable(page, 'networkIo.patchA', Store.data.networkIo.patchA);

    page.appendChild(Utils.sectionHeader('Patch B (Ports 1–24)'));
    renderPatchTable(page, 'networkIo.patchB', Store.data.networkIo.patchB);

    container.appendChild(page);
  }

  function renderPatchTable(parent, dataPath, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['Port', 'Device', 'IP Address', 'VLAN', 'Notes'].forEach((lbl, i) => {
      const th = document.createElement('th');
      th.textContent = lbl;
      if (i === 0) th.style.width = '45px';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    // Check for duplicate IPs across both patches
    const allIps = {};
    [...Store.data.networkIo.patchA, ...Store.data.networkIo.patchB].forEach(r => {
      if (r.ip) {
        allIps[r.ip] = (allIps[r.ip] || 0) + 1;
      }
    });

    const tbody = document.createElement('tbody');
    data.forEach((row, idx) => {
      const tr = document.createElement('tr');

      // Port
      const tdPort = document.createElement('td');
      tdPort.className = 'row-num';
      tdPort.textContent = row.port;
      tr.appendChild(tdPort);

      // Device
      const tdDev = document.createElement('td');
      const inpDev = document.createElement('input');
      inpDev.type = 'text';
      inpDev.value = row.device || '';
      inpDev.placeholder = 'Device...';
      inpDev.maxLength = 50;
      inpDev.addEventListener('change', () => {
        row.device = inpDev.value;
        Store.set(`${dataPath}.${idx}.device`, inpDev.value);
      });
      tdDev.appendChild(inpDev);
      tr.appendChild(tdDev);

      // IP Address — with validation
      const tdIp = document.createElement('td');
      const inpIp = document.createElement('input');
      inpIp.type = 'text';
      inpIp.value = row.ip || '';
      inpIp.placeholder = '192.168.x.x';
      inpIp.maxLength = 15;
      // Check initial state
      if (row.ip && !Utils.isValidIp(row.ip)) {
        Utils.showCellWarning(tdIp, `Invalid IP format: "${row.ip}"`);
      } else if (row.ip && allIps[row.ip] > 1) {
        Utils.showCellWarning(tdIp, `Duplicate IP address: ${row.ip}`);
      }
      inpIp.addEventListener('change', () => {
        const val = inpIp.value.trim();
        row.ip = val;
        inpIp.value = val;
        Store.set(`${dataPath}.${idx}.ip`, val);
        if (val && !Utils.isValidIp(val)) {
          Utils.showCellWarning(tdIp, `Invalid IP format: "${val}" — expected format: 192.168.1.1`);
          Utils.toast(`Invalid IP address format: "${val}"`, 'warn');
        } else {
          Utils.clearCellWarning(tdIp);
          // Check for duplicate
          const allCurrent = [...Store.data.networkIo.patchA, ...Store.data.networkIo.patchB];
          const dupeCount = allCurrent.filter(r => r.ip === val).length;
          if (val && dupeCount > 1) {
            Utils.showCellWarning(tdIp, `Duplicate IP address: ${val}`);
            Utils.toast(`Duplicate IP address: ${val}`, 'warn');
          }
        }
      });
      tdIp.appendChild(inpIp);
      tr.appendChild(tdIp);

      // VLAN
      const tdVlan = document.createElement('td');
      const inpVlan = document.createElement('input');
      inpVlan.type = 'text';
      inpVlan.value = row.vlan || '';
      inpVlan.placeholder = 'VLAN';
      inpVlan.maxLength = 10;
      inpVlan.addEventListener('change', () => {
        row.vlan = inpVlan.value;
        Store.set(`${dataPath}.${idx}.vlan`, inpVlan.value);
      });
      tdVlan.appendChild(inpVlan);
      tr.appendChild(tdVlan);

      // Notes
      const tdNotes = document.createElement('td');
      const inpNotes = document.createElement('input');
      inpNotes.type = 'text';
      inpNotes.value = row.notes || '';
      inpNotes.placeholder = '';
      inpNotes.maxLength = 100;
      inpNotes.addEventListener('change', () => {
        row.notes = inpNotes.value;
        Store.set(`${dataPath}.${idx}.notes`, inpNotes.value);
      });
      tdNotes.appendChild(inpNotes);
      tr.appendChild(tdNotes);

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
