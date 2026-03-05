// ============================================
// Shared Utilities — table rendering, dropdowns, helpers
// ============================================

const Utils = (() => {

  // Dark dropdown for inline use in tables (simpler, no filter for small cells)
  function createDarkDropdownInline(options, currentValue, onChange) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;';

    // Find current label
    const currentOpt = options.find(o => o.value === currentValue);
    const displayLabel = currentOpt ? currentOpt.label : (currentValue || '--');

    // The visible "button" that shows current value
    const display = document.createElement('div');
    display.style.cssText = `
      padding: 4px 20px 4px 6px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text-primary);
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
      min-height: 18px;
    `;
    display.innerHTML = `
      <span class="dropdown-value">${displayLabel}</span>
      <span style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:7px;color:var(--text-muted);">▼</span>
    `;
    wrapper.appendChild(display);

    // The dropdown popup
    const popup = document.createElement('div');
    popup.className = 'dark-dropdown-popup';
    popup.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 100%;
      max-height: 180px;
      overflow-y: auto;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 3px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    // Render options
    options.forEach(opt => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 5px 8px;
        font-size: 11px;
        cursor: pointer;
        color: var(--text-primary);
        white-space: nowrap;
      `;
      item.textContent = opt.label;
      if (opt.value === currentValue) {
        item.style.background = 'var(--accent-blue)';
        item.style.color = '#fff';
      }
      item.addEventListener('mouseenter', () => {
        if (opt.value !== currentValue) item.style.background = 'var(--bg-hover)';
      });
      item.addEventListener('mouseleave', () => {
        if (opt.value !== currentValue) item.style.background = '';
      });
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        display.querySelector('.dropdown-value').textContent = opt.label;
        popup.style.display = 'none';
        onChange(opt.value);
      });
      popup.appendChild(item);
    });

    display.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.dark-dropdown-popup').forEach(p => {
        if (p !== popup) p.style.display = 'none';
      });
      const isOpen = popup.style.display === 'block';
      popup.style.display = isOpen ? 'none' : 'block';
    });

    // Close on click outside
    const closeHandler = (e) => {
      if (!wrapper.contains(e.target)) {
        popup.style.display = 'none';
      }
    };
    document.addEventListener('click', closeHandler);

    wrapper.appendChild(popup);
    return wrapper;
  }

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
          // Dark dropdown instead of native select
          const opts = typeof col.options === 'function' ? col.options() : (col.options || []);
          const allOpts = [{ value: '', label: '--' }, ...opts.map(o => typeof o === 'object' ? o : { value: o, label: o })];
          const dropdown = createDarkDropdownInline(allOpts, rowData[col.key] || '', (val) => {
            rowData[col.key] = val;
            Store.set(`${dataPath}.${rowIdx}.${col.key}`, val);
          });
          td.appendChild(dropdown);
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

  // Dark dropdown picker (replaces native select with custom dark popup)
  function createDarkDropdown(options, currentValue, onChange, config = {}) {
    const { placeholder = '-- Select --', width = '100%' } = config;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:relative;width:${width};`;

    // The visible "button" that shows current value
    const display = document.createElement('div');
    display.style.cssText = `
      padding: 4px 24px 4px 8px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text-primary);
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
    `;
    display.innerHTML = `
      <span class="dropdown-value">${currentValue || placeholder}</span>
      <span style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:8px;color:var(--text-muted);">▼</span>
    `;
    wrapper.appendChild(display);

    // The dropdown popup
    const popup = document.createElement('div');
    popup.className = 'dark-dropdown-popup';
    popup.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 200px;
      overflow-y: auto;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 3px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;

    // Filter input
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter...';
    filterInput.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      background: var(--bg-secondary);
      border: none;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 11px;
      box-sizing: border-box;
      outline: none;
    `;
    popup.appendChild(filterInput);

    // Options container
    const optionsContainer = document.createElement('div');
    popup.appendChild(optionsContainer);

    function renderOptions(filter = '') {
      optionsContainer.innerHTML = '';
      const filterLower = filter.toLowerCase();
      const filtered = options.filter(opt => {
        if (opt.disabled) return true; // Keep separators
        const val = typeof opt === 'object' ? opt.label || opt.value : opt;
        return val.toLowerCase().includes(filterLower);
      });

      filtered.forEach(opt => {
        const value = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? (opt.label || opt.value) : opt;
        const disabled = opt.disabled || false;

        const item = document.createElement('div');
        if (disabled) {
          // Separator/disabled item
          item.style.cssText = `
            padding: 4px 8px;
            font-size: 10px;
            color: var(--text-muted);
            background: var(--bg-secondary);
            cursor: default;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          `;
          item.textContent = label;
        } else {
          item.style.cssText = `
            padding: 6px 8px;
            font-size: 11px;
            cursor: pointer;
            color: var(--text-primary);
            transition: background 0.1s;
          `;
          item.textContent = label;
          if (value === currentValue) {
            item.style.background = 'var(--bg-tertiary)';
          }
          item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-hover)');
          item.addEventListener('mouseleave', () => item.style.background = value === currentValue ? 'var(--bg-tertiary)' : '');
          item.addEventListener('click', () => {
            display.querySelector('.dropdown-value').textContent = label || placeholder;
            popup.style.display = 'none';
            currentValue = value;
            onChange(value);
          });
        }
        optionsContainer.appendChild(item);
      });

      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'padding:8px;font-size:10px;color:var(--text-muted);text-align:center;';
        empty.textContent = 'No matches';
        optionsContainer.appendChild(empty);
      }
    }

    filterInput.addEventListener('input', () => renderOptions(filterInput.value));

    display.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.dark-dropdown-popup').forEach(p => {
        if (p !== popup) p.style.display = 'none';
      });
      const isOpen = popup.style.display === 'block';
      popup.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        filterInput.value = '';
        renderOptions();
        filterInput.focus();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        popup.style.display = 'none';
      }
    });

    wrapper.appendChild(popup);
    return wrapper;
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

  // Collapsible section - defaults to collapsed, persists state in localStorage
  function collapsibleSection(title, storageKey, contentBuilder) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom:20px;';

    // Header (clickable)
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
    `;

    const arrow = document.createElement('span');
    arrow.style.cssText = 'font-size:10px;color:var(--text-muted);transition:transform 0.2s;';
    arrow.textContent = '▶';

    const titleEl = document.createElement('span');
    titleEl.style.cssText = 'font-weight:600;font-size:13px;color:var(--accent-blue);';
    titleEl.textContent = title;

    const badge = document.createElement('span');
    badge.style.cssText = 'font-size:9px;color:var(--text-muted);margin-left:auto;';
    badge.textContent = 'click to expand';

    header.appendChild(arrow);
    header.appendChild(titleEl);
    header.appendChild(badge);
    wrapper.appendChild(header);

    // Content container
    const content = document.createElement('div');
    content.style.cssText = 'display:none;margin-top:-1px;border:1px solid var(--border);border-top:none;border-radius:0 0 6px 6px;padding:16px;background:var(--bg-secondary);';

    // Check localStorage for saved state (default collapsed)
    const isExpanded = localStorage.getItem(storageKey) === 'expanded';

    function toggle() {
      const expanded = content.style.display !== 'none';
      if (expanded) {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
        badge.textContent = 'click to expand';
        header.style.borderRadius = '6px';
        localStorage.setItem(storageKey, 'collapsed');
      } else {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(90deg)';
        badge.textContent = 'click to collapse';
        header.style.borderRadius = '6px 6px 0 0';
        localStorage.setItem(storageKey, 'expanded');
      }
    }

    header.addEventListener('click', toggle);

    // Build content
    contentBuilder(content);
    wrapper.appendChild(content);

    // Apply initial state
    if (isExpanded) {
      content.style.display = 'block';
      arrow.style.transform = 'rotate(90deg)';
      badge.textContent = 'click to collapse';
      header.style.borderRadius = '6px 6px 0 0';
    }

    return wrapper;
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
    createDarkDropdown,
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
    collapsibleSection,
  };
})();
