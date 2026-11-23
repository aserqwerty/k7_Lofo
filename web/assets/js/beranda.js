(async function () {
  'use strict';

  try {
    const response = await fetch('/api/reports');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { reports } = await response.json();
    const format = new Intl.NumberFormat('id-ID');
    document.getElementById('stat-total').textContent = format.format(reports.length);
    document.getElementById('stat-found').textContent = format.format(reports.filter((item) => item.type === 'temuan').length);
    document.getElementById('stat-lost').textContent = format.format(reports.filter((item) => item.type === 'hilang').length);
  } catch {
    document.getElementById('stats-note').hidden = false;
  }
})();
