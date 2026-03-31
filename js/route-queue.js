// ============================================
// Route Queue — Centralized route execution via Supabase sync
// ============================================
//
// Architecture:
// - Any device can add routes to the queue (stored in show data)
// - Queue syncs to all devices via Supabase
// - Device that can reach bridges (engineering computer) processes the queue
// - After processing, queue is cleared and syncs back
//
// This allows iPads/laptops to trigger routes without direct bridge access.

const RouteQueue = (() => {
  let isProcessing = false;
  let bridgesReachable = null; // null = unknown, true/false = tested

  /**
   * Check if this device can reach the bridges (localhost)
   * Engineering computer can, remote devices can't
   */
  async function checkBridgesReachable() {
    try {
      // Try to reach NV9000 bridge on localhost
      const resp = await fetch('http://localhost:3003/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      bridgesReachable = resp.ok;
    } catch (e) {
      bridgesReachable = false;
    }
    console.log(`[RouteQueue] Bridges reachable: ${bridgesReachable}`);
    return bridgesReachable;
  }

  /**
   * Initialize - check if we can reach bridges
   */
  async function init() {
    await checkBridgesReachable();

    // Listen for remote changes to process queue
    Store.on('show-loaded', handleShowLoaded);

    // Periodically check queue AND re-check bridge reachability
    // This handles cases where bridges start after page load
    setInterval(async () => {
      // Re-check bridge reachability periodically if not reachable
      if (!bridgesReachable) {
        await checkBridgesReachable();
      }

      if (bridgesReachable && !isProcessing) {
        processQueue();
      }
    }, 2000);
  }

  /**
   * When show data is loaded (including from remote sync), check queue
   */
  function handleShowLoaded() {
    const queue = Store.data.routeQueue;
    const hasItems = queue && (
      (queue.nv9000 && queue.nv9000.length > 0) ||
      (queue.kaleido && queue.kaleido.length > 0) ||
      (queue.tallyman && queue.tallyman.length > 0)
    );

    console.log(`[RouteQueue] Show loaded - bridges: ${bridgesReachable}, queue items: ${hasItems ? 'YES' : 'no'}`);

    if (hasItems) {
      if (bridgesReachable && !isProcessing) {
        console.log('[RouteQueue] Processing queue from show-loaded event');
        processQueue();
      } else if (!bridgesReachable) {
        console.log('[RouteQueue] Queue has items but bridges not reachable (remote device)');
      }
    }
  }

  /**
   * Ensure routeQueue exists in store
   */
  function ensureQueue() {
    if (!Store.data.routeQueue) {
      Store.data.routeQueue = {
        nv9000: [],      // Router routes: { source, destination, sourceId, destId }
        kaleido: [],     // Layout changes: { cardId, ip, port, index, layoutName }
        tallyman: []     // UMD updates: { position, text }
      };
    }
    return Store.data.routeQueue;
  }

  /**
   * Add an NV9000 route to the queue
   */
  function queueRoute(sourceName, destName) {
    const queue = ensureQueue();

    // Look up IDs
    const sourceId = NV9000Client.getSourceId(sourceName);
    const destId = NV9000Client.getDestinationId(destName);

    if (!sourceId || !destId) {
      console.warn(`[RouteQueue] Cannot queue route - invalid source/dest: ${sourceName} -> ${destName}`);
      return false;
    }

    queue.nv9000.push({
      source: sourceName,
      destination: destName,
      sourceId,
      destId,
      timestamp: Date.now()
    });

    Store.set('routeQueue', queue);
    console.log(`[RouteQueue] Queued NV9000 route: ${sourceName} -> ${destName}`);

    // Log as queued (will show as executed when processed)
    if (typeof ActivityLog !== 'undefined') {
      ActivityLog.logRoute(sourceName, destName, 'queued');
    }

    // If we can reach bridges, process immediately
    if (bridgesReachable) {
      processQueue();
    }

    return true;
  }

  /**
   * Add a Kaleido layout change to the queue
   */
  function queueLayout(cardId, layoutName) {
    const queue = ensureQueue();

    // Get card config
    const card = KaleidoClient.getCardConfig(cardId);
    if (!card || !card.enabled) {
      console.warn(`[RouteQueue] Cannot queue layout - card not found or disabled: ${cardId}`);
      return false;
    }

    const index = KaleidoClient.getLayoutIndex(layoutName);

    queue.kaleido.push({
      cardId,
      ip: card.ip,
      port: card.port,
      index,
      layoutName,
      timestamp: Date.now()
    });

    Store.set('routeQueue', queue);
    console.log(`[RouteQueue] Queued Kaleido layout: card ${cardId} -> ${layoutName}`);

    if (bridgesReachable) {
      processQueue();
    }

    return true;
  }

  /**
   * Add a Tallyman UMD update to the queue
   */
  function queueUmd(position, text) {
    const queue = ensureQueue();

    queue.tallyman.push({
      position,
      text,
      timestamp: Date.now()
    });

    Store.set('routeQueue', queue);
    console.log(`[RouteQueue] Queued Tallyman UMD: ${position} -> "${text}"`);

    if (bridgesReachable) {
      processQueue();
    }

    return true;
  }

  /**
   * Process all queued routes (only runs on devices that can reach bridges)
   */
  async function processQueue() {
    if (!bridgesReachable || isProcessing) return;

    const queue = ensureQueue();
    const hasItems = queue.nv9000.length > 0 || queue.kaleido.length > 0 || queue.tallyman.length > 0;

    if (!hasItems) return;

    isProcessing = true;
    console.log(`[RouteQueue] Processing queue: ${queue.nv9000.length} routes, ${queue.kaleido.length} layouts, ${queue.tallyman.length} UMDs`);

    try {
      // Process NV9000 routes
      if (queue.nv9000.length > 0) {
        const routes = queue.nv9000.map(r => ({
          source: r.sourceId,
          destination: r.destId
        }));

        const result = await fetch('http://localhost:3003/route-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routes })
        }).then(r => r.json());

        if (result.success) {
          console.log(`[RouteQueue] Executed ${routes.length} NV9000 routes`);
          Utils.toast(`Executed ${routes.length} routes`, 'success');
          // Log each route
          queue.nv9000.forEach(r => {
            if (typeof ActivityLog !== 'undefined') {
              ActivityLog.logRoute(r.source, r.destination, 'success');
            }
          });
        } else {
          console.error('[RouteQueue] NV9000 batch failed:', result);
          queue.nv9000.forEach(r => {
            if (typeof ActivityLog !== 'undefined') {
              ActivityLog.logRoute(r.source, r.destination, 'failed');
            }
          });
        }
      }

      // Process Kaleido layouts
      if (queue.kaleido.length > 0) {
        const triggers = queue.kaleido.map(l => ({
          cardId: l.cardId,
          ip: l.ip,
          port: l.port,
          index: l.index
        }));

        const result = await fetch('http://localhost:3001/trigger-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ triggers })
        }).then(r => r.json());

        if (result.success) {
          console.log(`[RouteQueue] Executed ${triggers.length} Kaleido layouts`);
          Utils.toast(`Executed ${triggers.length} layout changes`, 'success');
          queue.kaleido.forEach(l => {
            if (typeof ActivityLog !== 'undefined') {
              ActivityLog.logLayout(l.cardId, l.layoutName, 'success');
            }
          });
        } else {
          console.error('[RouteQueue] Kaleido batch failed:', result);
          queue.kaleido.forEach(l => {
            if (typeof ActivityLog !== 'undefined') {
              ActivityLog.logLayout(l.cardId, l.layoutName, 'failed');
            }
          });
        }
      }

      // Process Tallyman UMDs
      if (queue.tallyman.length > 0) {
        const updates = queue.tallyman.map(u => ({
          position: u.position,
          text: u.text
        }));

        const result = await fetch('http://localhost:3002/umd-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        }).then(r => r.json());

        if (result.success) {
          console.log(`[RouteQueue] Executed ${updates.length} Tallyman UMDs`);
        } else {
          console.error('[RouteQueue] Tallyman batch failed:', result);
        }
      }

      // Clear the queue after processing
      Store.set('routeQueue', {
        nv9000: [],
        kaleido: [],
        tallyman: []
      });

    } catch (e) {
      console.error('[RouteQueue] Processing error:', e);
      Utils.toast('Route execution failed', 'error');
    }

    isProcessing = false;
  }

  /**
   * Get queue status
   */
  function getStatus() {
    const queue = ensureQueue();
    return {
      bridgesReachable,
      isProcessing,
      pending: {
        nv9000: queue.nv9000.length,
        kaleido: queue.kaleido.length,
        tallyman: queue.tallyman.length
      }
    };
  }

  /**
   * Clear the queue without processing
   */
  function clearQueue() {
    Store.set('routeQueue', {
      nv9000: [],
      kaleido: [],
      tallyman: []
    });
  }

  return {
    init,
    checkBridgesReachable,
    queueRoute,
    queueLayout,
    queueUmd,
    processQueue,
    getStatus,
    clearQueue,
    get bridgesReachable() { return bridgesReachable; }
  };
})();
