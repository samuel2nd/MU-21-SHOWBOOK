// FIBER TAC Tab — TAC A-H, S09, S10 patch panels (visual layout with easy assignment)
const FiberTacTab = (() => {
  function render(container) {
    const page = Utils.tabPage('FIBER TAC', 'Click any port to assign. Changes sync to CCU/FSY and VIDEO I/O pages.');

    const panels = Store.data.sheet8.tacPanels || ['TAC-A', 'TAC-B', 'TAC-C', 'TAC-D', 'TAC-E', 'TAC-F', 'TAC-G', 'TAC-H', 'S09', 'S10'];

    // Create grid of panels (2 columns)
    const panelsGrid = document.createElement('div');
    panelsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;';

    panels.forEach(panelName => {
      const panelDiv = document.createElement('div');
      panelDiv.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

      // Panel header
      const header = document.createElement('div');
      header.style.cssText = 'font-weight:700;font-size:14px;color:var(--accent-blue);margin-bottom:10px;';
      header.textContent = panelName;
      panelDiv.appendChild(header);

      const panelData = Store.data.fiberTac[panelName];
      if (!panelData) return;

      // Visual grid of ports (6x4 = 24 ports)
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:4px;';

      panelData.forEach((port, idx) => {
        const cell = document.createElement('div');
        const hasData = port.source || port.dest;
        cell.style.cssText = `
          padding:6px 4px;
          background:${hasData ? 'var(--accent-blue)' : 'var(--bg-primary)'};
          border:1px solid ${hasData ? 'var(--accent-blue)' : 'var(--border)'};
          border-radius:4px;
          cursor:pointer;
          text-align:center;
          min-height:45px;
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
        cell.addEventListener('click', () => openPortEditor(panelName, idx, port));
        grid.appendChild(cell);
      });

      panelDiv.appendChild(grid);
      panelsGrid.appendChild(panelDiv);
    });

    page.appendChild(panelsGrid);
    container.appendChild(page);
  }

  function openPortEditor(panelName, idx, port) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:400px;max-width:500px;max-height:80vh;overflow-y:auto;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = `<h3 style="margin:0;color:var(--accent-blue);">${panelName} — Port ${port.port}</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Quick assign section
    const quickSection = document.createElement('div');
    quickSection.style.cssText = 'margin-bottom:16px;';

    // Category tabs
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:4px;margin-bottom:12px;';

    const categories = [
      { id: 'ccu', label: 'CCU', color: 'var(--accent-green)' },
      { id: 'fsy', label: 'FSY', color: 'var(--accent-orange)' },
      { id: 'rtr', label: 'VIDEO I/O', color: 'var(--accent-blue)' },
      { id: 'other', label: 'Other', color: 'var(--text-secondary)' },
    ];

    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'border:1px solid var(--border);border-radius:4px;max-height:200px;overflow-y:auto;';

    let activeTab = 'ccu';

    const renderList = (category) => {
      listContainer.innerHTML = '';
      let items = [];

      if (category === 'ccu') {
        // CCU 1-12 with A/B options
        Store.data.ccuFsy.ccu.forEach(ccu => {
          const showName = Formulas.getSourceNamesForDevice(`CCU ${String(ccu.unit).padStart(2, '0')}`);
          items.push({
            source: `CCU ${String(ccu.unit).padStart(2, '0')}-A`,
            dest: showName,
            syncType: 'ccu',
            unit: ccu.unit,
            fibSide: 'A'
          });
          items.push({
            source: `CCU ${String(ccu.unit).padStart(2, '0')}-B`,
            dest: showName,
            syncType: 'ccu',
            unit: ccu.unit,
            fibSide: 'B'
          });
        });
      } else if (category === 'fsy') {
        // FS 1-67
        Store.data.ccuFsy.fsy.forEach(fs => {
          const showName = Formulas.getSourceNamesForDevice(`FS ${String(fs.unit).padStart(2, '0')}`);
          if (fs.format || showName) { // Only show FSY with format or assigned
            items.push({
              source: `FS ${String(fs.unit).padStart(2, '0')}`,
              dest: showName || fs.format || '',
              syncType: 'fsy',
              unit: fs.unit
            });
          }
        });
        // Also show unassigned slots
        if (items.length === 0) {
          Store.data.ccuFsy.fsy.slice(0, 20).forEach(fs => {
            items.push({
              source: `FS ${String(fs.unit).padStart(2, '0')}`,
              dest: '',
              syncType: 'fsy',
              unit: fs.unit
            });
          });
        }
      } else if (category === 'rtr') {
        // VIDEO I/O Fiber outputs
        Store.data.videoIo.fiberRtrOut.forEach(row => {
          if (row.source) {
            items.push({
              source: `RTR FIB ${row.row}`,
              dest: `${row.source}${row.destination ? ' → ' + row.destination : ''}`,
              syncType: 'rtr',
              rtrRow: row.row
            });
          }
        });
        // Show empty slots too
        if (items.length === 0) {
          Store.data.videoIo.fiberRtrOut.forEach(row => {
            items.push({
              source: `RTR FIB ${row.row}`,
              dest: row.destination || '',
              syncType: 'rtr',
              rtrRow: row.row
            });
          });
        }
      } else {
        // Other - show text input
        const inputDiv = document.createElement('div');
        inputDiv.style.cssText = 'padding:12px;';
        inputDiv.innerHTML = `
          <div style="margin-bottom:8px;">
            <label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Source</label>
            <input type="text" id="other-source" value="${port.source || ''}" style="width:100%;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);">
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Destination / Notes</label>
            <input type="text" id="other-dest" value="${port.dest || ''}" style="width:100%;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);">
          </div>
        `;
        listContainer.appendChild(inputDiv);
        return;
      }

      // Render item list
      items.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;';
        row.innerHTML = `
          <span style="font-weight:500;color:var(--text-primary);">${item.source}</span>
          <span style="color:var(--text-secondary);font-size:12px;">${item.dest || '—'}</span>
        `;
        row.addEventListener('mouseenter', () => row.style.background = 'var(--bg-secondary)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
        row.addEventListener('click', () => {
          // Apply assignment
          applyAssignment(panelName, idx, item);
          overlay.remove();
          App.renderCurrentTab();
        });
        listContainer.appendChild(row);
      });

      if (items.length === 0) {
        listContainer.innerHTML = '<div style="padding:12px;color:var(--text-secondary);text-align:center;">No items available</div>';
      }
    };

    categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.textContent = cat.label;
      tab.style.cssText = `
        padding:6px 12px;
        border:1px solid ${cat.color};
        background:${activeTab === cat.id ? cat.color : 'transparent'};
        color:${activeTab === cat.id ? '#fff' : cat.color};
        border-radius:4px;
        cursor:pointer;
        font-size:12px;
        font-weight:500;
      `;
      tab.addEventListener('click', () => {
        activeTab = cat.id;
        tabs.querySelectorAll('button').forEach(b => {
          const c = categories.find(x => x.label === b.textContent);
          b.style.background = 'transparent';
          b.style.color = c.color;
        });
        tab.style.background = cat.color;
        tab.style.color = '#fff';
        renderList(cat.id);
      });
      tabs.appendChild(tab);
    });

    quickSection.appendChild(tabs);
    quickSection.appendChild(listContainer);
    modal.appendChild(quickSection);

    // Apply Other button
    const applyOtherBtn = document.createElement('button');
    applyOtherBtn.className = 'btn btn-primary';
    applyOtherBtn.textContent = 'Apply';
    applyOtherBtn.style.cssText = 'width:100%;margin-top:12px;display:none;';
    applyOtherBtn.addEventListener('click', () => {
      const source = document.getElementById('other-source')?.value || '';
      const dest = document.getElementById('other-dest')?.value || '';
      applyAssignment(panelName, idx, { source, dest, syncType: 'other' });
      overlay.remove();
      App.renderCurrentTab();
    });
    modal.appendChild(applyOtherBtn);

    // Show/hide apply button based on tab
    const origRenderList = renderList;
    const wrappedRenderList = (cat) => {
      origRenderList(cat);
      applyOtherBtn.style.display = cat === 'other' ? 'block' : 'none';
    };

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary';
    clearBtn.textContent = 'Clear Port';
    clearBtn.style.cssText = 'width:100%;margin-top:8px;';
    clearBtn.addEventListener('click', () => {
      applyAssignment(panelName, idx, { source: '', dest: '', syncType: 'clear' });
      overlay.remove();
      App.renderCurrentTab();
    });
    modal.appendChild(clearBtn);

    // Initial render
    wrappedRenderList('ccu');

    // Update tab click handlers to use wrapped function
    tabs.querySelectorAll('button').forEach((tab, i) => {
      tab.onclick = () => {
        activeTab = categories[i].id;
        tabs.querySelectorAll('button').forEach((b, j) => {
          b.style.background = i === j ? categories[j].color : 'transparent';
          b.style.color = i === j ? '#fff' : categories[j].color;
        });
        wrappedRenderList(categories[i].id);
      };
    });

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }

  function applyAssignment(panelName, idx, item) {
    const panelData = Store.data.fiberTac[panelName];
    if (!panelData) return;

    // Update FIBER TAC
    panelData[idx].source = item.source;
    panelData[idx].dest = item.dest;
    Store.set(`fiberTac.${panelName}.${idx}.source`, item.source);
    Store.set(`fiberTac.${panelName}.${idx}.dest`, item.dest);

    // Sync back to source pages
    const strand = String(idx + 1);

    if (item.syncType === 'ccu') {
      const ccuIdx = item.unit - 1;
      const ccu = Store.data.ccuFsy.ccu[ccuIdx];
      if (ccu) {
        ccu.tac = panelName;
        Store.set(`ccuFsy.ccu.${ccuIdx}.tac`, panelName);
        if (item.fibSide === 'A') {
          ccu.fibA = strand;
          Store.set(`ccuFsy.ccu.${ccuIdx}.fibA`, strand);
        } else {
          ccu.fibB = strand;
          Store.set(`ccuFsy.ccu.${ccuIdx}.fibB`, strand);
        }
      }
    } else if (item.syncType === 'fsy') {
      const fsyIdx = item.unit - 1;
      const fsy = Store.data.ccuFsy.fsy[fsyIdx];
      if (fsy) {
        fsy.tac = panelName;
        fsy.fibA = strand;
        Store.set(`ccuFsy.fsy.${fsyIdx}.tac`, panelName);
        Store.set(`ccuFsy.fsy.${fsyIdx}.fibA`, strand);
      }
    } else if (item.syncType === 'rtr') {
      const rtrIdx = item.rtrRow - 1;
      const rtr = Store.data.videoIo.fiberRtrOut[rtrIdx];
      if (rtr) {
        rtr.tac = panelName;
        rtr.fibA = strand;
        Store.set(`videoIo.fiberRtrOut.${rtrIdx}.tac`, panelName);
        Store.set(`videoIo.fiberRtrOut.${rtrIdx}.fibA`, strand);
      }
    }
  }

  return { render };
})();
