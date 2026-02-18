// TX/PGM/GFX Tab — TX1-8, CG 1-6, PGM
const TxPgmGfxTab = (() => {
  function render(container) {
    const page = Utils.tabPage('TX / PGM / GFX', 'Transmission outputs, CG generators, and program assignments');

    const sections = [
      { key: 'tx', label: 'TRANSMISSION DA INPUTS (TX 1–8)', count: 8 },
      { key: 'cg', label: 'Character Generators (CG 1–6)', count: 6 },
      { key: 'pgm', label: 'Program', count: 1 },
    ];

    const baseColumns = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'device', label: 'Device' },
      { key: 'source', label: 'ENG SOURCE', type: 'select', options: () => Utils.getDeviceOptions() },
      { key: 'notes', label: 'Notes' },
    ];

    // TX section gets extra Fiber Panel + Fiber Port columns
    const txFiberColumns = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'device', label: 'Device' },
      { key: 'source', label: 'ENG SOURCE', type: 'select', options: () => Utils.getDeviceOptions() },
      { key: 'fiberPanel', label: 'Fiber Panel', type: 'select', options: () => (Store.data.sheet8.tacPanels || []) },
      { key: 'fiberPort', label: 'Fiber Port', type: 'select', options: () => {
        const ports = [];
        for (let i = 1; i <= 24; i++) ports.push(String(i));
        return ports;
      }},
      { key: 'notes', label: 'Notes' },
    ];

    sections.forEach(sec => {
      page.appendChild(Utils.sectionHeader(sec.label));
      const cols = sec.key === 'tx' ? txFiberColumns : baseColumns;
      const table = Utils.renderEditableTable(page, cols, `txPgmGfx.${sec.key}`, Store.data.txPgmGfx[sec.key]);

      // For TX section, bind fiber panel/port changes to auto-populate fiberTac
      if (sec.key === 'tx') {
        bindFiberAutoPopulate(table, Store.data.txPgmGfx[sec.key]);
      }
    });

    container.appendChild(page);
  }

  function bindFiberAutoPopulate(table, txData) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((tr, rowIdx) => {
      const selects = tr.querySelectorAll('select');
      // Find the fiber panel and fiber port selects (3rd and 4th selects in the row)
      // selects[0] = ENG SOURCE, selects[1] = Fiber Panel, selects[2] = Fiber Port
      if (selects.length >= 3) {
        const panelSel = selects[1];
        const portSel = selects[2];

        const updateFiberTac = () => {
          const panel = txData[rowIdx].fiberPanel;
          const port = txData[rowIdx].fiberPort;
          if (panel && port && Store.data.fiberTac[panel]) {
            const portIdx = parseInt(port, 10) - 1;
            if (portIdx >= 0 && portIdx < Store.data.fiberTac[panel].length) {
              const sourceName = txData[rowIdx].device || txData[rowIdx].source || `TX${rowIdx + 1}`;
              Store.data.fiberTac[panel][portIdx].source = sourceName;
              Store.set(`fiberTac.${panel}.${portIdx}.source`, sourceName);
            }
          }
        };

        panelSel.addEventListener('change', updateFiberTac);
        portSel.addEventListener('change', updateFiberTac);
      }
    });
  }

  return { render };
})();
