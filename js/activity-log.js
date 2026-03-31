// ============================================
// Activity Log — Shared event logging across devices
// ============================================
//
// Logs changes, routes, and sync events so all devices can see
// what happened and when. Synced via Supabase with the show data.
// Focuses on WHAT changed, not WHO changed it.

const ActivityLog = (() => {
  const MAX_ENTRIES = 200;

  // Add a log entry
  function log(type, action, details, page = null, status = 'success') {
    if (!Store.data.activityLog) {
      Store.data.activityLog = [];
    }

    const entry = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now(),
      type,      // 'data', 'route', 'layout', 'sync', 'system'
      action,    // Brief description
      details,   // Full details
      page,      // Which page/tab
      status     // 'success', 'staged', 'queued', 'failed', 'info'
    };

    Store.data.activityLog.unshift(entry);

    // Trim to max entries
    if (Store.data.activityLog.length > MAX_ENTRIES) {
      Store.data.activityLog = Store.data.activityLog.slice(0, MAX_ENTRIES);
    }

    // Save without triggering another log (use direct save)
    Store.save();
    Store.emit('activity-log', entry);

    return entry;
  }

  // Convenience methods for different log types
  function logData(action, details, page) {
    return log('data', action, details, page, 'success');
  }

  function logRoute(source, dest, status = 'success') {
    return log('route', `${source} → ${dest}`, `NV9000 route: ${source} to ${dest}`, 'Router', status);
  }

  function logLayout(cardId, layout, status = 'success') {
    return log('layout', `Card ${cardId} → ${layout}`, `Kaleido layout change`, 'Multiviewer', status);
  }

  function logSync(action, details) {
    return log('sync', action, details, null, 'info');
  }

  function logSystem(action, details) {
    return log('system', action, details, null, 'info');
  }

  // Get all log entries
  function getEntries(filter = null) {
    const entries = Store.data.activityLog || [];
    if (!filter) return entries;
    return entries.filter(e => e.type === filter);
  }

  // Clear log
  function clear() {
    Store.data.activityLog = [];
    Store.save();
    Store.emit('activity-log-cleared');
  }

  // Format timestamp for display
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }

  // Format relative time
  function formatRelative(ts) {
    const diff = Date.now() - ts;
    if (diff < 1000) return 'just now';
    if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleDateString();
  }

  return {
    log,
    logData,
    logRoute,
    logLayout,
    logSync,
    logSystem,
    getEntries,
    clear,
    formatTime,
    formatRelative,
    MAX_ENTRIES
  };
})();
