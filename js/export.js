// ============================================
// Export / Import — JSON + CSV (with validation)
// ============================================

const ExportImport = (() => {

  function downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Escape CSV cell value properly
  function csvEscape(val) {
    const str = String(val == null ? '' : val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function exportJSON() {
    const data = Store.exportData();
    const showName = data.show.name || 'untitled';
    const safeName = showName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ts = new Date().toISOString().slice(0, 10);
    downloadFile(JSON.stringify(data, null, 2), `MU21_${safeName}_${ts}.json`);
    Utils.toast('Show exported as JSON', 'success');
  }

  function exportCSV(tabKey) {
    const data = Store.data;
    let rows = [];
    let headers = [];
    let filename = `MU21_${tabKey}`;

    switch (tabKey) {
      case 'source':
        headers = ['Number', 'Show Name', 'UMD Name', 'Eng Source', 'Audio Source', 'Active'];
        rows = data.sources.map(s => [s.number, s.showName, s.umdName, s.engSource, s.audioSource, s.active ? 'Y' : '']);
        break;
      case 'rtrmaster':
        headers = ['Row', 'Device Name', 'Device Desc', 'Video Level', ...Array.from({ length: 16 }, (_, i) => `Audio ${i + 1}`)];
        rows = data.rtrMaster.map(d => [d.row, d.deviceName, d.deviceDesc, d.videoLevel, ...d.audio]);
        break;
      case 'rtroutputs':
        headers = ['Row', 'Device Name', 'Device Desc', 'Video Level', ...Array.from({ length: 16 }, (_, i) => `Audio ${i + 1}`)];
        rows = data.rtrOutputs.map(d => [d.row, d.deviceName, d.deviceDesc, d.videoLevel, ...d.audio]);
        break;
      case 'txpgmgfx':
        headers = ['Section', 'Row', 'Device', 'Source', 'Notes'];
        ['tx', 'remi', 'cg', 'pgm'].forEach(sec => {
          data.txPgmGfx[sec].forEach(r => rows.push([sec.toUpperCase(), r.row, r.device, r.source, r.notes]));
        });
        break;
      case 'ccufsy':
        headers = ['Type', 'Unit', 'Device', 'Coax', 'TAC', 'FIB-A', 'FIB-B', 'Show Name', 'Lens B', 'Lens S', 'Lens W', 'Lens Dolly', 'Lens Hand', 'Format', 'Mult', 'Fixed', 'JS', 'Notes'];
        data.ccuFsy.ccu.forEach(r => {
          const ccuName = 'CCU ' + String(r.unit).padStart(2, '0');
          const showName = Formulas.getSourceNamesForDevice(ccuName);
          rows.push(['CCU', r.unit, r.device, r.coax ? 'Y' : '', r.tac, r.fibA, r.fibB, showName,
            r.lensB ? 'Y' : '', r.lensS ? 'Y' : '', r.lensW ? 'Y' : '', r.lensDolly ? 'Y' : '', r.lensHand ? 'Y' : '',
            '', '', '', '', r.notes]);
        });
        data.ccuFsy.fsy.forEach(r => {
          const fsName = 'FS ' + String(r.unit).padStart(2, '0');
          const showName = Formulas.getSourceNamesForDevice(fsName);
          rows.push(['FSY', r.unit, '', '', r.tac, r.fibA, '', showName,
            '', '', '', '', '',
            r.format, r.mult, r.fixed, r.js, r.notes]);
        });
        break;
      case 'videoio':
        headers = ['Row', 'Fiber In', 'Fiber Out', 'Coax In', 'Coax Out', 'Notes'];
        rows = data.videoIo.map(r => [r.row, r.fiberIn, r.fiberOut, r.coaxIn, r.coaxOut, r.notes]);
        break;
      case 'swrio':
        headers = ['Section', 'Row', 'Field1', 'Field2', 'Notes'];
        data.swrIo.inputs.forEach(r => rows.push(['INPUT', r.row, r.source, r.tally, r.notes]));
        data.swrIo.outputs.forEach(r => rows.push(['OUTPUT', r.row, r.dest, r.source, r.notes]));
        data.swrIo.gpi.forEach(r => rows.push(['GPI', r.row, r.function, r.trigger, r.notes]));
        break;
      case 'networkio':
        headers = ['Patch', 'Port', 'Device', 'IP', 'VLAN', 'Notes'];
        data.networkIo.patchA.forEach(r => rows.push(['A', r.port, r.device, r.ip, r.vlan, r.notes]));
        data.networkIo.patchB.forEach(r => rows.push(['B', r.port, r.device, r.ip, r.vlan, r.notes]));
        break;
      case 'engineer':
        headers = ['Source #', 'Show Name', 'UMD Name', 'Eng Source', 'Video Level'];
        data.sources.forEach(s => {
          if (s.showName && s.engSource) {
            const dev = Store.data.rtrMaster.find(d => d.deviceName === s.engSource);
            rows.push([s.number, s.showName, s.umdName || s.showName, s.engSource, dev ? dev.videoLevel : '']);
          }
        });
        break;
      case 'evsconfig':
        headers = ['Server', 'Name', 'Channel', 'Input', 'Output', 'Mode', 'Notes'];
        data.evsConfig.forEach(srv => {
          srv.channels.forEach(ch => {
            rows.push([srv.server, srv.name, ch.channel, ch.input, ch.output, ch.mode, ch.notes]);
          });
        });
        break;
      case 'coax':
        headers = ['Section', 'Row', 'Source/Unit', 'Dest1/Input', 'Dest2/Output', 'Dest3', 'Dest4', 'Notes'];
        data.coax.mults.forEach(r => rows.push(['MULT', r.row, r.source, r.dest1, r.dest2, r.dest3, r.dest4, r.notes]));
        data.coax.mux.forEach(r => rows.push(['MUX', r.row, r.unit, r.input, r.output, '', '', r.notes]));
        break;
      case 'audiomult':
        headers = ['DT Unit', 'Row', 'Source', 'Destination', 'Notes'];
        for (let i = 1; i <= 6; i++) {
          data.audioMult[`dt${i}`].forEach(r => rows.push([`DT-${i}`, r.row, r.source, r.dest, r.notes]));
        }
        break;
      default:
        // Monitor walls
        if (tabKey.startsWith('monitors-')) {
          const wallKey = tabKey.replace('monitors-', '');
          const wall = data.monitorWalls[wallKey];
          if (wall) {
            headers = ['Position', 'Label', 'Source', 'Active'];
            rows = wall.map(m => [m.position, m.label, m.source, m.active ? 'Y' : '']);
          } else {
            headers = ['Info'];
            rows = [['CSV export not available for this tab.']];
          }
        } else {
          headers = ['Info'];
          rows = [['CSV export not implemented for this tab. Use JSON export for full show data.']];
        }
    }

    const csvContent = [
      headers.map(csvEscape).join(','),
      ...rows.map(r => r.map(csvEscape).join(',')),
    ].join('\n');

    const showName = data.show.name || 'untitled';
    const safeName = showName.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadFile(csvContent, `${filename}_${safeName}.csv`, 'text/csv');
    Utils.toast(`CSV exported: ${tabKey}`, 'success');
  }

  // Validate imported JSON structure
  function validateImportData(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
      errors.push('File does not contain a valid JSON object');
      return errors;
    }
    if (!data.show || typeof data.show !== 'object') {
      errors.push('Missing or invalid "show" object');
    } else {
      if (typeof data.show.name !== 'string') errors.push('"show.name" must be a string');
      if (typeof data.show.format !== 'string') errors.push('"show.format" must be a string');
    }
    if (data.sources) {
      if (!Array.isArray(data.sources)) {
        errors.push('"sources" must be an array');
      } else if (data.sources.length > 80) {
        errors.push(`"sources" has ${data.sources.length} entries — expected max 80`);
      } else {
        data.sources.forEach((s, i) => {
          if (typeof s !== 'object') errors.push(`sources[${i}] is not an object`);
        });
      }
    }
    if (data.rtrMaster) {
      if (!Array.isArray(data.rtrMaster)) {
        errors.push('"rtrMaster" must be an array');
      } else if (data.rtrMaster.length > 500) {
        errors.push(`"rtrMaster" has ${data.rtrMaster.length} entries — expected max 500`);
      } else {
        data.rtrMaster.forEach((d, i) => {
          if (d.audio && !Array.isArray(d.audio)) errors.push(`rtrMaster[${i}].audio must be an array`);
        });
      }
    }
    if (data.rtrOutputs) {
      if (!Array.isArray(data.rtrOutputs)) {
        errors.push('"rtrOutputs" must be an array');
      } else if (data.rtrOutputs.length > 500) {
        errors.push(`"rtrOutputs" has ${data.rtrOutputs.length} entries — expected max 500`);
      } else {
        data.rtrOutputs.forEach((d, i) => {
          if (d.audio && !Array.isArray(d.audio)) errors.push(`rtrOutputs[${i}].audio must be an array`);
        });
      }
    }
    if (data.monitorWalls && typeof data.monitorWalls !== 'object') {
      errors.push('"monitorWalls" must be an object');
    }
    if (data.txPgmGfx && typeof data.txPgmGfx !== 'object') {
      errors.push('"txPgmGfx" must be an object');
    }
    return errors;
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = e.target.result;
          // Size check (50MB max)
          if (raw.length > 50 * 1024 * 1024) {
            reject(new Error('File too large (max 50MB)'));
            return;
          }
          const data = JSON.parse(raw);

          // Structural validation
          const errors = validateImportData(data);
          if (errors.length > 0) {
            reject(new Error('Invalid showbook file:\n' + errors.join('\n')));
            return;
          }

          // Sanitize string fields to prevent stored XSS
          sanitizeStrings(data);

          Store.loadShow(data);
          Utils.toast(`Show "${data.show.name || 'Untitled'}" imported successfully`, 'success');
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Recursively sanitize all string values in an object
  function sanitizeStrings(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // Strip HTML tags and control characters
        obj[key] = obj[key].replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      } else if (typeof obj[key] === 'object') {
        sanitizeStrings(obj[key]);
      }
    }
  }

  function newShow() {
    // Confirmation before wiping data
    const hasData = Store.data.sources.some(s => s.showName) || Store.data.rtrMaster.some(d => d.deviceName);
    if (hasData) {
      if (!confirm('This will erase all current show data. Are you sure you want to create a new show?\n\nTip: Export your current show first with "Export JSON" if you want to keep it.')) {
        return;
      }
    }
    const name = prompt('Enter new show name:');
    if (name === null) return;
    if (!name.trim()) {
      Utils.toast('Show name cannot be empty', 'warn');
      return;
    }
    const format = prompt('Enter show format (e.g. 1080i/59.94):') || '';
    Store.newShow(name.trim(), format.trim());
    Utils.toast(`New show "${name.trim()}" created`, 'success');
  }

  return { exportJSON, exportCSV, importJSON, newShow };
})();
