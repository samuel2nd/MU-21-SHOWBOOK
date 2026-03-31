// HOME Tab
const HomeTab = (() => {
  function render(container) {
    const page = Utils.tabPage('HOME', 'MU-21 Showbook');

    // Top row: Show info + Equipment summary in matching boxes
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;gap:12px;margin-bottom:12px;align-items:stretch;';

    // Show info box
    const showBox = document.createElement('div');
    showBox.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;';
    showBox.innerHTML = `
      <div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">SHOW INFO</div>
      <div style="display:flex;gap:12px;align-items:center;">
        <label style="font-size:11px;color:var(--text-secondary);">Name</label>
        <input type="text" id="home-show-name" value="" placeholder="Enter show name..." maxlength="100" style="padding:4px 8px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);width:160px;">
        <label style="font-size:11px;color:var(--text-secondary);">Format</label>
        <select id="home-show-format" style="padding:4px 8px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text-primary);">
          <option value="">--</option>
          <option value="1080p/59.94">1080p/59.94</option>
          <option value="1080i/59.94">1080i/59.94</option>
          <option value="720p/59.94">720p/59.94</option>
        </select>
      </div>
    `;
    topRow.appendChild(showBox);

    // Set values safely via DOM property
    showBox.querySelector('#home-show-name').value = Store.data.show.name || '';
    showBox.querySelector('#home-show-format').value = Store.data.show.format || '';

    // Bind show name/format
    const nameInput = showBox.querySelector('#home-show-name');
    const formatInput = showBox.querySelector('#home-show-format');
    nameInput.addEventListener('change', () => {
      Store.set('show.name', nameInput.value);
      App.updateHeader();
    });
    formatInput.addEventListener('change', () => {
      Store.set('show.format', formatInput.value);
      App.updateHeader();
    });

    // Equipment summary box (matching style)
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = 'background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;';
    summaryBox.innerHTML = `<div style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px;">EQUIPMENT SUMMARY</div>`;
    const summary = document.createElement('div');
    summary.id = 'home-equip-summary';
    summary.style.cssText = 'display:flex;gap:16px;align-items:center;';
    summaryBox.appendChild(summary);
    renderSummary(summary);
    topRow.appendChild(summaryBox);

    page.appendChild(topRow);

    // Nav grid
    page.appendChild(Utils.sectionHeader('Quick Navigation'));
    const grid = document.createElement('div');
    grid.className = 'home-grid';

    // Match sidebar order exactly
    const tabs = [
      // INPUT
      { tab: 'txpgmgfx', label: 'TX/PGM/GFX', cat: 'input' },
      { tab: 'source', label: 'SHOW SOURCES', cat: 'input' },
      { tab: 'evsconfig', label: 'EVS CONFIG', cat: 'input' },
      // PHYSICAL I/O
      { tab: 'ccufsy', label: 'CCU/FSY', cat: 'physical' },
      { tab: 'videoio', label: 'VIDEO I/O', cat: 'physical' },
      { tab: 'networkio', label: 'NETWORK I/O', cat: 'physical' },
      { tab: 'swrio', label: 'SWR I/O', cat: 'physical' },
      // CONNECTION
      { tab: 'fibertac', label: 'FIBER TAC', cat: 'connection' },
      { tab: 'coax', label: 'COAX MULTS', cat: 'connection' },
      { tab: 'audiomult', label: 'AUDIO MULTS', cat: 'connection' },
      // MONITOR WALLS
      { tab: 'monitors-prod-digital', label: 'PROD Digital', cat: 'monitor' },
      { tab: 'monitors-prod-print', label: 'PROD Print', cat: 'monitor' },
      { tab: 'monitors-p2p3', label: 'P2-P3', cat: 'monitor' },
      { tab: 'monitors-evs', label: 'EVS', cat: 'monitor' },
      { tab: 'monitors-aud', label: 'AUD', cat: 'monitor' },
      { tab: 'monitors-video', label: 'VIDEO', cat: 'monitor' },
      // CONFIG
      { tab: 'engineer', label: 'ENGINEER', cat: 'config' },
      { tab: 'multiviewer', label: 'MULTIVIEWERS', cat: 'config' },
      { tab: 'routerpanel', label: 'ROUTER PANELS', cat: 'config' },
      { tab: 'activitylog', label: 'ACTIVITY LOG', cat: 'config' },
      // LOOKUP
      { tab: 'rtrmaster', label: 'RTR I/O MASTER', cat: 'lookup' },
      { tab: 'sheet8', label: 'Dropdown Options', cat: 'lookup' },
    ];

    tabs.forEach(t => {
      const card = document.createElement('div');
      card.className = 'home-nav-card';
      card.dataset.cat = t.cat;
      card.innerHTML = `<div class="card-label">${t.label}</div><div class="card-cat">${t.cat}</div>`;
      card.addEventListener('click', () => App.navigateTo(t.tab));
      grid.appendChild(card);
    });
    page.appendChild(grid);

    container.appendChild(page);
  }

  function renderSummary(el) {
    const s = Formulas.equipmentSummary();
    el.innerHTML = '';

    // Sources count
    const srcSpan = document.createElement('span');
    srcSpan.style.cssText = 'font-size:12px;color:var(--text-primary);';
    srcSpan.innerHTML = `<strong style="color:var(--accent-blue);">${s.totalSources}</strong> / 80 Sources`;
    el.appendChild(srcSpan);

    // Device breakdown - only show non-zero counts
    const deviceCounts = [];
    if (s.camCount) deviceCounts.push(`CAM: ${s.camCount}`);
    if (s.ccuCount) deviceCounts.push(`CCU: ${s.ccuCount}`);
    if (s.fsyCount) deviceCounts.push(`FSY: ${s.fsyCount}`);
    if (s.evsCount) deviceCounts.push(`EVS: ${s.evsCount}`);
    if (s.vtrCount) deviceCounts.push(`VTR: ${s.vtrCount}`);
    if (s.gfxCount) deviceCounts.push(`GFX: ${s.gfxCount}`);

    if (deviceCounts.length > 0) {
      const detailSpan = document.createElement('span');
      detailSpan.style.cssText = 'font-size:11px;color:var(--text-secondary);';
      detailSpan.textContent = deviceCounts.join(' | ');
      el.appendChild(detailSpan);
    }
  }

  return { render };
})();
