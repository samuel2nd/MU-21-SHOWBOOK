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
        { id: 'fevs-mon1', label: 'FEVSMON1', defaultMv: '10-1', defaultLayout: '9_SPLIT_L', row: 1 },
        { id: 'fevs-mon2', label: 'FEVSMON2', defaultMv: '11-1', defaultLayout: '9_SPLIT', row: 1 },
        { id: 'fevs-mon3', label: 'FEVSMON3', defaultMv: '12-1', defaultLayout: '9_SPLIT_R', row: 1 },
        // REVS Row (Full screen)
        { id: 'revs-mon1', label: 'REVSMON1', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon2', label: 'REVSMON2', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon3', label: 'REVSMON3', defaultMv: null, directSource: true, row: 2 },
        { id: 'revs-mon4', label: 'REVSMON4', defaultMv: null, directSource: true, row: 2 },
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
    'video': {
      title: 'MU-21 VIDEO MONITOR WALL',
      monitors: [
        // Top row - MV outputs (32x4 MV card 26, 3 outputs used)
        { id: 'vid-mv1', label: 'VID MV 1', defaultMv: '26-1', defaultLayout: '9_SPLIT', row: 1, fixedLayout: true, inputStart: 1 },
        { id: 'vid-mv2', label: 'VID MV 2', defaultMv: '26-2', defaultLayout: '9_SPLIT', row: 1, fixedLayout: true, inputStart: 10 },
        { id: 'vid-mv3', label: 'VID MV 3', defaultMv: '26-3', defaultLayout: '9_SPLIT', row: 1, fixedLayout: true, inputStart: 19 },
        // Bottom row - Full screen QC monitors
        { id: 'vid-qc1', label: 'VID QC 1', defaultMv: null, directSource: true, row: 2 },
        { id: 'vid-qc2', label: 'VID QC 2', defaultMv: null, directSource: true, row: 2 },
        { id: 'vid-qc3', label: 'VID QC 3', defaultMv: null, directSource: true, row: 2 },
      ],
      gridTemplate: `
        "vidmv1 vidmv2 vidmv3"
        "vidqc1 vidqc2 vidqc3"
      `,
      gridCols: '1fr 1fr 1fr',
      gridRows: '2fr 1fr',
    },
  };

  // Ensure prodDigital data exists and has card 26 MVs
  function ensureProdDigitalData() {
    if (!Store.data.prodDigital) {
      // Initialize from ProdDigitalTab if available, otherwise create basic structure
      if (typeof ProdDigitalTab !== 'undefined' && ProdDigitalTab.getDefaultProdDigitalData) {
        Store.data.prodDigital = ProdDigitalTab.getDefaultProdDigitalData();
        Store.save();
      }
    } else if (Store.data.prodDigital.multiviewers) {
      // Ensure card 26 MVs exist (32x4 MV for VIDEO position)
      const has26 = Store.data.prodDigital.multiviewers.some(m => m.cardId === 26);
      if (!has26) {
        for (let output = 1; output <= 4; output++) {
          Store.data.prodDigital.multiviewers.push({
            id: `26-${output}`,
            cardId: 26,
            side: output,
            layout: '9_SPLIT',
            inputs: Array(9).fill(''),
          });
        }
        Store.save();
        console.log('[Monitors] Added MV card 26 (32x4 VIDEO MV)');
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

  // Get paired MV (the other side of the same card)
  function getPairedMv(mvId) {
    if (!mvId || !Store.data.prodDigital || !Store.data.prodDigital.multiviewers) return null;
    const [cardId, side] = mvId.split('-');
    const pairedSide = side === '1' ? '2' : '1';
    const pairedId = `${cardId}-${pairedSide}`;
    return Store.data.prodDigital.multiviewers.find(m => m.id === pairedId);
  }

  // Get input offset for side 2 (starts after side 1's inputs)
  function getSide2InputOffset(side1Layout) {
    const layoutDef = LAYOUTS[side1Layout];
    return layoutDef ? layoutDef.positions : 0;
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
    const wallHeader = Utils.sectionHeader(config.title);
    wallHeader.style.marginTop = '0';
    page.appendChild(wallHeader);
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
    } else if (wallKey === 'video') {
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      grid.style.gridTemplateRows = '180px 180px';
      grid.style.gridTemplateAreas = `
        "vidmv1 vidmv2 vidmv3"
        "vidqc1 vidqc2 vidqc3"
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
      } else if (wallKey === 'video') {
        const areaMap = {
          'vid-mv1': 'vidmv1',
          'vid-mv2': 'vidmv2',
          'vid-mv3': 'vidmv3',
          'vid-qc1': 'vidqc1',
          'vid-qc2': 'vidqc2',
          'vid-qc3': 'vidqc3',
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
      showPicker(selectBtn, monData, async (val) => {
        let routeSource = null;

        if (val.startsWith('SRC:')) {
          const source = val.replace('SRC:', '');
          monData.assignmentType = 'source';
          monData.directSource = source;
          monData.mvId = null;
          routeSource = source;
        } else if (val) {
          monData.assignmentType = 'mv';
          monData.mvId = val;
          monData.directSource = '';
          // Route the MV output to the monitor
          routeSource = `MV ${val}`;
        } else {
          monData.assignmentType = '';
          monData.mvId = null;
          monData.directSource = '';
        }

        // Trigger NV9000 route if source selected
        if (routeSource) {
          const destName = monConfig.label;
          const result = await NV9000Client.handleRoute(routeSource, destName, 'monitors');
          if (result.success) {
            if (result.staged) {
              Utils.toast(`Staged: ${routeSource} → ${destName}`, 'info');
            } else {
              Utils.toast(`Routed: ${routeSource} → ${destName}`, 'success');
            }
          }
        }

        Store.set(`monitorWallsV2.${wallKey}.monitors.${idx}`, monData);
        App.renderCurrentTab();
      });
    });
    header.appendChild(selectBtn);

    // Layout selector (if MV assigned and not fixed layout)
    if (mv && !monConfig.fixedLayout) {
      // Check if this MV has a staged layout change
      const stagedLayouts = (typeof KaleidoClient !== 'undefined') ? KaleidoClient.getStagedLayouts() : {};
      const isStaged = stagedLayouts[mv.id] !== undefined;

      const layoutSelect = document.createElement('select');
      layoutSelect.style.cssText = `padding:2px;font-size:8px;background:var(--bg-primary);border:1px solid ${isStaged ? 'var(--accent-yellow)' : 'var(--border)'};border-radius:2px;color:var(--text-primary);${isStaged ? 'box-shadow: 0 0 4px rgba(234, 179, 8, 0.3);' : ''}`;
      if (isStaged) {
        layoutSelect.title = `Staged: ${stagedLayouts[mv.id].from} → ${stagedLayouts[mv.id].to}`;
      }
      Object.entries(LAYOUTS).forEach(([key, l]) => {
        if (key !== 'FULL_SCREEN') {
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = l.name;
          if (mv.layout === key) opt.selected = true;
          layoutSelect.appendChild(opt);
        }
      });
      layoutSelect.addEventListener('change', async (e) => {
        e.stopPropagation();
        if (mvIdx >= 0) {
          const oldLayout = mv.layout;
          const newLayout = layoutSelect.value;
          const cardId = mv.cardId;

          Store.data.prodDigital.multiviewers[mvIdx].layout = newLayout;
          Store.set(`prodDigital.multiviewers.${mvIdx}.layout`, newLayout);

          // Handle Kaleido trigger based on mode
          if (typeof KaleidoClient !== 'undefined' && newLayout && cardId) {
            const result = await KaleidoClient.handleLayoutChange(mv.id, oldLayout || '', newLayout, cardId);
            if (result.staged) {
              layoutSelect.style.borderColor = 'var(--accent-yellow)';
            }
          }

          App.renderCurrentTab();
        }
      });
      header.appendChild(layoutSelect);
    }

    display.appendChild(header);

    // Grid content
    const gridEl = document.createElement('div');

    if (isDirectSource) {
      // Full screen display (only when NOT assigned to an MV)
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

      // Click to select - allow MV or source selection
      gridEl.addEventListener('click', (e) => {
        e.stopPropagation();
        showPicker(gridEl, monData, async (val) => {
          if (val.startsWith('SRC:')) {
            const source = val.replace('SRC:', '');
            monData.assignmentType = 'source';
            monData.directSource = source;
            monData.mvId = null;

            // Trigger NV9000 route for direct source
            if (source) {
              const destName = monConfig.label;
              const result = await NV9000Client.handleRoute(source, destName, 'monitors');
              if (result.success) {
                if (result.staged) {
                  Utils.toast(`Staged: ${source} → ${destName}`, 'info');
                } else {
                  Utils.toast(`Routed: ${source} → ${destName}`, 'success');
                }
              }
            }
          } else if (val) {
            monData.assignmentType = 'mv';
            monData.mvId = val;
            monData.directSource = '';
          } else {
            monData.assignmentType = 'source';
            monData.mvId = null;
            monData.directSource = '';
          }
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
      gridEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        gridEl.style.boxShadow = 'none';
        const source = e.dataTransfer.getData('text/plain');
        if (source) {
          monData.directSource = source;
          monData.assignmentType = 'source';
          Store.set(`monitorWallsV2.${wallKey}.monitors.${idx}`, monData);

          // Trigger NV9000 route for direct source monitor
          const destName = monConfig.label;
          const result = await NV9000Client.handleRoute(source, destName, 'monitors');
          if (result.success) {
            if (result.staged) {
              Utils.toast(`Staged: ${source} → ${destName}`, 'info');
            } else {
              Utils.toast(`Routed: ${source} → ${destName}`, 'success');
            }
          }

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

      // Calculate input offset for side 2, or use inputStart for special MVs (like 32x4)
      let inputOffset = 0;
      if (monConfig.inputStart !== undefined) {
        // Special MV with explicit input start (e.g., 32x4 MV where inputs are 1-9, 10-18, 19-27)
        inputOffset = monConfig.inputStart - 1;
      } else {
        const pairedMv = getPairedMv(mv.id);
        inputOffset = (mv.side === 2 && pairedMv && pairedMv.layout)
          ? getSide2InputOffset(pairedMv.layout)
          : 0;
      }

      layout.cells.forEach(cell => {
        const cellEl = document.createElement('div');
        const sourceValue = mv.inputs[cell.pos - 1] || '';
        const [cardNum] = mv.id.split('-');
        const actualInputNum = cell.pos + inputOffset;
        const displayLabel = `${cardNum}-${actualInputNum}`;
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
          showSourcePicker(cellEl, async (source) => {
            mv.inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);

            // Trigger NV9000 route if source selected
            if (source && mv.cardId) {
              const destName = `MV ${mv.cardId}-${actualInputNum}`;
              const result = await NV9000Client.handleRoute(source, destName, 'monitors');
              if (result.success) {
                if (result.staged) {
                  Utils.toast(`Staged: ${source} → ${destName}`, 'info');
                } else {
                  Utils.toast(`Routed: ${source} → ${destName}`, 'success');
                }
              }
            }

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
        cellEl.addEventListener('drop', async (e) => {
          e.preventDefault();
          cellEl.style.background = baseBg;
          cellEl.style.boxShadow = 'none';
          const source = e.dataTransfer.getData('text/plain');
          if (source) {
            mv.inputs[cell.pos - 1] = source;
            Store.set(`prodDigital.multiviewers.${mvIdx}.inputs.${cell.pos - 1}`, source);

            // Trigger NV9000 route
            if (mv.cardId) {
              const destName = `MV ${mv.cardId}-${actualInputNum}`;
              const result = await NV9000Client.handleRoute(source, destName, 'monitors');
              if (result.success) {
                if (result.staged) {
                  Utils.toast(`Staged: ${source} → ${destName}`, 'info');
                } else {
                  Utils.toast(`Routed: ${source} → ${destName}`, 'success');
                }
              }
            }

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
    filterInput.style.cssText = 'width:100%;padding:6px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);box-sizing:border-box;';
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
    filterInput.style.cssText = 'width:100%;padding:6px;font-size:11px;background:var(--bg-primary);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);box-sizing:border-box;';
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
  // Render tabbed draggable source sections - router panel style (matches PROD Digital)
  function renderDraggableSources() {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background:var(--bg-secondary);border-radius:var(--radius-md);padding:6px;';

    // Tab buttons
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;gap:2px;margin-bottom:6px;flex-wrap:wrap;';

    const categories = [
      { id: 'show1', label: 'SHOW 1-20', color: '#3b6998' },
      { id: 'show2', label: 'SHOW 21-40', color: '#3b6998' },
      { id: 'show3', label: 'SHOW 41-60', color: '#3b6998' },
      { id: 'show4', label: 'SHOW 61-80', color: '#3b6998' },
      { id: 'evs', label: 'EVS', color: '#8b3ba0' },
      { id: 'tx', label: 'TX/PGM', color: '#a07030' },
      { id: 'cg', label: 'CG', color: '#a03080' },
      { id: 'test', label: 'TEST', color: '#6a6a6a' },
      { id: 'swr', label: 'SWR', color: '#4a8a4a' },
    ];

    const contentArea = document.createElement('div');
    contentArea.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';

    let activeTab = 'show1';

    function renderContent(catId) {
      contentArea.innerHTML = '';
      const sources = (Store.data && Store.data.sources) ? Store.data.sources : [];

      if (catId === 'show1') {
        for (let i = 0; i < 20; i++) {
          const src = sources[i];
          const showName = (src && src.showName) ? src.showName : `SRC ${String(i + 1).padStart(2, '0')}`;
          const isPlaceholder = !(src && src.showName);
          contentArea.appendChild(createDraggableChip(showName, 'show', isPlaceholder));
        }
      } else if (catId === 'show2') {
        for (let i = 20; i < 40; i++) {
          const src = sources[i];
          const showName = (src && src.showName) ? src.showName : `SRC ${String(i + 1).padStart(2, '0')}`;
          const isPlaceholder = !(src && src.showName);
          contentArea.appendChild(createDraggableChip(showName, 'show', isPlaceholder));
        }
      } else if (catId === 'show3') {
        for (let i = 40; i < 60; i++) {
          const src = sources[i];
          const showName = (src && src.showName) ? src.showName : `SRC ${String(i + 1).padStart(2, '0')}`;
          const isPlaceholder = !(src && src.showName);
          contentArea.appendChild(createDraggableChip(showName, 'show', isPlaceholder));
        }
      } else if (catId === 'show4') {
        for (let i = 60; i < 80; i++) {
          const src = sources[i];
          const showName = (src && src.showName) ? src.showName : `SRC ${String(i + 1).padStart(2, '0')}`;
          const isPlaceholder = !(src && src.showName);
          contentArea.appendChild(createDraggableChip(showName, 'show', isPlaceholder));
        }
      } else if (catId === 'evs') {
        const evsInputs = [
          'EVS1-Ain', 'EVS1-Bin', 'EVS1-Cin', 'EVS1-Din', 'EVS1-Ein', 'EVS1-Fin',
          'EVS2-Ain', 'EVS2-Bin', 'EVS2-Cin', 'EVS2-Din', 'EVS2-Ein', 'EVS2-Fin',
          'EVS3-Ain', 'EVS3-Bin', 'EVS3-Cin', 'EVS3-Din', 'EVS3-Ein', 'EVS3-Fin',
        ];
        evsInputs.forEach(name => contentArea.appendChild(createDraggableChip(name, 'evs')));
        const evsSupers = ['EVS 1-As', 'EVS 1-Bs', 'EVS 2-As', 'EVS 2-Bs', 'EVS 3-As', 'EVS 3-Bs'];
        evsSupers.forEach(name => contentArea.appendChild(createDraggableChip(name, 'evs')));
      } else if (catId === 'tx') {
        const txDas = ['TX1 DA', 'TX2 DA', 'TX3 DA', 'TX4 DA', 'TX5 DA', 'TX6 DA', 'TX7 DA', 'TX8 DA', 'PGM DA'];
        txDas.forEach(name => contentArea.appendChild(createDraggableChip(name, 'tx')));
      } else if (catId === 'cg') {
        const cgChannels = ['CG 1', 'CG 2', 'CG 3', 'CG 4', 'CG 5', 'CG 6'];
        cgChannels.forEach(name => contentArea.appendChild(createDraggableChip(name, 'cg')));
        const canvasChannels = ['CANVAS 1', 'CANVAS 2', 'CANVAS 3', 'CANVAS 4', 'CANVAS 5', 'CANVAS 6'];
        canvasChannels.forEach(name => contentArea.appendChild(createDraggableChip(name, 'cg')));
      } else if (catId === 'test') {
        const testSignals = ['BLACK', 'BARS', 'VALID'];
        testSignals.forEach(name => contentArea.appendChild(createDraggableChip(name, 'test')));
      } else if (catId === 'swr') {
        const swrOutputs = (Store.data && Store.data.swrIo && Store.data.swrIo.outputs) ? Store.data.swrIo.outputs : [];
        let swrCount = 0;
        if (Array.isArray(swrOutputs)) {
          swrOutputs.forEach(item => {
            const name = item && (item.show || item.defaultShow);
            if (name) {
              contentArea.appendChild(createDraggableChip(name, 'swr'));
              swrCount++;
            }
          });
        }
        if (swrCount === 0) {
          // Fallback - use RTR I/O naming
          ['PGM A', 'CLEAN', 'PRESET', 'SWR PVW', 'ME1 PVW', 'AUX 01'].forEach(name => contentArea.appendChild(createDraggableChip(name, 'swr')));
        }
      }
    }

    categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.textContent = cat.label;
      tab.style.cssText = `
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        border: 2px solid ${cat.color};
        border-radius: 4px;
        cursor: pointer;
        background: ${cat.id === activeTab ? cat.color : 'transparent'};
        color: ${cat.id === activeTab ? '#fff' : cat.color};
        transition: all 0.15s;
      `;
      tab.addEventListener('click', () => {
        activeTab = cat.id;
        // Update all tab styles
        tabBar.querySelectorAll('button').forEach((btn, idx) => {
          const c = categories[idx];
          btn.style.background = c.id === activeTab ? c.color : 'transparent';
          btn.style.color = c.id === activeTab ? '#fff' : c.color;
        });
        renderContent(cat.id);
      });
      tabBar.appendChild(tab);
    });

    wrapper.appendChild(tabBar);
    wrapper.appendChild(contentArea);
    renderContent(activeTab);

    return wrapper;
  }

  // Create a draggable source chip - router panel button style
  function createDraggableChip(label, type, isPlaceholder = false) {
    const chip = document.createElement('div');
    chip.draggable = true;
    chip.dataset.source = label;
    chip.dataset.sourceType = type;

    // Color scheme by category
    const colors = {
      show:  { bg: '#1e3a5f', border: '#3b6998', text: '#8ec8ff' },  // Blue - all show sources
      evs:   { bg: '#4a1e5f', border: '#8b3ba0', text: '#d8a0ff' },  // Purple - EVS
      tx:    { bg: '#5f3a1e', border: '#a07030', text: '#ffc890' },  // Orange - TX/PGM
      cg:    { bg: '#5f1e4a', border: '#a03080', text: '#ff90c8' },  // Pink - CG/Canvas
      test:  { bg: '#3a3a3a', border: '#6a6a6a', text: '#c0c0c0' },  // Gray - Test signals
      swr:   { bg: '#2a5a2a', border: '#4a8a4a', text: '#90ff90' },  // Green - SWR outs
    };
    const c = colors[type] || colors.show;
    const opacity = isPlaceholder ? '0.4' : '1';

    chip.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 54px;
      height: 32px;
      padding: 4px 6px;
      font-size: 10px;
      font-weight: 600;
      background: ${c.bg};
      border: 2px solid ${c.border};
      border-radius: 4px;
      color: ${c.text};
      cursor: grab;
      user-select: none;
      text-align: center;
      opacity: ${opacity};
      touch-action: none;
      box-sizing: border-box;
    `;
    chip.textContent = label;

    // Touch-friendly: use pointer events
    chip.addEventListener('pointerdown', (e) => {
      chip.style.transform = 'scale(0.95)';
    });
    chip.addEventListener('pointerup', () => {
      chip.style.transform = 'scale(1)';
    });
    chip.addEventListener('pointercancel', () => {
      chip.style.transform = 'scale(1)';
    });

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', label);
      e.dataTransfer.effectAllowed = 'copy';
      chip.style.opacity = '0.3';
    });

    chip.addEventListener('dragend', () => {
      chip.style.opacity = isPlaceholder ? '0.4' : '1';
      chip.style.transform = 'scale(1)';
    });

    return chip;
  }

  return { render };
})();
