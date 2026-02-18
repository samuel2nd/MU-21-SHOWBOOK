// MULTIVIEWER CONFIGURATION — MV 1-25 with 16 windows each
const MultiviewerTab = (() => {
  function render(container) {
    const page = Utils.tabPage('MULTIVIEWER CONFIGURATION', '25 multiviewer outputs — 16 windows each');

    Store.data.multiviewer.forEach((mv, mvIdx) => {
      page.appendChild(Utils.sectionHeader(`MV ${mv.mv}`));

      // Visual 4×4 grid
      const grid = document.createElement('div');
      grid.className = 'monitor-wall';
      grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
      grid.style.maxWidth = '500px';

      mv.windows.forEach((win, wIdx) => {
        const cell = document.createElement('div');
        cell.className = 'monitor-cell' + (win.source ? ' active' : '');
        cell.style.minHeight = '45px';
        const wLabel = document.createElement('div');
        wLabel.className = 'mon-label';
        wLabel.textContent = `W${win.window}`;
        const wSource = document.createElement('div');
        wSource.className = 'mon-source';
        wSource.style.fontSize = '10px';
        wSource.textContent = win.source || '—';
        cell.appendChild(wLabel);
        cell.appendChild(wSource);
        cell.addEventListener('click', () => {
          const source = prompt(`MV${mv.mv} Window ${win.window} — Source:`, win.source || '');
          if (source === null) return;
          win.source = source;
          win.label = source;
          Store.set(`multiviewer.${mvIdx}.windows.${wIdx}`, { ...win });
          App.renderCurrentTab();
        });
        grid.appendChild(cell);
      });
      page.appendChild(grid);

      // Detail table (collapsible)
      const detailToggle = document.createElement('button');
      detailToggle.className = 'btn';
      detailToggle.textContent = 'Show/Hide Detail Table';
      detailToggle.style.cssText = 'margin:8px 0;font-size:11px;';
      const detailDiv = document.createElement('div');
      detailDiv.style.display = 'none';
      detailToggle.addEventListener('click', () => {
        detailDiv.style.display = detailDiv.style.display === 'none' ? 'block' : 'none';
      });
      page.appendChild(detailToggle);

      const columns = [
        { key: '_rowNum', label: 'Win', width: '35px' },
        { key: 'source', label: 'Source', type: 'select', options: () => Utils.getSourceOptions() },
        { key: 'label', label: 'Label' },
      ];
      Utils.renderEditableTable(detailDiv, columns, `multiviewer.${mvIdx}.windows`, mv.windows);
      page.appendChild(detailDiv);
    });

    container.appendChild(page);
  }

  return { render };
})();
