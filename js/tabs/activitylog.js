// ACTIVITY LOG Tab — View changes and events across all devices
const ActivityLogTab = (() => {
  let autoScroll = true;
  let filterType = 'all';

  function render(container) {
    const page = Utils.tabPage('ACTIVITY LOG', 'View changes, routes, and sync events from all devices');

    // Controls row
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap;';

    // Device name setting
    const deviceLabel = document.createElement('span');
    deviceLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);';
    deviceLabel.textContent = 'This Device:';
    controls.appendChild(deviceLabel);

    const deviceInput = document.createElement('input');
    deviceInput.type = 'text';
    deviceInput.value = ActivityLog.getDeviceName();
    deviceInput.style.cssText = 'padding:4px 8px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);width:100px;';
    deviceInput.title = 'Name shown in activity log for this device';
    deviceInput.addEventListener('change', () => {
      ActivityLog.setDeviceName(deviceInput.value || 'Device');
      Utils.toast('Device name updated', 'success');
    });
    controls.appendChild(deviceInput);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    controls.appendChild(spacer);

    // Filter dropdown
    const filterLabel = document.createElement('span');
    filterLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);';
    filterLabel.textContent = 'Filter:';
    controls.appendChild(filterLabel);

    const filterSelect = document.createElement('select');
    filterSelect.style.cssText = 'padding:4px 8px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';
    filterSelect.innerHTML = `
      <option value="all">All Events</option>
      <option value="data">Data Changes</option>
      <option value="route">Routes</option>
      <option value="layout">Layouts</option>
      <option value="sync">Sync Events</option>
      <option value="system">System</option>
    `;
    filterSelect.value = filterType;
    filterSelect.addEventListener('change', () => {
      filterType = filterSelect.value;
      renderLogTable(logContainer);
    });
    controls.appendChild(filterSelect);

    // Auto-scroll toggle
    const autoScrollLabel = document.createElement('label');
    autoScrollLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);display:flex;align-items:center;gap:4px;cursor:pointer;';
    const autoScrollCheck = document.createElement('input');
    autoScrollCheck.type = 'checkbox';
    autoScrollCheck.checked = autoScroll;
    autoScrollCheck.addEventListener('change', () => {
      autoScroll = autoScrollCheck.checked;
    });
    autoScrollLabel.appendChild(autoScrollCheck);
    autoScrollLabel.appendChild(document.createTextNode('Auto-scroll'));
    controls.appendChild(autoScrollLabel);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn';
    clearBtn.textContent = 'Clear Log';
    clearBtn.style.cssText = 'padding:4px 12px;font-size:11px;';
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all activity log entries? This affects all devices.')) {
        ActivityLog.clear();
        renderLogTable(logContainer);
        Utils.toast('Activity log cleared', 'success');
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

    // Listen for new entries
    const updateHandler = () => renderLogTable(logContainer);
    Store.on('activity-log', updateHandler);
    Store.on('activity-log-cleared', updateHandler);
    Store.on('show-loaded', updateHandler);

    container.appendChild(page);
  }

  function renderLogTable(container) {
    const entries = filterType === 'all'
      ? ActivityLog.getEntries()
      : ActivityLog.getEntries(filterType);

    container.innerHTML = '';

    // Table header
    const header = document.createElement('div');
    header.style.cssText = 'display:grid;grid-template-columns:90px 80px 70px 80px 1fr 100px 70px;gap:8px;padding:8px 12px;background:var(--bg-tertiary);border-bottom:1px solid var(--border);font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;';
    header.innerHTML = `
      <div>Time</div>
      <div>Device</div>
      <div>Type</div>
      <div>Page</div>
      <div>Action</div>
      <div>Details</div>
      <div>Status</div>
    `;
    container.appendChild(header);

    // Scrollable log area
    const logArea = document.createElement('div');
    logArea.style.cssText = 'max-height:calc(100vh - 280px);overflow-y:auto;';
    container.appendChild(logArea);

    if (entries.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:40px;text-align:center;color:var(--text-muted);font-size:12px;';
      empty.textContent = 'No activity logged yet. Changes, routes, and sync events will appear here.';
      logArea.appendChild(empty);
      return;
    }

    entries.forEach(entry => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:90px 80px 70px 80px 1fr 100px 70px;gap:8px;padding:6px 12px;border-bottom:1px solid var(--border-subtle);font-size:11px;align-items:center;';
      row.dataset.id = entry.id;

      // Highlight based on type
      const typeColors = {
        data: 'var(--accent-cyan)',
        route: 'var(--accent-green)',
        layout: 'var(--accent-purple)',
        sync: 'var(--accent-blue)',
        system: 'var(--text-muted)'
      };

      const statusColors = {
        success: 'var(--accent-green)',
        staged: 'var(--accent-orange)',
        queued: 'var(--accent-yellow)',
        failed: 'var(--accent-red)',
        info: 'var(--text-secondary)'
      };

      row.innerHTML = `
        <div style="color:var(--text-secondary);" title="${new Date(entry.timestamp).toLocaleString()}">${ActivityLog.formatTime(entry.timestamp)}</div>
        <div style="color:var(--text-primary);font-weight:500;" title="Session: ${entry.session}">${entry.device}</div>
        <div style="color:${typeColors[entry.type] || 'var(--text-secondary)'};text-transform:uppercase;font-size:9px;font-weight:600;">${entry.type}</div>
        <div style="color:var(--text-secondary);">${entry.page || '—'}</div>
        <div style="color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${entry.action}">${entry.action}</div>
        <div style="color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;" title="${entry.details}">${entry.details || ''}</div>
        <div style="color:${statusColors[entry.status] || 'var(--text-secondary)'};text-transform:uppercase;font-size:9px;font-weight:600;">${entry.status}</div>
      `;

      logArea.appendChild(row);
    });

    // Auto-scroll to top (newest entries)
    if (autoScroll) {
      logArea.scrollTop = 0;
    }

    // Entry count
    const countEl = document.createElement('div');
    countEl.style.cssText = 'padding:8px 12px;font-size:10px;color:var(--text-muted);border-top:1px solid var(--border);background:var(--bg-tertiary);';
    countEl.textContent = `${entries.length} entries (max ${ActivityLog.MAX_ENTRIES})`;
    container.appendChild(countEl);
  }

  return { render };
})();
