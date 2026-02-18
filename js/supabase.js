// ============================================
// Supabase Client — Real-time sync (optional)
// ============================================

const SupabaseSync = (() => {
  let client = null;
  let channel = null;
  let connected = false;

  function isConfigured() {
    return typeof SUPABASE_CONFIG !== 'undefined' &&
      SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey;
  }

  async function init() {
    if (!isConfigured()) {
      console.log('Supabase not configured — using localStorage only');
      updateStatus(false);
      return;
    }

    try {
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

      // Subscribe to real-time changes
      channel = client.channel('showbook-sync')
        .on('broadcast', { event: 'data-change' }, (payload) => {
          handleRemoteChange(payload.payload);
        })
        .subscribe((status) => {
          connected = status === 'SUBSCRIBED';
          updateStatus(connected);
        });

      connected = true;
      updateStatus(true);

      // Listen for local changes and broadcast them
      Store.on('change', (detail) => {
        if (channel && connected) {
          channel.send({
            type: 'broadcast',
            event: 'data-change',
            payload: detail,
          });
        }
      });

    } catch (e) {
      console.warn('Supabase init failed:', e);
      updateStatus(false);
    }
  }

  function handleRemoteChange({ path, value }) {
    if (!path) return;
    // Apply remote change to local store without re-broadcasting
    const keys = path.split('.');
    let obj = Store.data;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    Store.save();
    Store.emit('remote-change', { path, value });
  }

  function updateStatus(online) {
    const el = document.getElementById('connection-status');
    if (el) {
      el.textContent = online ? 'LIVE' : 'LOCAL';
      el.className = `status-indicator ${online ? 'online' : 'offline'}`;
      el.title = online ? 'Connected to Supabase — real-time sync active' : 'localStorage only — configure Supabase for multi-user sync';
    }
  }

  return { init, isConfigured };
})();
