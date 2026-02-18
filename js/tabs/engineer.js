// ENGINEER Tab — UMD updater + NV9000 export (computed from SOURCE + RTR Master)
const EngineerTab = (() => {
  function render(container) {
    const page = Utils.tabPage('ENGINEER', 'Auto-computed: UMD names and NV9000 export data. All fields derived from SOURCE and RTR I/O MASTER.');

    // UMD Name Mapping Table
    page.appendChild(Utils.sectionHeader('UMD Name Mapping'));
    const umdTable = document.createElement('table');
    umdTable.className = 'data-table';

    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['Src #', 'Show Name', 'UMD Name', 'Eng Source'].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    umdTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    Store.data.sources.forEach(src => {
      if (!src.showName) return;
      const tr = document.createElement('tr');

      [
        src.number,
        src.showName,
        src.umdName || src.showName,
        src.engSource || '—',
      ].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    umdTable.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.appendChild(umdTable);
    page.appendChild(wrapper);

    // NV9000 Export
    page.appendChild(Utils.sectionHeader('NV9000 Router Configuration Export'));
    const nvTable = document.createElement('table');
    nvTable.className = 'data-table';

    // Build headers: Src #, Show Name, UMD Name, Eng Source, Video, Audio 1-16
    const nvThead = document.createElement('thead');
    const nvHr = document.createElement('tr');
    const audioHeaders = [];
    for (let i = 1; i <= 16; i++) {
      audioHeaders.push(`Audio ${i}`);
    }
    ['Src #', 'Show Name', 'UMD Name', 'Eng Source', 'Video', ...audioHeaders].forEach(lbl => {
      const th = document.createElement('th');
      th.textContent = lbl;
      nvHr.appendChild(th);
    });
    nvThead.appendChild(nvHr);
    nvTable.appendChild(nvThead);

    const nvTbody = document.createElement('tbody');
    Store.data.sources.forEach(src => {
      if (!src.showName) return;
      // Exclude EVS CONFIG entries from NV9000 export
      if (src.category === 'EVS') return;
      const tr = document.createElement('tr');

      // Lookup VIDEO device from RTR I/O MASTER by engSource name
      const videoDevice = Formulas.rtrMasterLookup(src.engSource);

      // Lookup AUDIO device from RTR I/O MASTER by audioSource name
      const audioDevice = Formulas.rtrMasterLookup(src.audioSource);

      // Get audio levels from RTR Master based on audioSource
      const audioLevels = audioDevice ? audioDevice.audio : null;

      // Base columns
      const baseValues = [
        src.number,
        src.showName,
        src.umdName || src.showName,
        src.engSource || '—',
        videoDevice ? videoDevice.videoLevel : '—',
      ];

      // 16 audio channels - pull from RTR Master using audioSource lookup
      const audioValues = [];
      for (let i = 0; i < 16; i++) {
        audioValues.push(audioLevels && audioLevels[i] ? audioLevels[i] : '—');
      }

      [...baseValues, ...audioValues].forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      nvTbody.appendChild(tr);
    });
    nvTable.appendChild(nvTbody);

    const nvWrapper = document.createElement('div');
    nvWrapper.className = 'table-scroll';
    nvWrapper.appendChild(nvTable);
    page.appendChild(nvWrapper);

    // Export button
    const btnRow = document.createElement('div');
    btnRow.style.marginTop = '12px';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'Export NV9000 CSV';
    btn.addEventListener('click', () => {
      const audioHeaders = [];
      for (let i = 1; i <= 16; i++) {
        audioHeaders.push(`Audio ${i}`);
      }
      const headers = ['Src #', 'Show Name', 'UMD Name', 'Eng Source', 'Video', ...audioHeaders];

      const csvRows = [];
      Store.data.sources.forEach(src => {
        if (!src.showName) return;
        // Exclude EVS CONFIG entries from NV9000 export
        if (src.category === 'EVS') return;
        // Lookup VIDEO device from RTR I/O MASTER by engSource name
        const videoDevice = Formulas.rtrMasterLookup(src.engSource);
        // Lookup AUDIO device from RTR I/O MASTER by audioSource name
        const audioDevice = Formulas.rtrMasterLookup(src.audioSource);
        // Get audio levels from RTR Master based on audioSource
        const audioLevels = audioDevice ? audioDevice.audio : null;

        const row = [
          src.number,
          src.showName,
          src.umdName || src.showName,
          src.engSource || '',
          videoDevice ? videoDevice.videoLevel : '',
        ];
        // 16 audio channels - pull from RTR Master using audioSource lookup
        for (let i = 0; i < 16; i++) {
          row.push(audioLevels && audioLevels[i] ? audioLevels[i] : '');
        }
        csvRows.push(row.map(c => `"${c}"`).join(','));
      });

      const csv = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NV9000_${Store.data.show.name || 'export'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
    btnRow.appendChild(btn);
    page.appendChild(btnRow);

    container.appendChild(page);
  }

  return { render };
})();
