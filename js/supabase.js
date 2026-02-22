// ============================================
// Supabase Client — Cloud storage + Real-time sync
// ============================================
//
// Requires a 'shows' table in Supabase with the following structure:
// CREATE TABLE shows (
//   name TEXT PRIMARY KEY,
//   data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
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
        await loadShow(urlShowName);
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
      const showData = Store.exportData();

      const { error } = await client
        .from('shows')
        .upsert({
          name: currentShowName,
          data: showData,
          updated_at: new Date().toISOString()
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
          handleRemoteChange(payload.new);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to real-time updates for "${showName}"`);
        }
      });
  }

  function handleRemoteChange(payload) {
    if (!payload || !payload.data) return;

    // Check if this change came from us (compare timestamps)
    const remoteData = payload.data;
    const localData = Store.exportData();

    // Simple check - if show names match and data is different, apply it
    if (remoteData.show?.name === currentShowName) {
      console.log('Received remote update, applying...');
      isLoadingRemote = true;
      Store.loadShow(remoteData);
      isLoadingRemote = false;

      // Refresh current tab
      if (typeof App !== 'undefined' && App.renderCurrentTab) {
        App.renderCurrentTab();
      }

      Utils.toast('Show updated from another device', 'info');
    }
  }

  function updateStatus(online, text) {
    connected = online;
    const el = document.getElementById('connection-status');
    if (el) {
      el.textContent = text || (online ? 'LIVE' : 'LOCAL');
      el.className = `status-indicator ${online ? 'online' : 'offline'}`;
      el.title = online
        ? `Connected to Supabase — real-time sync active\nShow: ${currentShowName || 'None'}\nShare URL: ${window.location.href}`
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

  return {
    init,
    isConfigured,
    loadShow,
    createCloudShow,
    listCloudShows,
    deleteCloudShow,
    getShareUrl,
    copyShareUrl,
    get connected() { return connected; },
    get currentShowName() { return currentShowName; }
  };
})();
