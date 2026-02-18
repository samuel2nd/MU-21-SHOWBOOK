// PROD DIGITAL Tab — MU-21 Monitor Wall with dynamic MV layouts
const ProdDigitalTab = (() => {
  // Layout definitions with CSS grid templates
  // Based on MU-21 DEFAULT LAYOUT OPTIONS from marked-up reference image
  // VIP = blue/highlighted areas, positions numbered left-to-right, top-to-bottom
  const LAYOUTS = {
    // 9 SPLIT: 3x3 equal grid
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
    // 9 SPLIT R: 6 small cells top row, 7+8 stacked left, 9 VIP large right
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
    // 9 SPLIT L: 6 small cells top row, 9 VIP large left, 7+8 stacked right
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
    // 6 SPLIT R: Flip of R UP - 3 small on TOP, 2 stacked left, VIP right
    '6_SPLIT_R': {
      name: '6 SPLIT R',
      positions: 6,
      template: '"p1 p2 p3" "p4 p5 p5" "p6 p5 p5"',
      colSizes: '1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' },
        { pos: 5, area: 'p5', vip: true },
        { pos: 6, area: 'p6' },
      ],
    },
    // 6 SPLIT L: Flip of L UP - 3 small on TOP, VIP left, 2 stacked right
    '6_SPLIT_L': {
      name: '6 SPLIT L',
      positions: 6,
      template: '"p1 p2 p3" "p4 p4 p5" "p4 p4 p6"',
      colSizes: '1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4', vip: true },
        { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
      ],
    },
    // 6 SPLIT R UP: Mirror of L UP - 1 top-left, 3 mid-left, 2 VIP on right, 4+5+6 bottom row
    '6_SPLIT_R_UP': {
      name: '6 SPLIT R UP',
      positions: 6,
      template: '"p1 p2 p2" "p3 p2 p2" "p4 p5 p6"',
      colSizes: '1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1' },
        { pos: 2, area: 'p2', vip: true },
        { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
      ],
    },
    // 6 SPLIT L UP: 1 VIP on left, 2 top-right, 3 mid-right, 4+5+6 bottom row
    '6_SPLIT_L_UP': {
      name: '6 SPLIT L UP',
      positions: 6,
      template: '"p1 p1 p2" "p1 p1 p3" "p4 p5 p6"',
      colSizes: '1fr 1fr 1fr',
      rowSizes: '1fr 1fr 1fr',
      cells: [
        { pos: 1, area: 'p1', vip: true },
        { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' }, { pos: 6, area: 'p6' },
      ],
    },
    // 5 SPLIT: 3 small cells on top (1,2,3), 2 larger VIPs on bottom (4,5)
    '5_SPLIT': {
      name: '5 SPLIT',
      positions: 5,
      template: '"p1 p1 p2 p2 p3 p3" "p4 p4 p4 p5 p5 p5"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr',
      rowSizes: '1fr 2fr',
      cells: [
        { pos: 1, area: 'p1' }, { pos: 2, area: 'p2' }, { pos: 3, area: 'p3' },
        { pos: 4, area: 'p4', vip: true },
        { pos: 5, area: 'p5', vip: true },
      ],
    },
    // 5 SPLIT FLIP: 2 larger VIPs on top (1,2), 3 small cells on bottom (3,4,5)
    '5_SPLIT_FLIP': {
      name: '5 SPLIT FLIP',
      positions: 5,
      template: '"p1 p1 p1 p2 p2 p2" "p3 p3 p4 p4 p5 p5"',
      colSizes: '1fr 1fr 1fr 1fr 1fr 1fr',
      rowSizes: '2fr 1fr',
      cells: [
        { pos: 1, area: 'p1', vip: true },
        { pos: 2, area: 'p2', vip: true },
        { pos: 3, area: 'p3' }, { pos: 4, area: 'p4' }, { pos: 5, area: 'p5' },
      ],
    },
    // 4 SPLIT: 2x2 equal grid
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
    // FULL SCREEN: Single full-size display
    'FULL_SCREEN': {
      name: 'FULL SCREEN',
      positions: 1,
      template: '"p1"',
      colSizes: '1fr',
      rowSizes: '1fr',
      cells: [{ pos: 1, area: 'p1', vip: true }],
    },
  };

  // PXM display configuration (physical monitor positions)
  const PXM_CONFIG = [
    { id: 1, label: 'PXM 1', defaultMv: '1-1' },
    { id: 2, label: 'PXM 2', defaultMv: '2-1' },
    { id: 3, label: 'PXM 3', defaultMv: '3-1' },
    { id: 4, label: 'PXM 4', defaultMv: '4-1' },
    { id: 5, label: 'PXM 5', defaultMv: '5-1' },
    { id: 6, label: 'PXM 6', defaultMv: '6-1' },
    { id: 7, label: 'PXM 7', defaultMv: '7-1' },
    { id: 8, label: 'PXM 8', defaultMv: '8-1' },
    { id: 10, label: 'PXM 10', defaultMv: '5-2', small: true },
    { id: 11, label: 'PXM 11', defaultMv: '9-1', small: true },
    { id: 12, label: 'PXM 12', defaultMv: '9-2', small: true },
  ];

  // Number of MV cards (each card has 2 sides: -1 and -2, sharing 9 inputs)
  // MV 1-22, all 9x2 cards with same layout options
  const MV_CARD_COUNT = 22;

  // Get the paired MV for a given MV (e.g., '1-1' -> '1-2', '1-2' -> '1-1')
  function getPairedMvId(mvId) {
    if (!mvId) return null;
    const [card, side] = mvId.split('-');
    return `${card}-${side === '1' ? '2' : '1'}`;
  }

  // Get inputs used by a specific MV side based on its layout
  function getInputsUsedBySide(layout, side) {
    const layoutDef = LAYOUTS[layout];
    if (!layoutDef) return { start: 1, count: 0, end: 0 };

    const count = layoutDef.positions;
    if (side === 1) {
      return { start: 1, count, end: count };
    } else {
      // Side 2 starts after side 1's inputs
      return { start: 1, count, end: count }; // Will be offset when rendering
    }
  }

  // Get available inputs for MV side 2 based on side 1's layout
  function getAvailableInputsForSide2(side1Layout) {
    const layoutDef = LAYOUTS[side1Layout];
    if (!layoutDef) return 9;
    return 9 - layoutDef.positions;
  }

  // Get layouts that fit within available input count
  function getAvailableLayouts(maxInputs) {
    const available = [];
    Object.entries(LAYOUTS).forEach(([key, layout]) => {
      if (key !== 'FULL_SCREEN' && layout.positions <= maxInputs) {
        available.push({ key, name: layout.name, positions: layout.positions });
      }
    });
    return available;
  }

  // Get input offset for side 2 (starts after side 1's inputs)
  function getSide2InputOffset(side1Layout) {
    const layoutDef = LAYOUTS[side1Layout];
    return layoutDef ? layoutDef.positions : 0;
  }

  // Get all available source options from RTR I/O Master
  function getAllSourceOptions() {
    const sources = [];

    // Pull from RTR I/O Master device list
    const rtrMaster = (Store.data && Store.data.rtrMaster) ? Store.data.rtrMaster : [];
    if (Array.isArray(rtrMaster)) {
      rtrMaster.forEach(device => {
        if (device && device.deviceName) {
          sources.push({ value: device.deviceName, label: device.deviceName, type: 'device' });
        }
      });
    }

    return sources;
  }

  // Get default replay sources
  function getDefaultReplaySources() {
    return [
      { engName: 'EVS1-Ain', channelName: 'EVS 1-1 IN' },
      { engName: 'EVS1-Bin', channelName: 'EVS 1-2 IN' },
      { engName: 'EVS1-Cin', channelName: 'EVS 1-3 IN' },
      { engName: 'EVS1-Din', channelName: 'EVS 1-4 IN' },
      { engName: 'EVS1-Ein', channelName: 'EVS 1-5 IN' },
      { engName: 'EVS1-Fin', channelName: 'EVS 1-6 IN' },
      { engName: 'EVS 1-As', channelName: 'EVS 1-1 OUT' },
      { engName: 'EVS 1-Bs', channelName: 'EVS 1-2 OUT' },
      { engName: 'EVS2-Ain', channelName: 'EVS 2-1 IN' },
      { engName: 'EVS2-Bin', channelName: 'EVS 2-2 IN' },
      { engName: 'EVS2-Cin', channelName: 'EVS 2-3 IN' },
      { engName: 'EVS2-Din', channelName: 'EVS 2-4 IN' },
      { engName: 'EVS2-Ein', channelName: 'EVS 2-5 IN' },
      { engName: 'EVS2-Fin', channelName: 'EVS 2-6 IN' },
      { engName: 'EVS 2-As', channelName: 'EVS 2-1 OUT' },
      { engName: 'EVS 2-Bs', channelName: 'EVS 2-2 OUT' },
      { engName: 'EVS3-Ain', channelName: 'EVS 3-1 IN' },
      { engName: 'EVS3-Bin', channelName: 'EVS 3-2 IN' },
      { engName: 'EVS3-Cin', channelName: 'EVS 3-3 IN' },
      { engName: 'EVS3-Din', channelName: 'EVS 3-4 IN' },
      { engName: 'EVS3-Ein', channelName: 'EVS 3-5 IN' },
      { engName: 'EVS3-Fin', channelName: 'EVS 3-6 IN' },
      { engName: 'EVS 3-As', channelName: 'EVS 3-1 OUT' },
      { engName: 'EVS 3-Bs', channelName: 'EVS 3-2 OUT' },
      { engName: 'SPOT 1', channelName: 'SPOT 1' },
      { engName: 'SPOT 2', channelName: 'SPOT 2' },
      { engName: 'SPOT 3', channelName: 'SPOT 3' },
      { engName: 'SPOT 4', channelName: 'SPOT 4' },
    ];
  }

  // Get MV options for dropdown (MV1-MV11 + direct sources from RTR I/O Master)
  function getMvOptions() {
    const options = [{ value: '', label: '-- Select --' }];

    // Add MV options
    for (let i = 1; i <= 11; i++) {
      options.push({ value: `MV${i}`, label: `MV ${i}` });
    }

    // Add separator
    options.push({ value: '__separator__', label: '── Direct Sources ──', disabled: true });

    // Add direct source options from RTR I/O Master
    Store.data.rtrMaster.forEach(device => {
      if (device.deviceName) {
        options.push({ value: `SRC:${device.deviceName}`, label: device.deviceName });
      }
    });

    return options;
  }

  // Migrate old data format (numeric mvId) to new paired format (string "X-1")
  function migrateDataIfNeeded(data) {
    let needsSave = false;

    // Check if MVs need migration (old format had numeric ids)
    if (data.multiviewers && data.multiviewers.length > 0) {
      const firstMv = data.multiviewers[0];
      if (typeof firstMv.id === 'number' || (typeof firstMv.id === 'string' && !firstMv.id.includes('-'))) {
        // Old format - regenerate multiviewers
        const oldMvs = [...data.multiviewers];
        data.multiviewers = [];
        for (let card = 1; card <= MV_CARD_COUNT; card++) {
          const oldMv = oldMvs.find(m => m.id === card || m.id === String(card));
          // Side 1 (-1)
          data.multiviewers.push({
            id: `${card}-1`,
            cardId: card,
            side: 1,
            layout: oldMv?.layout || '9_SPLIT',
            inputs: oldMv?.inputs || Array(9).fill(''),
          });
          // Side 2 (-2)
          data.multiviewers.push({
            id: `${card}-2`,
            cardId: card,
            side: 2,
            layout: null,
            inputs: Array(9).fill(''),
          });
        }
        needsSave = true;
      }
    }

    // Check if PXMs need migration (old format had numeric mvId)
    if (data.pxms) {
      data.pxms.forEach((pxm, idx) => {
        if (pxm.assignmentType === 'mv' && pxm.mvId) {
          if (typeof pxm.mvId === 'number' || (typeof pxm.mvId === 'string' && !pxm.mvId.includes('-'))) {
            // Convert numeric to paired format (default to side 1)
            data.pxms[idx].mvId = `${pxm.mvId}-1`;
            needsSave = true;
          }
        }
      });
    }

    return needsSave;
  }

  function render(container) {
    // Initialize prodDigital data if not exists
    if (!Store.data.prodDigital) {
      Store.data.prodDigital = getDefaultProdDigitalData();
      Store.save();
    } else {
      // Migrate old data format if needed
      if (migrateDataIfNeeded(Store.data.prodDigital)) {
        Store.save();
      }
    }

    const page = document.createElement('div');
    page.className = 'tab-page';
    page.style.padding = '0';

    // Monitor Wall Visual (all configuration is done directly on the wall)
    page.appendChild(Utils.sectionHeader('MU-21 MONITOR WALL'));
    page.appendChild(renderMonitorWall());

    // Draggable Source Sections
    page.appendChild(Utils.sectionHeader('DRAG SOURCES TO ASSIGN'));
    page.appendChild(renderDraggableSources());

    container.appendChild(page);
  }

  // Render all draggable source sections
  function renderDraggableSources() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    `;

    // SHOW SOURCES section with 1-40 / 41-80 toggle
    wrapper.appendChild(renderShowSourcesSection());

    // EVS SOURCES section
    wrapper.appendChild(renderEvsSourcesSection());

    // SWR OUTS section
    wrapper.appendChild(renderSwrOutsSection());

    return wrapper;
  }

  // SHOW SOURCES with range toggle
  function renderShowSourcesSection() {
    const section = document.createElement('div');

    // Header with toggle
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';

    const title = document.createElement('span');
    title.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);';
    title.textContent = 'SHOW SOURCES';
    header.appendChild(title);

    // Range toggle buttons
    const toggleGroup = document.createElement('div');
    toggleGroup.style.cssText = 'display:flex;gap:2px;';

    const btn1to40 = document.createElement('button');
    btn1to40.textContent = '1-40';
    btn1to40.className = 'range-toggle active';
    btn1to40.style.cssText = 'padding:2px 6px;font-size:9px;border:1px solid var(--border);border-radius:3px;cursor:pointer;background:var(--accent-blue);color:white;';

    const btn41to80 = document.createElement('button');
    btn41to80.textContent = '41-80';
    btn41to80.className = 'range-toggle';
    btn41to80.style.cssText = 'padding:2px 6px;font-size:9px;border:1px solid var(--border);border-radius:3px;cursor:pointer;background:var(--bg-primary);color:var(--text-secondary);';

    toggleGroup.appendChild(btn1to40);
    toggleGroup.appendChild(btn41to80);
    header.appendChild(toggleGroup);
    section.appendChild(header);

    // Sources grid container
    const sourcesGrid = document.createElement('div');
    sourcesGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    function renderRange(start, end) {
      sourcesGrid.innerHTML = '';
      const sources = (Store.data && Store.data.sources) ? Store.data.sources : [];
      for (let i = start - 1; i < end && i < sources.length; i++) {
        const src = sources[i];
        if (src && src.showName) {
          sourcesGrid.appendChild(createDraggableChip(src.showName, 'show'));
        }
      }
      if (sourcesGrid.children.length === 0) {
        const empty = document.createElement('span');
        empty.style.cssText = 'font-size:10px;color:var(--text-muted);padding:4px;';
        empty.textContent = 'No sources in this range';
        sourcesGrid.appendChild(empty);
      }
    }

    // Initial render 1-40
    renderRange(1, 40);

    btn1to40.addEventListener('click', () => {
      btn1to40.style.background = 'var(--accent-blue)';
      btn1to40.style.color = 'white';
      btn41to80.style.background = 'var(--bg-primary)';
      btn41to80.style.color = 'var(--text-secondary)';
      renderRange(1, 40);
    });

    btn41to80.addEventListener('click', () => {
      btn41to80.style.background = 'var(--accent-blue)';
      btn41to80.style.color = 'white';
      btn1to40.style.background = 'var(--bg-primary)';
      btn1to40.style.color = 'var(--text-secondary)';
      renderRange(41, 80);
    });

    section.appendChild(sourcesGrid);
    return section;
  }

  // EVS SOURCES section
  function renderEvsSourcesSection() {
    const section = document.createElement('div');

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);margin-bottom:6px;';
    header.textContent = 'EVS SOURCES';
    section.appendChild(header);

    const sourcesGrid = document.createElement('div');
    sourcesGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    // Get EVS sources from replay sources or generate defaults
    const replaySources = (Store.data && Store.data.prodDigital && Store.data.prodDigital.replaySources)
      ? Store.data.prodDigital.replaySources
      : getDefaultReplaySources();

    if (replaySources && Array.isArray(replaySources)) {
      replaySources.forEach(src => {
        if (src && src.engName && src.engName.includes('EVS')) {
          const label = src.channelName || src.engName;
          sourcesGrid.appendChild(createDraggableChip(label, 'evs'));
        }
      });
    }

    section.appendChild(sourcesGrid);
    return section;
  }

  // SWR OUTS section
  function renderSwrOutsSection() {
    const section = document.createElement('div');

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:600;font-size:11px;color:var(--accent-blue);margin-bottom:6px;';
    header.textContent = 'SWR OUTS';
    section.appendChild(header);

    const sourcesGrid = document.createElement('div');
    sourcesGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;';

    // Get SWR outputs from swrIo.outputs data
    const swrOutputs = (Store.data && Store.data.swrIo && Store.data.swrIo.outputs)
      ? Store.data.swrIo.outputs
      : [];

    if (Array.isArray(swrOutputs)) {
      swrOutputs.forEach(item => {
        // Use show name if set, otherwise defaultShow
        const displayName = (item && (item.show || item.defaultShow));
        if (displayName) {
          sourcesGrid.appendChild(createDraggableChip(displayName, 'swr'));
        }
      });
    }

    // If no SWR data, show some defaults
    if (sourcesGrid.children.length === 0) {
      ['PGM', 'PVW', 'CLN', 'AUX1', 'AUX2', 'AUX3'].forEach(name => {
        sourcesGrid.appendChild(createDraggableChip(name, 'swr'));
      });
    }

    section.appendChild(sourcesGrid);
    return section;
  }

  // Create a draggable source chip
  function createDraggableChip(label, type) {
    const chip = document.createElement('div');
    chip.draggable = true;
    chip.dataset.source = label;
    chip.dataset.sourceType = type;

    const colors = {
      show: { bg: '#2a3a5b', border: '#3b5998', text: '#7eb8ff' },
      evs: { bg: '#3a2a5b', border: '#6b3fa0', text: '#c490ff' },
      swr: { bg: '#2a4a3a', border: '#3a7a5a', text: '#7effb8' },
    };
    const c = colors[type] || colors.show;

    chip.style.cssText = `
      padding: 3px 6px;
      font-size: 9px;
      font-weight: 500;
      background: ${c.bg};
      border: 1px solid ${c.border};
      border-radius: 3px;
      color: ${c.text};
      cursor: grab;
      user-select: none;
      white-space: nowrap;
    `;
    chip.textContent = label;

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', label);
      e.dataTransfer.effectAllowed = 'copy';
      chip.style.opacity = '0.5';
    });

    chip.addEventListener('dragend', () => {
      chip.style.opacity = '1';
    });

    return chip;
  }

  function renderMonitorWall() {
    const wrapper = document.createElement('div');
    wrapper.className = 'prod-digital-wall';
    wrapper.style.cssText = `
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
    `;

    const data = Store.data.prodDigital;

    // Title
    const title = document.createElement('div');
    title.style.cssText = 'text-align:center;font-weight:700;color:var(--accent-blue);font-size:14px;margin-bottom:10px;';
    title.textContent = 'MU-21 MONITOR WALL';
    wrapper.appendChild(title);

    // Layout matching PDF - PXM 5 and 6 are STACKED in center column:
    // [PXM1] [PXM3] [PXM5] [PXM7] [PXM10]
    // [PXM2] [PXM4] [PXM6] [PXM8] [PXM11]
    //                             [PXM12]
    const mainGrid = document.createElement('div');
    mainGrid.style.cssText = `
      display: grid;
      grid-template-areas:
        "pxm1 pxm3 pxm5 pxm7 smalls"
        "pxm2 pxm4 pxm6 pxm8 smalls";
      grid-template-columns: 1fr 1fr 1fr 1fr 100px;
      grid-template-rows: 140px 140px;
      gap: 6px;
    `;

    // PXM 1
    const pxm1 = renderPxmDisplay(data, 1);
    pxm1.style.gridArea = 'pxm1';
    mainGrid.appendChild(pxm1);

    // PXM 2
    const pxm2 = renderPxmDisplay(data, 2);
    pxm2.style.gridArea = 'pxm2';
    mainGrid.appendChild(pxm2);

    // PXM 3
    const pxm3 = renderPxmDisplay(data, 3);
    pxm3.style.gridArea = 'pxm3';
    mainGrid.appendChild(pxm3);

    // PXM 4
    const pxm4 = renderPxmDisplay(data, 4);
    pxm4.style.gridArea = 'pxm4';
    mainGrid.appendChild(pxm4);

    // PXM 5 (defaults to 5_SPLIT layout)
    const pxm5 = renderPxmDisplay(data, 5);
    pxm5.style.gridArea = 'pxm5';
    mainGrid.appendChild(pxm5);

    // PXM 6
    const pxm6 = renderPxmDisplay(data, 6);
    pxm6.style.gridArea = 'pxm6';
    mainGrid.appendChild(pxm6);

    // PXM 7
    const pxm7 = renderPxmDisplay(data, 7);
    pxm7.style.gridArea = 'pxm7';
    mainGrid.appendChild(pxm7);

    // PXM 8
    const pxm8 = renderPxmDisplay(data, 8);
    pxm8.style.gridArea = 'pxm8';
    mainGrid.appendChild(pxm8);

    // Small PXMs container (17" monitors - all same size)
    const smallsContainer = document.createElement('div');
    smallsContainer.style.cssText = `
      grid-area: smalls;
      display: flex;
      flex-direction: column;
      gap: 6px;
    `;

    const small1 = renderPxmDisplay(data, 10, true);
    small1.style.flex = '1';
    smallsContainer.appendChild(small1);

    const small2 = renderPxmDisplay(data, 11, true);
    small2.style.flex = '1';
    smallsContainer.appendChild(small2);

    const small3 = renderPxmDisplay(data, 12, true);
    small3.style.flex = '1';
    smallsContainer.appendChild(small3);

    mainGrid.appendChild(smallsContainer);

    wrapper.appendChild(mainGrid);

    return wrapper;
  }

  function renderPxmAssignments() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
    `;

    const data = Store.data.prodDigital;

    // Render assignment card for each PXM
    PXM_CONFIG.forEach((cfg, pxmIdx) => {
      const pxm = data.pxms.find(p => p.id === cfg.id);
      if (!pxm) return;

      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 10px;
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = 'font-weight:700;color:var(--accent-blue);font-size:12px;margin-bottom:8px;';
      header.textContent = cfg.label;
      card.appendChild(header);

      // Assignment dropdown
      const select = document.createElement('select');
      select.style.cssText = `
        width: 100%;
        padding: 6px 8px;
        background: var(--bg-input);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        font-size: 11px;
      `;

      // Add MV options
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- None --';
      select.appendChild(emptyOpt);

      for (let i = 1; i <= 11; i++) {
        const opt = document.createElement('option');
        opt.value = `MV${i}`;
        opt.textContent = `MV ${i}`;
        if (pxm.assignmentType === 'mv' && pxm.mvId === i) opt.selected = true;
        select.appendChild(opt);
      }

      // Add separator
      const sepOpt = document.createElement('option');
      sepOpt.disabled = true;
      sepOpt.textContent = '── Direct Sources ──';
      select.appendChild(sepOpt);

      // Add source options
      const allSources = getAllSourceOptions();
      allSources.forEach(src => {
        const opt = document.createElement('option');
        opt.value = `SRC:${src.value}`;
        opt.textContent = src.label;
        if (pxm.assignmentType === 'source' && pxm.directSource === src.value) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        const val = select.value;
        const realIdx = data.pxms.findIndex(p => p.id === cfg.id);

        if (val.startsWith('MV')) {
          const mvNum = parseInt(val.replace('MV', ''));
          data.pxms[realIdx].assignmentType = 'mv';
          data.pxms[realIdx].mvId = mvNum;
          data.pxms[realIdx].directSource = '';
        } else if (val.startsWith('SRC:')) {
          data.pxms[realIdx].assignmentType = 'source';
          data.pxms[realIdx].directSource = val.replace('SRC:', '');
          data.pxms[realIdx].mvId = null;
        } else {
          data.pxms[realIdx].assignmentType = '';
          data.pxms[realIdx].mvId = null;
          data.pxms[realIdx].directSource = '';
        }

        Store.set(`prodDigital.pxms.${realIdx}`, data.pxms[realIdx]);
        App.renderCurrentTab();
      });

      card.appendChild(select);

      // Show current assignment info
      const info = document.createElement('div');
      info.style.cssText = 'font-size:10px;color:var(--text-secondary);margin-top:6px;';
      if (pxm.assignmentType === 'mv') {
        const mv = data.multiviewers.find(m => m.id === pxm.mvId);
        info.textContent = mv ? `Layout: ${LAYOUTS[mv.layout]?.name || mv.layout}` : '';
      } else if (pxm.assignmentType === 'source') {
        info.textContent = 'Full Screen';
      } else {
        info.textContent = 'Not assigned';
      }
      card.appendChild(info);

      wrapper.appendChild(card);
    });

    return wrapper;
  }

  function renderPxmDisplay(data, pxmId, small = false) {
    const pxm = data.pxms.find(p => p.id === pxmId);
    const pxmIdx = data.pxms.findIndex(p => p.id === pxmId);
    if (!pxm) return document.createElement('div');

    // Find MV - check both mv assignment and direct source that might be an MV
    let mv = null;
    let mvIdx = -1;

    if (pxm.assignmentType === 'mv' && pxm.mvId) {
      mv = data.multiviewers.find(m => m.id === pxm.mvId);
      mvIdx = mv ? data.multiviewers.findIndex(m => m.id === pxm.mvId) : -1;
    } else if (pxm.assignmentType === 'source' && pxm.directSource) {
      // Check if direct source matches an MV pattern (e.g., "MV1-1", "MV 2-1", "1-1")
      const mvMatch = pxm.directSource.match(/^(?:MV\s*)?(\d+-\d+)$/i);
      if (mvMatch) {
        const mvId = mvMatch[1];
        mv = data.multiviewers.find(m => m.id === mvId);
        mvIdx = mv ? data.multiviewers.findIndex(m => m.id === mvId) : -1;
      }
    }

    const layout = mv && mv.layout ? LAYOUTS[mv.layout] : LAYOUTS['FULL_SCREEN'];
    const isDirectSource = pxm.assignmentType === 'source' && !mv;

    // Bottom row PXMs (2, 4, 6, 8) have controls at bottom
    const isBottomRow = [2, 4, 6, 8].includes(pxmId);

    const display = document.createElement('div');
    display.className = 'pxm-display';
    display.style.cssText = `
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 4px;
      padding: ${small ? '4px' : '6px'};
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    `;

    // Header with PXM label and controls
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      ${isBottomRow ? `margin-top: ${small ? '2px' : '4px'};` : `margin-bottom: ${small ? '2px' : '4px'};`}
      flex-wrap: wrap;
    `;

    // PXM Label
    const label = document.createElement('span');
    label.style.cssText = `
      font-size: ${small ? '8px' : '10px'};
      font-weight: 700;
      color: var(--accent-blue);
      white-space: nowrap;
    `;
    label.textContent = `PXM ${pxmId}`;
    header.appendChild(label);

    // MV/Source selector button (opens filterable picker)
    const mvSelectBtn = document.createElement('button');
    mvSelectBtn.style.cssText = `
      flex: 1;
      min-width: ${small ? '45px' : '55px'};
      padding: 2px 4px;
      font-size: ${small ? '7px' : '8px'};
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--text-primary);
      cursor: pointer;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;

    // Display current assignment
    let displayText = '--';
    if (pxm.assignmentType === 'mv' && pxm.mvId) {
      displayText = `MV${pxm.mvId}`;
    } else if (pxm.assignmentType === 'source' && pxm.directSource) {
      displayText = pxm.directSource;
    }
    mvSelectBtn.textContent = displayText;

    mvSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentVal = pxm.assignmentType === 'mv' ? pxm.mvId :
                         pxm.assignmentType === 'source' ? `SRC:${pxm.directSource}` : '';

      showPxmPicker(mvSelectBtn, currentVal, (val) => {
        if (val.startsWith('SRC:')) {
          // Direct source selected
          data.pxms[pxmIdx].assignmentType = 'source';
          data.pxms[pxmIdx].directSource = val.replace('SRC:', '');
          data.pxms[pxmIdx].mvId = null;
        } else if (val) {
          // MV selected
          data.pxms[pxmIdx].assignmentType = 'mv';
          data.pxms[pxmIdx].mvId = val;
          data.pxms[pxmIdx].directSource = '';
        } else {
          // None selected
          data.pxms[pxmIdx].assignmentType = '';
          data.pxms[pxmIdx].mvId = null;
          data.pxms[pxmIdx].directSource = '';
        }
        Store.set(`prodDigital.pxms.${pxmIdx}`, data.pxms[pxmIdx]);
        App.renderCurrentTab();
      });
    });
    header.appendChild(mvSelectBtn);

    // Layout selector (if MV assigned) - shows available layouts based on paired MV usage
    if (mv) {
      const pairedMv = getPairedMv(data, mv.id);
      const isSide2 = mv.side === 2;
      let availableInputs = 9;

      if (isSide2 && pairedMv && pairedMv.layout) {
        // Side 2: available inputs = 9 - side1's layout positions
        availableInputs = getAvailableInputsForSide2(pairedMv.layout);
      } else if (!isSide2 && pairedMv && pairedMv.layout) {
        // Side 1: if side 2 has a layout, we might need to respect it
        // But typically side 1 is set first, so no restriction
      }

      const layoutSelect = document.createElement('select');
      layoutSelect.style.cssText = `
        padding: 2px;
        font-size: ${small ? '7px' : '8px'};
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 2px;
        color: var(--text-primary);
        ${small ? 'max-width: 60px;' : ''}
      `;

      // Add "None" option for side 2 if no inputs available
      if (isSide2 && availableInputs === 0) {
        layoutSelect.innerHTML = '<option value="">N/A (0 inputs)</option>';
        layoutSelect.disabled = true;
      } else {
        Object.entries(LAYOUTS).forEach(([key, l]) => {
          if (key !== 'FULL_SCREEN') {
            // For side 2, only show layouts that fit in available inputs
            if (isSide2 && l.positions > availableInputs) return;

            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${l.name}${isSide2 ? ` (${l.positions})` : ''}`;
            if (mv.layout === key) opt.selected = true;
            layoutSelect.appendChild(opt);
          }
        });
      }

      layoutSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        const newLayout = layoutSelect.value;
        data.multiviewers[mvIdx].layout = newLayout || null;
        Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, newLayout || null);

        // If side 1 layout changes, check if side 2's layout is still valid
        if (!isSide2 && pairedMv && pairedMv.layout) {
          const newAvailable = getAvailableInputsForSide2(newLayout);
          const pairedLayout = LAYOUTS[pairedMv.layout];
          if (pairedLayout && pairedLayout.positions > newAvailable) {
            // Invalidate side 2's layout
            const pairedIdx = findMvIndex(data, pairedMv.id);
            if (pairedIdx >= 0) {
              data.multiviewers[pairedIdx].layout = null;
              Store.set(`prodDigital.multiviewers.${pairedIdx}.layout`, null);
            }
          }
        }

        App.renderCurrentTab();
      });
      header.appendChild(layoutSelect);

      // Show remaining inputs info for side 2
      if (isSide2 && pairedMv && pairedMv.layout) {
        const infoSpan = document.createElement('span');
        infoSpan.style.cssText = 'font-size:7px;color:var(--text-muted);';
        infoSpan.textContent = `(${availableInputs} avail)`;
        header.appendChild(infoSpan);
      }
    }

    // For top row PXMs, add header first
    if (!isBottomRow) {
      display.appendChild(header);
    }

    // Layout Grid or Full Screen
    const grid = document.createElement('div');

    if (isDirectSource) {
      // Full screen display for direct source
      const directBg = 'linear-gradient(135deg, #2d4a3e 0%, #1a2e1a 100%)';
      grid.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${directBg};
        border-radius: 3px;
        flex: 1;
        font-size: ${small ? '9px' : '11px'};
        font-weight: 600;
        color: #34d399;
        text-align: center;
        padding: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
      `;
      grid.textContent = pxm.directSource || 'FULL';

      // Click to select source
      grid.addEventListener('click', (e) => {
        e.stopPropagation();
        showSourcePicker(grid, (source) => {
          data.pxms[pxmIdx].directSource = source;
          Store.set(`prodDigital.pxms.${pxmIdx}.directSource`, source);
          App.renderCurrentTab();
        });
      });

      // Drag and drop support
      grid.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        grid.style.background = 'linear-gradient(135deg, #3d5a4e 0%, #2a3e2a 100%)';
        grid.style.boxShadow = 'inset 0 0 12px rgba(52, 211, 153, 0.5)';
      });

      grid.addEventListener('dragleave', (e) => {
        e.preventDefault();
        grid.style.background = directBg;
        grid.style.boxShadow = 'none';
      });

      grid.addEventListener('drop', (e) => {
        e.preventDefault();
        grid.style.background = directBg;
        grid.style.boxShadow = 'none';
        const droppedSource = e.dataTransfer.getData('text/plain');
        if (droppedSource) {
          data.pxms[pxmIdx].directSource = droppedSource;
          Store.set(`prodDigital.pxms.${pxmIdx}.directSource`, droppedSource);
          App.renderCurrentTab();
        }
      });
    } else if (mv && mv.layout) {
      // MV layout grid
      grid.style.cssText = `
        display: grid;
        grid-template-areas: ${layout.template};
        grid-template-columns: ${layout.colSizes};
        grid-template-rows: ${layout.rowSizes};
        gap: 2px;
        flex: 1;
      `;

      // Calculate input offset for side 2 (inputs start after side 1's usage)
      const pairedMv = getPairedMv(data, mv.id);
      const inputOffset = (mv.side === 2 && pairedMv && pairedMv.layout)
        ? getSide2InputOffset(pairedMv.layout)
        : 0;

      layout.cells.forEach(cell => {
        const cellEl = document.createElement('div');
        // For side 2, the actual card input is offset
        const actualInputNum = cell.pos + inputOffset;
        const sourceValue = mv.inputs[cell.pos - 1] || '';
        const baseBg = cell.vip ? 'linear-gradient(135deg, #3b4a6b 0%, #2a3a5b 100%)' : '#252836';

        cellEl.style.cssText = `
          grid-area: ${cell.area};
          background: ${baseBg};
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: ${small ? '7px' : '8px'};
          color: ${sourceValue ? '#34d399' : (cell.vip ? '#5b9aff' : 'var(--text-secondary)')};
          font-weight: ${cell.vip ? '600' : '400'};
          cursor: pointer;
          padding: 2px;
          overflow: hidden;
          transition: all 0.15s ease;
        `;

        // Show source name (or position if no source)
        // Display format: CardNum-ActualInput (e.g., "1-6" for card 1 input 6)
        const [cardNum] = mv.id.split('-');
        const displayLabel = `${cardNum}-${actualInputNum}`;

        if (sourceValue) {
          const srcName = document.createElement('div');
          srcName.style.cssText = `font-size: ${small ? '7px' : '9px'}; text-align: center; line-height: 1.1;`;
          srcName.textContent = sourceValue;
          cellEl.appendChild(srcName);

          // Smaller position label showing card-input
          const posLabel = document.createElement('div');
          posLabel.style.cssText = `font-size: ${small ? '6px' : '7px'}; color: var(--text-muted); margin-top: 1px;`;
          posLabel.textContent = displayLabel;
          cellEl.appendChild(posLabel);
        } else {
          cellEl.textContent = displayLabel;
        }

        // Click to select source
        cellEl.addEventListener('click', (e) => {
          e.stopPropagation();
          showSourcePicker(cellEl, (source) => {
            mv.inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);
            App.renderCurrentTab();
          });
        });

        // Drag and drop support
        cellEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          cellEl.style.background = 'linear-gradient(135deg, #4a6b3b 0%, #3a5b2a 100%)';
          cellEl.style.boxShadow = 'inset 0 0 8px rgba(52, 211, 153, 0.5)';
        });

        cellEl.addEventListener('dragleave', (e) => {
          e.preventDefault();
          cellEl.style.background = baseBg;
          cellEl.style.boxShadow = 'none';
        });

        cellEl.addEventListener('drop', (e) => {
          e.preventDefault();
          cellEl.style.background = baseBg;
          cellEl.style.boxShadow = 'none';
          const droppedSource = e.dataTransfer.getData('text/plain');
          if (droppedSource) {
            mv.inputs[cell.pos - 1] = droppedSource;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, droppedSource);
            App.renderCurrentTab();
          }
        });

        grid.appendChild(cellEl);
      });
    } else if (mv && !mv.layout) {
      // MV assigned but no layout (e.g., side 2 with no available inputs)
      grid.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        border-radius: 3px;
        flex: 1;
        font-size: 8px;
        color: var(--text-muted);
        text-align: center;
        padding: 4px;
      `;
      const pairedMv = getPairedMv(data, mv.id);
      if (mv.side === 2 && pairedMv && pairedMv.layout) {
        const avail = getAvailableInputsForSide2(pairedMv.layout);
        grid.textContent = avail > 0 ? 'Select Layout' : 'No inputs avail';
      } else {
        grid.textContent = 'Select Layout';
      }
    } else {
      grid.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        border-radius: 3px;
        flex: 1;
        font-size: 9px;
        color: var(--text-muted);
      `;
      grid.textContent = 'Select MV';
    }

    display.appendChild(grid);

    // For bottom row PXMs, add header after grid
    if (isBottomRow) {
      display.appendChild(header);
    }

    return display;
  }

  // PXM assignment picker popup with MVs and filterable sources
  function showPxmPicker(anchorEl, currentValue, onSelect) {
    // Remove any existing picker
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
    filterWrapper.style.cssText = 'padding: 6px; border-bottom: 1px solid var(--border);';

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter MVs or sources...';
    filterInput.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      font-size: 11px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text-primary);
      box-sizing: border-box;
    `;
    filterWrapper.appendChild(filterInput);
    popup.appendChild(filterWrapper);

    // Options container (scrollable)
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'max-height: 280px; overflow-y: auto;';

    // Build MV options list
    const mvOptions = [{ value: '', label: '-- None --', type: 'none' }];
    for (let card = 1; card <= MV_CARD_COUNT; card++) {
      for (let side = 1; side <= 2; side++) {
        mvOptions.push({ value: `${card}-${side}`, label: `MV ${card}-${side}`, type: 'mv' });
      }
    }

    // Track filtered results for Enter key
    let currentFiltered = [];

    // Function to render filtered options
    function renderOptions(filterText = '') {
      optionsContainer.innerHTML = '';
      const filterTerms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
      currentFiltered = [];

      // Filter MVs
      const filteredMvs = filterTerms.length > 0
        ? mvOptions.filter(mv => {
            const label = mv.label.toLowerCase();
            return filterTerms.every(term => label.includes(term));
          })
        : mvOptions;

      // Filter sources
      const filteredSources = filterTerms.length > 0
        ? sources.filter(src => {
            const label = src.label.toLowerCase();
            return filterTerms.every(term => label.includes(term));
          })
        : sources;

      // Combine for Enter key selection (MVs first, then sources)
      currentFiltered = [
        ...filteredMvs.map(mv => ({ ...mv, selectValue: mv.type === 'mv' ? mv.value : '' })),
        ...filteredSources.map(src => ({ ...src, type: 'source', selectValue: `SRC:${src.value}` }))
      ];

      // Render MV section
      if (filteredMvs.length > 0) {
        const mvHeader = document.createElement('div');
        mvHeader.style.cssText = 'padding: 4px 10px; font-size: 9px; color: var(--text-muted); background: var(--bg-secondary); font-weight: 600;';
        mvHeader.textContent = 'MULTIVIEWERS';
        optionsContainer.appendChild(mvHeader);

        filteredMvs.forEach((mv, idx) => {
          const isFirstMatch = idx === 0 && filterTerms.length > 0;
          const opt = document.createElement('div');
          opt.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            font-size: 11px;
            color: ${mv.type === 'none' ? 'var(--text-muted)' : 'var(--text-primary)'};
            ${isFirstMatch ? 'background: var(--accent-blue); color: white;' : ''}
          `;
          opt.textContent = mv.label;
          if (!isFirstMatch) {
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

      // Render Sources section
      if (filteredSources.length > 0) {
        const srcHeader = document.createElement('div');
        srcHeader.style.cssText = 'padding: 4px 10px; font-size: 9px; color: var(--text-muted); background: var(--bg-secondary); font-weight: 600; margin-top: 2px;';
        srcHeader.textContent = 'DIRECT SOURCES';
        optionsContainer.appendChild(srcHeader);

        const firstSourceIdx = filteredMvs.length === 0 ? 0 : -1;
        filteredSources.forEach((src, idx) => {
          const isFirstMatch = idx === firstSourceIdx && filterTerms.length > 0;
          const opt = document.createElement('div');
          opt.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            font-size: 11px;
            color: var(--text-primary);
            ${isFirstMatch ? 'background: var(--accent-blue); color: white;' : ''}
          `;
          opt.textContent = src.label;
          if (!isFirstMatch) {
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

      // No results
      if (filteredMvs.length === 0 && filteredSources.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'padding: 10px; font-size: 11px; color: var(--text-muted); text-align: center;';
        noResults.textContent = 'No matches found';
        optionsContainer.appendChild(noResults);
      }
    }

    // Initial render
    renderOptions();
    popup.appendChild(optionsContainer);

    // Filter on input
    filterInput.addEventListener('input', () => {
      renderOptions(filterInput.value);
    });

    // Enter key selects first match
    filterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFiltered.length > 0) {
          onSelect(currentFiltered[0].selectValue);
          popup.remove();
        }
      }
    });

    // Position popup near anchor
    const rect = anchorEl.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 210) + 'px';
    popup.style.top = Math.min(rect.bottom + 2, window.innerHeight - 320) + 'px';

    document.body.appendChild(popup);

    // Focus filter input
    setTimeout(() => filterInput.focus(), 10);

    // Close on click outside
    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);

    // Close on Escape key
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  // Source picker popup with filtering
  function showSourcePicker(anchorEl, onSelect) {
    // Remove any existing picker
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

    // Filter input
    const filterWrapper = document.createElement('div');
    filterWrapper.style.cssText = 'padding: 6px; border-bottom: 1px solid var(--border);';

    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter sources...';
    filterInput.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      font-size: 11px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text-primary);
      box-sizing: border-box;
    `;
    filterWrapper.appendChild(filterInput);
    popup.appendChild(filterWrapper);

    // Options container (scrollable)
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'max-height: 200px; overflow-y: auto;';

    // Function to render filtered options
    function renderOptions(filterText = '') {
      optionsContainer.innerHTML = '';
      const filterTerms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

      // Clear option
      const clearOpt = document.createElement('div');
      clearOpt.style.cssText = 'padding: 6px 10px; cursor: pointer; font-size: 11px; color: var(--text-muted); border-bottom: 1px solid var(--border);';
      clearOpt.textContent = '-- Clear --';
      clearOpt.addEventListener('click', () => {
        onSelect('');
        popup.remove();
      });
      clearOpt.addEventListener('mouseenter', () => clearOpt.style.background = 'var(--bg-secondary)');
      clearOpt.addEventListener('mouseleave', () => clearOpt.style.background = '');
      optionsContainer.appendChild(clearOpt);

      // Filtered source options - all terms must match (AND logic)
      const filteredSources = filterTerms.length > 0
        ? sources.filter(src => {
            const label = src.label.toLowerCase();
            return filterTerms.every(term => label.includes(term));
          })
        : sources;

      if (filteredSources.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'padding: 10px; font-size: 11px; color: var(--text-muted); text-align: center;';
        noResults.textContent = 'No matches found';
        optionsContainer.appendChild(noResults);
      } else {
        filteredSources.forEach((src, idx) => {
          const opt = document.createElement('div');
          const isFirst = idx === 0 && filterTerms.length > 0;
          opt.style.cssText = `
            padding: 6px 10px;
            cursor: pointer;
            font-size: 11px;
            color: var(--text-primary);
            ${isFirst ? 'background: var(--accent-blue); color: white;' : ''}
          `;
          opt.textContent = src.label;
          if (!isFirst) {
            opt.addEventListener('mouseenter', () => opt.style.background = 'var(--bg-secondary)');
            opt.addEventListener('mouseleave', () => opt.style.background = '');
          }
          opt.addEventListener('click', () => {
            onSelect(src.value);
            popup.remove();
          });
          optionsContainer.appendChild(opt);
        });
      }
    }

    // Track current filtered results for Enter key selection
    let currentFilteredSources = sources;

    // Function to update filtered sources list
    function updateFilteredSources(filterText = '') {
      const filterTerms = filterText.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
      currentFilteredSources = filterTerms.length > 0
        ? sources.filter(src => {
            const label = src.label.toLowerCase();
            return filterTerms.every(term => label.includes(term));
          })
        : sources;
    }

    // Initial render
    renderOptions();
    popup.appendChild(optionsContainer);

    // Filter on input
    filterInput.addEventListener('input', () => {
      updateFilteredSources(filterInput.value);
      renderOptions(filterInput.value);
    });

    // Enter key selects first match
    filterInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFilteredSources.length > 0) {
          onSelect(currentFilteredSources[0].value);
          popup.remove();
        }
      }
    });

    // Position popup near anchor
    const rect = anchorEl.getBoundingClientRect();
    popup.style.left = Math.min(rect.left, window.innerWidth - 190) + 'px';
    popup.style.top = Math.min(rect.bottom + 2, window.innerHeight - 260) + 'px';

    document.body.appendChild(popup);

    // Focus filter input
    setTimeout(() => filterInput.focus(), 10);

    // Close on click outside
    const closeHandler = (e) => {
      if (!popup.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);

    // Close on Escape key
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function renderPxmConfiguration() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit, minmax(380px, 1fr));gap:16px;';

    const data = Store.data.prodDigital;

    // Render config card for each PXM
    PXM_CONFIG.forEach((cfg) => {
      const pxm = data.pxms.find(p => p.id === cfg.id);
      if (!pxm) return;

      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 12px;
      `;

      // Header row with PXM name and assignment dropdown
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:12px;';

      const title = document.createElement('div');
      title.style.cssText = 'font-weight:700;color:var(--accent-blue);font-size:13px;';
      title.textContent = cfg.label + (cfg.small ? ' (17")' : ' (40")');
      header.appendChild(title);

      // Assignment dropdown
      const select = document.createElement('select');
      select.style.cssText = `
        padding: 6px 10px;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        font-size: 11px;
        min-width: 140px;
      `;

      // Add MV options (paired: MV1-1, MV1-2, MV2-1, etc.)
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '-- None --';
      select.appendChild(emptyOpt);

      for (let card = 1; card <= MV_CARD_COUNT; card++) {
        for (let side = 1; side <= 2; side++) {
          const mvId = `${card}-${side}`;
          const opt = document.createElement('option');
          opt.value = mvId;
          opt.textContent = `MV ${mvId}`;
          if (pxm.assignmentType === 'mv' && pxm.mvId === mvId) opt.selected = true;
          select.appendChild(opt);
        }
      }

      // Add separator
      const sepOpt = document.createElement('option');
      sepOpt.disabled = true;
      sepOpt.textContent = '── Direct Sources ──';
      select.appendChild(sepOpt);

      // Add source options
      const allSources = getAllSourceOptions();
      allSources.forEach(src => {
        const opt = document.createElement('option');
        opt.value = `SRC:${src.value}`;
        opt.textContent = src.label;
        if (pxm.assignmentType === 'source' && pxm.directSource === src.value) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        const val = select.value;
        const realIdx = data.pxms.findIndex(p => p.id === cfg.id);

        if (val && !val.startsWith('SRC:')) {
          // MV assignment (e.g., "1-1", "1-2")
          data.pxms[realIdx].assignmentType = 'mv';
          data.pxms[realIdx].mvId = val;
          data.pxms[realIdx].directSource = '';
        } else if (val.startsWith('SRC:')) {
          data.pxms[realIdx].assignmentType = 'source';
          data.pxms[realIdx].directSource = val.replace('SRC:', '');
          data.pxms[realIdx].mvId = null;
        } else {
          data.pxms[realIdx].assignmentType = '';
          data.pxms[realIdx].mvId = null;
          data.pxms[realIdx].directSource = '';
        }

        Store.set(`prodDigital.pxms.${realIdx}`, data.pxms[realIdx]);
        App.renderCurrentTab();
      });

      header.appendChild(select);
      card.appendChild(header);

      // If assigned to MV, show MV configuration
      if (pxm.assignmentType === 'mv' && pxm.mvId) {
        const mvIdx = findMvIndex(data, pxm.mvId);
        const mv = data.multiviewers[mvIdx];
        if (mv) {
          // Get paired MV info for input offset calculation
          const pairedMv = getPairedMv(data, mv.id);
          const isSide2 = mv.side === 2;
          let availableInputs = 9;
          let inputOffset = 0;

          if (isSide2 && pairedMv && pairedMv.layout) {
            availableInputs = getAvailableInputsForSide2(pairedMv.layout);
            inputOffset = getSide2InputOffset(pairedMv.layout);
          }

          // Layout selector row with availability info
          const layoutRow = document.createElement('div');
          layoutRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;';

          const layoutLabel = document.createElement('span');
          layoutLabel.style.cssText = 'font-size:11px;color:var(--text-secondary);';
          layoutLabel.textContent = 'Layout:';
          layoutRow.appendChild(layoutLabel);

          const layoutSelect = document.createElement('select');
          layoutSelect.style.cssText = 'padding:5px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-size:11px;flex:1;min-width:120px;';

          // Add "None" option for side 2 if no layout set or no inputs available
          if (isSide2) {
            const noneOpt = document.createElement('option');
            noneOpt.value = '';
            noneOpt.textContent = availableInputs > 0 ? '-- Select Layout --' : '-- No inputs available --';
            if (!mv.layout) noneOpt.selected = true;
            layoutSelect.appendChild(noneOpt);
          }

          Object.entries(LAYOUTS).forEach(([key, layout]) => {
            if (key !== 'FULL_SCREEN') {
              // For side 2, only show layouts that fit in available inputs
              if (isSide2 && layout.positions > availableInputs) return;

              const opt = document.createElement('option');
              opt.value = key;
              opt.textContent = `${layout.name} (${layout.positions} inputs)`;
              if (mv.layout === key) opt.selected = true;
              layoutSelect.appendChild(opt);
            }
          });

          if (isSide2 && availableInputs === 0) {
            layoutSelect.disabled = true;
          }

          layoutSelect.addEventListener('change', () => {
            const newLayout = layoutSelect.value || null;
            mv.layout = newLayout;
            Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, newLayout);

            // If side 1 layout changes, check if side 2's layout is still valid
            if (!isSide2 && pairedMv && pairedMv.layout) {
              const newAvailable = getAvailableInputsForSide2(newLayout);
              const pairedLayout = LAYOUTS[pairedMv.layout];
              if (pairedLayout && pairedLayout.positions > newAvailable) {
                const pairedIdx = findMvIndex(data, pairedMv.id);
                if (pairedIdx >= 0) {
                  data.multiviewers[pairedIdx].layout = null;
                  Store.set(`prodDigital.multiviewers.${pairedIdx}.layout`, null);
                }
              }
            }

            App.renderCurrentTab();
          });
          layoutRow.appendChild(layoutSelect);

          // Show paired MV info
          if (isSide2 && pairedMv) {
            const pairInfo = document.createElement('span');
            pairInfo.style.cssText = 'font-size:10px;color:var(--text-muted);';
            const side1Layout = pairedMv.layout ? LAYOUTS[pairedMv.layout]?.name : 'None';
            pairInfo.textContent = `MV${mv.cardId}-1: ${side1Layout} | ${availableInputs} inputs remaining`;
            layoutRow.appendChild(pairInfo);
          } else if (!isSide2) {
            // Show side 2 usage info
            const side2Info = document.createElement('span');
            side2Info.style.cssText = 'font-size:10px;color:var(--text-muted);';
            const side2Layout = pairedMv?.layout ? LAYOUTS[pairedMv.layout]?.name : 'Not used';
            const usedByThis = mv.layout ? LAYOUTS[mv.layout]?.positions : 0;
            side2Info.textContent = `Using inputs 1-${usedByThis} | Side 2: ${side2Layout}`;
            layoutRow.appendChild(side2Info);
          }

          card.appendChild(layoutRow);

          // Visual preview of layout
          if (mv.layout) {
            const layout = LAYOUTS[mv.layout];
            const preview = document.createElement('div');
            preview.style.cssText = `
              display: grid;
              grid-template-areas: ${layout.template};
              grid-template-columns: ${layout.colSizes};
              grid-template-rows: ${layout.rowSizes};
              gap: 3px;
              height: 90px;
              margin-bottom: 10px;
              background: var(--bg-primary);
              padding: 4px;
              border-radius: 4px;
            `;

            layout.cells.forEach(cell => {
              const cellEl = document.createElement('div');
              const sourceValue = mv.inputs[cell.pos - 1] || '';
              // Actual hardware input number (with offset for side 2)
              const actualInputNum = cell.pos + inputOffset;
              const displayLabel = `${mv.cardId}-${actualInputNum}`;

              cellEl.style.cssText = `
                grid-area: ${cell.area};
                background: ${cell.vip ? 'linear-gradient(135deg, #3b4a6b 0%, #2a3a5b 100%)' : '#252836'};
                border-radius: 3px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 9px;
                color: ${sourceValue ? '#34d399' : 'var(--text-muted)'};
                font-weight: ${cell.vip ? '600' : '400'};
                text-align: center;
                padding: 2px;
                overflow: hidden;
              `;

              if (sourceValue) {
                const srcSpan = document.createElement('span');
                srcSpan.textContent = sourceValue;
                cellEl.appendChild(srcSpan);
                const inputSpan = document.createElement('span');
                inputSpan.style.cssText = 'font-size:7px;color:var(--text-muted);margin-top:1px;';
                inputSpan.textContent = displayLabel;
                cellEl.appendChild(inputSpan);
              } else {
                cellEl.textContent = displayLabel;
              }

              preview.appendChild(cellEl);
            });

            card.appendChild(preview);

            // Input assignments - grid of inputs for each position
            const inputsGrid = document.createElement('div');
            inputsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;';

            for (let i = 0; i < layout.positions; i++) {
              const inputWrapper = document.createElement('div');
              inputWrapper.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

              const posLabel = document.createElement('label');
              posLabel.style.cssText = 'font-size:9px;color:var(--text-secondary);';
              const cellInfo = layout.cells[i];
              // Show actual hardware input number
              const actualInputNum = (i + 1) + inputOffset;
              posLabel.textContent = `Input ${mv.cardId}-${actualInputNum}${cellInfo?.vip ? ' (VIP)' : ''}`;
              inputWrapper.appendChild(posLabel);

              const input = document.createElement('input');
              input.type = 'text';
              input.value = mv.inputs[i] || '';
              input.placeholder = '--';
              input.style.cssText = `
                padding: 4px 6px;
                font-size: 10px;
                background: var(--bg-primary);
                border: 1px solid var(--border);
                border-radius: 3px;
                color: var(--text-primary);
                ${cellInfo?.vip ? 'border-color: var(--accent-blue);' : ''}
              `;
              input.setAttribute('list', `mv-sources-${mv.id}-${i}`);

              // Create datalist for autocomplete
              const datalist = document.createElement('datalist');
              datalist.id = `mv-sources-${mv.id}-${i}`;
              getAllSourceOptions().forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                datalist.appendChild(option);
              });
              inputWrapper.appendChild(datalist);

              input.addEventListener('change', () => {
                mv.inputs[i] = input.value;
                Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${i}`, input.value);
                App.renderCurrentTab();
              });

              inputWrapper.appendChild(input);
              inputsGrid.appendChild(inputWrapper);
            }

            card.appendChild(inputsGrid);
          } else {
            // No layout selected (for side 2)
            const noLayoutInfo = document.createElement('div');
            noLayoutInfo.style.cssText = `
              padding: 20px;
              background: var(--bg-primary);
              border-radius: 4px;
              text-align: center;
              color: var(--text-muted);
              font-size: 12px;
            `;
            noLayoutInfo.textContent = availableInputs > 0
              ? 'Select a layout to configure inputs'
              : `No inputs available (MV${mv.cardId}-1 uses all 9)`;
            card.appendChild(noLayoutInfo);
          }
        }
      } else if (pxm.assignmentType === 'source') {
        // Show direct source info
        const sourceInfo = document.createElement('div');
        sourceInfo.style.cssText = `
          padding: 20px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2e1a 100%);
          border-radius: 4px;
          text-align: center;
          color: #34d399;
          font-weight: 600;
          font-size: 14px;
        `;
        sourceInfo.textContent = `FULL SCREEN: ${pxm.directSource}`;
        card.appendChild(sourceInfo);
      } else {
        // Not assigned
        const emptyInfo = document.createElement('div');
        emptyInfo.style.cssText = `
          padding: 20px;
          background: var(--bg-primary);
          border-radius: 4px;
          text-align: center;
          color: var(--text-muted);
          font-size: 12px;
        `;
        emptyInfo.textContent = 'Select an MV or direct source above';
        card.appendChild(emptyInfo);
      }

      wrapper.appendChild(card);
    });

    return wrapper;
  }

  function renderMvConfiguration() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:16px;';

    const data = Store.data.prodDigital;

    // Render each MV configuration card
    data.multiviewers.forEach((mv, idx) => {
      wrapper.appendChild(renderMvCard(mv, idx));
    });

    return wrapper;
  }

  function renderMvCard(mv, idx) {
    const card = document.createElement('div');
    card.className = 'mv-config-card';
    card.style.cssText = `
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px;
    `;

    // Header with MV number and layout selector
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:700;color:var(--accent-blue);';
    title.textContent = `MV ${mv.id}`;
    header.appendChild(title);

    // Layout dropdown
    const layoutSelect = document.createElement('select');
    layoutSelect.style.cssText = 'padding:4px 8px;background:var(--bg-primary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);font-size:11px;';
    Object.entries(LAYOUTS).forEach(([key, layout]) => {
      if (key !== 'FULL_SCREEN') {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = layout.name;
        if (mv.layout === key) opt.selected = true;
        layoutSelect.appendChild(opt);
      }
    });
    layoutSelect.addEventListener('change', () => {
      mv.layout = layoutSelect.value;
      Store.set(`prodDigital.multiviewers.${idx}.layout`, layoutSelect.value);
      App.renderCurrentTab();
    });
    header.appendChild(layoutSelect);

    card.appendChild(header);

    // Visual preview of layout
    const preview = document.createElement('div');
    const layout = LAYOUTS[mv.layout] || LAYOUTS['9_SPLIT'];
    preview.style.cssText = `
      display: grid;
      grid-template-areas: ${layout.template};
      grid-template-columns: ${layout.colSizes};
      grid-template-rows: ${layout.rowSizes};
      gap: 3px;
      height: 80px;
      margin-bottom: 10px;
      background: var(--bg-primary);
      padding: 4px;
      border-radius: 4px;
    `;

    layout.cells.forEach(cell => {
      const cellEl = document.createElement('div');
      const input = mv.inputs[cell.pos - 1] || '';
      cellEl.style.cssText = `
        grid-area: ${cell.area};
        background: ${cell.vip ? 'linear-gradient(135deg, #3b4a6b 0%, #2a3a5b 100%)' : '#252836'};
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        color: ${input ? '#34d399' : 'var(--text-muted)'};
        font-weight: ${cell.vip ? '600' : '400'};
        text-align: center;
        padding: 2px;
        overflow: hidden;
      `;
      cellEl.textContent = input || `${mv.id}-${cell.pos}`;
      preview.appendChild(cellEl);
    });

    card.appendChild(preview);

    // Input assignments
    const inputsGrid = document.createElement('div');
    inputsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;';

    for (let i = 0; i < layout.positions; i++) {
      const inputWrapper = document.createElement('div');
      inputWrapper.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

      const posLabel = document.createElement('label');
      posLabel.style.cssText = 'font-size:9px;color:var(--text-secondary);';
      posLabel.textContent = `Pos ${i + 1}`;
      inputWrapper.appendChild(posLabel);

      const input = document.createElement('input');
      input.type = 'text';
      input.value = mv.inputs[i] || '';
      input.placeholder = '--';
      input.style.cssText = 'padding:4px 6px;font-size:10px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);';
      input.setAttribute('list', `mv-sources-${mv.id}-${i}`);

      // Create datalist for autocomplete
      const datalist = document.createElement('datalist');
      datalist.id = `mv-sources-${mv.id}-${i}`;
      getAllSourceOptions().forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        datalist.appendChild(option);
      });
      inputWrapper.appendChild(datalist);

      input.addEventListener('change', () => {
        mv.inputs[i] = input.value;
        Store.set(`prodDigital.multiviewers.${idx}.inputs.${i}`, input.value);
        App.renderCurrentTab();
      });

      inputWrapper.appendChild(input);
      inputsGrid.appendChild(inputWrapper);
    }

    card.appendChild(inputsGrid);

    return card;
  }

  function renderShowSourcesReference() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
    `;

    // Get sources from SOURCE tab that are in use
    const allSources = (Store.data && Store.data.sources) ? Store.data.sources : [];
    const sources = allSources.filter(s => s && s.showName);

    // Display in 4 columns of 10 each
    for (let col = 0; col < 4; col++) {
      const column = document.createElement('div');
      column.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

      for (let row = 0; row < 10; row++) {
        const idx = col * 10 + row;
        const source = sources[idx] || (allSources[idx] ? allSources[idx] : null);

        const item = document.createElement('div');
        item.style.cssText = `
          font-size: 11px;
          padding: 3px 6px;
          background: ${source?.showName ? 'var(--bg-primary)' : 'transparent'};
          border-radius: 3px;
          color: ${source?.showName ? 'var(--text-primary)' : 'var(--text-muted)'};
        `;
        item.textContent = source?.showName || `SHOW${String(idx + 1).padStart(2, '0')}`;
        column.appendChild(item);
      }

      wrapper.appendChild(column);
    }

    return wrapper;
  }

  function renderReplaySourcesReference() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    `;

    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.fontSize = '11px';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th colspan="2" style="text-align:center;background:var(--bg-primary);">EVS 1</th>
        <th colspan="2" style="text-align:center;background:var(--bg-primary);">EVS 2</th>
        <th colspan="2" style="text-align:center;background:var(--bg-primary);">EVS 3</th>
        <th colspan="2" style="text-align:center;background:var(--bg-primary);">SPOT</th>
      </tr>
      <tr>
        <th style="font-size:10px;">Eng Name</th>
        <th style="font-size:10px;">Channel</th>
        <th style="font-size:10px;">Eng Name</th>
        <th style="font-size:10px;">Channel</th>
        <th style="font-size:10px;">Eng Name</th>
        <th style="font-size:10px;">Channel</th>
        <th style="font-size:10px;">Eng Name</th>
        <th style="font-size:10px;">Channel</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const replaySources = Store.data.prodDigital?.replaySources || getDefaultReplaySources();

    // Group by EVS and display in rows
    for (let row = 0; row < 8; row++) {
      const tr = document.createElement('tr');

      // EVS 1
      const evs1 = replaySources[row] || {};
      tr.innerHTML += `<td>${evs1.engName || ''}</td><td>${evs1.channelName || ''}</td>`;

      // EVS 2
      const evs2 = replaySources[row + 8] || {};
      tr.innerHTML += `<td>${evs2.engName || ''}</td><td>${evs2.channelName || ''}</td>`;

      // EVS 3
      const evs3 = replaySources[row + 16] || {};
      tr.innerHTML += `<td>${evs3.engName || ''}</td><td>${evs3.channelName || ''}</td>`;

      // SPOT (only 4 rows)
      if (row < 4) {
        const spot = replaySources[row + 24] || {};
        tr.innerHTML += `<td>${spot.engName || ''}</td><td>${spot.channelName || ''}</td>`;
      } else {
        tr.innerHTML += `<td></td><td></td>`;
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
  }

  function editPxm(pxmId) {
    const data = Store.data.prodDigital;
    const pxmIdx = data.pxms.findIndex(p => p.id === pxmId);
    const pxm = data.pxms[pxmIdx];

    // Create a modal or use prompt for now
    const mvOptions = getMvOptions();
    const currentValue = pxm.assignmentType === 'mv' ? `MV${pxm.mvId}` :
                         pxm.assignmentType === 'source' ? `SRC:${pxm.directSource}` : '';

    const optionsList = mvOptions.filter(o => !o.disabled).map(o => o.label).join(', ');
    const newValue = prompt(
      `PXM ${pxmId} — Select MV (MV1-MV11) or direct source:\n\nCurrent: ${currentValue || 'None'}\n\nOptions: ${optionsList.substring(0, 200)}...`,
      currentValue
    );

    if (newValue === null) return;

    if (newValue.startsWith('MV')) {
      const mvNum = parseInt(newValue.replace('MV', ''));
      if (mvNum >= 1 && mvNum <= 11) {
        pxm.assignmentType = 'mv';
        pxm.mvId = mvNum;
        pxm.directSource = '';
      }
    } else if (newValue.startsWith('SRC:')) {
      pxm.assignmentType = 'source';
      pxm.directSource = newValue.replace('SRC:', '');
      pxm.mvId = null;
    } else if (newValue) {
      // Assume direct source if not MV format
      pxm.assignmentType = 'source';
      pxm.directSource = newValue;
      pxm.mvId = null;
    } else {
      pxm.assignmentType = '';
      pxm.mvId = null;
      pxm.directSource = '';
    }

    Store.set(`prodDigital.pxms.${pxmIdx}`, pxm);
    App.renderCurrentTab();
  }

  function getDefaultProdDigitalData() {
    // Create paired MVs (each card has -1 and -2 sides sharing 9 inputs)
    const multiviewers = [];

    // Default layouts for each MV card (side 1)
    // PROD Digital: MV1-8 = 9_SPLIT, MV5 = 5_SPLIT, MV9 = 4_SPLIT
    // EVS Wall: MV10 = 9_SPLIT_L, MV11 = 9_SPLIT, MV12 = 9_SPLIT_R
    // AUD Wall: MV16 = 9_SPLIT, MV17 = 9_SPLIT
    // P2-P3 Wall: MV18-21 = 9_SPLIT
    const defaultLayouts = {
      5: { side1: '5_SPLIT', side2: '4_SPLIT' },
      9: { side1: '4_SPLIT', side2: '4_SPLIT' },
      10: { side1: '9_SPLIT_L', side2: null },  // FEVS MON1
      11: { side1: '9_SPLIT', side2: null },    // FEVS MON2
      12: { side1: '9_SPLIT_R', side2: null },  // FEVS MON3
      16: { side1: '9_SPLIT', side2: null },    // AUD MV1
      17: { side1: '9_SPLIT', side2: null },    // AUD MV2
      18: { side1: '9_SPLIT', side2: null },    // P2 MON1
      19: { side1: '9_SPLIT', side2: null },    // P2 MON3
      20: { side1: '9_SPLIT', side2: null },    // P3 MON1
      21: { side1: '9_SPLIT', side2: null },    // P3 MON3
    };

    for (let card = 1; card <= MV_CARD_COUNT; card++) {
      const layouts = defaultLayouts[card] || { side1: '9_SPLIT', side2: null };

      // Side 1 (-1)
      multiviewers.push({
        id: `${card}-1`,
        cardId: card,
        side: 1,
        layout: layouts.side1,
        inputs: Array(9).fill(''),
      });
      // Side 2 (-2)
      multiviewers.push({
        id: `${card}-2`,
        cardId: card,
        side: 2,
        layout: layouts.side2,
        inputs: Array(9).fill(''),
      });
    }

    return {
      // 11 PXM displays
      pxms: PXM_CONFIG.map(cfg => ({
        id: cfg.id,
        assignmentType: 'mv',
        mvId: cfg.defaultMv,
        directSource: '',
      })),
      // Paired Multiviewers (22 total: 11 cards x 2 sides)
      multiviewers,
      // Replay sources reference
      replaySources: getDefaultReplaySources(),
    };
  }

  // Find MV by id (e.g., '1-1', '1-2')
  function findMv(data, mvId) {
    return data.multiviewers.find(m => m.id === mvId);
  }

  // Find MV index by id
  function findMvIndex(data, mvId) {
    return data.multiviewers.findIndex(m => m.id === mvId);
  }

  // Get the paired MV object
  function getPairedMv(data, mvId) {
    const pairedId = getPairedMvId(mvId);
    return pairedId ? findMv(data, pairedId) : null;
  }

  return { render, getDefaultProdDigitalData };
})();
