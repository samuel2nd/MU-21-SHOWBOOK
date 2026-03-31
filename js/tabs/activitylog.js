// ACTIVITY LOG Tab — View changes and events across all devices
const ActivityLogTab = (() => {
  let filterType = 'all';

  function render(container) {
    const page = Utils.tabPage('ACTIVITY LOG', 'View changes, routes, and sync events');

    // Controls row
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:12px;align-items:center;margin-bottom:12px;';

    // Filter dropdown
    const filterLabel = document.createElement('span');
    filterLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);';
    filterLabel.textContent = 'Filter:';
    controls.appendChild(filterLabel);

    const filterSelect = document.createElement('select');
    filterSelect.style.cssText = 'padding:4px 8px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';
    filterSelect.innerHTML = `
      <option value="all">All Events</option>
      <option value="route">Routes</option>
      <option value="layout">Layouts</option>
      <option value="data">Data Changes</option>
      <option value="sync">Sync Events</option>
    `;
    filterSelect.value = filterType;
    filterSelect.addEventListener('change', () => {
      filterType = filterSelect.value;
      renderLogTable(logContainer);
    });
    controls.appendChild(filterSelect);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    controls.appendChild(spacer);

    // Entry count
    const countEl = document.createElement('span');
    countEl.id = 'activity-log-count';
    countEl.style.cssText = 'font-size:11px;color:var(--text-muted);';
    controls.appendChild(countEl);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn';
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = 'padding:4px 12px;font-size:11px;';
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear activity log?')) {
        ActivityLog.clear();
        renderLogTable(logContainer);
      }
    });
    controls.appendChild(clearBtn);

    page.appendChild(controls);

    // Log table container
    const logContainer = document.createElement('div');
    logContainer.id = 'activity-log-container';
    logContainer.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;';
    page.appendChild(logContainer);

    renderLogTable(logContainer);

    // Update count
    updateCount();

    // Listen for new entries
    const updateHandler = () => {
      renderLogTable(logContainer);
      updateCount();
    };
    Store.on('activity-log', updateHandler);
    Store.on('activity-log-cleared', updateHandler);
    Store.on('show-loaded', updateHandler);

    container.appendChild(page);

    function updateCount() {
      const entries = ActivityLog.getEntries();
      const el = document.getElementById('activity-log-count');
      if (el) el.textContent = `${entries.length} / ${ActivityLog.MAX_ENTRIES}`;
    }
  }

  function renderLogTable(container) {
    const entries = filterType === 'all'
      ? ActivityLog.getEntries()
      : ActivityLog.getEntries(filterType);

    container.innerHTML = '';

    // Table header
    const header = document.createElement('div');
    header.style.cssText = 'display:grid;grid-template-columns:85px 60px 90px 1fr 80px;gap:8px;padding:8px 12px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;';
    header.innerHTML = `
      <div>Time</div>
      <div>Type</div>
      <div>Page</div>
      <div>Action</div>
      <div>Status</div>
    `;
    container.appendChild(header);

    // Scrollable log area
    const logArea = document.createElement('div');
    logArea.style.cssText = 'max-height:calc(100vh - 260px);overflow-y:auto;';
    container.appendChild(logArea);

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:40px;text-align:center;color:var(--text-muted);font-size:12px;';
      empty.textContent = filterType === 'all'
        ? 'No activity yet. Routes and changes will appear here.'
        : `No ${filterType} events logged.`;
      logArea.appendChild(empty);
      return;
    }

    // Type colors
    const typeColors = {
      route: 'var(--accent-green)',
      layout: 'var(--accent-purple)',
      data: 'var(--accent-cyan)',
      sync: 'var(--accent-blue)',
      system: 'var(--text-muted)'
    };

    // Status colors
    const statusColors = {
      success: 'var(--accent-green)',
      staged: 'var(--accent-orange)',
      queued: 'var(--accent-yellow)',
      failed: 'var(--accent-red)',
      info: 'var(--text-secondary)'
    };

    entries.forEach(entry => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:85px 60px 90px 1fr 80px;gap:8px;padding:6px 12px;border-bottom:1px solid var(--border-subtle);font-size:11px;align-items:center;';

      const timeStr = ActivityLog.formatTime(entry.timestamp);
      const relativeStr = ActivityLog.formatRelative(entry.timestamp);

      row.innerHTML = `
        <div style="color:var(--text-secondary);font-family:var(--font-mono);font-size:10px;" title="${new Date(entry.timestamp).toLocaleString()}">${timeStr}</div>
        <div style="color:${typeColors[entry.type] || 'var(--text-secondary)'};text-transform:uppercase;font-size:9px;font-weight:600;">${entry.type}</div>
        <div style="color:var(--text-secondary);font-size:10px;">${entry.page || '—'}</div>
        <div style="color:var(--text-primary);" title="${entry.details || ''}">${entry.action}</div>
        <div style="color:${statusColors[entry.status] || 'var(--text-secondary)'};text-transform:uppercase;font-size:9px;font-weight:600;">${entry.status}</div>
      `;

      logArea.appendChild(row);
    });
  }

  return { render };
})();
