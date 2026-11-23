(function () {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const form = document.querySelector('.report-form');
  const maxPhotos = Number(form.dataset.maxPhotos);
  const gallery = byId('foto');
  const camera = byId('kamera');
  const pick = byId('pilih-foto');
  const capture = byId('ambil-foto');
  const list = byId('foto-daftar');
  const submit = form.querySelector('[type="submit"]');
  const photos = [];
  let replace = -1;
  let busy = false;

  function message(id, text = '') {
    const element = byId(id);
    element.hidden = !text;
    element.textContent = text;
  }

  function updateControls() {
    const full = maxPhotos > 1 && photos.length >= maxPhotos;
    pick.disabled = capture.disabled = busy || full;
    submit.disabled = busy;
    list.querySelectorAll('button').forEach((button) => { button.disabled = busy; });
    byId('foto-label').textContent = maxPhotos === 1 && photos.length ? 'Ganti foto' : 'Pilih foto';
    byId('foto-jumlah').textContent = `${photos.length} / ${maxPhotos} foto dipilih`;
  }

  function openPicker(input, index) {
    replace = index;
    gallery.multiple = maxPhotos > 1 && index < 0;
    input.click();
  }

  function photoButton(text, index, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--ghost';
    button.textContent = text;
    button.setAttribute('aria-label', `${text} foto ${index + 1}`);
    button.addEventListener('click', action);
    return button;
  }

  function renderPhotos() {
    list.replaceChildren();
    photos.forEach(({ file, url }, index) => {
      const item = document.createElement('li');
      const image = document.createElement('img');
      image.src = url;
      image.alt = `Pratinjau foto ${index + 1}`;
      const name = document.createElement('p');
      name.className = 'photo-name';
      name.textContent = file.name;
      const controls = document.createElement('div');
      controls.className = 'photo-controls';
      if (maxPhotos > 1) {
        const retake = photoButton('Ambil ulang', index, () => openPicker(camera, index));
        retake.classList.add('photo-camera');
        controls.append(photoButton('Ganti', index, () => openPicker(gallery, index)), retake);
      }
      controls.append(photoButton('Hapus', index, () => {
        URL.revokeObjectURL(photos.splice(index, 1)[0].url);
        message('foto-error');
        renderPhotos();
        pick.focus();
      }));
      item.append(image, name, controls);
      list.append(item);
    });
    list.hidden = photos.length === 0;
    updateControls();
  }

  async function selectFiles(event) {
    const input = event.currentTarget;
    const files = Array.from(input.files);
    input.value = '';
    if (!files.length || busy) return;
    const index = replace;
    const available = index >= 0 ? 1 : maxPhotos - photos.length;
    if (files.length > available) {
      message('foto-error', `Kamu hanya bisa menambahkan ${available} foto lagi.`);
      return;
    }

    busy = true;
    updateControls();
    message('foto-error');
    const selected = [];
    try {
      for (const file of files) {
        if (!file.size) throw new Error('File foto kosong. Pilih foto lain.');
        if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran satu atau beberapa foto melebihi 5 MB. Pilih foto yang lebih kecil.');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
            (file.type || !/\.(jpe?g|png|webp)$/i.test(file.name))) {
          throw new Error('Pilih foto JPG, PNG, atau WebP. Jika kamera menghasilkan HEIC, ubah ke JPG dulu.');
        }
        const url = URL.createObjectURL(file);
        selected.push({ file, url });
        const preview = new Image();
        preview.src = url;
        await preview.decode().catch(() => { throw new Error('Foto tidak bisa dibuka. Pilih foto lain.'); });
        if (preview.naturalWidth * preview.naturalHeight > 32_000_000) {
          const number = index >= 0 ? index + 1 : photos.length + selected.length;
          throw new Error(`Foto ${number} melebihi 32 megapiksel. Kecilkan resolusi atau pilih foto lain.`);
        }
      }
      if (index >= 0) URL.revokeObjectURL(photos.splice(index, 1, ...selected)[0].url);
      else photos.push(...selected);
    } catch (error) {
      selected.forEach(({ url }) => URL.revokeObjectURL(url));
      message('foto-error', error.message);
    } finally {
      busy = false;
      renderPhotos();
      const fallback = list.querySelector('button');
      if (index >= 0 && maxPhotos > 1) list.children[index]?.querySelector(input === camera ? '.photo-camera' : 'button')?.focus();
      else if (pick.disabled) fallback?.focus();
      else (input === camera ? capture : pick).focus();
    }
  }

  if (!/^https?:$/.test(location.protocol)) {
    message('lapor-error', 'Buka formulir dari server LoFo, bukan langsung dari file HTML.');
    return;
  }

  pick.addEventListener('click', () => openPicker(gallery, maxPhotos === 1 && photos.length ? 0 : -1));
  capture.addEventListener('click', () => openPicker(camera, maxPhotos === 1 && photos.length ? 0 : -1));
  gallery.addEventListener('change', selectFiles);
  camera.addEventListener('change', selectFiles);
  form.querySelectorAll('[required]').forEach((control) => {
    control.addEventListener('input', () => control.setCustomValidity(''));
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || form.hidden) return;
    for (const control of form.querySelectorAll('[required]')) {
      if (!control.value.trim()) {
        control.setCustomValidity('Kolom ini wajib diisi.');
        control.reportValidity();
        return;
      }
    }
    busy = true;
    const body = new FormData(form);
    photos.forEach(({ file }) => body.append('photos', file));
    const controls = [...form.querySelectorAll('.input, .textarea, .select')];
    controls.forEach((control) => { control.disabled = true; });
    updateControls();
    message('lapor-error');
    const label = byId('kirim-label');
    label.textContent = 'Menyimpan…';
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(form.action, { method: 'POST', body });
      const result = await response.json().catch(() => ({}));
      if (response.status !== 201 || !Number.isInteger(result.report?.id) || result.report?.status !== 'pending') {
        throw new Error(typeof result.error === 'string' ? result.error : 'Penyimpanan laporan belum dapat dikonfirmasi.');
      }
      photos.forEach(({ url }) => URL.revokeObjectURL(url));
      photos.length = 0;
      renderPhotos();
      form.reset();
      form.hidden = true;
      byId('lapor-sukses-detail').textContent = `Nomor laporan: #${result.report.id}. Simpan nomor ini sebagai referensi.`;
      byId('lapor-sukses').hidden = false;
      byId('lapor-sukses-judul').focus();
    } catch (error) {
      const text = error instanceof TypeError ? 'Koneksi terputus. Penyimpanan laporan belum dapat dikonfirmasi.' : error.message;
      message('lapor-error', text);
      byId('lapor-error').scrollIntoView({ block: 'nearest' });
    } finally {
      busy = false;
      controls.forEach((control) => { control.disabled = false; });
      form.removeAttribute('aria-busy');
      label.textContent = 'Kirim Laporan';
      updateControls();
    }
  });

  updateControls();
}());
