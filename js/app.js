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
    'monitors-video': (c) => MonitorsTab.render(c, 'video'),
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

  // ============================================
  // Stage All Routes & Layouts from Show Data
  // ============================================

  function stageAllFromShowData() {
    let nv9000Count = 0;
    let kaleidoCount = 0;

    const hasNV9000 = typeof NV9000Client !== 'undefined';
    const hasKaleido = typeof KaleidoClient !== 'undefined';

    // Clear existing staged items first
    if (hasNV9000) {
      NV9000Client.clearStagedRoutes();
    }
    if (hasKaleido) {
      KaleidoClient.clearStagedLayouts();
    }

    if (!hasNV9000) {
      console.warn('[StageAll] NV9000Client not available');
      return { nv9000Count: 0, kaleidoCount: 0 };
    }

    // ── Stage NV9000 Routes ──

    // 1. Video I/O - Fiber RTR Out (source → destination)
    const videoIo = Store.data.videoIo;
    if (videoIo) {
      // Fiber RTR Out
      (videoIo.fiberRtrOut || []).forEach(row => {
        if (row.source && row.destination) {
          const result = NV9000Client.stageRoute(row.source, row.destination);
          if (result.success) nv9000Count++;
        }
      });

      // Coax RTR Out
      (videoIo.coaxRtrOut || []).forEach(row => {
        if (row.source && row.destination) {
          const result = NV9000Client.stageRoute(row.source, row.destination);
          if (result.success) nv9000Count++;
        }
      });

      // Coax I/O Tie Lines
      (videoIo.coaxIoTieLines || []).forEach(row => {
        if (row.source && row.destination) {
          const result = NV9000Client.stageRoute(row.source, row.destination);
          if (result.success) nv9000Count++;
        }
      });

      // Coax Truck Tie Lines
      (videoIo.coaxTruckTieLines || []).forEach(row => {
        if (row.source && row.destination) {
          const result = NV9000Client.stageRoute(row.source, row.destination);
          if (result.success) nv9000Count++;
        }
      });
    }

    // 2. Prod Digital Multiviewers - inputs (source → MV input)
    const prodDigital = Store.data.prodDigital;
    if (prodDigital && prodDigital.multiviewers) {
      prodDigital.multiviewers.forEach(mv => {
        if (!mv || !mv.inputs) return;

        // Stage MV input routes
        mv.inputs.forEach((source, inputIdx) => {
          if (source) {
            // Determine actual input number based on layout
            const layout = mv.layout;
            let actualInputNum = inputIdx + 1;
            if (layout && (layout.includes('9_SPLIT') || layout === '9_SPLIT')) {
              actualInputNum = inputIdx + 1;
            } else if (layout && layout.includes('6_SPLIT')) {
              const sixSplitMap = { 0: 1, 1: 2, 2: 3, 3: 7, 4: 9, 5: 8 };
              actualInputNum = sixSplitMap[inputIdx] || (inputIdx + 1);
            } else if (layout && layout.includes('5_SPLIT')) {
              const fiveSplitMap = { 0: 1, 1: 2, 2: 3, 3: 7, 4: 9 };
              actualInputNum = fiveSplitMap[inputIdx] || (inputIdx + 1);
            } else if (layout && layout.includes('4_SPLIT')) {
              const fourSplitMap = { 0: 1, 1: 3, 2: 7, 3: 9 };
              actualInputNum = fourSplitMap[inputIdx] || (inputIdx + 1);
            }

            const destName = `MV ${mv.cardId}-${actualInputNum}`;
            const result = NV9000Client.stageRoute(source, destName);
            if (result.success) nv9000Count++;
          }
        });

        // Stage Kaleido layout if configured
        if (mv.layout && mv.cardId && hasKaleido) {
          KaleidoClient.stageLayoutChange(mv.id, null, mv.layout, mv.cardId);
          kaleidoCount++;
        }
      });
    }

    // 3. Monitor Walls V2 - direct sources (for monitors with assignmentType='source')
    const monitorWallsV2 = Store.data.monitorWallsV2;
    if (monitorWallsV2) {
      // Destination mapping for each wall's direct-source monitors
      const wallDestinations = {
        'p2p3': {
          'p2-gfx': 'P2 GFX',
          'p3-mon2': 'P3 MON2',
        },
        'evs': {
          'revs-mon1': 'REVS MON1',
          'revs-mon2': 'REVS MON2',
          'revs-mon3': 'REVS MON3',
          'revs-mon4': 'REVS MON4',
        },
      };

      Object.entries(monitorWallsV2).forEach(([wallKey, wallData]) => {
        if (!wallData || !wallData.monitors) return;
        const destMap = wallDestinations[wallKey] || {};

        wallData.monitors.forEach(mon => {
          if (mon.assignmentType === 'source' && mon.directSource && destMap[mon.id]) {
            const result = NV9000Client.stageRoute(mon.directSource, destMap[mon.id]);
            if (result.success) nv9000Count++;
          }
        });
      });
    }

    console.log(`[StageAll] Staged ${nv9000Count} NV9000 routes, ${kaleidoCount} Kaleido layouts`);
    return { nv9000Count, kaleidoCount };
  }

  // Show staging prompt after cloud show load
  function showStagingPrompt(showName) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1001;display:flex;align-items:center;justify-content:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:24px;min-width:400px;max-width:500px;text-align:center;';

    modal.innerHTML = `
      <h3 style="margin:0 0 12px 0;color:var(--text-primary);font-size:16px;">Show Loaded: ${showName}</h3>
      <p style="margin:0 0 20px 0;color:var(--text-secondary);font-size:13px;">
        Would you like to stage all routes and MV layouts from this show?<br>
        <span style="font-size:11px;color:var(--text-muted);">This is typically only needed by the engineer.</span>
      </p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="stage-no" class="btn btn-primary" style="padding:8px 24px;">Skip (Recommended)</button>
        <button id="stage-yes" class="btn btn-secondary" style="padding:8px 24px;">Stage All</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('stage-yes').addEventListener('click', () => {
      const { nv9000Count, kaleidoCount } = stageAllFromShowData();
      overlay.remove();

      if (nv9000Count > 0 || kaleidoCount > 0) {
        const messages = [];
        if (nv9000Count > 0) messages.push(`${nv9000Count} NV9000 routes`);
        if (kaleidoCount > 0) messages.push(`${kaleidoCount} MV layouts`);
        Utils.toast(`Staged: ${messages.join(', ')}`, 'success');
      } else {
        Utils.toast('No routes or layouts to stage', 'info');
      }
    });

    document.getElementById('stage-no').addEventListener('click', () => {
      overlay.remove();
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  function init() {
    // Init store
    Store.init();

    // Init Tallyman Bridge WebSocket (for remote trigger from Companion)
    if (typeof TallymanBridge !== 'undefined') {
      TallymanBridge.init();
    }

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

    // Refresh from cloud button
    document.getElementById('btn-refresh-cloud').addEventListener('click', () => {
      if (SupabaseSync.connected) {
        SupabaseSync.forceRefresh();
      } else {
        Utils.toast('Not connected to cloud', 'warn');
      }
    });

    // Click on status indicator copies share URL
    document.getElementById('connection-status').addEventListener('click', () => {
      SupabaseSync.copyShareUrl();
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

    // Init RouteQueue (checks if bridges are reachable)
    RouteQueue.init();
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
          // Show staging prompt for routes and MV layouts
          showStagingPrompt(show.name);
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

  return { navigateTo, renderCurrentTab, updateHeader, showStagingPrompt };
})();
