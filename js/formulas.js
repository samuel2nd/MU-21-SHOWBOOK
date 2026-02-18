// ============================================
// Computed Fields — INDEX/MATCH, TEXTJOIN logic
// ============================================

const Formulas = (() => {

  // INDEX/MATCH: Look up a device in rtrMaster by name
  // Returns { deviceName, deviceDesc, videoLevel, audio: [...16] } or null
  function rtrMasterLookup(deviceName) {
    if (!deviceName) return null;
    const entry = Store.data.rtrMaster.find(
      d => d.deviceName && d.deviceName.toLowerCase() === deviceName.toLowerCase()
    );
    return entry || null;
  }

  // Get video level for a device
  function getVideoLevel(deviceName) {
    const entry = rtrMasterLookup(deviceName);
    return entry ? entry.videoLevel : '';
  }

  // Get audio levels for a device (array of 16)
  function getAudioLevels(deviceName) {
    const entry = rtrMasterLookup(deviceName);
    return entry ? entry.audio : Array(16).fill('');
  }

  // TEXTJOIN: Get all show names for sources that reference a device
  function getUmdNames(deviceName) {
    if (!deviceName) return '';
    return Store.data.sources
      .filter(s => s.engSource === deviceName && s.showName)
      .map(s => s.showName)
      .join(', ');
  }

  // Get UMD name for a specific source number
  function getUmdForSource(sourceNumber) {
    const src = Store.data.sources.find(s => s.number === sourceNumber);
    return src ? (src.umdName || src.showName || '') : '';
  }

  // Look up source by show name
  function sourceByName(showName) {
    if (!showName) return null;
    return Store.data.sources.find(s => s.showName === showName) || null;
  }

  // Get active source count
  function activeSourceCount() {
    return Store.data.sources.filter(s => s.active).length;
  }

  // Get devices in use (referenced by any source)
  function devicesInUse() {
    const used = new Set();
    Store.data.sources.forEach(s => {
      if (s.engSource) used.add(s.engSource);
    });
    return used;
  }

  // Equipment usage summary
  function equipmentSummary() {
    const totalSources = Store.data.sources.filter(s => s.showName).length;
    const activeSources = Store.data.sources.filter(s => s.active).length;
    const totalDevices = Store.data.rtrMaster.filter(d => d.deviceName).length;
    const usedDevices = devicesInUse().size;

    const totalMonitors = Object.values(Store.data.monitorWalls)
      .reduce((sum, wall) => sum + wall.length, 0);
    const activeMonitors = Object.values(Store.data.monitorWalls)
      .reduce((sum, wall) => sum + wall.filter(m => m.source).length, 0);

    // CCU count: CCU entries with a device assigned
    const ccuCount = (Store.data.ccuFsy.ccu || []).filter(c => c.device).length;
    // FSY count: FSY entries with a format or show name assigned
    const fsyCount = (Store.data.ccuFsy.fsy || []).filter(f => f.format || f.showName).length;

    return {
      totalSources, activeSources,
      totalDevices, usedDevices,
      totalMonitors, activeMonitors,
      ccuCount, fsyCount,
    };
  }

  // Get all show names from SOURCE where engSource matches a device name
  // Used by CCU/FSY tab for computed SHOW NAME fields
  function getSourceNamesForDevice(deviceName) {
    if (!deviceName) return '';
    return Store.data.sources
      .filter(s => s.engSource === deviceName && s.showName)
      .map(s => s.showName)
      .join(', ');
  }

  // Get the engSource device name for sources assigned to a given FS device
  function getSourceDeviceForFs(fsDeviceName) {
    if (!fsDeviceName) return '';
    const src = Store.data.sources.find(s => s.engSource === fsDeviceName && s.showName);
    return src ? src.engSource : '';
  }

  // Generate NV9000 export data (ENGINEER tab)
  function generateNv9000Export() {
    const lines = [];
    Store.data.sources.forEach(s => {
      if (s.showName && s.engSource) {
        const device = rtrMasterLookup(s.engSource);
        lines.push({
          sourceNum: s.number,
          showName: s.showName,
          umdName: s.umdName || s.showName,
          engSource: s.engSource,
          videoLevel: device ? device.videoLevel : '',
        });
      }
    });
    return lines;
  }

  return {
    rtrMasterLookup,
    getVideoLevel,
    getAudioLevels,
    getUmdNames,
    getUmdForSource,
    sourceByName,
    activeSourceCount,
    devicesInUse,
    equipmentSummary,
    generateNv9000Export,
    getSourceNamesForDevice,
    getSourceDeviceForFs,
  };
})();
