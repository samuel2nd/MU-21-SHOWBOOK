// COAX MULTS + COAX MUX UNITS (combined tab)
const CoaxTab = (() => {
  function render(container) {
    const page = Utils.tabPage('COAX MULTS / MUX UNITS', 'Coaxial mult distribution and mux unit assignments');

    // Coax Mults
    page.appendChild(Utils.sectionHeader('Coax Mults (1–40)'));
    const multCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'source', label: 'Source' },
      { key: 'dest1', label: 'Dest 1' },
      { key: 'dest2', label: 'Dest 2' },
      { key: 'dest3', label: 'Dest 3' },
      { key: 'dest4', label: 'Dest 4' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, multCols, 'coax.mults', Store.data.coax.mults);

    // Coax Mux Units
    page.appendChild(Utils.sectionHeader('Coax Mux Units (1–20)'));
    const muxCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'unit', label: 'Unit' },
      { key: 'input', label: 'Input' },
      { key: 'output', label: 'Output' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, muxCols, 'coax.mux', Store.data.coax.mux);

    container.appendChild(page);
  }

  return { render };
})();
