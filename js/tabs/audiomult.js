// AUDIO MULT — DT-12 connections A-F (visual patch panel layout like FIBER TAC)
const AudioMultTab = (() => {
  const panels = ['A', 'B', 'C', 'D', 'E', 'F'];

  function render(container) {
    const page = Utils.tabPage('AUDIO MULT', 'DT-12 audio connections — Click any port to assign. 6 panels (A-F) with 12 channels each.');

    // Initialize data if missing
    panels.forEach(p => {
      const key = `dt${p}`;
      if (!Store.data.audioMult[key]) {
        Store.data.audioMult[key] = Array.from({ length: 12 }, (_, i) => ({ port: i + 1, source: '', dest: '' }));
      }
    });

    // Create grid of panels (2 columns, 3 rows)
    const panelsGrid = document.createElement('div');
    panelsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;';

    panels.forEach(panelName => {
      const key = `dt${panelName}`;
      const panelData = Store.data.audioMult[key];

      const panelDiv = document.createElement('div');
      panelDiv.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

      // Panel header
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = panelName;
      nameSpan.style.cssText = 'font-weight:700;font-size:16px;color:var(--accent-orange);';
      header.appendChild(nameSpan);

      const portCount = panelData.filter(p => p.source || p.dest).length;
      if (portCount > 0) {
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size:10px;color:var(--text-secondary);background:var(--bg-primary);padding:2px 6px;border-radius:10px;';
        badge.textContent = `${portCount} used`;
        header.appendChild(badge);
      }

      panelDiv.appendChild(header);

      // Visual grid of ports (6x2 = 12 ports)
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:4px;';

      panelData.forEach((port, idx) => {
        const cell = document.createElement('div');
        const hasData = port.source || port.dest;
        cell.style.cssText = `
          padding:6px 4px;
          background:${hasData ? 'var(--accent-orange)' : 'var(--bg-primary)'};
          border:1px solid ${hasData ? 'var(--accent-orange)' : 'var(--border)'};
          border-radius:4px;
          cursor:pointer;
          text-align:center;
          min-height:50px;
          transition:all 0.15s;
        `;
        cell.innerHTML = `
          <div style="font-size:9px;font-weight:600;color:${hasData ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'};margin-bottom:2px;">${port.port}</div>
          <div style="font-size:10px;color:${hasData ? '#fff' : 'var(--text-secondary)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${port.source || ''}">${port.source || '—'}</div>
          <div style="font-size:9px;color:${hasData ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${port.dest || ''}">${port.dest || ''}</div>
        `;
        cell.addEventListener('mouseenter', () => {
          cell.style.transform = 'scale(1.05)';
          cell.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        cell.addEventListener('mouseleave', () => {
          cell.style.transform = 'scale(1)';
          cell.style.boxShadow = 'none';
        });
        cell.addEventListener('click', () => openPortEditor(key, idx, port, panelName));
        grid.appendChild(cell);
      });

      panelDiv.appendChild(grid);
      panelsGrid.appendChild(panelDiv);
    });

    page.appendChild(panelsGrid);
    container.appendChild(page);
  }

  function openPortEditor(dataKey, idx, port, panelName) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:400px;max-width:500px;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = `<h3 style="margin:0;color:var(--accent-orange);">${panelName} — Port ${port.port}</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Form
    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    // Source
    const sourceDiv = document.createElement('div');
    sourceDiv.innerHTML = `<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Source</label>`;
    const sourceInput = document.createElement('input');
    sourceInput.type = 'text';
    sourceInput.value = port.source || '';
    sourceInput.placeholder = 'Source...';
    sourceInput.style.cssText = 'width:100%;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    sourceDiv.appendChild(sourceInput);
    form.appendChild(sourceDiv);

    // Destination
    const destDiv = document.createElement('div');
    destDiv.innerHTML = `<label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Destination</label>`;
    const destInput = document.createElement('input');
    destInput.type = 'text';
    destInput.value = port.dest || '';
    destInput.placeholder = 'Destination...';
    destInput.style.cssText = 'width:100%;padding:8px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';
    destDiv.appendChild(destInput);
    form.appendChild(destDiv);

    modal.appendChild(form);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:16px;';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.style.flex = '1';
    saveBtn.addEventListener('click', () => {
      port.source = sourceInput.value.trim();
      port.dest = destInput.value.trim();
      Store.set(`audioMult.${dataKey}.${idx}.source`, port.source);
      Store.set(`audioMult.${dataKey}.${idx}.dest`, port.dest);
      overlay.remove();
      App.renderCurrentTab();
    });
    btnRow.appendChild(saveBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
      port.source = '';
      port.dest = '';
      Store.set(`audioMult.${dataKey}.${idx}.source`, '');
      Store.set(`audioMult.${dataKey}.${idx}.dest`, '');
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

    // Focus source input
    setTimeout(() => sourceInput.focus(), 100);
  }

  return { render };
})();
