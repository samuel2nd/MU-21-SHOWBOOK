// HOME Tab
const HomeTab = (() => {
  function render(container) {
    const page = Utils.tabPage('HOME', 'MU-21 Showbook');

    // Show info form
    const form = document.createElement('div');
    form.className = 'home-form';
    form.innerHTML = `
      <label>Show Name <span style="color:var(--accent-red)">*</span></label>
      <input type="text" id="home-show-name" value="" placeholder="Enter show name..." maxlength="100" required>
      <label>Format</label>
      <select id="home-show-format">
        <option value="">--</option>
        <option value="1080p/59.94">1080p/59.94</option>
        <option value="1080i/59.94">1080i/59.94</option>
        <option value="720p/59.94">720p/59.94</option>
      </select>
    `;
    page.appendChild(form);

    // Set values safely via DOM property (not innerHTML)
    form.querySelector('#home-show-name').value = Store.data.show.name || '';
    form.querySelector('#home-show-format').value = Store.data.show.format || '';

    // Bind show name/format
    const nameInput = form.querySelector('#home-show-name');
    const formatInput = form.querySelector('#home-show-format');
    nameInput.addEventListener('change', () => {
      Store.set('show.name', nameInput.value);
      App.updateHeader();
    });
    formatInput.addEventListener('change', () => {
      Store.set('show.format', formatInput.value);
      App.updateHeader();
    });

    // Equipment summary
    page.appendChild(Utils.sectionHeader('Equipment Summary'));
    const summary = document.createElement('div');
    summary.className = 'equip-summary';
    summary.id = 'home-equip-summary';
    page.appendChild(summary);
    renderSummary(summary);

    // Nav grid
    page.appendChild(Utils.sectionHeader('Quick Navigation'));
    const grid = document.createElement('div');
    grid.className = 'home-grid';

    const tabs = [
      { tab: 'source', label: 'SOURCE', cat: 'input' },
      { tab: 'txpgmgfx', label: 'TX/PGM/GFX', cat: 'input' },
      { tab: 'ccufsy', label: 'CCU/FSY INPUT', cat: 'input' },
      { tab: 'rtrmaster', label: 'RTR I/O MASTER', cat: 'lookup' },
      { tab: 'sheet8', label: 'Sheet8 (Ref Data)', cat: 'lookup' },
      { tab: 'engineer', label: 'ENGINEER', cat: 'output' },
      { tab: 'swrio', label: 'SWR I/O', cat: 'output' },
      { tab: 'videoio', label: 'VIDEO I/O', cat: 'physical' },
      { tab: 'fibertac', label: 'FIBER TAC', cat: 'physical' },
      { tab: 'coax', label: 'COAX MULTS/MUX', cat: 'physical' },
      { tab: 'audiomult', label: 'AUDIO MULT', cat: 'physical' },
      { tab: 'networkio', label: 'NETWORK I/O', cat: 'physical' },
      { tab: 'monitors-prod-digital', label: 'PROD Digital', cat: 'monitor' },
      { tab: 'monitors-prod-print', label: 'PROD Print', cat: 'monitor' },
      { tab: 'monitors-p2p3', label: 'P2-P3', cat: 'monitor' },
      { tab: 'monitors-evs', label: 'EVS', cat: 'monitor' },
      { tab: 'monitors-aud', label: 'AUD', cat: 'monitor' },
      { tab: 'evsconfig', label: 'EVS CONFIG', cat: 'config' },
      { tab: 'multiviewer', label: 'MULTIVIEWER', cat: 'config' },
      { tab: 'routerpanel', label: 'ROUTER PANELS', cat: 'config' },
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

    // Build device breakdown string - only show non-zero counts
    const deviceCounts = [];
    if (s.camCount) deviceCounts.push(`CAM: ${s.camCount}`);
    if (s.ccuCount) deviceCounts.push(`CCU: ${s.ccuCount}`);
    if (s.fsyCount) deviceCounts.push(`FSY: ${s.fsyCount}`);
    if (s.evsCount) deviceCounts.push(`EVS: ${s.evsCount}`);
    if (s.vtrCount) deviceCounts.push(`VTR: ${s.vtrCount}`);
    if (s.gfxCount) deviceCounts.push(`GFX: ${s.gfxCount}`);

    const cards = [
      {
        title: 'Sources',
        value: `${s.totalSources} / 80`,
        detail: deviceCounts.length > 0 ? deviceCounts.join(' | ') : 'No devices assigned'
      },
      {
        title: 'Devices',
        value: `${s.usedDevices} / ${s.totalDevices}`,
        detail: 'RTR I/O Master'
      },
    ];

    cards.forEach(c => {
      const card = document.createElement('div');
      card.className = 'equip-card';
      const t = document.createElement('div'); t.className = 'equip-title'; t.textContent = c.title;
      const v = document.createElement('div'); v.className = 'equip-value'; v.textContent = c.value;
      const d = document.createElement('div'); d.className = 'equip-detail'; d.textContent = c.detail;
      card.appendChild(t); card.appendChild(v); card.appendChild(d);
      el.appendChild(card);
    });
  }

  return { render };
})();
