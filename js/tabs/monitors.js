// Monitor Walls — P2-P3, EVS, AUD (using same MV system as PROD Digital)
const MonitorsTab = (() => {

  // Reference to shared LAYOUTS from ProdDigitalTab
  const LAYOUTS = {
    '9_SPLIT': {
      name: '9 SPLIT',
      positions: 9,
      template: '"p1 p2 p3" "p4 p5 p6" "p7 p8 p9"',
      colSizes: '1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' }, { pos: 9, area: 'p9' },
      ],
    },
    '9_SPLIT_R': {
      name: '9 SPLIT R',
      positions: 9,
      template: '"p1 p2 p3 p4 p5 p6" "p7 p9 p9 p9 p9 p9" "p8 p9 p9 p9 p9 p9"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' },
        { pos: 9, area: 'p9', vip: true },
      ],
    },
    '9_SPLIT_L': {
      name: '9 SPLIT L',
      positions: 9,
      template: '"p1 p2 p3 p4 p5 p6" "p9 p9 p9 p9 p9 p7" "p9 p9 p9 p9 p9 p8"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
        { pos: 7, area: 'p7' }, { pos: 8, area: 'p8' },
        { pos: 9, area: 'p9', vip: true },
      ],
    },
    '4_SPLIT': {
      name: '4 SPLIT',
      positions: 4,
      template: '"p1 p2" "p3 p4"',
      colSizes: '1fr 1fr',
      rowSizes: '1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' },
        { pos: 3, area: 'p3' }, { pos: 4, area: 'p4' },
      ],
    },
    'FULL_SCREEN': {
      name: 'FULL SCREEN',
      positions: 1,
      template: '"p1"',
      colSizes: '1fr',
      rowSizes: '1fr',
      cells: [{ pos: 1, area: 'p1', vip: true }],
    },
  };

  // Wall configurations
  const WALL_CONFIGS = {
    'p2p3': {
      title: 'MU-21 P2-P3 MONITOR WALL',
      monitors: [
        // P2 Row
        { id: 'p2-mon1', label: 'P2 MON1', defaultMv: '18-1', defaultLayout: '9_SPLIT', row: 1 },
        { id: 'p2-mon3', label: 'P2 MON3', defaultMv: '19-1', defaultLayout: '9_SPLIT', row: 1 },
        { id: 'p2-gfx', label: 'P2 GRAPHICS', defaultMv: null, directSource: true, row: 1 },
        // P3 Row
        { id: 'p3-mon1', label: 'P3 MON1', defaultMv: '20-1', defaultLayout: '9_SPLIT', row: 2 },
        { id: 'p3-mon2', label: 'P3 MON2', defaultMv: null, directSource: true, row: 2 },
        { id: 'p3-mon3', label: 'P3 MON3', defaultMv: '21-1', defaultLayout: '9_SPLIT', row: 2 },
      ],
      gridTemplate: `
        "p2mon1 p2mon3 p2gfx"
        "p3mon1 p3mon2 p3mon3"
      `,
      gridCols: '1fr 1fr 1fr',
      gridRows: '1fr 1fr',
    },
    'evs': {
      title: 'MU-21 EVS MONITOR WALL',
      monitors: [
        // FEVS Row (MV displays)
        { id: 'fevs-mon1', label: 'FEVS MON1', defaultMv: '10-1', defaultLayout: '9_SPLIT_L', row: 1 },
        { id: 'fevs-mon2', label: 'FEVS MON2', defaultMv: '11-1', defaultLayout: '9_SPLIT', row: 1 },
        { id: 'fevs-mon3', label: 'FEVS MON3', defaultMv: '12-1', defaultLayout: '9_SPLIT_R', row: 1 },
        // REVS Row (Full screen)
        { id: 'revs-mon1', label: 'REVS MON1', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon2', label: 'REVS MON2', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon3', label: 'REVS MON3', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon4', label: 'REVS MON4', defaultMv: null, directSource: true, row: 2 },
      ],
      gridTemplate: `
        "fevs1 fevs2 fevs3"
        "revs1 revs2 revs3 revs4"
      `,
      gridCols: '1fr 1fr 1fr',
      gridRows: '2fr 1fr',
    },
    'aud': {
      title: 'MU-21 AUDIO MONITOR WALL',
      monitors: [
        { id: 'aud-mv1', label: 'AUD MV 1', defaultMv: '16-1', defaultLayout: '9_SPLIT', row: 1 },
        { id: 'aud-mv2', label: 'AUD MV 2', defaultMv: '17-1', defaultLayout: '9_SPLIT', row: 1 },
      ],
      gridTemplate: '"aud1 aud2"',
      gridCols: '1fr 1fr',
      gridRows: '1fr',
    },
  };

  // Ensure prodDigital data exists (initialize if needed)
  function ensureProdDigitalData() {
    if (!Store.data.prodDigital) {
      // Initialize from ProdDigitalTab if available, otherwise create basic structure
      if (typeof ProdDigitalTab !== 'undefined' && ProdDigitalTab.getDefaultProdDigitalData) {
        Store.data.prodDigital = ProdDigitalTab.getDefaultProdDigitalData();
        Store.save();
      }
    }
  }

  // Get all source options
  function getAllSourceOptions() {
    const sources = [];
    const rtrMaster = (Store.data && Store.data.rtrMaster) ? Store.data.rtrMaster : [];
    if (Array.isArray(rtrMaster)) {
      rtrMaster.forEach(device => {
        if (device && device.deviceName) {
          sources.push({ value: device.deviceName, label: device.deviceName });
        }
      });
    }
    return sources;
  }

  // Initialize wall data if needed
  function initWallData(wallKey) {
    const config = WALL_CONFIGS[wallKey];
    if (!config) return;

    if (!Store.data.monitorWallsV2) {
      Store.data.monitorWallsV2 = {};
    }

    if (!Store.data.monitorWallsV2[wallKey]) {
      Store.data.monitorWallsV2[wallKey] = {
        monitors: config.monitors.map(mon => ({
          id: mon.id,
          label: mon.label,
          assignmentType: mon.directSource ? 'source' : 'mv',
          mvId: mon.defaultMv,
          directSource: '',
          layout: mon.defaultLayout || null,
        })),
      };

      // Apply default layouts to the actual MV data in prodDigital.multiviewers
      config.monitors.forEach(mon => {
        if (mon.defaultMv && mon.defaultLayout) {
          const mvIdx = getMvIndex(mon.defaultMv);
          if (mvIdx >= 0 && Store.data.prodDigital && Store.data.prodDigital.multiviewers[mvIdx]) {
            // Only set if layout is not already set or is null
            if (!Store.data.prodDigital.multiviewers[mvIdx].layout) {
              Store.data.prodDigital.multiviewers[mvIdx].layout = mon.defaultLayout;
            }
          }
        }
      });

      Store.save();
    }
  }

  // Get MV data from prodDigital's multiviewers
  function getMvData(mvId) {
    if (!mvId || !Store.data.prodDigital || !Store.data.prodDigital.multiviewers) return null;
    return Store.data.prodDigital.multiviewers.find(m => m.id === mvId);
  }

  // Get MV index
  function getMvIndex(mvId) {
    if (!mvId || !Store.data.prodDigital || !Store.data.prodDigital.multiviewers) return -1;
    return Store.data.prodDigital.multiviewers.findIndex(m => m.id === mvId);
  }

  // Ensure default layouts are applied to MVs (runs on every render)
  function ensureDefaultLayouts(wallKey) {
    const config = WALL_CONFIGS[wallKey];
    if (!config) return;

    config.monitors.forEach(mon => {
      if (mon.defaultMv && mon.defaultLayout) {
        const mvIdx = getMvIndex(mon.defaultMv);
        if (mvIdx >= 0 && Store.data.prodDigital && Store.data.prodDigital.multiviewers[mvIdx]) {
          const mv = Store.data.prodDigital.multiviewers[mvIdx];
          // Apply default if layout is missing or null
          if (!mv.layout) {
            mv.layout = mon.defaultLayout;
            Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, mon.defaultLayout);
          }
        }
      }
    });
  }

  function render(container, wallKey) {
    const config = WALL_CONFIGS[wallKey];
    if (!config) {
      container.innerHTML = '<div class="tab-page"><p>Unknown wall type</p></div>';
      return;
    }

    // Ensure prodDigital data exists before accessing MVs
    ensureProdDigitalData();
    initWallData(wallKey);
    ensureDefaultLayouts(wallKey);

    const page = document.createElement('div');
    page.className = 'tab-page';
    page.style.padding = '0';

    // Monitor Wall Visual
    page.appendChild(Utils.sectionHeader(config.title));
    page.appendChild(renderMonitorWall(wallKey, config));

    // Draggable Sources
    page.appendChild(Utils.sectionHeader('DRAG SOURCES TO ASSIGN'));
    page.appendChild(renderDraggableSources());

    container.appendChild(page);
  }

  function renderMonitorWall(wallKey, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
    `;

    const wallData = Store.data.monitorWallsV2[wallKey];

    // Create grid based on wall type
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      gap: 8px;
    `;

    if (wallKey === 'aud') {
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.gridTemplateRows = '250px';
    } else if (wallKey === 'evs') {
      // 12-column grid: FEVS monitors span 4 each (3x4=12), REVS monitors span 3 each (4x3=12)
      grid.style.gridTemplateColumns = 'repeat(12, 1fr)';
      grid.style.gridTemplateRows = '220px 90px';
      grid.style.gridTemplateAreas = `
        "fevs1 fevs1 fevs1 fevs1 fevs2 fevs2 fevs2 fevs2 fevs3 fevs3 fevs3 fevs3"
        "revs1 revs1 revs1 revs2 revs2 revs2 revs3 revs3 revs3 revs4 revs4 revs4"
      `;
    } else if (wallKey === 'p2p3') {
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      grid.style.gridTemplateRows = '180px 180px';
      grid.style.gridTemplateAreas = `
        "p2mon1 p2mon3 p2gfx"
        "p3mon1 p3mon2 p3mon3"
      `;
    }

    // Render each monitor
    config.monitors.forEach((monConfig, idx) => {
      const monData = wallData.monitors[idx];
      if (!monData) return;

      const display = renderMonitorDisplay(wallKey, monConfig, monData, idx);

      // Set grid area based on wall type
      if (wallKey === 'evs') {
        const areaMap = {
          'fevs-mon1': 'fevs1',
          'fevs-mon2': 'fevs2',
          'fevs-mon3': 'fevs3',
          'revs-mon1': 'revs1',
          'revs-mon2': 'revs2',
          'revs-mon3': 'revs3',
          'revs-mon4': 'revs4',
        };
        if (areaMap[monConfig.id]) {
          display.style.gridArea = areaMap[monConfig.id];
        }
      } else if (wallKey === 'p2p3') {
        const areaMap = {
          'p2-mon1': 'p2mon1',
          'p2-mon3': 'p2mon3',
          'p2-gfx': 'p2gfx',
          'p3-mon1': 'p3mon1',
          'p3-mon2': 'p3mon2',
          'p3-mon3': 'p3mon3',
        };
        if (areaMap[monConfig.id]) {
          display.style.gridArea = areaMap[monConfig.id];
        }
      }

      grid.appendChild(display);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  function renderMonitorDisplay(wallKey, monConfig, monData, idx) {
    const display = document.createElement('div');
    display.style.cssText = `
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 4px;
      padding: 6px;
      display: flex;
      flex-direction: column;
    `;

    // Find MV data
    let mv = null;
    let mvIdx = -1;
    if (monData.assignmentType === 'mv' && monData.mvId) {
      mv = getMvData(monData.mvId);
      mvIdx = getMvIndex(monData.mvId);
    } else if (monData.assignmentType === 'source' && monData.directSource) {
      const mvMatch = monData.directSource.match(/^(?:MV\s*)?(\d+-\d+)$/i);
      if (mvMatch) {
        mv = getMvData(mvMatch[1]);
        mvIdx = getMvIndex(mvMatch[1]);
      }
    }

    const layout = mv && mv.layout ? LAYOUTS[mv.layout] : null;
    const isDirectSource = monData.assignmentType === 'source' && !mv;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:wrap;';

    const label = document.createElement('span');
    label.style.cssText = 'font-size:10px;font-weight:700;color:var(--accent-blue);';
    label.textContent = monConfig.label;
    header.appendChild(label);

    // MV/Source selector button
    const selectBtn = document.createElement('button');
    selectBtn.style.cssText = `
      flex: 1;
      min-width: 50px;
      padding: 2px 4px;
      font-size: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--text-primary);
      cursor: pointer;
      text-align: left;
    `;
    let displayText = '--';
    if (monData.assignmentType === 'mv' && monData.mvId) {
      displayText = `MV${monData.mvId}`;
    } else if (monData.assignmentType === 'source' && monData.directSource) {
      displayText = monData.directSource;
    }
    selectBtn.textContent = displayText;
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPicker(selectBtn, monData, (val) => {
        if (val.startsWith('SRC:')) {
          monData.assignmentType = 'source';
          monData.directSource = val.replace('SRC:', '');
          monData.mvId = null;
        } else if (val) {
          monData.assignmentType = 'mv';
          monData.mvId = val;
          monData.directSource = '';
        } else {
          monData.assignmentType = '';
          monData.mvId = null;
          monData.directSource = '';
        }
        Store.set(`monitorWallsV2.${wallKey}.monitors.${idx}`, monData);
        App.renderCurrentTab();
      });
    });
    header.appendChild(selectBtn);

    // Layout selector (if MV assigned)
    if (mv) {
      const layoutSelect = document.createElement('select');
      layoutSelect.style.cssText = 'padding:2px;font-size:8px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:2px;color:var(--text-primary);';
      Object.entries(LAYOUTS).forEach(([key, l]) => {
        if (key !== 'FULL_SCREEN') {
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = l.name;
          if (mv.layout === key) opt.selected = true;
          layoutSelect.appendChild(opt);
        }
      });
      layoutSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        if (mvIdx >= 0) {
          Store.data.prodDigital.multiviewers[mvIdx].layout = layoutSelect.value;
          Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, layoutSelect.value);
          App.renderCurrentTab();
        }
      });
      header.appendChild(layoutSelect);
    }

    display.appendChild(header);

    // Grid content
    const gridEl = document.createElement('div');

    if (isDirectSource || monConfig.directSource) {
      // Full screen display
      const directBg = 'linear-gradient(135deg, #2d4a3e 0%, #1a2e1a 100%)';
      gridEl.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${directBg};
        border-radius: 3px;
        flex: 1;
        font-size: 11px;
        font-weight: 600;
        color: #34d399;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      gridEl.textContent = monData.directSource || 'FULL';

      // Click to select
      gridEl.addEventListener('click', (e) => {
        e.stopPropagation();
        showSourcePicker(gridEl, (source) => {
          monData.directSource = source;
          monData.assignmentType = 'source';
          Store.set(`monitorWallsV2.${wallKey}.monitors.${idx}`, monData);
          App.renderCurrentTab();
        });
      });

      // Drag and drop
      gridEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        gridEl.style.boxShadow = 'inset 0 0 12px rgba(52, 211, 153, 0.5)';
      });
      gridEl.addEventListener('dragleave', () => {
        gridEl.style.boxShadow = 'none';
      });
      gridEl.addEventListener('drop', (e) => {
        e.preventDefault();
        gridEl.style.boxShadow = 'none';
        const source = e.dataTransfer.getData('text/plain');
        if (source) {
          monData.directSource = source;
          monData.assignmentType = 'source';
          Store.set(`monitorWallsV2.${wallKey}.monitors.${idx}`, monData);
          App.renderCurrentTab();
        }
      });
    } else if (mv && layout) {
      // MV grid layout
      gridEl.style.cssText = `
        display: grid;
        grid-template-areas: ${layout.template};
        grid-template-columns: ${layout.colSizes};
        grid-template-rows: ${layout.rowSizes};
        gap: 2px;
        flex: 1;
      `;

      layout.cells.forEach(cell => {
        const cellEl = document.createElement('div');
        const sourceValue = mv.inputs[cell.pos - 1] || '';
        const [cardNum] = mv.id.split('-');
        const displayLabel = `${cardNum}-${cell.pos}`;
        const baseBg = cell.vip ? 'linear-gradient(135deg, #3b4a6b 0%, #2a3a5b 100%)' : '#252836';

        cellEl.style.cssText = `
          grid-area: ${cell.area};
          background: ${baseBg};
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: ${sourceValue ? '#34d399' : (cell.vip ? '#5b9aff' : 'var(--text-secondary)')};
          cursor: pointer;
          padding: 2px;
          transition: all 0.15s ease;
        `;

        if (sourceValue) {
          const srcName = document.createElement('div');
          srcName.style.cssText = 'font-size:9px;text-align:center;line-height:1.1;';
          srcName.textContent = sourceValue;
          cellEl.appendChild(srcName);
          const posLabel = document.createElement('div');
          posLabel.style.cssText = 'font-size:7px;color:var(--text-muted);';
          posLabel.textContent = displayLabel;
          cellEl.appendChild(posLabel);
        } else {
          cellEl.textContent = displayLabel;
        }

        // Click to select
        cellEl.addEventListener('click', (e) => {
          e.stopPropagation();
          showSourcePicker(cellEl, (source) => {
            mv.inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);
            App.renderCurrentTab();
          });
        });

        // Drag and drop
        cellEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          cellEl.style.background = 'linear-gradient(135deg, #4a6b3b 0%, #3a5b2a 100%)';
          cellEl.style.boxShadow = 'inset 0 0 8px rgba(52, 211, 153, 0.5)';
        });
        cellEl.addEventListener('dragleave', () => {
          cellEl.style.background = baseBg;
          cellEl.style.boxShadow = 'none';
        });
        cellEl.addEventListener('drop', (e) => {
          e.preventDefault();
          cellEl.style.background = baseBg;
          cellEl.style.boxShadow = 'none';
          const source = e.dataTransfer.getData('text/plain');
          if (source) {
            mv.inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);
            App.renderCurrentTab();
          }
        });

        gridEl.appendChild(cellEl);
      });
    } else {
      gridEl.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        border-radius: 3px;
        flex: 1;
        font-size: 9px;
        color: var(--text-muted);
      `;
      gridEl.textContent = 'Select MV';
    }

    display.appendChild(gridEl);
    return display;
  }

  // Picker popup for MV/Source selection
  function showPicker(anchorEl, currentData, onSelect) {
    const existing = document.querySelector('.source-picker-popup');
    if (existing) existing.remove();

    const sources = getAllSourceOptions();

    const popup = document.createElement('div');
    popup.className = 'source-picker-popup';
    popup.style.cssText = `
      position: fixed;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      min-width: 200px;
      max-width: 280px;
      display: flex;
      flex-direction: column;
    `;

    // Filter input
    const filterWrapper = document.createElement('div');
    filterWrapper.style.cssText = 'padding:6px;border-bottom:1px solid var(--border);';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter...';
    filterInput.style.cssText = 'width:100%;padding:6px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);box-sizing:border-box;';
    filterWrapper.appendChild(filterInput);
    popup.appendChild(filterWrapper);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'max-height:280px;overflow-y:auto;';

    // Build MV options (MV 1-22)
    const mvOptions = [{ value: '', label: '-- None --', type: 'none' }];
    for (let card = 1; card <= 22; card++) {
      for (let side = 1; side <= 2; side++) {
        mvOptions.push({ value: `${card}-${side}`, label: `MV ${card}-${side}`, type: 'mv' });
      }
    }

    let currentFiltered = [];

    function renderOptions(filterText = '') {
      optionsContainer.innerHTML = '';
      const terms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t);
      currentFiltered = [];

      const filteredMvs = terms.length > 0
        ? mvOptions.filter(mv => terms.every(t => mv.label.toLowerCase().includes(t)))
        : mvOptions;

      const filteredSources = terms.length > 0
        ? sources.filter(src => terms.every(t => src.label.toLowerCase().includes(t)))
        : sources;

      currentFiltered = [
        ...filteredMvs.map(mv => ({ ...mv, selectValue: mv.type === 'mv' ? mv.value : '' })),
        ...filteredSources.map(src => ({ ...src, type: 'source', selectValue: `SRC:${src.value}` }))
      ];

      // MV section
      if (filteredMvs.length > 0) {
        const header = document.createElement('div');
        header.style.cssText = 'padding:4px 10px;font-size:9px;color:var(--text-muted);background:var(--bg-secondary);font-weight:600;';
        header.textContent = 'MULTIVIEWERS';
        optionsContainer.appendChild(header);

        filteredMvs.forEach((mv, i) => {
          const isFirst = i === 0 && terms.length > 0;
          const opt = document.createElement('div');
          opt.style.cssText = `padding:5px 10px;cursor:pointer;font-size:11px;color:${mv.type === 'none' ? 'var(--text-muted)' : 'var(--text-primary)'};${isFirst ? 'background:var(--accent-blue);color:white;' : ''}`;
          opt.textContent = mv.label;
          if (!isFirst) {
            opt.addEventListener('mouseenter', () => opt.style.background = 'var(--bg-secondary)');
            opt.addEventListener('mouseleave', () => opt.style.background = '');
          }
          opt.addEventListener('click', () => {
            onSelect(mv.type === 'mv' ? mv.value : '');
            popup.remove();
          });
          optionsContainer.appendChild(opt);
        });
      }

      // Sources section
      if (filteredSources.length > 0) {
        const header = document.createElement('div');
        header.style.cssText = 'padding:4px 10px;font-size:9px;color:var(--text-muted);background:var(--bg-secondary);font-weight:600;margin-top:2px;';
        header.textContent = 'DIRECT SOURCES';
        optionsContainer.appendChild(header);

        filteredSources.forEach((src, i) => {
          const isFirst = i === 0 && filteredMvs.length === 0 && terms.length > 0;
          const opt = document.createElement('div');
          opt.style.cssText = `padding:5px 10px;cursor:pointer;font-size:11px;color:var(--text-primary);${isFirst ? 'background:var(--accent-blue);color:white;' : ''}`;
          opt.textContent = src.label;
          if (!isFirst) {
            opt.addEventListener('mouseenter', () => opt.style.background = 'var(--bg-secondary)');
            opt.addEventListener('mouseleave', () => opt.style.background = '');
          }
          opt.addEventListener('click', () => {
            onSelect(`SRC:${src.value}`);
            popup.remove();
          });
          optionsContainer.appendChild(opt);
        });
      }

      if (filteredMvs.length === 0 && filteredSources.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'padding:10px;font-size:11px;color:var(--text-muted);text-align:center;';
        noResults.textContent = 'No matches';
        optionsContainer.appendChild(noResults);
      }
    }

    renderOptions();
    popup.appendChild(optionsContainer);

    filterInput.addEventListener('input', () => renderOptions(filterInput.value));
    filterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentFiltered.length > 0) {
        e.preventDefault();
        onSelect(currentFiltered[0].selectValue);
        popup.remove();
      }
    });

    const rect = anchorEl.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 210) + 'px';
    popup.style.top = Math.min(rect.bottom + 2, window.innerHeight - 320) + 'px';

    document.body.appendChild(popup);
    setTimeout(() => filterInput.focus(), 10);

    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);

    document.addEventListener('keydown', function keyHandler(e) {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    });
  }

  // Source picker for cells
  function showSourcePicker(anchorEl, onSelect) {
    const existing = document.querySelector('.source-picker-popup');
    if (existing) existing.remove();

    const sources = getAllSourceOptions();

    const popup = document.createElement('div');
    popup.className = 'source-picker-popup';
    popup.style.cssText = `
      position: fixed;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      min-width: 180px;
      display: flex;
      flex-direction: column;
    `;

    const filterWrapper = document.createElement('div');
    filterWrapper.style.cssText = 'padding:6px;border-bottom:1px solid var(--border);';
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter sources...';
    filterInput.style.cssText = 'width:100%;padding:6px;font-size:11px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);box-sizing:border-box;';
    filterWrapper.appendChild(filterInput);
    popup.appendChild(filterWrapper);

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'max-height:200px;overflow-y:auto;';

    let currentFiltered = sources;

    function renderOptions(filterText = '') {
      optionsContainer.innerHTML = '';
      const terms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t);

      // Clear option
      const clearOpt = document.createElement('div');
      clearOpt.style.cssText = 'padding:6px 10px;cursor:pointer;font-size:11px;color:var(--text-muted);border-bottom:1px solid var(--border);';
      clearOpt.textContent = '-- Clear --';
      clearOpt.addEventListener('click', () => { onSelect(''); popup.remove(); });
      clearOpt.addEventListener('mouseenter', () => clearOpt.style.background = 'var(--bg-secondary)');
      clearOpt.addEventListener('mouseleave', () => clearOpt.style.background = '');
      optionsContainer.appendChild(clearOpt);

      currentFiltered = terms.length > 0
        ? sources.filter(src => terms.every(t => src.label.toLowerCase().includes(t)))
        : sources;

      if (currentFiltered.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'padding:10px;font-size:11px;color:var(--text-muted);text-align:center;';
        noResults.textContent = 'No matches';
        optionsContainer.appendChild(noResults);
      } else {
        currentFiltered.forEach((src, i) => {
          const isFirst = i === 0 && terms.length > 0;
          const opt = document.createElement('div');
          opt.style.cssText = `padding:6px 10px;cursor:pointer;font-size:11px;color:var(--text-primary);${isFirst ? 'background:var(--accent-blue);color:white;' : ''}`;
          opt.textContent = src.label;
          if (!isFirst) {
            opt.addEventListener('mouseenter', () => opt.style.background = 'var(--bg-secondary)');
            opt.addEventListener('mouseleave', () => opt.style.background = '');
          }
          opt.addEventListener('click', () => { onSelect(src.value); popup.remove(); });
          optionsContainer.appendChild(opt);
        });
      }
    }

    renderOptions();
    popup.appendChild(optionsContainer);

    filterInput.addEventListener('input', () => renderOptions(filterInput.value));
    filterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentFiltered.length > 0) {
        e.preventDefault();
        onSelect(currentFiltered[0].value);
        popup.remove();
      }
    });

    const rect = anchorEl.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 190) + 'px';
    popup.style.top = Math.min(rect.bottom + 2, window.innerHeight - 260) + 'px';

    document.body.appendChild(popup);
    setTimeout(() => filterInput.focus(), 10);

    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);

    document.addEventListener('keydown', function keyHandler(e) {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    });
  }

  // Draggable source sections
  function renderDraggableSources() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px;background:var(--bg-secondary);border-radius:var(--radius-md);';

    // Show Sources
    wrapper.appendChild(renderShowSourcesSection());
    // EVS Sources
    wrapper.appendChild(renderEvsSourcesSection());
    // SWR Outs
    wrapper.appendChild(renderSwrOutsSection());

    return wrapper;
  }

  function renderShowSourcesSection() {
    const section = document.createElement('div');
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';
    const title = document.createElement('span');
    title.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);';
    title.textContent = 'SHOW SOURCES';
    header.appendChild(title);

    const toggleGroup = document.createElement('div');
    toggleGroup.style.cssText = 'display:flex;gap:2px;';
    const btn1 = document.createElement('button');
    btn1.textContent = '1-40';
    btn1.style.cssText = 'padding:2px 6px;font-size:9px;border:1px solid var(--border);border-radius:3px;cursor:pointer;background:var(--accent-blue);color:white;';
    const btn2 = document.createElement('button');
    btn2.textContent = '41-80';
    btn2.style.cssText = 'padding:2px 6px;font-size:9px;border:1px solid var(--border);border-radius:3px;cursor:pointer;background:var(--bg-primary);color:var(--text-secondary);';
    toggleGroup.appendChild(btn1);
    toggleGroup.appendChild(btn2);
    header.appendChild(toggleGroup);
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    function renderRange(start, end) {
      grid.innerHTML = '';
      const sources = (Store.data && Store.data.sources) ? Store.data.sources : [];
      // Always show all sources 1-80, use placeholder if no showName defined
      for (let i = start - 1; i < end; i++) {
        const src = sources[i];
        const showName = (src && src.showName) ? src.showName : `SRC ${String(i + 1).padStart(2, '0')}`;
        const isPlaceholder = !(src && src.showName);
        grid.appendChild(createChip(showName, 'show', isPlaceholder));
      }
    }

    renderRange(1, 40);

    btn1.addEventListener('click', () => {
      btn1.style.background = 'var(--accent-blue)'; btn1.style.color = 'white';
      btn2.style.background = 'var(--bg-primary)'; btn2.style.color = 'var(--text-secondary)';
      renderRange(1, 40);
    });
    btn2.addEventListener('click', () => {
      btn2.style.background = 'var(--accent-blue)'; btn2.style.color = 'white';
      btn1.style.background = 'var(--bg-primary)'; btn1.style.color = 'var(--text-secondary)';
      renderRange(41, 80);
    });

    section.appendChild(grid);
    return section;
  }

  function renderEvsSourcesSection() {
    const section = document.createElement('div');
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);margin-bottom:6px;';
    header.textContent = 'EVS SOURCES';
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    const defaultEvs = [
      'EVS1-Ain', 'EVS1-Bin', 'EVS1-Cin', 'EVS1-Din', 'EVS1-Ein', 'EVS1-Fin',
      'EVS2-Ain', 'EVS2-Bin', 'EVS2-Cin', 'EVS2-Din', 'EVS2-Ein', 'EVS2-Fin',
      'EVS3-Ain', 'EVS3-Bin', 'EVS3-Cin', 'EVS3-Din', 'EVS3-Ein', 'EVS3-Fin',
    ];
    defaultEvs.forEach(name => grid.appendChild(createChip(name, 'evs')));

    section.appendChild(grid);
    return section;
  }

  function renderSwrOutsSection() {
    const section = document.createElement('div');
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);margin-bottom:6px;';
    header.textContent = 'SWR OUTS';
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    const swrOutputs = (Store.data && Store.data.swrIo && Store.data.swrIo.outputs) ? Store.data.swrIo.outputs : [];
    let count = 0;
    if (Array.isArray(swrOutputs)) {
      swrOutputs.forEach(item => {
        const name = item && (item.show || item.defaultShow);
        if (name) {
          grid.appendChild(createChip(name, 'swr'));
          count++;
        }
      });
    }
    if (count === 0) {
      ['PGM', 'PVW', 'CLN', 'AUX1', 'AUX2', 'AUX3'].forEach(name => grid.appendChild(createChip(name, 'swr')));
    }

    section.appendChild(grid);
    return section;
  }

  function createChip(label, type, isPlaceholder = false) {
    const chip = document.createElement('div');
    chip.draggable = true;
    const colors = {
      show: { bg: '#2a3a5b', border: '#3b5998', text: '#7eb8ff' },
      evs: { bg: '#3a2a5b', border: '#6b3fa0', text: '#c490ff' },
      swr: { bg: '#2a4a3a', border: '#3a7a5a', text: '#7effb8' },
    };
    const c = colors[type] || colors.show;
    // Dim placeholder chips to distinguish from defined sources
    const opacity = isPlaceholder ? '0.5' : '1';
    chip.style.cssText = `padding:3px 6px;font-size:9px;font-weight:500;background:${c.bg};border:1px solid ${c.border};border-radius:3px;color:${c.text};cursor:grab;user-select:none;white-space:nowrap;opacity:${opacity};`;
    chip.textContent = label;
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', label);
      e.dataTransfer.effectAllowed = 'copy';
      chip.style.opacity = '0.3';
    });
    chip.addEventListener('dragend', () => { chip.style.opacity = isPlaceholder ? '0.5' : '1'; });
    return chip;
  }

  return { render };
})();
