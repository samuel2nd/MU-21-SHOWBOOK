// FIBER TAC Tab — TAC A-H, S09, S10 patch panels (visual layout)
const FiberTacTab = (() => {
  function render(container) {
    const page = Utils.tabPage('FIBER TAC', 'Fiber patch panel assignments — TAC A through H, S09, S10');

    const panels = Store.data.sheet8.tacPanels || ['TAC-A', 'TAC-B', 'TAC-C', 'TAC-D', 'TAC-E', 'TAC-F', 'TAC-G', 'TAC-H', 'S09', 'S10'];

    panels.forEach(panelName => {
      page.appendChild(Utils.sectionHeader(panelName));

      const panelData = Store.data.fiberTac[panelName];
      if (!panelData) return;

      // Visual grid
      const grid = document.createElement('div');
      grid.className = 'tac-panel';

      panelData.forEach((port, idx) => {
        const cell = document.createElement('div');
        cell.className = 'tac-port' + (port.source ? ' in-use' : '');
        const portLabel = document.createElement('div');
        portLabel.style.cssText = 'font-weight:700;font-size:10px;color:var(--text-muted);';
        portLabel.textContent = `Port ${port.port}`;
        const portSource = document.createElement('div');
        portSource.style.cssText = 'font-size:11px;margin-top:2px;';
        portSource.textContent = port.source || '—';
        cell.appendChild(portLabel);
        cell.appendChild(portSource);
        cell.title = `${panelName} Port ${port.port}: ${port.source || 'Empty'} \u2192 ${port.dest || 'N/A'}`;
        cell.addEventListener('click', () => editPort(panelName, idx));
        grid.appendChild(cell);
      });
      page.appendChild(grid);

      // Detail table
      const columns = [
        { key: '_rowNum', label: 'Port', width: '45px' },
        { key: 'source', label: 'Source' },
        { key: 'dest', label: 'Destination' },
        { key: 'notes', label: 'Notes' },
      ];
      Utils.renderEditableTable(page, columns, `fiberTac.${panelName}`, panelData);
    });

    container.appendChild(page);
  }

  function editPort(panelName, idx) {
    const port = Store.data.fiberTac[panelName][idx];
    const source = prompt(`${panelName} Port ${port.port} — Source:`, port.source || '');
    if (source === null) return;
    port.source = source;
    const dest = prompt(`${panelName} Port ${port.port} — Destination:`, port.dest || '');
    if (dest !== null) port.dest = dest;
    Store.set(`fiberTac.${panelName}.${idx}`, { ...port });
    App.renderCurrentTab();
  }

  return { render };
})();
