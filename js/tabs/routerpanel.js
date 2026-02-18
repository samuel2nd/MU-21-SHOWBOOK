// ROUTER PANEL FORM + TD ROUTER PANEL (combined)
const RouterPanelTab = (() => {
  function render(container) {
    const page = Utils.tabPage('ROUTER PANELS', 'Router panel configuration and TD panel button assignments');

    // Router Panel Form
    page.appendChild(Utils.sectionHeader('Router Panel Form (1–20)'));
    const formCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'panelName', label: 'Panel Name' },
      { key: 'location', label: 'Location', type: 'select', options: () => Store.data.sheet8.locations },
      { key: 'type', label: 'Type' },
      { key: 'levels', label: 'Levels' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, formCols, 'routerPanels.form', Store.data.routerPanels.form);

    // TD Router Panel
    page.appendChild(Utils.sectionHeader('TD Router Panel Buttons (1–20)'));
    const tdCols = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'button', label: 'Button Label' },
      { key: 'source', label: 'Source', type: 'select', options: () => Utils.getSourceOptions() },
      { key: 'dest', label: 'Destination' },
      { key: 'notes', label: 'Notes' },
    ];
    Utils.renderEditableTable(page, tdCols, 'routerPanels.td', Store.data.routerPanels.td);

    container.appendChild(page);
  }

  return { render };
})();
