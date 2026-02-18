// AUDIO MULT LIST — DT-1 through DT-6
const AudioMultTab = (() => {
  function render(container) {
    const page = Utils.tabPage('AUDIO MULT LIST', 'Audio distribution — DT-1 through DT-6 (24 channels each)');

    const columns = [
      { key: '_rowNum', label: '#', width: '35px' },
      { key: 'source', label: 'Source' },
      { key: 'dest', label: 'Destination' },
      { key: 'notes', label: 'Notes' },
    ];

    for (let i = 1; i <= 6; i++) {
      const key = `dt${i}`;
      page.appendChild(Utils.sectionHeader(`DT-${i} (24 Channels)`));
      Utils.renderEditableTable(page, columns, `audioMult.${key}`, Store.data.audioMult[key]);
    }

    container.appendChild(page);
  }

  return { render };
})();
