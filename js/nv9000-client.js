/**
 * NV9000 Router Client
 *
 * Client-side module for the Showbook to communicate with the NV9000 bridge.
 * Handles source/destination name → ID lookups using Store data.
 *
 * Usage:
 *   NV9000Client.route('CCU 01', 'MV 1-1');
 *   NV9000Client.routeById(1, 429);
 */

const NV9000Client = (() => {
  // Staged routes storage
  let stagedRoutes = {};  // { 'destName': { source: 'srcName', destination: 'destName', sourceId, destId } }

  // ============================================================
  // CONFIGURATION - bridges always on localhost
  // ============================================================

  function getBridgeUrl() {
    return 'http://localhost:3003';
  }

  function setBridgeUrl(url) {
    // No-op - bridges are always on localhost
  }

  // ============================================================
  // TRIGGER MODE (STAGED / IMMEDIATE)
  // ============================================================

  // Global mode (fallback)
  function getTriggerMode() {
    return localStorage.getItem('nv9000TriggerMode') || 'immediate';
  }

  function setTriggerMode(mode) {
    localStorage.setItem('nv9000TriggerMode', mode);
  }

  // Per-page modes
  function getPageMode(page) {
    const pageMode = localStorage.getItem(`nv9000Mode_${page}`);
    return pageMode || 'global'; // 'global', 'staged', or 'immediate'
  }

  function setPageMode(page, mode) {
    localStorage.setItem(`nv9000Mode_${page}`, mode);
  }

  // Get effective mode for a page
  function getEffectiveMode(page) {
    const pageMode = getPageMode(page);
    if (pageMode === 'global') {
      return getTriggerMode();
    }
    return pageMode;
  }

  // ============================================================
  // STAGED ROUTES
  // ============================================================

  function getStagedRoutes() {
    return { ...stagedRoutes };
  }

  function stageRoute(sourceName, destName) {
    const sourceId = getSourceId(sourceName);
    const destId = getDestinationId(destName);

    if (!sourceId) {
      console.warn(`[NV9000] Cannot stage - unknown source: ${sourceName}`);
      return { success: false, error: `Unknown source: ${sourceName}` };
    }

    if (!destId) {
      console.warn(`[NV9000] Cannot stage - unknown destination: ${destName}`);
      return { success: false, error: `Unknown destination: ${destName}` };
    }

    stagedRoutes[destName] = {
      source: sourceName,
      destination: destName,
      sourceId,
      destId
    };

    console.log(`[NV9000] Staged: ${sourceName} -> ${destName}`);
    return { success: true };
  }

  function unstageRoute(destName) {
    delete stagedRoutes[destName];
  }

  function clearStagedRoutes() {
    stagedRoutes = {};
  }

  async function triggerAllStaged() {
    const routes = Object.values(stagedRoutes);
    if (routes.length === 0) {
      return { success: true, message: 'No routes to execute' };
    }

    console.log(`[NV9000] Triggering ${routes.length} staged routes`);

    const resolvedRoutes = routes.map(r => ({
      source: r.sourceId,
      destination: r.destId
    }));

    try {
      const response = await fetch(`${getBridgeUrl()}/route-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routes: resolvedRoutes })
      });

      const result = await response.json();

      if (result.success) {
        clearStagedRoutes();
      }

      return result;
    } catch (error) {
      console.error(`[NV9000] Trigger error:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle a route based on current trigger mode
   * @param {string} sourceName - Source device name
   * @param {string} destName - Destination device name
   * @param {string} page - Page identifier for per-page mode (optional)
   * @returns {Promise<object>} - Result with { success, staged }
   */
  async function handleRoute(sourceName, destName, page = null) {
    const mode = page ? getEffectiveMode(page) : getTriggerMode();

    if (mode === 'staged') {
      const result = stageRoute(sourceName, destName);
      return { ...result, staged: true };
    } else {
      // Check if RouteQueue is available and bridges aren't reachable locally
      // If so, queue the route for the engineering computer to execute
      if (typeof RouteQueue !== 'undefined' && !RouteQueue.bridgesReachable) {
        const result = RouteQueue.queueRoute(sourceName, destName);
        return { success: result, queued: true, staged: false };
      }
      // Bridges reachable - execute directly
      const result = await route(sourceName, destName);
      return { ...result, staged: false };
    }
  }

  // ============================================================
  // ID LOOKUP FUNCTIONS
  // ============================================================

  /**
   * Look up source ID from device name (rtrMaster)
   * @param {string} deviceName - Device name (e.g., 'CCU 01', 'FS 01')
   * @returns {number|null} - NV9000 source ID or null if not found
   */
  function getSourceId(deviceName) {
    if (!deviceName || !Store.data || !Store.data.rtrMaster) return null;

    const device = Store.data.rtrMaster.find(d =>
      d && d.deviceName && d.deviceName.toLowerCase() === deviceName.toLowerCase()
    );

    return device ? device.row : null;
  }

  /**
   * Look up destination ID from device name (rtrOutputs)
   * @param {string} deviceName - Device name (e.g., 'MV 1-1', 'EIC QC 1')
   * @returns {number|null} - NV9000 destination ID or null if not found
   */
  function getDestinationId(deviceName) {
    if (!deviceName || !Store.data || !Store.data.rtrOutputs) return null;

    const device = Store.data.rtrOutputs.find(d =>
      d && d.deviceName && d.deviceName.toLowerCase() === deviceName.toLowerCase()
    );

    return device ? device.row : null;
  }

  /**
   * Look up device name from source ID
   * @param {number} sourceId - NV9000 source ID
   * @returns {string|null} - Device name or null
   */
  function getSourceName(sourceId) {
    if (!sourceId || !Store.data || !Store.data.rtrMaster) return null;

    const device = Store.data.rtrMaster.find(d => d && d.row === sourceId);
    return device ? device.deviceName : null;
  }

  /**
   * Look up device name from destination ID
   * @param {number} destId - NV9000 destination ID
   * @returns {string|null} - Device name or null
   */
  function getDestinationName(destId) {
    if (!destId || !Store.data || !Store.data.rtrOutputs) return null;

    const device = Store.data.rtrOutputs.find(d => d && d.row === destId);
    return device ? device.deviceName : null;
  }

  // ============================================================
  // ROUTE FUNCTIONS
  // ============================================================

  /**
   * Execute a route using device names
   * @param {string} sourceName - Source device name
   * @param {string} destName - Destination device name
   * @returns {Promise<object>} - Route result
   */
  async function route(sourceName, destName) {
    const sourceId = getSourceId(sourceName);
    const destId = getDestinationId(destName);

    if (!sourceId) {
      console.error(`[NV9000] Unknown source: ${sourceName}`);
      return { success: false, error: `Unknown source: ${sourceName}` };
    }

    if (!destId) {
      console.error(`[NV9000] Unknown destination: ${destName}`);
      return { success: false, error: `Unknown destination: ${destName}` };
    }

    console.log(`[NV9000] Route: ${sourceName} (${sourceId}) -> ${destName} (${destId})`);
    return routeById(sourceId, destId);
  }

  /**
   * Execute a route using IDs directly
   * @param {number} sourceId - NV9000 source ID
   * @param {number} destId - NV9000 destination ID
   * @returns {Promise<object>} - Route result
   */
  async function routeById(sourceId, destId) {
    try {
      const response = await fetch(`${getBridgeUrl()}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceId, destination: destId })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`[NV9000] Route error:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute multiple routes
   * @param {Array} routes - Array of { source, destination } (names or IDs)
   * @param {boolean} useNames - If true, source/dest are names; if false, IDs
   * @returns {Promise<object>} - Batch result
   */
  async function routeBatch(routes, useNames = true) {
    const resolvedRoutes = [];

    for (const r of routes) {
      if (useNames) {
        const sourceId = getSourceId(r.source);
        const destId = getDestinationId(r.destination);

        if (!sourceId || !destId) {
          console.warn(`[NV9000] Skipping invalid route: ${r.source} -> ${r.destination}`);
          continue;
        }

        resolvedRoutes.push({ source: sourceId, destination: destId });
      } else {
        resolvedRoutes.push({ source: r.source, destination: r.destination });
      }
    }

    if (resolvedRoutes.length === 0) {
      return { success: false, error: 'No valid routes to execute' };
    }

    try {
      const response = await fetch(`${getBridgeUrl()}/route-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routes: resolvedRoutes })
      });

      return await response.json();
    } catch (error) {
      console.error(`[NV9000] Batch route error:`, error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // CONNECTION TEST
  // ============================================================

  /**
   * Check connection to the bridge
   * @returns {Promise<object>} - Connection status
   */
  async function checkConnection() {
    try {
      const response = await fetch(`${getBridgeUrl()}/health`, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        return { status: 'connected', bridge: getBridgeUrl() };
      }
      return { status: 'error', error: `HTTP ${response.status}` };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  /**
   * Test connection to NV9000 through the bridge
   * @returns {Promise<object>} - NV9000 status
   */
  async function testNV9000() {
    try {
      const response = await fetch(`${getBridgeUrl()}/test-nv9000`, {
        method: 'GET',
        timeout: 10000
      });

      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Get all available sources
   * @returns {Array} - Array of { id, name, desc }
   */
  function getAllSources() {
    if (!Store.data || !Store.data.rtrMaster) return [];

    return Store.data.rtrMaster
      .filter(d => d && d.deviceName)
      .map(d => ({
        id: d.row,
        name: d.deviceName,
        desc: d.deviceDesc || ''
      }));
  }

  /**
   * Get all available destinations
   * @returns {Array} - Array of { id, name, desc }
   */
  function getAllDestinations() {
    if (!Store.data || !Store.data.rtrOutputs) return [];

    return Store.data.rtrOutputs
      .filter(d => d && d.deviceName)
      .map(d => ({
        id: d.row,
        name: d.deviceName,
        desc: d.deviceDesc || ''
      }));
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Configuration
    getBridgeUrl,
    setBridgeUrl,
    getTriggerMode,
    setTriggerMode,
    getPageMode,
    setPageMode,
    getEffectiveMode,

    // ID Lookups
    getSourceId,
    getDestinationId,
    getSourceName,
    getDestinationName,

    // Routing
    route,
    routeById,
    routeBatch,
    handleRoute,

    // Staged Routes
    getStagedRoutes,
    stageRoute,
    unstageRoute,
    clearStagedRoutes,
    triggerAllStaged,

    // Connection
    checkConnection,
    testNV9000,

    // Utilities
    getAllSources,
    getAllDestinations
  };
})();
