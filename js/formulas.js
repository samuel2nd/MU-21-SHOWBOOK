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

    // Count sources by device type (based on engSource field)
    // CCU count: sources with engSource containing "CCU"
    const ccuCount = Store.data.sources.filter(s =>
      s.engSource && s.engSource.toUpperCase().includes('CCU')
    ).length;

    // FSY count: sources with engSource containing "FSY" or "FS" + TX/PGM/GFX framesync assignments
    const fsyFromSources = Store.data.sources.filter(s =>
      s.engSource && (s.engSource.toUpperCase().includes('FSY') || s.engSource.toUpperCase().match(/\bFS\s*\d/))
    ).length;
    const fsyFromTx = (Store.data.txPgmGfx && Store.data.txPgmGfx.tx)
      ? Store.data.txPgmGfx.tx.filter(tx => tx.framesync).length
      : 0;
    const fsyCount = fsyFromSources + fsyFromTx;

    // EVS count: sources with engSource containing "EVS"
    const evsCount = Store.data.sources.filter(s =>
      s.engSource && s.engSource.toUpperCase().includes('EVS')
    ).length;

    // VTR count: sources with engSource containing "VTR"
    const vtrCount = Store.data.sources.filter(s =>
      s.engSource && s.engSource.toUpperCase().includes('VTR')
    ).length;

    // GFX count: sources with engSource containing "GFX"
    const gfxCount = Store.data.sources.filter(s =>
      s.engSource && s.engSource.toUpperCase().includes('GFX')
    ).length;

    // CAM count: sources with engSource containing "CAM"
    const camCount = Store.data.sources.filter(s =>
      s.engSource && s.engSource.toUpperCase().includes('CAM')
    ).length;

    return {
      totalSources, activeSources,
      totalDevices, usedDevices,
      totalMonitors, activeMonitors,
      ccuCount, fsyCount, evsCount, vtrCount, gfxCount, camCount,
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

  // Get TX UMD name for a Frame Sync (if assigned in TX/PGM/GFX page)
  // Returns the UMD NAME from TX row that has this FS in its framesync field
  function getTxUmdForFs(fsName) {
    if (!fsName || !Store.data.txPgmGfx || !Store.data.txPgmGfx.tx) return '';
    const txRow = Store.data.txPgmGfx.tx.find(tx => tx.framesync === fsName);
    return txRow ? (txRow.umdName || `TX${txRow.row}`) : '';
  }

  // Get FS units assigned in TX/PGM/GFX (returns Set of FS names like "FS 01")
  function getFsAssignedInTxPgmGfx() {
    const assigned = new Set();
    if (Store.data.txPgmGfx && Store.data.txPgmGfx.tx) {
      Store.data.txPgmGfx.tx.forEach(tx => {
        if (tx.framesync) {
          assigned.add(tx.framesync);
        }
      });
    }
    return assigned;
  }

  // Get show name OR TX UMD name for a Frame Sync device
  // First checks SOURCE page, then checks TX/PGM/GFX assignments
  function getShowNameForFs(fsName) {
    if (!fsName) return '';
    // First check if any source uses this FS as engSource
    const sourceNames = getSourceNamesForDevice(fsName);
    if (sourceNames) return sourceNames;
    // Then check if this FS is assigned in TX/PGM/GFX
    const txUmd = getTxUmdForFs(fsName);
    return txUmd;
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

  // Get routing info for a TX UMD name from VIDEO I/O page
  // Returns a comma-separated list of where this TX is assigned (Fiber RTR, Coax RTR, JFS MUX, Tie Lines)
  function getTxRoutingInfo(txUmdName) {
    if (!txUmdName) return '';
    const routes = [];
    const videoIo = Store.data.videoIo;

    // Check Fiber RTR Outputs
    if (videoIo.fiberRtrOut) {
      videoIo.fiberRtrOut.forEach((row, idx) => {
        if (row.source && row.source.toUpperCase().includes(txUmdName.toUpperCase())) {
          routes.push(`FIB-${row.row}${row.destination ? ': ' + row.destination : ''}`);
        }
      });
    }

    // Check Coax RTR Outputs
    if (videoIo.coaxRtrOut) {
      videoIo.coaxRtrOut.forEach((row, idx) => {
        if (row.source && row.source.toUpperCase().includes(txUmdName.toUpperCase())) {
          routes.push(`COAX-${row.row}${row.destination ? ': ' + row.destination : ''}`);
        }
      });
    }

    // Check I/O Tie Lines
    if (videoIo.coaxIoTieLines) {
      videoIo.coaxIoTieLines.forEach((row, idx) => {
        if (row.source && row.source.toUpperCase().includes(txUmdName.toUpperCase())) {
          routes.push(`TIE-${row.row}${row.destination ? ': ' + row.destination : ''}`);
        }
      });
    }

    // Check JFS MUX 1
    if (videoIo.jfsMux1 && videoIo.jfsMux1.rows) {
      videoIo.jfsMux1.rows.forEach((row, idx) => {
        if (row.source && row.source.toUpperCase().includes(txUmdName.toUpperCase())) {
          routes.push(`MUX1-${row.row}${row.destination ? ': ' + row.destination : ''}`);
        }
      });
    }

    // Check JFS MUX 2
    if (videoIo.jfsMux2 && videoIo.jfsMux2.rows) {
      videoIo.jfsMux2.rows.forEach((row, idx) => {
        if (row.source && row.source.toUpperCase().includes(txUmdName.toUpperCase())) {
          routes.push(`MUX2-${row.row}${row.destination ? ': ' + row.destination : ''}`);
        }
      });
    }

    return routes.join(', ');
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
    getTxRoutingInfo,
    getTxUmdForFs,
    getFsAssignedInTxPgmGfx,
    getShowNameForFs,
  };
})();
