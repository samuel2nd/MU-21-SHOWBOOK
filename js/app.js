// ============================================
// App Init — Tab routing, header, global events
// ============================================

const App = (() => {
  let currentTab = 'home';

  const tabRenderers = {
    'home': (c) => HomeTab.render(c),
    'source': (c) => SourceTab.render(c),
    'txpgmgfx': (c) => TxPgmGfxTab.render(c),
    'ccufsy': (c) => CcuFsyTab.render(c),
    'rtrmaster': (c) => RtrMasterTab.render(c),
    'sheet8': (c) => Sheet8Tab.render(c),
    'engineer': (c) => EngineerTab.render(c),
    'swrio': (c) => SwrIoTab.render(c),
    'videoio': (c) => VideoIoTab.render(c),
    'fibertac': (c) => FiberTacTab.render(c),
    'coax': (c) => CoaxTab.render(c),
    'audiomult': (c) => AudioMultTab.render(c),
    'networkio': (c) => NetworkIoTab.render(c),
    'monitors-prod-digital': (c) => ProdDigitalTab.render(c),
    'monitors-prod-print': (c) => MonitorsTab.render(c, 'prod-print'),
    'monitors-p2p3': (c) => MonitorsTab.render(c, 'p2p3'),
    'monitors-evs': (c) => MonitorsTab.render(c, 'evs'),
    'monitors-aud': (c) => MonitorsTab.render(c, 'aud'),
    'evsconfig': (c) => EvsConfigTab.render(c),
    'multiviewer': (c) => MultiviewerTab.render(c),
    'routerpanel': (c) => RouterPanelTab.render(c),
  };

  function navigateTo(tabKey) {
    currentTab = tabKey;
    renderTab(tabKey);
    updateNavHighlight(tabKey);
  }

  function renderTab(tabKey) {
    const content = document.getElementById('tab-content');
    content.innerHTML = '';
    content.scrollTop = 0;
    const renderer = tabRenderers[tabKey];
    if (renderer) {
      renderer(content);
    } else {
      content.innerHTML = `<div class="tab-page"><h2 class="tab-title">Tab Not Found</h2><p class="tab-subtitle">No renderer for tab: ${tabKey}</p></div>`;
    }
  }

  function renderCurrentTab() {
    renderTab(currentTab);
  }

  function updateNavHighlight(tabKey) {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });
  }

  function updateHeader() {
    const nameEl = document.getElementById('header-show-name');
    const formatEl = document.getElementById('header-show-format');
    nameEl.textContent = Store.data.show.name || 'No Show Loaded';
    formatEl.textContent = Store.data.show.format || '';
    document.title = `MU-21 — ${Store.data.show.name || 'Showbook'}`;
  }

  function init() {
    // Init store
    Store.init();

    // Set up tab navigation
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.tab));
    });

    // Header buttons
    document.getElementById('btn-new-show').addEventListener('click', () => {
      ExportImport.newShow();
      updateHeader();
      renderCurrentTab();
    });

    document.getElementById('btn-import').addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });

    document.getElementById('import-file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await ExportImport.importJSON(file);
        updateHeader();
        navigateTo('home');
        alert('Show imported successfully!');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
      e.target.value = '';
    });

    document.getElementById('btn-export-json').addEventListener('click', () => {
      ExportImport.exportJSON();
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
      ExportImport.exportCSV(currentTab);
    });

    // Listen for show-loaded to refresh UI
    Store.on('show-loaded', () => {
      updateHeader();
      renderCurrentTab();
    });

    // Save indicator
    let saveTimer;
    Store.on('saved', () => {
      const el = document.getElementById('save-indicator');
      if (el) {
        el.textContent = 'Saved';
        el.classList.add('just-saved');
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => el.classList.remove('just-saved'), 1500);
      }
    });

    // Listen for remote changes to refresh current tab
    Store.on('remote-change', Utils.debounce(() => {
      renderCurrentTab();
    }, 500));

    // Update header
    updateHeader();

    // Render initial tab
    renderTab('home');

    // Init Supabase (async, non-blocking)
    SupabaseSync.init();
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { navigateTo, renderCurrentTab, updateHeader };
})();
