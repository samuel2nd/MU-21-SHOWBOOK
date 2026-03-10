// ============================================
// Bridge Configuration — Auto-detect or manual override
// ============================================
// Centralizes bridge URL configuration for all three bridges:
// - Kaleido Bridge (port 3001)
// - Tallyman Bridge (port 3002)
// - NV9000 Bridge (port 3003)
//
// Auto-detection: Uses the hostname from the current URL so remote
// browsers automatically connect to the correct engineering computer.

const BridgeConfig = (() => {
  const PORTS = {
    kaleido: 3001,
    tallyman: 3002,
    nv9000: 3003
  };

  const STORAGE_KEYS = {
    kaleido: 'kaleidoBridgeUrl',
    tallyman: 'tallymanBridgeUrl',
    nv9000: 'nv9000BridgeUrl',
    manualHost: 'bridgeHostOverride'
  };

  /**
   * Get the auto-detected host from current URL
   * If accessing via IP (e.g., http://192.168.1.50:8080), returns that IP
   * If accessing via localhost, returns localhost
   */
  function getAutoHost() {
    return window.location.hostname || 'localhost';
  }

  /**
   * Get the manually configured host override (if any)
   */
  function getManualHost() {
    return localStorage.getItem(STORAGE_KEYS.manualHost);
  }

  /**
   * Set a manual host override for all bridges
   * Pass null/empty to clear and use auto-detection
   */
  function setManualHost(host) {
    if (host) {
      localStorage.setItem(STORAGE_KEYS.manualHost, host);
    } else {
      localStorage.removeItem(STORAGE_KEYS.manualHost);
    }
  }

  /**
   * Get the effective host (manual override or auto-detected)
   */
  function getHost() {
    return getManualHost() || getAutoHost();
  }

  /**
   * Get the full bridge URL for a specific bridge
   * @param {string} bridge - 'kaleido', 'tallyman', or 'nv9000'
   * @returns {string} - Full URL like 'http://192.168.1.50:3001'
   */
  function getBridgeUrl(bridge) {
    // Check for per-bridge override first
    const perBridgeUrl = localStorage.getItem(STORAGE_KEYS[bridge]);
    if (perBridgeUrl) {
      return perBridgeUrl;
    }

    // Build URL from host + port
    const host = getHost();
    const port = PORTS[bridge];
    return `http://${host}:${port}`;
  }

  /**
   * Set a per-bridge URL override
   * Pass null/empty to clear and use auto-detection
   */
  function setBridgeUrl(bridge, url) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS[bridge], url);
    } else {
      localStorage.removeItem(STORAGE_KEYS[bridge]);
    }
  }

  /**
   * Get all bridge URLs
   */
  function getAllUrls() {
    return {
      kaleido: getBridgeUrl('kaleido'),
      tallyman: getBridgeUrl('tallyman'),
      nv9000: getBridgeUrl('nv9000')
    };
  }

  /**
   * Get configuration status for display
   */
  function getStatus() {
    const manualHost = getManualHost();
    const autoHost = getAutoHost();
    return {
      mode: manualHost ? 'manual' : 'auto',
      host: getHost(),
      autoDetectedHost: autoHost,
      manualOverride: manualHost,
      urls: getAllUrls()
    };
  }

  /**
   * Clear all bridge URL overrides (reset to auto-detection)
   */
  function resetAll() {
    localStorage.removeItem(STORAGE_KEYS.kaleido);
    localStorage.removeItem(STORAGE_KEYS.tallyman);
    localStorage.removeItem(STORAGE_KEYS.nv9000);
    localStorage.removeItem(STORAGE_KEYS.manualHost);
  }

  return {
    getBridgeUrl,
    setBridgeUrl,
    getHost,
    setManualHost,
    getAutoHost,
    getManualHost,
    getAllUrls,
    getStatus,
    resetAll,
    PORTS
  };
})();
