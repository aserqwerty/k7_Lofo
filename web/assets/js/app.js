/* ==========================================================================
   LoFo — Website Behaviour
   - Ikon SVG inline (tanpa dependency)
   - Injeksi header + bottom nav + footer
   - Interaksi: filter, tab, modal, validasi form, toast, kekuatan sandi
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. IKON
     ---------------------------------------------------------------------- */
  var ICONS = {
    home:      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.5"/>',
    search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    bell:      '<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
    user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    calendar:  '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    tag:       '<path d="M20.5 13.3 13.3 20.5a2 2 0 0 1-2.8 0l-7-7V4h9.5l7.5 7.5a1.9 1.9 0 0 1 0 1.8Z"/><circle cx="8" cy="8" r="1.4"/>',
    shield:    '<path d="M12 3 4.5 6v6c0 5 7.5 9 7.5 9s7.5-4 7.5-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    check:     '<path d="m4.5 12.5 5 5L19.5 7"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16 9.7"/>',
    camera:    '<path d="M3.5 8.5h3l1.5-2.5h8L17.5 8.5h3v11h-17Z"/><circle cx="12" cy="13.5" r="3.4"/>',
    upload:    '<path d="M12 16V4"/><path d="m7.5 8.5 4.5-4.5 4.5 4.5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    image:     '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m5 17.5 4.6-4.6 3.2 3.2 2.4-2.4 3.8 3.8"/>',
    laptop:    '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2.5 19.5h19"/>',
    wallet:    '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.2"/>',
    key:       '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9"/><path d="m16 5 3 3"/><path d="m13.5 7.5 2.5 2.5"/>',
    'file-text': '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/>',
    package:   '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5"/><path d="M12 12v9"/>',
    'alert-triangle': '<path d="M10.3 4.3 2.6 17.5A1.9 1.9 0 0 0 4.3 20.5h15.4a1.9 1.9 0 0 0 1.7-3L13.7 4.3a1.9 1.9 0 0 0-3.4 0Z"/><path d="M12 9v4"/><circle cx="12" cy="16.4" r=".9" fill="currentColor" stroke="none"/>',
    info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>',
    x:         '<path d="M6 6l12 12M18 6 6 18"/>',
    filter:    '<path d="M3.5 5.5h17l-6.6 7.6v6.4l-3.8-2v-4.4Z"/>',
    grid:      '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    list:      '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>',
    logout:    '<path d="M14 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H14"/><path d="M17.5 12H9.5"/><path d="m15 8.5 3.5 3.5L15 15.5"/>',
    settings:  '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7"/>',
    'trending-up': '<path d="m3.5 16.5 6-6 4 4 7-7"/><path d="M15 7.5h5.5V13"/>',
    users:     '<circle cx="9" cy="8.5" r="3.6"/><path d="M2.5 20c0-3.6 3-5.6 6.5-5.6s6.5 2 6.5 5.6"/><path d="M17 5.2a3.4 3.4 0 0 1 0 6.6"/><path d="M18.5 14.8c2 .7 3.2 2.3 3.2 4.7"/>',
    flag:      '<path d="M5.5 21V4"/><path d="M5.5 4.5h11l-2.2 3.6 2.2 3.6h-11Z"/>',
    eye:       '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3.1"/>',
    mail:      '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 5.5 8-5.5"/>',
    lock:      '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    phone:     '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
    star:      '<path d="m12 3.8 2.6 5.3 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z"/>',
    'more-h':  '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    send:      '<path d="M21 3 10.5 13.5"/><path d="M21 3l-6.8 18-3.7-7.5L3 9.8Z"/>',
    'refresh': '<path d="M20 11.5A8 8 0 0 0 6.2 6.2L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12.5a8 8 0 0 0 13.8 5.3L20 15.5"/><path d="M20 20v-4.5h-4.5"/>',
    'thumbs-up': '<path d="M7 10.5v10H4.5a1.5 1.5 0 0 1-1.5-1.5v-7a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M7 10.5 11.5 3a2.5 2.5 0 0 1 2.5 2.5V9h4.6a2 2 0 0 1 2 2.4l-1.3 6.6a2 2 0 0 1-2 1.6H7"/>'
  };

  function icon(name, size, cls) {
    var d = ICONS[name];
    if (!d) return '';
    var s = size || 20;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ' +
      'width="' + s + '" height="' + s + '"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + d + '</svg>';
  }

  /* ----------------------------------------------------------------------
     2. DATA NAVIGASI
     ---------------------------------------------------------------------- */
  var NAV = [
    { id: 'beranda', label: 'Beranda', href: 'index.html', ico: 'home' },
    { id: 'cari', label: 'Cari Barang', href: 'cari.html', ico: 'search' },
    { id: 'lapor', label: 'Lapor', href: 'lapor.html', ico: 'plus' },
    { id: 'laporan-saya', label: 'Laporan Saya', href: 'laporan-saya.html', ico: 'file-text' },
    { id: 'tentang', label: 'Tentang', href: 'tentang.html', ico: 'info' }
  ];

  var page = document.body.getAttribute('data-page') || '';

  function isActive(id) {
    if (id === page) return true;
    if (id === 'lapor' && ['lapor-hilang', 'lapor-temuan'].includes(page)) return true;
    if (id === 'cari' && ['detail', 'klaim'].includes(page)) return true;
    return false;
  }

  /* ----------------------------------------------------------------------
     3. HEADER
     ---------------------------------------------------------------------- */
  function renderHeader() {
    var host = document.getElementById('site-header');
    if (!host) return;

    var links = NAV.map(function (l) {
      return '<a href="' + l.href + '"' + (isActive(l.id) ? ' aria-current="page"' : '') + '>' + l.label + '</a>';
    }).join('');

    host.innerHTML =
      '<header class="topbar">' +
        '<div class="topbar__inner">' +
          '<a class="brand" href="index.html" aria-label="LoFo — Beranda">' +
            '<span class="brand__mark">' + icon('package') + '</span>' +
            '<span class="brand__name">LoFo</span>' +
          '</a>' +
          '<nav class="nav-links" aria-label="Navigasi utama">' + links + '</nav>' +
          '<div class="topbar__actions">' +
            '<form class="topbar__search" role="search" aria-label="Pencarian cepat" action="cari.html">' +
              '<label class="sr-only" for="site-q">Cari barang</label>' +
              '<input class="input" id="site-q" name="q" type="search" placeholder="Cari barang…" maxlength="100">' +
              '<button class="icon-btn" aria-label="Jalankan pencarian">' + icon('search') + '</button>' +
            '</form>' +
            '<a class="icon-btn topbar__notification" href="notifikasi.html" aria-label="Notifikasi">' + icon('bell') + '</a>' +
            '<a class="btn btn--ghost btn--sm" href="masuk.html">Masuk</a>' +
            '<a class="btn btn--primary btn--sm" href="daftar.html">Daftar Gratis</a>' +
          '</div>' +
        '</div>' +
      '</header>';

  }

  /* ----------------------------------------------------------------------
     4. BOTTOM NAV
     ---------------------------------------------------------------------- */
  function renderBottomNav() {
    var host = document.getElementById('site-bottomnav');
    if (!host) return;

    var items = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (isActive(n.id) ? ' aria-current="page"' : '') + '>' +
        icon(n.ico) + '<span>' + n.label + '</span></a>';
    }).join('');

    host.innerHTML = '<nav class="bottomnav" aria-label="Navigasi bawah">' + items + '</nav>';
  }

  /* ----------------------------------------------------------------------
     5. FOOTER
     ---------------------------------------------------------------------- */
  function renderFooter() {
    var host = document.getElementById('site-footer');
    if (!host) return;

    host.innerHTML =
      '<footer class="site-foot">' +
        '<div class="container site-foot__inner">' +
          '<div class="row" style="gap:10px">' +
            '<span class="brand__mark" style="width:28px;height:28px;border-radius:9px">' + icon('package') + '</span>' +
            '<span>&copy; 2026 LoFo — Platform Lost &amp; Found Indonesia</span>' +
          '</div>' +
          '<nav class="site-foot__links" aria-label="Tautan footer">' +
            '<a href="index.html">Beranda</a>' +
            '<a href="cari.html">Cari Barang</a>' +
            '<a href="lapor.html">Lapor</a>' +
            '<a href="tentang.html">Tentang</a>' +
          '</nav>' +
        '</div>' +
      '</footer>';
  }

  /* ----------------------------------------------------------------------
     6. TOAST
     ---------------------------------------------------------------------- */
  var toastTimer;
  function toast(msg) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ----------------------------------------------------------------------
     7. INTERAKSI UMUM
     ---------------------------------------------------------------------- */
  function bindChips() {
    document.querySelectorAll('[data-chipgroup]').forEach(function (group) {
      group.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip || !group.contains(chip)) return;

        var multi = group.getAttribute('data-chipgroup') === 'multi';
        if (!multi) {
          group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        }
        chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');

        applyFilters();
      });
    });
  }

  /* Filter gabungan: kata kunci (search) + semua grup chip */
  function applyFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) return;

    var q = '';
    var search = document.querySelector('[data-live-search]');
    if (search) q = search.value.trim().toLowerCase();

    // Kumpulkan seluruh chip aktif dari semua grup
    var active = [];
    document.querySelectorAll('[data-chipgroup]').forEach(function (group) {
      group.querySelectorAll('.chip[aria-pressed="true"]').forEach(function (chip) {
        var v = (chip.getAttribute('data-value') || '').toLowerCase();
        if (v && v !== 'semua') active.push(v);
      });
    });

    var count = 0;
    list.querySelectorAll('[data-tags]').forEach(function (item) {
      var tags = (item.getAttribute('data-tags') || '').toLowerCase();
      var text = (item.textContent || '').toLowerCase() + ' ' + tags;

      var matchChips = active.length === 0 || active.every(function (v) {
        return tags.indexOf(v) !== -1 || text.indexOf(v) !== -1;
      });
      var matchQuery = !q || text.indexOf(q) !== -1;

      var show = matchChips && matchQuery;
      item.style.display = show ? '' : 'none';
      if (show) count++;
    });

    var out = document.querySelector('[data-filter-count]');
    if (out) out.textContent = count + ' barang';

    var empty = document.querySelector('[data-filter-empty]');
    if (empty) empty.hidden = count !== 0;
  }

  function bindSearch() {
    var input = document.querySelector('[data-live-search]');
    if (!input) return;
    input.addEventListener('input', applyFilters);
  }

  function bindTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (wrap) {
      var tabs = wrap.querySelectorAll('[data-tab]');
      var panels = wrap.querySelectorAll('[data-panel]');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var key = tab.getAttribute('data-tab');
          tabs.forEach(function (t) {
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
          panels.forEach(function (p) {
            p.hidden = p.getAttribute('data-panel') !== key;
          });
        });
      });
    });
  }

  function bindPasswordMeter() {
    var pw = document.querySelector('[data-pw]');
    var meter = document.querySelector('.pw-meter');
    var label = document.querySelector('[data-pw-label]');
    if (!pw || !meter) return;

    pw.addEventListener('input', function () {
      var v = pw.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;

      // Pastikan sandi yang diisi selalu menampilkan minimal 1 bar (tidak "kosong")
      var level = v ? Math.max(score, 1) : 0;

      meter.setAttribute('data-level', String(level));
      if (label) {
        label.textContent = v
          ? 'Kekuatan sandi: ' + (score >= 3 ? 'Kuat' : score === 2 ? 'Sedang' : 'Lemah')
          : 'Minimal 8 karakter, campur huruf & angka.';
      }
    });
  }

  function bindForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;

        form.querySelectorAll('[required]').forEach(function (input) {
          var field = input.closest('.field');
          var valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
          if (input.type === 'email' && valid) {
            valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          }
          if (field) field.classList.toggle('is-invalid', !valid);
          if (!valid && ok) { ok = false; input.focus(); }
        });

        if (!ok) {
          toast('Lengkapi dulu kolom yang ditandai.');
          return;
        }

        toast('Fitur ini belum aktif. Data belum dikirim atau disimpan.');
      });

      form.querySelectorAll('.input, .select, .textarea').forEach(function (input) {
        input.addEventListener('input', function () {
          var field = input.closest('.field');
          if (field) field.classList.remove('is-invalid');
        });
      });
    });
  }

  function bindTogglePassword() {
    document.querySelectorAll('[data-toggle-pw]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-toggle-pw'));
        if (!target) return;
        var show = target.type === 'password';
        target.type = show ? 'text' : 'password';
        btn.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
        btn.innerHTML = icon(show ? 'x' : 'eye');
      });
    });
  }

  function bindMisc() {
    document.querySelectorAll('[data-toast]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return;
        e.preventDefault();
        toast(el.getAttribute('data-toast'));
      });
    });

    document.querySelectorAll('[data-mark-read]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.notif--unread').forEach(function (n) {
          n.classList.remove('notif--unread');
        });
        toast('Semua notifikasi ditandai sudah dibaca.');
      });
    });
  }

  /* ----------------------------------------------------------------------
     8. INIT
     ---------------------------------------------------------------------- */
  function init() {
    renderHeader();
    renderBottomNav();
    renderFooter();

    // Ganti placeholder ikon: <span data-icon="home"></span>
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = icon(el.getAttribute('data-icon'));
    });

    bindChips();
    bindSearch();
    bindTabs();
    bindPasswordMeter();
    bindForms();
    bindTogglePassword();
    bindMisc();

    // Hitung ulang jumlah hasil saat halaman dimuat
    if (document.querySelector('[data-filter-list]')) applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspos untuk debugging
  window.LoFo = { icon: icon, toast: toast };
})();
