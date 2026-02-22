// COAX MULTS Tab — 8 Mult units with 15 outputs each (visual layout like FIBER TAC)
const CoaxTab = (() => {
  const NUM_MULTS = 8;
  const OUTPUTS_PER_MULT = 15;

  function render(container) {
    const page = Utils.tabPage('COAX MULTS', 'Click any output to assign. Changes sync to FSY and VIDEO I/O pages.');

    // Initialize coax data structure if needed
    if (!Store.data.coax.multUnits) {
      Store.data.coax.multUnits = Array.from({ length: NUM_MULTS }, (_, i) => ({
        mult: i + 1,
        name: `MULT ${i + 1}`,
        source: '',
        outputs: Array.from({ length: OUTPUTS_PER_MULT }, (_, j) => ({
          output: j + 1,
          dest: '',
          notes: ''
        }))
      }));
    }

    // Create grid of mult units (2 columns)
    const multsGrid = document.createElement('div');
    multsGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:20px;';

    for (let m = 0; m < NUM_MULTS; m++) {
      const multData = Store.data.coax.multUnits[m] || {
        mult: m + 1,
        source: '',
        outputs: Array.from({ length: OUTPUTS_PER_MULT }, (_, j) => ({ output: j + 1, dest: '', notes: '' }))
      };

      const multDiv = document.createElement('div');
      multDiv.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;padding:12px;';

      // Mult header with editable name and source selector
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = multData.name || `MULT ${m + 1}`;
      nameInput.style.cssText = 'font-weight:700;font-size:14px;color:var(--accent-orange);background:transparent;border:1px solid transparent;border-radius:4px;padding:2px 6px;width:80px;';
      nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = 'var(--accent-orange)';
        nameInput.style.background = 'var(--bg-primary)';
      });
      nameInput.addEventListener('blur', () => {
        nameInput.style.borderColor = 'transparent';
        nameInput.style.background = 'transparent';
      });
      nameInput.addEventListener('change', () => {
        ensureMultData(m);
        Store.data.coax.multUnits[m].name = nameInput.value.trim() || `MULT ${m + 1}`;
        Store.set(`coax.multUnits.${m}.name`, Store.data.coax.multUnits[m].name);
        Utils.toast(`Renamed to "${nameInput.value}"`, 'success');
      });
      header.appendChild(nameInput);

      // Source input for mult
      const sourceInput = document.createElement('input');
      sourceInput.type = 'text';
      sourceInput.value = multData.source || '';
      sourceInput.placeholder = 'Source...';
      sourceInput.style.cssText = 'flex:1;padding:4px 8px;font-size:12px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);';

      const srcDlId = `mult-src-${m}`;
      sourceInput.setAttribute('list', srcDlId);
      const srcDl = document.createElement('datalist');
      srcDl.id = srcDlId;
      Utils.getDeviceOptions().forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.value;
        srcDl.appendChild(opt);
      });

      sourceInput.addEventListener('change', () => {
        multData.source = sourceInput.value;
        ensureMultData(m);
        Store.set(`coax.multUnits.${m}.source`, sourceInput.value);
      });

      header.appendChild(sourceInput);
      header.appendChild(srcDl);
      multDiv.appendChild(header);

      // Visual grid of outputs (5x3 = 15 outputs)
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:4px;';

      for (let o = 0; o < OUTPUTS_PER_MULT; o++) {
        const output = multData.outputs[o] || { output: o + 1, dest: '', notes: '' };
        const hasData = output.dest;

        const cell = document.createElement('div');
        cell.style.cssText = `
          padding:6px 4px;
          background:${hasData ? 'var(--accent-orange)' : 'var(--bg-primary)'};
          border:1px solid ${hasData ? 'var(--accent-orange)' : 'var(--border)'};
          border-radius:4px;
          cursor:pointer;
          text-align:center;
          min-height:40px;
          transition:all 0.15s;
        `;
        cell.innerHTML = `
          <div style="font-size:9px;font-weight:600;color:${hasData ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'};margin-bottom:2px;">${o + 1}</div>
          <div style="font-size:10px;color:${hasData ? '#fff' : 'var(--text-secondary)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${output.dest || ''}">${output.dest || '—'}</div>
        `;
        cell.addEventListener('mouseenter', () => {
          cell.style.transform = 'scale(1.05)';
          cell.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });
        cell.addEventListener('mouseleave', () => {
          cell.style.transform = 'scale(1)';
          cell.style.boxShadow = 'none';
        });
        cell.addEventListener('click', () => openOutputEditor(m, o, multData, output));
        grid.appendChild(cell);
      }

      multDiv.appendChild(grid);
      multsGrid.appendChild(multDiv);
    }

    page.appendChild(multsGrid);
    container.appendChild(page);
  }

  function ensureMultData(multIdx) {
    if (!Store.data.coax.multUnits) {
      Store.data.coax.multUnits = Array.from({ length: NUM_MULTS }, (_, i) => ({
        mult: i + 1,
        name: `MULT ${i + 1}`,
        source: '',
        outputs: Array.from({ length: OUTPUTS_PER_MULT }, (_, j) => ({ output: j + 1, dest: '', notes: '' }))
      }));
    }
    if (!Store.data.coax.multUnits[multIdx]) {
      Store.data.coax.multUnits[multIdx] = {
        mult: multIdx + 1,
        name: `MULT ${multIdx + 1}`,
        source: '',
        outputs: Array.from({ length: OUTPUTS_PER_MULT }, (_, j) => ({ output: j + 1, dest: '', notes: '' }))
      };
    }
  }

  function openOutputEditor(multIdx, outputIdx, multData, output) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:400px;max-width:500px;max-height:80vh;overflow-y:auto;';

    // Header
    const multName = multData.name || `MULT ${multIdx + 1}`;
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = `<h3 style="margin:0;color:var(--accent-orange);">${multName} — Output ${outputIdx + 1}</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Show current mult source
    if (multData.source) {
      const sourceInfo = document.createElement('div');
      sourceInfo.style.cssText = 'padding:8px 12px;background:var(--bg-secondary);border-radius:4px;margin-bottom:12px;font-size:12px;';
      sourceInfo.innerHTML = `<span style="color:var(--text-secondary);">Mult Source:</span> <strong>${multData.source}</strong>`;
      modal.appendChild(sourceInfo);
    }

    // Quick assign section
    const quickSection = document.createElement('div');
    quickSection.style.cssText = 'margin-bottom:16px;';

    // Category tabs
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:4px;margin-bottom:12px;';

    const categories = [
      { id: 'fsy', label: 'FSY', color: 'var(--accent-orange)' },
      { id: 'rtr', label: 'VIDEO I/O', color: 'var(--accent-blue)' },
      { id: 'other', label: 'Other', color: 'var(--text-secondary)' },
    ];

    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'border:1px solid var(--border);border-radius:4px;max-height:200px;overflow-y:auto;';

    let activeTab = 'fsy';

    const renderList = (category) => {
      listContainer.innerHTML = '';
      let items = [];

      if (category === 'fsy') {
        // FS 1-67
        Store.data.ccuFsy.fsy.forEach(fs => {
          const showName = Formulas.getSourceNamesForDevice(`FS ${String(fs.unit).padStart(2, '0')}`);
          if (fs.format || showName) {
            items.push({
              dest: `FS ${String(fs.unit).padStart(2, '0')}${showName ? ': ' + showName : ''}`,
              syncType: 'fsy',
              unit: fs.unit
            });
          }
        });
        if (items.length === 0) {
          Store.data.ccuFsy.fsy.slice(0, 20).forEach(fs => {
            items.push({
              dest: `FS ${String(fs.unit).padStart(2, '0')}`,
              syncType: 'fsy',
              unit: fs.unit
            });
          });
        }
      } else if (category === 'rtr') {
        // VIDEO I/O Coax outputs
        Store.data.videoIo.coaxRtrOut.forEach(row => {
          items.push({
            dest: `RTR COAX ${row.row}${row.source ? ': ' + row.source : ''}`,
            syncType: 'rtr',
            rtrRow: row.row
          });
        });
        // Also tie lines
        Store.data.videoIo.coaxIoTieLines.forEach(row => {
          if (row.source) {
            items.push({
              dest: `TIE ${row.row}: ${row.source}`,
              syncType: 'tie',
              rtrRow: row.row
            });
          }
        });
      } else {
        // Other - show text input
        const inputDiv = document.createElement('div');
        inputDiv.style.cssText = 'padding:12px;';
        inputDiv.innerHTML = `
          <div>
            <label style="display:block;font-size:11px;color:var(--text-secondary);margin-bottom:4px;">Destination</label>
            <input type="text" id="other-dest" value="${output.dest || ''}" style="width:100%;padding:6px 10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);">
          </div>
        `;
        listContainer.appendChild(inputDiv);
        return;
      }

      // Render item list
      items.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--border);cursor:pointer;';
        row.innerHTML = `<span style="color:var(--text-primary);">${item.dest}</span>`;
        row.addEventListener('mouseenter', () => row.style.background = 'var(--bg-secondary)');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');
        row.addEventListener('click', () => {
          applyOutputAssignment(multIdx, outputIdx, item);
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
        applyOtherBtn.style.display = cat.id === 'other' ? 'block' : 'none';
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
      const dest = document.getElementById('other-dest')?.value || '';
      applyOutputAssignment(multIdx, outputIdx, { dest, syncType: 'other' });
      overlay.remove();
      App.renderCurrentTab();
    });
    modal.appendChild(applyOtherBtn);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary';
    clearBtn.textContent = 'Clear Output';
    clearBtn.style.cssText = 'width:100%;margin-top:8px;';
    clearBtn.addEventListener('click', () => {
      applyOutputAssignment(multIdx, outputIdx, { dest: '', syncType: 'clear' });
      overlay.remove();
      App.renderCurrentTab();
    });
    modal.appendChild(clearBtn);

    // Initial render
    renderList('fsy');

    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }

  function applyOutputAssignment(multIdx, outputIdx, item) {
    ensureMultData(multIdx);

    const multData = Store.data.coax.multUnits[multIdx];
    if (!multData.outputs[outputIdx]) {
      multData.outputs[outputIdx] = { output: outputIdx + 1, dest: '', notes: '' };
    }

    multData.outputs[outputIdx].dest = item.dest;
    Store.set(`coax.multUnits.${multIdx}.outputs.${outputIdx}.dest`, item.dest);

    // Sync back to source pages
    if (item.syncType === 'fsy') {
      const fsyIdx = item.unit - 1;
      const fsy = Store.data.ccuFsy.fsy[fsyIdx];
      if (fsy) {
        fsy.mult = String(multIdx + 1);
        fsy.coax = String(outputIdx + 1);
        Store.set(`ccuFsy.fsy.${fsyIdx}.mult`, String(multIdx + 1));
        Store.set(`ccuFsy.fsy.${fsyIdx}.coax`, String(outputIdx + 1));
      }
    } else if (item.syncType === 'rtr') {
      const rtrIdx = item.rtrRow - 1;
      const rtr = Store.data.videoIo.coaxRtrOut[rtrIdx];
      if (rtr) {
        rtr.mult = String(multIdx + 1);
        rtr.coax = String(outputIdx + 1);
        Store.set(`videoIo.coaxRtrOut.${rtrIdx}.mult`, String(multIdx + 1));
        Store.set(`videoIo.coaxRtrOut.${rtrIdx}.coax`, String(outputIdx + 1));
      }
    } else if (item.syncType === 'tie') {
      const tieIdx = item.rtrRow - 1;
      const tie = Store.data.videoIo.coaxIoTieLines[tieIdx];
      if (tie) {
        tie.mult = String(multIdx + 1);
        tie.coax = String(outputIdx + 1);
        Store.set(`videoIo.coaxIoTieLines.${tieIdx}.mult`, String(multIdx + 1));
        Store.set(`videoIo.coaxIoTieLines.${tieIdx}.coax`, String(outputIdx + 1));
      }
    }
  }

  return { render };
})();
