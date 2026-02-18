// Sheet8 — Reference/dropdown data editor
const Sheet8Tab = (() => {
  function render(container) {
    const page = Utils.tabPage('Sheet8 — Reference Data', 'Edit dropdown lists and reference data used across the showbook');
    const d = Store.data.sheet8;

    const lists = [
      { key: 'deviceTypes', label: 'Device Types' },
      { key: 'videoFormats', label: 'Video Formats' },
      { key: 'audioFormats', label: 'Audio Formats' },
      { key: 'locations', label: 'Locations' },
      { key: 'tacPanels', label: 'TAC Panels' },
      { key: 'audioSources', label: 'Audio Sources' },
    ];

    lists.forEach(list => {
      page.appendChild(Utils.sectionHeader(list.label));

      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '16px';

      const textarea = document.createElement('textarea');
      textarea.style.cssText = 'width:100%;max-width:500px;height:100px;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-family:var(--font-mono);font-size:12px;padding:8px;border-radius:4px;resize:vertical;';
      textarea.value = (d[list.key] || []).join('\n');
      textarea.placeholder = 'One item per line...';
      textarea.addEventListener('change', () => {
        const items = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
        d[list.key] = items;
        Store.set(`sheet8.${list.key}`, items);
      });
      wrapper.appendChild(textarea);

      const hint = document.createElement('div');
      hint.style.cssText = 'font-size:11px;color:var(--text-muted);margin-top:4px;';
      hint.textContent = 'One item per line. Changes apply to all dropdowns using this list.';
      wrapper.appendChild(hint);

      page.appendChild(wrapper);
    });

    container.appendChild(page);
  }

  return { render };
})();
