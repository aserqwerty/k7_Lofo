(function () {
  'use strict';

  const search = document.getElementById('q');
  const searchForm = document.getElementById('report-search');
  const filterForm = document.getElementById('filter-form');
  const filterPanel = document.getElementById('report-filters');
  const filterButton = document.getElementById('toggle-filters');
  const sort = document.getElementById('sort');
  const list = document.getElementById('report-list');
  const count = document.getElementById('report-count');
  const message = document.getElementById('report-message');
  const messageTitle = document.getElementById('report-message-title');
  const messageHelp = document.getElementById('report-message-help');
  const retry = document.getElementById('retry-reports');
  let filters = new URLSearchParams(new FormData(filterForm));
  const categories = new Map([
    ['elektronik', 'Elektronik'],
    ['dompet', 'Dompet & Tas'],
    ['kunci', 'Kunci'],
    ['dokumen', 'Dokumen'],
  ]);
  const formatDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
  let activeRequest;
  search.value = (new URLSearchParams(window.location.search).get('q') ?? '').slice(0, 100);

  function element(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function icon(name) {
    const el = document.createElement('span');
    el.setAttribute('aria-hidden', 'true');
    // Only icon names from this script reach the existing SVG helper.
    el.innerHTML = window.LoFo.icon(name);
    return el;
  }

  function metadata(name, text) {
    const el = element('div', 'item__meta');
    el.append(icon(name), text);
    return el;
  }

  function renderReport(report) {
    const category = categories.get(report.category) ?? 'Lainnya';
    const isFound = report.type === 'temuan';
    const card = element('article', 'item');
    const thumb = element('span', 'item__thumb');
    thumb.append(icon('image'));

    const badge = element('span', `badge badge--${isFound ? 'found' : 'lost'}`);
    badge.append(element('span', 'badge__dot'), isFound ? 'Temuan' : 'Hilang');
    thumb.append(badge);
    const title = element('h2', 'item__title', report.title);
    title.title = report.title;

    const date = new Date(`${report.occurredAt}T00:00:00Z`);
    const dateLabel = Number.isNaN(date.getTime()) ? 'Tanggal tidak tersedia' : formatDate.format(date);
    const foot = element('div', 'item__foot');
    foot.append(metadata('map-pin', report.location), metadata('clock', dateLabel));
    const body = element('div', 'item__body');
    body.append(title, metadata('tag', category), foot);
    card.append(thumb, body);
    return card;
  }

  function showMessage(title, help, canRetry) {
    messageTitle.textContent = title;
    messageHelp.textContent = help;
    retry.hidden = !canRetry;
    message.hidden = false;
  }

  async function refresh() {
    activeRequest?.abort();
    const request = new AbortController();
    activeRequest = request;
    const params = new URLSearchParams(filters);
    const q = search.value.trim();
    params.set('q', q);
    params.set('sort', sort.value);
    const hasFilter = q || [...filters.values()].some(Boolean);

    list.setAttribute('aria-busy', 'true');
    list.replaceChildren();
    count.textContent = 'Memuat laporan…';
    message.hidden = true;

    try {
      const response = await fetch(`/api/reports?${params}`, { signal: request.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { reports } = await response.json();
      if (activeRequest !== request) return;
      list.replaceChildren(...reports.map(renderReport));
      count.textContent = `${reports.length} barang`;
      if (!reports.length) {
        if (hasFilter) {
          showMessage('Tidak ada barang yang cocok', 'Coba kata kunci lain atau reset filter pencarian.', false);
        } else {
          showMessage('Belum ada laporan', 'Laporan barang hilang dan temuan akan muncul di sini.', false);
        }
      }
    } catch {
      if (activeRequest !== request) return;
      count.textContent = 'Laporan gagal dimuat';
      showMessage('Gagal memuat laporan', 'Coba lagi untuk memuat daftar barang.', true);
    } finally {
      if (activeRequest === request) {
        activeRequest = undefined;
        list.setAttribute('aria-busy', 'false');
      }
    }
  }

  function setFilterPanel(open) {
    filterPanel.classList.toggle('is-open', open);
    filterButton.setAttribute('aria-expanded', String(open));
  }

  filterButton.addEventListener('click', () => setFilterPanel(!filterPanel.classList.contains('is-open')));
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new URL(window.location.href);
    const q = search.value.trim();
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    refresh();
  });
  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    filters = new URLSearchParams(new FormData(filterForm));
    filters.set('location', filters.get('location').trim());
    refresh();
    if (filterButton.getClientRects().length) {
      setFilterPanel(false);
      filterButton.focus();
    }
  });
  sort.addEventListener('change', () => refresh());
  retry.addEventListener('click', () => refresh());
  document.getElementById('reset-filters').addEventListener('click', () => {
    filterForm.reset();
    filters = new URLSearchParams(new FormData(filterForm));
    search.value = '';
    sort.value = 'newest';
    searchForm.requestSubmit();
  });

  refresh();
})();
