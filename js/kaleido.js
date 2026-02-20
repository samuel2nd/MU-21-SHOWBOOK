/**
 * Kaleido Browser Client
 *
 * Browser-side API for communicating with the Kaleido Bridge server.
 * Handles layout triggering, connection testing, and staged layout management.
 */

const KaleidoClient = (() => {
  // Status tracking
  let connectionStatus = 'unknown'; // 'connected', 'disconnected', 'unknown'
  let lastError = null;

  /**
   * Get the bridge URL from config or store
   */
  function getBridgeUrl() {
    if (Store.data.kaleidoConfig && Store.data.kaleidoConfig.bridgeUrl) {
      return Store.data.kaleidoConfig.bridgeUrl;
    }
    return 'http://localhost:3001';
  }

  /**
   * Check if bridge is connected
   */
  async function checkConnection() {
    try {
      const response = await fetch(`${getBridgeUrl()}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        connectionStatus = 'connected';
        lastError = null;
        return { success: true, status: 'connected' };
      } else {
        connectionStatus = 'disconnected';
        lastError = 'Bridge returned error';
        return { success: false, status: 'disconnected', error: lastError };
      }
    } catch (error) {
      connectionStatus = 'disconnected';
      lastError = error.message;
      return { success: false, status: 'disconnected', error: error.message };
    }
  }

  /**
   * Test connection to a specific Kaleido card
   */
  async function testCard(ip, port = 8902) {
    try {
      const response = await fetch(`${getBridgeUrl()}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger a single layout change
   * @param {string} ip - Kaleido card IP address
   * @param {number} index - Layout index to trigger (1-based)
   * @param {number} port - TCP port (default 8902)
   */
  async function triggerLayout(ip, index, port = 8902) {
    try {
      const response = await fetch(`${getBridgeUrl()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, port, index })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger multiple layout changes in batch
   * @param {Array} triggers - Array of { ip, index, port?, cardId? }
   */
  async function triggerBatch(triggers) {
    try {
      const response = await fetch(`${getBridgeUrl()}/trigger-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggers })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get trigger mode from config
   */
  function getTriggerMode() {
    if (Store.data.kaleidoConfig) {
      return Store.data.kaleidoConfig.triggerMode || 'staged';
    }
    return 'staged';
  }

  /**
   * Set trigger mode
   */
  function setTriggerMode(mode) {
    if (!Store.data.kaleidoConfig) return;
    Store.set('kaleidoConfig.triggerMode', mode);
  }

  /**
   * Get staged layouts
   */
  function getStagedLayouts() {
    if (Store.data.kaleidoConfig && Store.data.kaleidoConfig.stagedLayouts) {
      return Store.data.kaleidoConfig.stagedLayouts;
    }
    return {};
  }

  /**
   * Stage a layout change for later triggering
   * @param {string} mvId - MV ID (e.g., "1-1")
   * @param {string} fromLayout - Current layout name
   * @param {string} toLayout - Target layout name
   * @param {number} cardId - Card ID (1-22)
   */
  function stageLayoutChange(mvId, fromLayout, toLayout, cardId) {
    if (!Store.data.kaleidoConfig) return;

    const stagedLayouts = { ...getStagedLayouts() };

    if (fromLayout === toLayout) {
      // Remove from staged if reverting to original
      delete stagedLayouts[mvId];
    } else {
      stagedLayouts[mvId] = {
        from: fromLayout,
        to: toLayout,
        cardId: cardId,
        timestamp: Date.now()
      };
    }

    Store.set('kaleidoConfig.stagedLayouts', stagedLayouts);
  }

  /**
   * Remove a staged layout change
   */
  function unstagLayoutChange(mvId) {
    if (!Store.data.kaleidoConfig) return;

    const stagedLayouts = { ...getStagedLayouts() };
    delete stagedLayouts[mvId];
    Store.set('kaleidoConfig.stagedLayouts', stagedLayouts);
  }

  /**
   * Clear all staged layout changes
   */
  function clearStagedLayouts() {
    if (!Store.data.kaleidoConfig) return;
    Store.set('kaleidoConfig.stagedLayouts', {});
  }

  /**
   * Get layout index from layout name for TSL trigger
   * Kaleido uses 1-based indices for layout presets
   */
  function getLayoutIndex(layoutName) {
    const layoutIndexMap = {
      '9_SPLIT': 1,
      '9_SPLIT_R': 2,
      '9_SPLIT_L': 3,
      '6_SPLIT_R': 4,
      '6_SPLIT_L': 5,
      '6_SPLIT_R_UP': 6,
      '6_SPLIT_L_UP': 7,
      '5_SPLIT': 8,
      '5_SPLIT_FLIP': 9,
      '4_SPLIT': 10,
      'FULL_SCREEN': 11
    };

    return layoutIndexMap[layoutName] || 1;
  }

  /**
   * Get card config by card ID
   */
  function getCardConfig(cardId) {
    if (!Store.data.kaleidoConfig || !Store.data.kaleidoConfig.cards) return null;
    return Store.data.kaleidoConfig.cards.find(c => c.cardId === cardId);
  }

  /**
   * Trigger all staged layout changes
   */
  async function triggerAllStaged() {
    const stagedLayouts = getStagedLayouts();
    const triggers = [];

    for (const [mvId, staged] of Object.entries(stagedLayouts)) {
      const card = getCardConfig(staged.cardId);
      if (!card || !card.enabled) continue;

      const index = getLayoutIndex(staged.to);
      triggers.push({
        cardId: staged.cardId,
        ip: card.ip,
        port: card.port,
        index: index
      });
    }

    if (triggers.length === 0) {
      return { success: true, message: 'No staged layouts to trigger' };
    }

    const result = await triggerBatch(triggers);

    // Clear staged layouts on success
    if (result.success) {
      clearStagedLayouts();
    }

    return result;
  }

  /**
   * Immediately trigger a layout change (for immediate mode)
   */
  async function triggerLayoutImmediate(cardId, layoutName) {
    const card = getCardConfig(cardId);
    if (!card || !card.enabled) {
      return { success: false, error: 'Card not found or disabled' };
    }

    const index = getLayoutIndex(layoutName);
    return await triggerLayout(card.ip, index, card.port);
  }

  /**
   * Get current connection status
   */
  function getConnectionStatus() {
    return {
      status: connectionStatus,
      lastError: lastError
    };
  }

  /**
   * Handle layout change based on current trigger mode
   * Returns true if change was handled (staged or triggered), false otherwise
   */
  async function handleLayoutChange(mvId, fromLayout, toLayout, cardId) {
    const mode = getTriggerMode();

    if (mode === 'immediate') {
      // Trigger immediately
      const result = await triggerLayoutImmediate(cardId, toLayout);
      return result;
    } else {
      // Stage the change
      stageLayoutChange(mvId, fromLayout, toLayout, cardId);
      return { success: true, staged: true };
    }
  }

  // Public API
  return {
    checkConnection,
    testCard,
    triggerLayout,
    triggerBatch,
    triggerAllStaged,
    triggerLayoutImmediate,
    handleLayoutChange,
    getTriggerMode,
    setTriggerMode,
    getStagedLayouts,
    stageLayoutChange,
    unstagLayoutChange,
    clearStagedLayouts,
    getLayoutIndex,
    getCardConfig,
    getConnectionStatus,
    getBridgeUrl
  };
})();
