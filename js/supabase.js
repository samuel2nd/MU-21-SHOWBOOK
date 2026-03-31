// ============================================
// Supabase Client — Cloud storage + Real-time sync
// ============================================
//
// Requires a 'shows' table in Supabase with the following structure:
// CREATE TABLE shows (
//   name TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW(),
//   session_id TEXT  -- Used to filter out own real-time updates
// );
// To add session_id to existing table: ALTER TABLE shows ADD COLUMN session_id TEXT;
//
// Enable real-time: ALTER PUBLICATION supabase_realtime ADD TABLE shows;
// Enable RLS with public access for anon:
// ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow public access" ON shows FOR ALL USING (true) WITH CHECK (true);

const SupabaseSync = (() => {
  let client = null;
  let channel = null;
  let connected = false;
  let currentShowName = null;
  let saveTimeout = null;
  let isLoadingRemote = false;
  let syncCheckInterval = null;
  let realtimeActive = false; // Track if real-time subscription is working

  // Unique session ID to filter out our own real-time updates
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  function isConfigured() {
    return typeof SUPABASE_CONFIG !== 'undefined' &&
      SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;
  }

  // Parse URL for ?show=SHOWNAME parameter
  function getShowNameFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('show');
  }

  // Update URL with show name (without page reload)
  function updateUrl(showName) {
    if (!showName) return;
    const url = new URL(window.location);
    url.searchParams.set('show', showName);
    window.history.replaceState({}, '', url);
  }

  async function init() {
    if (!isConfigured()) {
      console.log('Supabase not configured — using localStorage only');
      updateStatus(false, 'Not configured');
      return;
    }

    try {
      updateStatus(false, 'Connecting...');

      // Dynamically load Supabase client
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      const { createClient } = supabase;
      client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

      // Check if we have a show name in URL
      const urlShowName = getShowNameFromUrl();

      if (urlShowName) {
        // Load from Supabase
        const loaded = await loadShow(urlShowName);
        if (loaded && typeof App !== 'undefined' && App.showStagingPrompt) {
          // Show staging prompt after loading from URL
          setTimeout(() => App.showStagingPrompt(urlShowName), 500);
        }
      } else if (Store.data.show.name) {
        // We have a local show, use that name
        currentShowName = Store.data.show.name;
        updateUrl(currentShowName);
        // Save it to Supabase
        await saveShow();
      }

      // Subscribe to real-time changes
      if (currentShowName) {
        subscribeToChanges(currentShowName);
      }

      connected = true;
      updateStatus(true, currentShowName ? `LIVE: ${currentShowName}` : 'LIVE');

      // Start periodic sync check to catch stale clients
      startSyncCheck();

      // Listen for local changes and save to Supabase
      Store.on('change', handleLocalChange);
      Store.on('show-loaded', handleShowLoaded);

    } catch (e) {
      console.warn('Supabase init failed:', e);
      updateStatus(false, 'Connection failed');
    }
  }

  async function loadShow(showName) {
    if (!client) return false;

    try {
      updateStatus(false, `Loading ${showName}...`);

      const { data, error } = await client
        .from('shows')
        .select('data')
        .eq('name', showName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found - create new show
          console.log(`Show "${showName}" not found, creating new`);
          currentShowName = showName;
          Store.newShow(showName, '');
          updateUrl(showName);
          await saveShow();
          return true;
        }
        throw error;
      }

      if (data && data.data) {
        isLoadingRemote = true;
        Store.loadShow(data.data);
        isLoadingRemote = false;
        currentShowName = showName;
        updateUrl(showName);
        console.log(`Loaded show "${showName}" from Supabase`);
        return true;
      }
    } catch (e) {
      console.error('Failed to load show:', e);
      Utils.toast(`Failed to load show: ${e.message}`, 'error');
    }
    return false;
  }

  async function saveShow() {
    if (!client || !currentShowName || isLoadingRemote) return;

    try {
      // Fetch current cloud version to check for conflicts
      const { data: cloudData, error: fetchError } = await client
        .from('shows')
        .select('data')
        .eq('name', currentShowName)
        .single();

      if (!fetchError && cloudData?.data) {
        const cloudVersion = cloudData.data.show?.version || 0;
        const localVersion = Store.data.show?.version || 0;

        // If cloud has a newer version, don't overwrite - fetch and merge
        if (cloudVersion > localVersion) {
          console.log(`Cloud has newer version (${cloudVersion} > ${localVersion}), fetching...`);
          isLoadingRemote = true;
          Store.loadShow(cloudData.data);
          isLoadingRemote = false;
          Utils.toast('Synced newer data from cloud', 'info');
          if (typeof App !== 'undefined' && App.refreshCurrentTab) {
            App.refreshCurrentTab();
          }
          return;
        }
      }

      const showData = Store.exportData();

      const { error } = await client
        .from('shows')
        .upsert({
          name: currentShowName,
          data: showData,
          updated_at: new Date().toISOString(),
          session_id: sessionId  // Track which session made this change
        }, { onConflict: 'name' });

      if (error) throw error;

      updateStatus(true, `LIVE: ${currentShowName}`);
    } catch (e) {
      console.error('Failed to save show:', e);
      updateStatus(false, 'Save failed');
    }
  }

  // Debounced save - batch rapid changes
  function debouncedSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveShow(), 500);
  }

  function handleLocalChange(detail) {
    if (isLoadingRemote) return;

    // If show name changed, update tracking and URL
    if (detail.path === 'show.name' && detail.value) {
      const oldName = currentShowName;
      currentShowName = detail.value;
      updateUrl(currentShowName);

      // Unsubscribe from old show
      if (channel) {
        client.removeChannel(channel);
      }

      // Subscribe to new show
      subscribeToChanges(currentShowName);
    }

    debouncedSave();
  }

  function handleShowLoaded(data) {
    if (isLoadingRemote) return;

    if (data.show.name) {
      currentShowName = data.show.name;
      updateUrl(currentShowName);

      // Resubscribe to the new show
      if (channel) {
        client.removeChannel(channel);
      }
      subscribeToChanges(currentShowName);

      debouncedSave();
    }
  }

  function subscribeToChanges(showName) {
    if (!client || !showName) return;

    // Remove existing channel if any
    if (channel) {
      client.removeChannel(channel);
    }

    console.log(`[Supabase] Setting up real-time subscription for "${showName}"...`);

    channel = client
      .channel(`show:${showName}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shows',
          filter: `name=eq.${showName}`
        },
        (payload) => {
          console.log('[Supabase] Real-time UPDATE received');
          handleRemoteChange(payload.new);
        }
      )
      .subscribe((status, err) => {
        console.log(`[Supabase] Subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          realtimeActive = true;
          console.log(`[Supabase] ✓ Real-time active for "${showName}"`);
          updateStatus(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          realtimeActive = false;
          console.error(`[Supabase] Subscription error: ${status}`, err);
          updateStatus(true); // Still connected, just polling
          // Try to reconnect after a delay
          setTimeout(() => {
            console.log('[Supabase] Attempting to reconnect...');
            subscribeToChanges(showName);
          }, 5000);
        } else if (status === 'CLOSED') {
          realtimeActive = false;
          console.warn('[Supabase] Channel closed, will reconnect on next sync');
          updateStatus(true);
        }
      });
  }

  function handleRemoteChange(payload) {
    if (!payload || !payload.data) return;

    // Ignore updates from our own session
    if (payload.session_id === sessionId) {
      console.log('Ignoring own session update');
      return;
    }

    const remoteData = payload.data;

    // Apply remote changes if show names match
    if (remoteData.show?.name === currentShowName) {
      const localVersion = Store.data.show?.version || 0;
      const localTimestamp = Store.data.show?.lastModified || 0;
      const remoteVersion = remoteData.show?.version || 0;
      const remoteTimestamp = remoteData.show?.lastModified || 0;

      // Only apply if remote data is actually newer
      // Compare version first, then timestamp as tiebreaker
      if (remoteVersion < localVersion) {
        console.log(`Ignoring stale remote update (remote v${remoteVersion} < local v${localVersion})`);
        // Re-push our data to correct the stale update
        debouncedSave();
        return;
      }

      if (remoteVersion === localVersion && remoteTimestamp <= localTimestamp) {
        console.log(`Ignoring same/older remote update (same version, remote time ${remoteTimestamp} <= local ${localTimestamp})`);
        return;
      }

      console.log(`Applying remote update: v${remoteVersion} (was v${localVersion})`);
      isLoadingRemote = true;
      Store.loadShow(remoteData);
      isLoadingRemote = false;

      // Process route queue if this device can reach bridges
      if (typeof RouteQueue !== 'undefined') {
        const queue = Store.data.routeQueue;
        const hasQueue = queue && (queue.nv9000?.length || queue.kaleido?.length || queue.tallyman?.length);
        console.log(`[Supabase] Remote update - RouteQueue check: bridges=${RouteQueue.bridgesReachable}, hasQueue=${hasQueue}`);
        if (RouteQueue.bridgesReachable) {
          RouteQueue.processQueue();
        } else if (hasQueue) {
          console.log('[Supabase] Queue has items but bridges not reachable on this device');
        }
      }

      // Refresh current tab
      if (typeof App !== 'undefined' && App.refreshCurrentTab) {
        App.refreshCurrentTab();
      }

      Utils.toast('Show updated from another device', 'info');
    }
  }

  function updateStatus(online, text) {
    connected = online;
    const el = document.getElementById('connection-status');
    if (el) {
      const version = Store.data.show?.version || 0;
      // Show compact version with sync mode indicator
      const syncMode = realtimeActive ? 'RT' : 'POLL';
      el.textContent = online ? `${syncMode} v${version}` : (text || 'LOCAL');
      el.className = `status-indicator ${online ? 'online' : 'offline'}`;
      el.title = online
        ? `Connected to Supabase\nSync: ${realtimeActive ? 'Real-time ✓' : 'Polling (5s)'}\nShow: ${currentShowName || 'None'}\nVersion: ${version}\nSession: ${sessionId.slice(0, 8)}...\n\nClick ↻ to force refresh from cloud`
        : 'localStorage only — configure Supabase for multi-user sync';
    }
  }

  // Create a new cloud show
  async function createCloudShow(name, format) {
    if (!client) {
      Utils.toast('Supabase not connected', 'error');
      return false;
    }

    try {
      // Check if show already exists
      const { data: existing } = await client
        .from('shows')
        .select('name')
        .eq('name', name)
        .single();

      if (existing) {
        Utils.toast(`Show "${name}" already exists in cloud`, 'warn');
        return false;
      }

      Store.newShow(name, format);
      currentShowName = name;
      updateUrl(name);
      await saveShow();

      // Subscribe to changes
      if (channel) {
        client.removeChannel(channel);
      }
      subscribeToChanges(name);

      Utils.toast(`Created cloud show "${name}"`, 'success');
      return true;
    } catch (e) {
      console.error('Failed to create cloud show:', e);
      Utils.toast(`Failed to create show: ${e.message}`, 'error');
      return false;
    }
  }

  // List all shows in cloud
  async function listCloudShows() {
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('shows')
        .select('name, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to list shows:', e);
      return [];
    }
  }

  // Delete a show from cloud
  async function deleteCloudShow(name) {
    if (!client) return false;

    try {
      const { error } = await client
        .from('shows')
        .delete()
        .eq('name', name);

      if (error) throw error;

      Utils.toast(`Deleted show "${name}"`, 'success');
      return true;
    } catch (e) {
      console.error('Failed to delete show:', e);
      Utils.toast(`Failed to delete: ${e.message}`, 'error');
      return false;
    }
  }

  // Get shareable URL for current show
  function getShareUrl() {
    if (!currentShowName) return null;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('show', currentShowName);
    return url.href;
  }

  // Copy share URL to clipboard
  async function copyShareUrl() {
    const url = getShareUrl();
    if (!url) {
      Utils.toast('No show loaded', 'warn');
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      Utils.toast('Share URL copied to clipboard', 'success');
    } catch (e) {
      Utils.toast('Failed to copy URL', 'error');
    }
  }

  // Periodic sync check - catches stale clients that missed real-time updates
  // Runs every 5 seconds for responsive sync even if real-time fails
  function startSyncCheck() {
    if (syncCheckInterval) clearInterval(syncCheckInterval);
    syncCheckInterval = setInterval(async () => {
      if (!client || !currentShowName || isLoadingRemote) return;

      try {
        const { data, error } = await client
          .from('shows')
          .select('data')
          .eq('name', currentShowName)
          .single();

        if (error || !data?.data) return;

        const cloudVersion = data.data.show?.version || 0;
        const localVersion = Store.data.show?.version || 0;

        if (cloudVersion > localVersion) {
          console.log(`[Supabase] Sync check: cloud v${cloudVersion} > local v${localVersion}, updating...`);
          isLoadingRemote = true;
          Store.loadShow(data.data);
          isLoadingRemote = false;

          // Process route queue on engineering computer
          if (typeof RouteQueue !== 'undefined' && RouteQueue.bridgesReachable) {
            RouteQueue.processQueue();
          }

          Utils.toast('Synced from cloud', 'info');
          if (typeof App !== 'undefined' && App.refreshCurrentTab) {
            App.refreshCurrentTab();
          }
        }
      } catch (e) {
        console.warn('[Supabase] Sync check failed:', e);
      }
    }, 5000); // Check every 5 seconds
  }

  // Force refresh from cloud - for when users suspect stale data
  async function forceRefresh() {
    if (!client || !currentShowName) {
      Utils.toast('No cloud connection', 'warn');
      return false;
    }

    try {
      updateStatus(false, 'Refreshing...');

      const { data, error } = await client
        .from('shows')
        .select('data')
        .eq('name', currentShowName)
        .single();

      if (error) throw error;

      if (data?.data) {
        const cloudVersion = data.data.show?.version || 0;
        const localVersion = Store.data.show?.version || 0;

        isLoadingRemote = true;
        Store.loadShow(data.data);
        isLoadingRemote = false;

        Utils.toast(`Refreshed from cloud (v${cloudVersion}, was v${localVersion})`, 'success');

        if (typeof App !== 'undefined' && App.refreshCurrentTab) {
          App.refreshCurrentTab();
        }

        updateStatus(true, `LIVE: ${currentShowName}`);
        return true;
      }
    } catch (e) {
      console.error('Force refresh failed:', e);
      Utils.toast(`Refresh failed: ${e.message}`, 'error');
      updateStatus(true, `LIVE: ${currentShowName}`);
    }
    return false;
  }

  // Get current version info for debugging
  function getVersionInfo() {
    return {
      localVersion: Store.data.show?.version || 0,
      localTimestamp: Store.data.show?.lastModified || 0,
      sessionId: sessionId,
      showName: currentShowName
    };
  }

  return {
    init,
    isConfigured,
    loadShow,
    createCloudShow,
    listCloudShows,
    deleteCloudShow,
    getShareUrl,
    copyShareUrl,
    forceRefresh,
    getVersionInfo,
    get connected() { return connected; },
    get currentShowName() { return currentShowName; }
  };
})();
