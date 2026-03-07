// FIBER TAC Tab — TAC A-H, S09, S10 patch panels (visual layout with easy assignment)
const FiberTacTab = (() => {
  function render(container) {
    const page = Utils.tabPage('FIBER TAC', 'Click any port to assign. Changes sync to CCU/FSY and VIDEO I/O pages.');

    // TAC count control
    const controlBar = document.createElement('div');
    controlBar.style.cssText = 'display:flex;align-items:center;gap:16px;margin-bottom:16px;padding:12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;';

    // Current count display
    const panels = Store.data.sheet8.tacPanels || ['TAC-A', 'TAC-B', 'TAC-C', 'TAC-D', 'TAC-E', 'TAC-F', 'TAC-G', 'TAC-H', 'S09', 'S10'];
    const countLabel = document.createElement('span');
    countLabel.style.cssText = 'font-size:12px;color:var(--text-secondary);';
    countLabel.textContent = `${panels.length} TAC Panels`;
    controlBar.appendChild(countLabel);

    // Add TAC button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.style.cssText = 'font-size:11px;padding:6px 12px;';
    addBtn.textContent = '+ Add TAC Panel';
    addBtn.addEventListener('click', () => openAddTacModal());
    controlBar.appendChild(addBtn);

    // Quick add presets
    const presetLabel = document.createElement('span');
    presetLabel.style.cssText = 'font-size:11px;color:var(--text-muted);margin-left:auto;';
    presetLabel.textContent = 'Quick add:';
    controlBar.appendChild(presetLabel);

    // Preset buttons for common naming patterns
    const presets = [
      { label: 'TAC-I', name: 'TAC-I' },
      { label: 'TAC-J', name: 'TAC-J' },
      { label: 'S11', name: 'S11' },
      { label: 'S12', name: 'S12' },
    ];

    presets.forEach(preset => {
      // Only show if not already exists
      if (!panels.includes(preset.name)) {
        const presetBtn = document.createElement('button');
        presetBtn.className = 'btn btn-secondary';
        presetBtn.style.cssText = 'font-size:10px;padding:4px 8px;';
        presetBtn.textContent = preset.label;
        presetBtn.addEventListener('click', () => {
          addTacPanel(preset.name);
        });
        controlBar.appendChild(presetBtn);
      }
    });

    page.appendChild(controlBar);

    // Create grid of panels (2 columns)
    const panelsGrid = document.createElement('div');
    panelsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;';

    panels.forEach((panelName, panelIdx) => {
      const panelData = Store.data.fiberTac[panelName];
      if (!panelData) return;

      const panelDiv = document.createElement('div');
      panelDiv.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

      // Panel header with editable name
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = panelName;
      nameInput.style.cssText = 'font-weight:700;font-size:14px;color:var(--accent-blue);background:transparent;border:1px solid transparent;border-radius:4px;padding:2px 6px;width:80px;cursor:pointer;';
      nameInput.title = 'Click to rename';
      nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = 'var(--accent-blue)';
        nameInput.style.background = 'var(--bg-primary)';
        nameInput.style.cursor = 'text';
      });
      nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'transparent';
        nameInput.style.background = 'transparent';
        nameInput.style.cursor = 'pointer';
        // Trigger rename on blur if changed
        const oldName = panelName;
        const newName = nameInput.value.trim() || oldName;
        if (newName !== oldName) {
          renameTacPanel(oldName, newName, panelIdx);
        }
      });
      header.appendChild(nameInput);

      const portCount = panelData.filter(p => p.source).length;
      if (portCount > 0) {
        const badge = document.createElement('span');
        badge.style.cssText = 'font-size:10px;color:var(--text-secondary);background:var(--bg-primary);padding:2px 6px;border-radius:10px;';
        badge.textContent = `${portCount} used`;
        header.appendChild(badge);
      }

      // Delete panel button (only show if panel has no assignments)
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.title = portCount > 0 ? 'Clear all ports before deleting' : 'Delete this TAC panel';
      deleteBtn.style.cssText = `
        margin-left:auto;
        background:none;
        border:none;
        color:${portCount > 0 ? 'var(--text-muted)' : 'var(--error)'};
        font-size:16px;
        cursor:${portCount > 0 ? 'not-allowed' : 'pointer'};
        opacity:${portCount > 0 ? '0.3' : '0.6'};
        padding:0 4px;
      `;
      if (portCount === 0) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete TAC panel "${panelName}"? This cannot be undone.`)) {
            deleteTacPanel(panelName, panelIdx);
          }
        });
        deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0.6');
      }
      header.appendChild(deleteBtn);

      panelDiv.appendChild(header);

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
            <input type="text" id="other-source" value="${port.source || ''}" style="width:100%;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);">
          </div>
          <div>
            <label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Destination / Notes</label>
            <input type="text" id="other-dest" value="${port.dest || ''}" style="width:100%;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);">
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

  function renameTacPanel(oldName, newName, panelIdx) {
    // Update sheet8.tacPanels array
    const panels = Store.data.sheet8.tacPanels || [];
    if (panelIdx !== undefined && panelIdx < panels.length) {
      panels[panelIdx] = newName;
    } else {
      const idx = panels.indexOf(oldName);
      if (idx !== -1) {
        panels[idx] = newName;
      }
    }
    Store.set('sheet8.tacPanels', [...panels]);

    // Move fiberTac data to new key
    if (Store.data.fiberTac[oldName]) {
      const data = Store.data.fiberTac[oldName];
      delete Store.data.fiberTac[oldName];
      Store.data.fiberTac[newName] = data;
    }

    // Update references in CCU/FSY
    Store.data.ccuFsy.ccu.forEach((ccu, i) => {
      if (ccu.tac === oldName) {
        ccu.tac = newName;
        Store.set(`ccuFsy.ccu.${i}.tac`, newName);
      }
    });
    Store.data.ccuFsy.fsy.forEach((fsy, i) => {
      if (fsy.tac === oldName) {
        fsy.tac = newName;
        Store.set(`ccuFsy.fsy.${i}.tac`, newName);
      }
    });

    // Update references in VIDEO I/O
    Store.data.videoIo.fiberRtrOut.forEach((row, i) => {
      if (row.tac === oldName) {
        row.tac = newName;
        Store.set(`videoIo.fiberRtrOut.${i}.tac`, newName);
      }
    });

    Utils.toast(`Renamed "${oldName}" to "${newName}"`, 'success');
    App.renderCurrentTab();
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

  function openAddTacModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:350px;';

    modal.innerHTML = `
      <h3 style="margin:0 0 16px 0;color:var(--accent-blue);">Add TAC Panel</h3>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Panel Name</label>
        <input type="text" id="new-tac-name" placeholder="e.g. TAC-K, S13, TRUCK-1" style="width:100%;padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-size:14px;">
      </div>
      <div style="display:flex;gap:8px;">
        <button id="add-tac-cancel" class="btn btn-secondary" style="flex:1;">Cancel</button>
        <button id="add-tac-confirm" class="btn btn-primary" style="flex:1;">Add Panel</button>
      </div>
    `;

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);

    const nameInput = document.getElementById('new-tac-name');
    nameInput.focus();

    document.getElementById('add-tac-cancel').addEventListener('click', () => overlay.remove());
    document.getElementById('add-tac-confirm').addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        Utils.toast('Please enter a panel name', 'error');
        return;
      }
      const panels = Store.data.sheet8.tacPanels || [];
      if (panels.includes(name)) {
        Utils.toast('A panel with this name already exists', 'error');
        return;
      }
      addTacPanel(name);
      overlay.remove();
    });

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('add-tac-confirm').click();
      } else if (e.key === 'Escape') {
        overlay.remove();
      }
    });
  }

  function addTacPanel(name) {
    // Add to tacPanels array
    const panels = Store.data.sheet8.tacPanels || [];
    panels.push(name);
    Store.set('sheet8.tacPanels', [...panels]);

    // Initialize fiberTac data for the new panel (24 ports)
    Store.data.fiberTac[name] = Array.from({ length: 24 }, (_, i) => ({
      port: i + 1,
      source: '',
      dest: '',
      notes: ''
    }));

    Utils.toast(`Added TAC panel "${name}"`, 'success');
    App.renderCurrentTab();
  }

  function deleteTacPanel(name, panelIdx) {
    // Remove from tacPanels array
    const panels = Store.data.sheet8.tacPanels || [];
    const idx = panelIdx !== undefined ? panelIdx : panels.indexOf(name);
    if (idx !== -1) {
      panels.splice(idx, 1);
      Store.set('sheet8.tacPanels', [...panels]);
    }

    // Remove fiberTac data
    if (Store.data.fiberTac[name]) {
      delete Store.data.fiberTac[name];
    }

    // Clear any references in CCU/FSY
    Store.data.ccuFsy.ccu.forEach((ccu, i) => {
      if (ccu.tac === name) {
        ccu.tac = '';
        Store.set(`ccuFsy.ccu.${i}.tac`, '');
      }
    });
    Store.data.ccuFsy.fsy.forEach((fsy, i) => {
      if (fsy.tac === name) {
        fsy.tac = '';
        Store.set(`ccuFsy.fsy.${i}.tac`, '');
      }
    });

    // Clear any references in VIDEO I/O
    Store.data.videoIo.fiberRtrOut.forEach((row, i) => {
      if (row.tac === name) {
        row.tac = '';
        Store.set(`videoIo.fiberRtrOut.${i}.tac`, '');
      }
    });

    Utils.toast(`Deleted TAC panel "${name}"`, 'success');
    App.renderCurrentTab();
  }

  return { render };
})();
