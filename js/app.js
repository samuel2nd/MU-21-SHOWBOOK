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

    document.getElementById('btn-share').addEventListener('click', () => {
      SupabaseSync.copyShareUrl();
    });

    document.getElementById('btn-cloud-shows').addEventListener('click', () => {
      showCloudShowsModal();
    });

    // Click on status indicator copies share URL
    document.getElementById('connection-status').addEventListener('click', () => {
      SupabaseSync.copyShareUrl();
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

  // Cloud shows modal
  async function showCloudShowsModal() {
    if (!SupabaseSync.connected) {
      Utils.toast('Not connected to cloud', 'warn');
      return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;min-width:400px;max-width:600px;max-height:80vh;overflow-y:auto;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = '<h3 style="margin:0;color:var(--accent-blue);">Cloud Shows</h3>';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715';
    closeBtn.style.cssText = 'background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Loading
    const listDiv = document.createElement('div');
    listDiv.innerHTML = '<p style="color:var(--text-secondary);text-align:center;">Loading shows...</p>';
    modal.appendChild(listDiv);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fetch shows
    const shows = await SupabaseSync.listCloudShows();

    if (shows.length === 0) {
      listDiv.innerHTML = '<p style="color:var(--text-secondary);text-align:center;">No shows in cloud yet. Create one using "+ New Show".</p>';
    } else {
      listDiv.innerHTML = '';
      shows.forEach(show => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border);';

        const info = document.createElement('div');
        info.innerHTML = `
          <div style="font-weight:600;color:var(--text-primary);">${show.name}</div>
          <div style="font-size:11px;color:var(--text-secondary);">Updated: ${new Date(show.updated_at).toLocaleString()}</div>
        `;
        row.appendChild(info);

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;';

        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.className = 'btn btn-primary';
        loadBtn.style.cssText = 'padding:4px 12px;font-size:12px;';
        loadBtn.addEventListener('click', async () => {
          await SupabaseSync.loadShow(show.name);
          updateHeader();
          renderCurrentTab();
          overlay.remove();
          Utils.toast(`Loaded "${show.name}"`, 'success');
        });
        actions.appendChild(loadBtn);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Link';
        copyBtn.className = 'btn btn-secondary';
        copyBtn.style.cssText = 'padding:4px 12px;font-size:12px;';
        copyBtn.addEventListener('click', async () => {
          const url = new URL(window.location.origin + window.location.pathname);
          url.searchParams.set('show', show.name);
          await navigator.clipboard.writeText(url.href);
          Utils.toast('Link copied', 'success');
        });
        actions.appendChild(copyBtn);

        row.appendChild(actions);
        listDiv.appendChild(row);
      });
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { navigateTo, renderCurrentTab, updateHeader };
})();
