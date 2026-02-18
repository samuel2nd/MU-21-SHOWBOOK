// CCU/FSY INPUT Tab — CCU 1-12, Frame Sync 1-67
// Computed SHOW NAME and SOURCE fields pull from SOURCE tab
const CcuFsyTab = (() => {
  function render(container) {
    const page = Utils.tabPage('CCU / FSY INPUT', 'Camera Control Units (1–12) and Frame Synchronizers (1–67). Show Name fields auto-populate from SOURCE tab assignments.');

    // CCU Section
    page.appendChild(Utils.sectionHeader('CCU 1–12'));
    const ccuCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'device', label: 'Device' },
      { key: 'coax', label: 'Coax', type: 'checkbox' },
      { key: 'tac', label: 'TAC' },
      { key: 'fibA', label: 'FIB-A' },
      { key: 'fibB', label: 'FIB-B' },
      { key: 'showName', label: 'Show Name', computed: (row) => {
        const ccuName = 'CCU ' + String(row.unit).padStart(2, '0');
        return Formulas.getSourceNamesForDevice(ccuName);
      }},
      { key: 'lensB', label: 'B', type: 'checkbox' },
      { key: 'lensS', label: 'S', type: 'checkbox' },
      { key: 'lensW', label: 'W', type: 'checkbox' },
      { key: 'lensDolly', label: 'DOLLY', type: 'checkbox' },
      { key: 'lensHand', label: 'HAND', type: 'checkbox' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, ccuCols, 'ccuFsy.ccu', Store.data.ccuFsy.ccu);

    // Frame Sync Section — split into two groups for readability
    page.appendChild(Utils.sectionHeader('Frame Sync 1–67'));
    const fsyCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'format', label: 'Format', type: 'select', options: () => Store.data.sheet8.videoFormats },
      { key: 'tac', label: 'TAC' },
      { key: 'fibA', label: 'FIB-A' },
      { key: 'showName', label: 'Show Name', computed: (row) => {
        const fsName = 'FS ' + String(row.unit).padStart(2, '0');
        return Formulas.getSourceNamesForDevice(fsName);
      }},
      { key: 'source', label: 'Source', computed: (row) => {
        const fsName = 'FS ' + String(row.unit).padStart(2, '0');
        return Formulas.getSourceNamesForDevice(fsName) ? fsName : '';
      }},
      { key: 'mult', label: 'Mult' },
      { key: 'coax', label: 'Coax' },
      { key: 'fixed', label: 'Fixed' },
      { key: 'js', label: 'JS' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, fsyCols, 'ccuFsy.fsy', Store.data.ccuFsy.fsy);

    container.appendChild(page);
  }

  return { render };
})();
