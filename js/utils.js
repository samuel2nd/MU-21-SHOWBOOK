// ============================================
// Shared Utilities — table rendering, dropdowns, helpers
// ============================================

const Utils = (() => {

  // Build an editable table from column definitions and data array
  // columns: [{ key, label, width?, type?, options?, computed?, readonly? }]
  // dataPath: dot-separated path into Store for the array
  function renderEditableTable(container, columns, dataPath, data) {
    const table = document.createElement('table');
    table.className = 'data-table';

    // Header
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.label;
      if (col.width) th.style.width = col.width;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach((rowData, rowIdx) => {
      const tr = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');

        if (col.key === '_rowNum') {
          td.className = 'row-num';
          td.textContent = rowIdx + 1;
        } else if (col.computed) {
          td.className = 'cell-computed';
          td.textContent = typeof col.computed === 'function' ? col.computed(rowData, rowIdx) : '';
          td.dataset.computedKey = col.key;
        } else if (col.readonly) {
          td.className = 'cell-readonly';
          td.textContent = rowData[col.key] || '';
        } else if (col.type === 'checkbox') {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = !!rowData[col.key];
          cb.addEventListener('change', () => {
            rowData[col.key] = cb.checked;
            Store.set(`${dataPath}.${rowIdx}.${col.key}`, cb.checked);
          });
          td.appendChild(cb);
          td.style.textAlign = 'center';
        } else if (col.type === 'select') {
          const sel = document.createElement('select');
          sel.innerHTML = '<option value="">--</option>';
          const opts = typeof col.options === 'function' ? col.options() : (col.options || []);
          opts.forEach(o => {
            const opt = document.createElement('option');
            if (typeof o === 'object') {
              opt.value = o.value;
              opt.textContent = o.label;
            } else {
              opt.value = o;
              opt.textContent = o;
            }
            if (rowData[col.key] === opt.value) opt.selected = true;
            sel.appendChild(opt);
          });
          sel.addEventListener('change', () => {
            rowData[col.key] = sel.value;
            Store.set(`${dataPath}.${rowIdx}.${col.key}`, sel.value);
          });
          td.appendChild(sel);
        } else {
          // text input
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.value = rowData[col.key] || '';
          if (col.placeholder) inp.placeholder = col.placeholder;
          inp.addEventListener('change', () => {
            rowData[col.key] = inp.value;
            Store.set(`${dataPath}.${rowIdx}.${col.key}`, inp.value);
          });
          td.appendChild(inp);
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(table);
    container.appendChild(wrapper);
    return table;
  }

  // Get list of source names for dropdowns
  function getSourceOptions() {
    return Store.data.sources
      .filter(s => s.showName)
      .map(s => ({ value: s.showName, label: `${s.number}: ${s.showName}` }));
  }

  // Get list of device names from RTR master
  function getDeviceOptions() {
    return Store.data.rtrMaster
      .filter(d => d.deviceName)
      .map(d => ({ value: d.deviceName, label: d.deviceName }));
  }

  // Get TAC panel options
  function getTacOptions() {
    return Store.data.sheet8.tacPanels || ['TAC-A', 'TAC-B', 'TAC-C', 'TAC-D', 'TAC-E', 'TAC-F', 'TAC-G', 'TAC-H', 'S09', 'S10'];
  }

  // Get fiber strand options (1-24 per TAC panel)
  function getFiberStrandOptions() {
    return Array.from({ length: 24 }, (_, i) => String(i + 1));
  }

  // Get coax mult options (1-40)
  function getMultOptions() {
    return Array.from({ length: 40 }, (_, i) => String(i + 1));
  }

  // Get coax output options (1-16 typical)
  function getCoaxOptions() {
    return Array.from({ length: 40 }, (_, i) => String(i + 1));
  }

  // Create a filterable dropdown (select with datalist for typing)
  function createFilterDropdown(options, currentValue, onChange, placeholder = '') {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = currentValue || '';
    inp.placeholder = placeholder;
    inp.style.cssText = 'width:100%;';

    const dlId = 'dl-' + Math.random().toString(36).substr(2, 9);
    inp.setAttribute('list', dlId);

    const dl = document.createElement('datalist');
    dl.id = dlId;
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = typeof opt === 'object' ? opt.value : opt;
      dl.appendChild(o);
    });

    inp.addEventListener('change', () => onChange(inp.value));
    wrapper.appendChild(inp);
    wrapper.appendChild(dl);

    return wrapper;
  }

  // Clear old fiber TAC assignment before setting new one
  function clearOldFiberTacAssignment(sourceIdentifier) {
    // Search all TAC panels for this source and clear it
    const panels = Store.data.sheet8.tacPanels || [];
    panels.forEach(panelName => {
      const panelData = Store.data.fiberTac[panelName];
      if (!panelData) return;
      panelData.forEach((port, idx) => {
        if (port.source && port.source.includes(sourceIdentifier)) {
          port.source = '';
          port.dest = '';
          Store.set(`fiberTac.${panelName}.${idx}.source`, '');
          Store.set(`fiberTac.${panelName}.${idx}.dest`, '');
        }
      });
    });
  }

  // Sync fiber assignment to FIBER TAC page with detailed source info
  // sourceInfo: { type: 'CCU'|'FSY'|'RTR', unit: number, fibSide: 'A'|'B', showName: string, rtrRow: number, clear: boolean }
  function syncToFiberTac(tacPanel, strand, sourceInfo) {
    // Build source identifier for clearing old assignments
    let sourceIdentifier = '';
    if (typeof sourceInfo === 'object' && sourceInfo) {
      if (sourceInfo.type === 'CCU') {
        sourceIdentifier = `CCU ${String(sourceInfo.unit).padStart(2, '0')}-${sourceInfo.fibSide || 'A'}`;
      } else if (sourceInfo.type === 'FSY') {
        sourceIdentifier = `FS ${String(sourceInfo.unit).padStart(2, '0')}`;
      } else if (sourceInfo.type === 'RTR') {
        sourceIdentifier = `RTR FIB ${sourceInfo.rtrRow}`;
      } else if (sourceInfo.type === 'JFS') {
        sourceIdentifier = `JFS MUX ${sourceInfo.unit}`;
      }
    }

    // Clear old assignment first
    if (sourceIdentifier) {
      clearOldFiberTacAssignment(sourceIdentifier);
    }

    // If clearing or no valid panel/strand, we're done
    if (!tacPanel || !strand) return;
    if (sourceInfo && sourceInfo.clear) return;

    const strandNum = parseInt(strand);
    if (isNaN(strandNum) || strandNum < 1 || strandNum > 24) return;

    const panelData = Store.data.fiberTac[tacPanel];
    if (!panelData) return;

    const portIdx = strandNum - 1;

    // Build detailed source string
    let sourceStr = '';
    let destStr = '';

    if (typeof sourceInfo === 'string') {
      // Legacy: simple string
      sourceStr = sourceInfo;
    } else if (sourceInfo) {
      if (sourceInfo.type === 'CCU') {
        const ccuNum = String(sourceInfo.unit).padStart(2, '0');
        sourceStr = `CCU ${ccuNum}-${sourceInfo.fibSide || 'A'}`;
        if (sourceInfo.showName) {
          destStr = sourceInfo.showName;
        }
      } else if (sourceInfo.type === 'FSY') {
        const fsNum = String(sourceInfo.unit).padStart(2, '0');
        sourceStr = `FS ${fsNum}`;
        if (sourceInfo.showName) {
          destStr = sourceInfo.showName;
        }
      } else if (sourceInfo.type === 'RTR') {
        sourceStr = `RTR FIB ${sourceInfo.rtrRow}`;
        if (sourceInfo.source) {
          destStr = sourceInfo.source;
        }
        if (sourceInfo.dest) {
          destStr = destStr ? `${destStr} → ${sourceInfo.dest}` : sourceInfo.dest;
        }
      } else if (sourceInfo.type === 'JFS') {
        sourceStr = `JFS MUX ${sourceInfo.unit}`;
        destStr = sourceInfo.dest || '';
      }
    }

    if (sourceStr) {
      panelData[portIdx].source = sourceStr;
      Store.set(`fiberTac.${tacPanel}.${portIdx}.source`, sourceStr);
    }
    if (destStr !== undefined) {
      panelData[portIdx].dest = destStr;
      Store.set(`fiberTac.${tacPanel}.${portIdx}.dest`, destStr);
    }
  }

  // Clear old coax mult assignment before setting new one
  function clearOldCoaxMultAssignment(sourceIdentifier) {
    // Search all mult units for this source and clear it
    if (!Store.data.coax.multUnits) return;
    Store.data.coax.multUnits.forEach((mult, multIdx) => {
      if (!mult.outputs) return;
      mult.outputs.forEach((output, outIdx) => {
        if (output.dest && output.dest.includes(sourceIdentifier)) {
          output.dest = '';
          Store.set(`coax.multUnits.${multIdx}.outputs.${outIdx}.dest`, '');
        }
      });
    });
  }

  // Sync coax mult assignment to COAX MULTS page with detailed source info
  // sourceInfo: { type: 'FSY'|'RTR', unit: number, showName: string, source: string, clear: boolean }
  function syncToCoaxMult(multNum, sourceInfo) {
    // Build source identifier for clearing old assignments
    let sourceIdentifier = '';
    if (typeof sourceInfo === 'object' && sourceInfo) {
      if (sourceInfo.type === 'FSY') {
        sourceIdentifier = `FS ${String(sourceInfo.unit).padStart(2, '0')}`;
      } else if (sourceInfo.type === 'RTR') {
        sourceIdentifier = `RTR COAX ${sourceInfo.rtrRow}`;
      }
    }

    // Clear old assignment first
    if (sourceIdentifier) {
      clearOldCoaxMultAssignment(sourceIdentifier);
    }

    // If clearing or no valid mult, we're done
    if (!multNum) return;
    if (sourceInfo && sourceInfo.clear) return;

    const num = parseInt(multNum);
    if (isNaN(num) || num < 1 || num > 40) return;

    // Also update the old coax.mults structure for backwards compatibility
    const multIdx = num - 1;
    const multData = Store.data.coax.mults[multIdx];

    // Build detailed source string
    let sourceStr = '';

    if (typeof sourceInfo === 'string') {
      sourceStr = sourceInfo;
    } else if (sourceInfo) {
      if (sourceInfo.type === 'FSY') {
        const fsNum = String(sourceInfo.unit).padStart(2, '0');
        sourceStr = `FS ${fsNum}`;
        if (sourceInfo.showName) {
          sourceStr += `: ${sourceInfo.showName}`;
        }
      } else if (sourceInfo.type === 'RTR') {
        sourceStr = `RTR COAX ${sourceInfo.rtrRow}`;
        if (sourceInfo.source) {
          sourceStr += `: ${sourceInfo.source}`;
        }
      } else if (sourceInfo.source) {
        sourceStr = sourceInfo.source;
      }
    }

    if (sourceStr && multData) {
      multData.source = sourceStr;
      Store.set(`coax.mults.${multIdx}.source`, sourceStr);
    }
  }

  // Create a section header
  function sectionHeader(text) {
    const h = document.createElement('h3');
    h.className = 'section-header';
    h.textContent = text;
    return h;
  }

  // Build tab page container
  function tabPage(title, subtitle) {
    const div = document.createElement('div');
    div.className = 'tab-page';
    const h = document.createElement('h2');
    h.className = 'tab-title';
    h.textContent = title;
    div.appendChild(h);
    if (subtitle) {
      const sub = document.createElement('p');
      sub.className = 'tab-subtitle';
      sub.textContent = subtitle;
      div.appendChild(sub);
    }
    return div;
  }

  // Debounce
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Validate IP address format (IPv4)
  function isValidIp(str) {
    if (!str) return true; // empty is OK
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) &&
      str.split('.').every(octet => {
        const n = parseInt(octet, 10);
        return n >= 0 && n <= 255;
      });
  }

  // Check for duplicate values in a store array field
  function findDuplicates(dataArray, fieldKey) {
    const seen = {};
    const dupes = [];
    dataArray.forEach((row, idx) => {
      const val = row[fieldKey];
      if (val) {
        if (seen[val] !== undefined) {
          dupes.push({ value: val, indices: [seen[val], idx] });
        } else {
          seen[val] = idx;
        }
      }
    });
    return dupes;
  }

  // Show inline validation message on a cell
  function showCellWarning(td, message) {
    td.style.outline = '1px solid var(--accent-orange)';
    td.title = message;
  }

  function clearCellWarning(td) {
    td.style.outline = '';
    td.title = '';
  }

  // Toast notification
  function toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:6px;';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    const colors = { info: 'var(--accent-blue)', warn: 'var(--accent-orange)', error: 'var(--accent-red)', success: 'var(--accent-green)' };
    t.style.cssText = `background:var(--bg-secondary);border:1px solid ${colors[type] || colors.info};color:var(--text-primary);padding:8px 14px;border-radius:4px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.5);transition:opacity 0.3s;max-width:350px;`;
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3500);
  }

  return {
    renderEditableTable,
    getSourceOptions,
    getDeviceOptions,
    getTacOptions,
    getFiberStrandOptions,
    getMultOptions,
    getCoaxOptions,
    createFilterDropdown,
    syncToFiberTac,
    syncToCoaxMult,
    sectionHeader,
    tabPage,
    debounce,
    escapeHtml,
    isValidIp,
    findDuplicates,
    showCellWarning,
    clearCellWarning,
    toast,
  };
})();
