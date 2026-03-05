// NETWORK I/O — Network patch areas with visual grid layout
const NetworkIoTab = (() => {
  function render(container) {
    const page = Utils.tabPage('NETWORK I/O', 'Network patch reference — Click any port to edit. I/O and Truck Bench are 24 ports each, Above Tape is ports 13-24.');

    // Initialize data if missing
    if (!Store.data.networkIo.io) {
      Store.data.networkIo.io = Array.from({ length: 24 }, (_, i) => ({ port: i + 1, device: '', notes: '' }));
    }
    if (!Store.data.networkIo.truckBench) {
      Store.data.networkIo.truckBench = Array.from({ length: 24 }, (_, i) => ({ port: i + 1, device: '', notes: '' }));
    }
    if (!Store.data.networkIo.aboveTape) {
      Store.data.networkIo.aboveTape = Array.from({ length: 12 }, (_, i) => ({ port: i + 13, device: '', notes: '' }));
    }

    // Stack all sections vertically for full width
    const patchStack = document.createElement('div');
    patchStack.style.cssText = 'display:flex;flex-direction:column;gap:20px;';

    // I/O Section (24 ports - 2 rows of 12)
    patchStack.appendChild(renderPatchPanel('I/O', 'io', Store.data.networkIo.io, 12));

    // Truck Bench Section (24 ports - 2 rows of 12)
    patchStack.appendChild(renderPatchPanel('TRUCK BENCH', 'truckBench', Store.data.networkIo.truckBench, 12));

    // Above Tape Section (ports 13-24 only - 1 row of 12)
    patchStack.appendChild(renderPatchPanel('ABOVE TAPE', 'aboveTape', Store.data.networkIo.aboveTape, 12));

    page.appendChild(patchStack);

    container.appendChild(page);
  }

  function renderPatchPanel(label, dataKey, data, portsPerRow) {
    const panelDiv = document.createElement('div');
    panelDiv.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

    // Panel header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    labelSpan.style.cssText = 'font-weight:700;font-size:14px;color:var(--accent-blue);';
    header.appendChild(labelSpan);

    const usedCount = data.filter(p => p.device).length;
    if (usedCount > 0) {
      const badge = document.createElement('span');
      badge.style.cssText = 'font-size:10px;color:var(--text-secondary);background:var(--bg-primary);padding:2px 6px;border-radius:10px;';
      badge.textContent = `${usedCount} used`;
      header.appendChild(badge);
    }

    panelDiv.appendChild(header);

    // Visual grid of ports
    const grid = document.createElement('div');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${portsPerRow},1fr);gap:4px;`;

    data.forEach((port, idx) => {
      const cell = document.createElement('div');
      const hasData = port.device;
      cell.style.cssText = `
        padding:6px 4px;
        background:${hasData ? 'var(--accent-green)' : 'var(--bg-primary)'};
        border:1px solid ${hasData ? 'var(--accent-green)' : 'var(--border)'};
        border-radius:4px;
        cursor:pointer;
        text-align:center;
        min-height:50px;
        transition:all 0.15s;
      `;
      cell.innerHTML = `
        <div style="font-size:10px;font-weight:600;color:${hasData ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'};margin-bottom:2px;">${port.port}</div>
        <div style="font-size:10px;color:${hasData ? '#fff' : 'var(--text-secondary)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${port.device || ''}">${port.device || '—'}</div>
        <div style="font-size:9px;color:${hasData ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${port.notes || ''}">${port.notes || ''}</div>
      `;
      cell.addEventListener('mouseenter', () => {
        cell.style.transform = 'scale(1.05)';
        cell.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      });
      cell.addEventListener('mouseleave', () => {
        cell.style.transform = 'scale(1)';
        cell.style.boxShadow = 'none';
      });
      cell.addEventListener('click', () => openPortEditor(dataKey, idx, port));
      grid.appendChild(cell);
    });

    panelDiv.appendChild(grid);
    return panelDiv;
  }

  function openPortEditor(dataKey, idx, port) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:350px;max-width:450px;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = `<h3 style="margin:0;color:var(--accent-green);">Port ${port.port}</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Form fields
    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    // Device
    const deviceDiv = document.createElement('div');
    deviceDiv.innerHTML = `<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Device</label>`;
    const deviceInput = document.createElement('input');
    deviceInput.type = 'text';
    deviceInput.value = port.device || '';
    deviceInput.placeholder = 'Device name...';
    deviceInput.style.cssText = 'width:100%;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    deviceDiv.appendChild(deviceInput);
    form.appendChild(deviceDiv);

    // Notes
    const notesDiv = document.createElement('div');
    notesDiv.innerHTML = `<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Notes</label>`;
    const notesInput = document.createElement('input');
    notesInput.type = 'text';
    notesInput.value = port.notes || '';
    notesInput.placeholder = 'Additional notes...';
    notesInput.style.cssText = 'width:100%;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    notesDiv.appendChild(notesInput);
    form.appendChild(notesDiv);

    modal.appendChild(form);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:16px;';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.style.flex = '1';
    saveBtn.addEventListener('click', () => {
      port.device = deviceInput.value.trim();
      port.notes = notesInput.value.trim();
      Store.set(`networkIo.${dataKey}.${idx}.device`, port.device);
      Store.set(`networkIo.${dataKey}.${idx}.notes`, port.notes);
      overlay.remove();
      App.renderCurrentTab();
    });
    btnRow.appendChild(saveBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
      port.device = '';
      port.notes = '';
      Store.set(`networkIo.${dataKey}.${idx}.device`, '');
      Store.set(`networkIo.${dataKey}.${idx}.notes`, '');
      overlay.remove();
      App.renderCurrentTab();
    });
    btnRow.appendChild(clearBtn);

    modal.appendChild(btnRow);

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);

    // Focus device input
    setTimeout(() => deviceInput.focus(), 100);
  }

  return { render };
})();
