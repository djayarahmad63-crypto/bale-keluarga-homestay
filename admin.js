/**
 * Bale Keluarga Homestay Sembalun - Admin Panel Engine
 * Real-time data management, live image upload & preview, and dual persistence (Local Disk API & LocalStorage)
 */

let appData = null;
let currentModalAction = null;

// Default factory data in case file or server is absent
const defaultFactoryData = {
  profile: {
    brandName: "Bale Keluarga",
    brandSubtitle: "Homestay Sembalun",
    phone: "+62 812-3456-7890",
    whatsapp: "6281234567890",
    address: "Jl. Pariwisata Sembalun Lawang, Lombok Timur, NTB 83656",
    aboutLead: "\"Bale\" dalam bahasa Sasak bermakna Rumah. Kami menghadirkan tempat pulang yang nyaman bagi setiap musafir dan keluarga yang berkunjung ke Sembalun.",
    aboutDesc: "Terletak di ketinggian 1.150 meter di atas permukaan laut di lereng megah Gunung Rinjani, Bale Keluarga memadukan kehangatan arsitektur kayu khas Lombok dengan kenyamanan modern. Udara Sembalun yang sejuk hingga 14°C dapat dinikmati dengan tenang berkat kamar mandi berair panas melimpah, selimut duvet hangat, dan seduhan kopi Sembalun segar.",
    aboutImage: "images/hero.jpg",
    badgeNumber: "100% Asli",
    badgeText: "Dikelola Ramah oleh Warga Lokal Sembalun",
    checkinTime: "14:00 WITA",
    checkoutTime: "12:00 WITA"
  },
  hero: {
    badge: "★★★★★ 4.9/5 Rating Terverifikasi (140+ Ulasan)",
    title: "Kehangatan Rumah Keluarga di",
    highlightWord: "Kaki Gunung Rinjani",
    description: "Nikmati sejuknya alam Sembalun dengan kenyamanan kamar hangat berair panas, balkon berpanorama gunung megah, kebun stroberi petik sendiri, dan keramahan asli suku Sasak.",
    bgImage: "images/hero.jpg",
    highlight1: "Water Heater 24 Jam",
    highlight2: "View 360° Rinjani & Pergasingan",
    highlight3: "Sarapan & Kopi Sembalun"
  },
  rooms: [],
  facilities: [],
  experiences: [],
  gallery: [],
  reviews: [],
  faqs: []
};

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigationTabs();
  await loadInitialData();
  bindMasterSaveButton();
});

// 1. Load Initial Data (API or LocalStorage or Default)
async function loadInitialData() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      appData = await res.json();
      localStorage.setItem('bale_homestay_data', JSON.stringify(appData));
    } else {
      throw new Error('API fetch failed');
    }
  } catch (err) {
    const local = localStorage.getItem('bale_homestay_data');
    if (local) {
      appData = JSON.parse(local);
    } else {
      appData = JSON.parse(JSON.stringify(defaultFactoryData));
    }
  }

  populateAllSections();
  updateDashboardStats();
}

// 2. Setup Sidebar Tabs
function setupNavigationTabs() {
  const tabButtons = document.querySelectorAll('.nav-item-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchAdminTab(targetTab);
    });
  });

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('adminSidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.nav-item-btn').forEach(b => {
    if (b.dataset.tab === tabName) b.classList.add('active');
    else b.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    if (p.id === `pane-${tabName}`) p.classList.add('active');
    else p.classList.remove('active');
  });

  const topbarTitle = document.getElementById('topbarCurrentTabTitle');
  const titles = {
    overview: 'Dashboard Ringkasan',
    hero: 'Hero & Banner Utama',
    profile: 'Profil & Kontak Homestay',
    rooms: 'Kelola Pilihan Kamar',
    facilities: 'Fasilitas Homestay',
    experiences: 'Paket Wisata & Trip',
    gallery: 'Galeri Foto Asli',
    reviews: 'Ulasan & Testimoni Tamu',
    faqs: 'FAQ (Tanya Jawab)',
    backup: 'Backup & Pemulihan Data'
  };
  if (topbarTitle && titles[tabName]) {
    topbarTitle.textContent = titles[tabName];
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');
}

// 3. Populate All Form Fields & Lists
function populateAllSections() {
  if (!appData) return;

  // Hero Fields
  if (appData.hero) {
    document.getElementById('heroBadgeInput').value = appData.hero.badge || '';
    document.getElementById('heroTitleInput').value = appData.hero.title || '';
    document.getElementById('heroHighlightWordInput').value = appData.hero.highlightWord || '';
    document.getElementById('heroDescInput').value = appData.hero.description || '';
    document.getElementById('heroHl1Input').value = appData.hero.highlight1 || '';
    document.getElementById('heroHl2Input').value = appData.hero.highlight2 || '';
    document.getElementById('heroHl3Input').value = appData.hero.highlight3 || '';

    const heroBg = appData.hero.bgImage || 'images/hero.jpg';
    document.getElementById('heroBgPreview').src = heroBg;
    document.getElementById('heroBgCustomInput').value = heroBg;
    setSelectIfPreset('heroPresetSelect', heroBg);
  }

  // Profile Fields
  if (appData.profile) {
    document.getElementById('profBrandNameInput').value = appData.profile.brandName || '';
    document.getElementById('profBrandSubInput').value = appData.profile.brandSubtitle || '';
    document.getElementById('profWhatsappInput').value = appData.profile.whatsapp || '';
    document.getElementById('profPhoneInput').value = appData.profile.phone || '';
    document.getElementById('profAddressInput').value = appData.profile.address || '';
    document.getElementById('profCheckinInput').value = appData.profile.checkinTime || '';
    document.getElementById('profCheckoutInput').value = appData.profile.checkoutTime || '';
    document.getElementById('profAboutLeadInput').value = appData.profile.aboutLead || '';
    document.getElementById('profAboutDescInput').value = appData.profile.aboutDesc || '';
    document.getElementById('profBadgeNumInput').value = appData.profile.badgeNumber || '';
    document.getElementById('profBadgeTextInput').value = appData.profile.badgeText || '';

    const aboutImg = appData.profile.aboutImage || 'images/hero.jpg';
    document.getElementById('aboutImgPreview').src = aboutImg;
    document.getElementById('aboutImgCustomInput').value = aboutImg;
    setSelectIfPreset('aboutPresetSelect', aboutImg);
  }

  // Render Collection Lists
  renderRoomsList();
  renderFacilitiesList();
  renderExperiencesList();
  renderGalleryList();
  renderReviewsList();
  renderFaqsList();
}

function setSelectIfPreset(selectId, val) {
  const el = document.getElementById(selectId);
  if (!el) return;
  for (let opt of el.options) {
    if (opt.value === val) {
      el.value = val;
      return;
    }
  }
}

// 4. Update Overview Dashboard Statistics
function updateDashboardStats() {
  if (!appData) return;
  const rc = document.getElementById('statRoomsCount');
  const fc = document.getElementById('statFacilitiesCount');
  const ec = document.getElementById('statExpCount');
  const gc = document.getElementById('statGalleryCount');

  if (rc && appData.rooms) rc.textContent = appData.rooms.length;
  if (fc && appData.facilities) fc.textContent = appData.facilities.length;
  if (ec && appData.experiences) ec.textContent = appData.experiences.length;
  if (gc && appData.gallery) gc.textContent = appData.gallery.length;
}

// 5. Render Dynamic Collection Lists
function renderRoomsList() {
  const container = document.getElementById('adminRoomsList');
  if (!container || !appData.rooms) return;

  container.innerHTML = '';
  appData.rooms.forEach((room, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.innerHTML = `
      <img src="${room.image || 'images/hero.jpg'}" class="manage-item-thumb" alt="${room.title}">
      <div class="manage-item-info">
        <h4>${room.title}</h4>
        <div class="manage-item-meta">
          <span class="item-price-badge">Rp ${Number(room.price).toLocaleString('id-ID')} / malam</span>
          <span>👤 ${room.capacity}</span>
          <span>🛏️ ${room.bed}</span>
          <span>🏷️ ${room.badge || 'Standard'}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--admin-text-muted);">${room.description.substring(0, 110)}...</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Kamar" onclick="editRoom(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Kamar" onclick="deleteRoom(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFacilitiesList() {
  const container = document.getElementById('adminFacilitiesList');
  if (!container || !appData.facilities) return;

  container.innerHTML = '';
  appData.facilities.forEach((fac, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '1fr auto';
    card.innerHTML = `
      <div class="manage-item-info">
        <h4>${fac.title}</h4>
        <p style="font-size:0.9rem; color:var(--admin-text-muted);">${fac.desc}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Fasilitas" onclick="editFacility(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Fasilitas" onclick="deleteFacility(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderExperiencesList() {
  const container = document.getElementById('adminExperiencesList');
  if (!container || !appData.experiences) return;

  container.innerHTML = '';
  appData.experiences.forEach((exp, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.innerHTML = `
      <img src="${exp.image || 'images/pergasingan.jpg'}" class="manage-item-thumb" alt="${exp.title}">
      <div class="manage-item-info">
        <h4>${exp.title}</h4>
        <div class="manage-item-meta">
          <span class="item-price-badge">Rp ${Number(exp.price).toLocaleString('id-ID')}</span>
          <span style="background:var(--admin-gold); color:#122116; font-weight:700; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${exp.tag || 'Wisata'}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--admin-text-muted);">${exp.desc}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Paket" onclick="editExperience(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Paket" onclick="deleteExperience(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderGalleryList() {
  const container = document.getElementById('adminGalleryList');
  if (!container || !appData.gallery) return;

  container.innerHTML = '';
  appData.gallery.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.innerHTML = `
      <img src="${item.image || 'images/hero.jpg'}" class="manage-item-thumb" alt="${item.title}">
      <div class="manage-item-info">
        <h4>${item.title}</h4>
        <div class="manage-item-meta">
          <span style="text-transform:uppercase; font-size:0.75rem; font-weight:700; background:#e2e8e2; padding:3px 8px; border-radius:4px;">${item.category}</span>
          <span>Lebar: ${item.span2 ? '2 Kolom (Besar)' : '1 Kolom'}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--admin-text-muted);">${item.subtitle || ''}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Foto" onclick="editGalleryItem(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Foto" onclick="deleteGalleryItem(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderReviewsList() {
  const container = document.getElementById('adminReviewsList');
  if (!container || !appData.reviews) return;

  container.innerHTML = '';
  appData.reviews.forEach((rev, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '60px 1fr auto';
    card.innerHTML = `
      <div style="width:50px; height:50px; border-radius:50%; background:#eaf2eb; color:var(--admin-primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem;">
        ${rev.avatar || rev.name.charAt(0)}
      </div>
      <div class="manage-item-info">
        <h4>${rev.name}</h4>
        <div class="manage-item-meta">
          <span>📍 ${rev.origin}</span>
          <span style="color:var(--admin-gold);">★★★★★ ${rev.rating || 5}/5</span>
        </div>
        <p style="font-size:0.88rem; font-style:italic; color:var(--admin-text-muted);">"${rev.text}"</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Ulasan" onclick="editReview(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Ulasan" onclick="deleteReview(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFaqsList() {
  const container = document.getElementById('adminFaqsList');
  if (!container || !appData.faqs) return;

  container.innerHTML = '';
  appData.faqs.forEach((faq, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '1fr auto';
    card.innerHTML = `
      <div class="manage-item-info">
        <h4 style="color:var(--admin-primary);">❓ ${faq.question}</h4>
        <p style="font-size:0.9rem; color:var(--admin-text-muted); margin-top:6px;">${faq.answer}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit FAQ" onclick="editFaq(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus FAQ" onclick="deleteFaq(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// 6. Master Save Handler
function bindMasterSaveButton() {
  const saveBtn = document.getElementById('btnMasterSave');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `⏳ Menyimpan...`;

    // Collect values from Hero
    appData.hero.badge = document.getElementById('heroBadgeInput').value;
    appData.hero.title = document.getElementById('heroTitleInput').value;
    appData.hero.highlightWord = document.getElementById('heroHighlightWordInput').value;
    appData.hero.description = document.getElementById('heroDescInput').value;
    appData.hero.bgImage = document.getElementById('heroBgCustomInput').value || 'images/hero.jpg';
    appData.hero.highlight1 = document.getElementById('heroHl1Input').value;
    appData.hero.highlight2 = document.getElementById('heroHl2Input').value;
    appData.hero.highlight3 = document.getElementById('heroHl3Input').value;

    // Collect values from Profile
    appData.profile.brandName = document.getElementById('profBrandNameInput').value;
    appData.profile.brandSubtitle = document.getElementById('profBrandSubInput').value;
    appData.profile.whatsapp = document.getElementById('profWhatsappInput').value.replace(/[^0-9]/g, '');
    appData.profile.phone = document.getElementById('profPhoneInput').value;
    appData.profile.address = document.getElementById('profAddressInput').value;
    appData.profile.checkinTime = document.getElementById('profCheckinInput').value;
    appData.profile.checkoutTime = document.getElementById('profCheckoutInput').value;
    appData.profile.aboutLead = document.getElementById('profAboutLeadInput').value;
    appData.profile.aboutDesc = document.getElementById('profAboutDescInput').value;
    appData.profile.badgeNumber = document.getElementById('profBadgeNumInput').value;
    appData.profile.badgeText = document.getElementById('profBadgeTextInput').value;
    appData.profile.aboutImage = document.getElementById('aboutImgCustomInput').value || 'images/hero.jpg';

    // 1. Save to LocalStorage
    localStorage.setItem('bale_homestay_data', JSON.stringify(appData));

    // 2. Save to Server Disk via POST /api/data
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData, null, 2)
      });
      if (res.ok) {
        showToast('✅ Seluruh data & foto berhasil disimpan ke Landing Page!');
      } else {
        showToast('✅ Data disimpan ke browser lokal!');
      }
    } catch (e) {
      showToast('✅ Data disimpan ke memori browser lokal!');
    }

    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
      Simpan Semua Perubahan
    `;

    updateDashboardStats();
  });
}

// 7. Image Preset & Custom Upload Handlers
function onPresetImageChange(selectEl, previewId, inputId) {
  const preview = document.getElementById(previewId);
  const input = document.getElementById(inputId);
  if (preview) preview.src = selectEl.value;
  if (input) input.value = selectEl.value;
}

function onCustomUrlInput(inputEl, previewId) {
  const preview = document.getElementById(previewId);
  if (preview && inputEl.value) {
    preview.src = inputEl.value;
  }
}

function handleFileUpload(event, previewId, inputId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result;
    const preview = document.getElementById(previewId);
    const input = document.getElementById(inputId);
    if (preview) preview.src = base64Data;
    if (input) input.value = base64Data;
    showToast('📷 Gambar berhasil diunggah!');
  };
  reader.readAsDataURL(file);
}

// 8. Generic Modal Helpers
function openGenericModal(title, bodyHtml, onSaveCallback) {
  const modal = document.getElementById('adminGenericModal');
  const titleEl = document.getElementById('genericModalTitle');
  const bodyEl = document.getElementById('genericModalBody');
  const saveBtn = document.getElementById('btnGenericModalSave');

  if (!modal) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;

  currentModalAction = onSaveCallback;
  saveBtn.onclick = () => {
    if (currentModalAction) currentModalAction();
  };

  modal.classList.add('active');
}

function closeGenericModal() {
  const modal = document.getElementById('adminGenericModal');
  if (modal) modal.classList.remove('active');
  currentModalAction = null;
}

// 9. Rooms CRUD
function openRoomModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">ID Kamar (unik, misal: royal-suite)</label>
        <input type="text" id="mRoomId" class="admin-input" placeholder="contoh: premier-view">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Nama Tipe Kamar</label>
        <input type="text" id="mRoomTitle" class="admin-input" placeholder="Nama kamar...">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Harga per Malam (IDR)</label>
        <input type="number" id="mRoomPrice" class="admin-input" placeholder="500000">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Badge / Tag (e.g. Best View, Terlaris)</label>
        <input type="text" id="mRoomBadge" class="admin-input" placeholder="Best Mountain View">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Kapasitas Tamu</label>
        <input type="text" id="mRoomCap" class="admin-input" placeholder="2 Tamu Dewasa">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Tipe Tempat Tidur</label>
        <input type="text" id="mRoomBed" class="admin-input" placeholder="1 King Bed">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Kamar</label>
        <textarea id="mRoomDesc" class="admin-textarea"></textarea>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Fasilitas Termasuk (Pisahkan dengan tanda koma)</label>
        <input type="text" id="mRoomAmenities" class="admin-input" placeholder="Water Heater, Balkon, Sarapan, Wi-Fi Cepat">
      </div>
    </div>
    <div class="image-selector-box">
      <img src="images/room-deluxe.jpg" id="mRoomImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Pilih / Unggah Foto Kamar:</div>
        <select class="image-preset-select" onchange="onPresetImageChange(this, 'mRoomImgPreview', 'mRoomImgInput')">
          <option value="images/room-deluxe.jpg">images/room-deluxe.jpg</option>
          <option value="images/room-family.jpg">images/room-family.jpg</option>
          <option value="images/hero.jpg">images/hero.jpg</option>
        </select>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mRoomImgPreview', 'mRoomImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mRoomImgInput" class="admin-input" style="flex:1;" value="images/room-deluxe.jpg" oninput="onCustomUrlInput(this, 'mRoomImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal('Tambah Kamar Baru', bodyHtml, () => {
    const title = document.getElementById('mRoomTitle').value.trim();
    if (!title) return alert('Nama kamar harus diisi!');

    const newRoom = {
      id: document.getElementById('mRoomId').value.trim() || `room-${Date.now()}`,
      title: title,
      price: parseInt(document.getElementById('mRoomPrice').value) || 350000,
      badge: document.getElementById('mRoomBadge').value || 'Pilihan Favorit',
      capacity: document.getElementById('mRoomCap').value || '2 Tamu',
      bed: document.getElementById('mRoomBed').value || '1 King Bed',
      description: document.getElementById('mRoomDesc').value || '',
      image: document.getElementById('mRoomImgInput').value || 'images/room-deluxe.jpg',
      amenities: document.getElementById('mRoomAmenities').value.split(',').map(s => s.trim()).filter(Boolean)
    };

    appData.rooms.push(newRoom);
    renderRoomsList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Kamar baru ditambahkan! Jangan lupa klik "Simpan Semua Perubahan".');
  });
}

function editRoom(index) {
  const r = appData.rooms[index];
  if (!r) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Nama Tipe Kamar</label>
        <input type="text" id="mRoomTitle" class="admin-input" value="${r.title}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Harga per Malam (IDR)</label>
        <input type="number" id="mRoomPrice" class="admin-input" value="${r.price}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Badge / Tag</label>
        <input type="text" id="mRoomBadge" class="admin-input" value="${r.badge || ''}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Kapasitas Tamu</label>
        <input type="text" id="mRoomCap" class="admin-input" value="${r.capacity || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Tipe Tempat Tidur</label>
        <input type="text" id="mRoomBed" class="admin-input" value="${r.bed || ''}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Fasilitas (Pisahkan Koma)</label>
        <input type="text" id="mRoomAmenities" class="admin-input" value="${(r.amenities || []).join(', ')}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Kamar</label>
        <textarea id="mRoomDesc" class="admin-textarea">${r.description || ''}</textarea>
      </div>
    </div>
    <div class="image-selector-box">
      <img src="${r.image || 'images/room-deluxe.jpg'}" id="mRoomImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Pilih / Unggah Foto Kamar:</div>
        <select class="image-preset-select" onchange="onPresetImageChange(this, 'mRoomImgPreview', 'mRoomImgInput')">
          <option value="images/room-deluxe.jpg">images/room-deluxe.jpg</option>
          <option value="images/room-family.jpg">images/room-family.jpg</option>
          <option value="images/hero.jpg">images/hero.jpg</option>
        </select>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mRoomImgPreview', 'mRoomImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mRoomImgInput" class="admin-input" style="flex:1;" value="${r.image || ''}" oninput="onCustomUrlInput(this, 'mRoomImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal(`Edit Kamar: ${r.title}`, bodyHtml, () => {
    r.title = document.getElementById('mRoomTitle').value;
    r.price = parseInt(document.getElementById('mRoomPrice').value) || r.price;
    r.badge = document.getElementById('mRoomBadge').value;
    r.capacity = document.getElementById('mRoomCap').value;
    r.bed = document.getElementById('mRoomBed').value;
    r.description = document.getElementById('mRoomDesc').value;
    r.image = document.getElementById('mRoomImgInput').value || r.image;
    r.amenities = document.getElementById('mRoomAmenities').value.split(',').map(s => s.trim()).filter(Boolean);

    renderRoomsList();
    closeGenericModal();
    showToast('Kamar berhasil diperbarui!');
  });
}

function deleteRoom(index) {
  if (confirm(`Yakin ingin menghapus kamar "${appData.rooms[index].title}"?`)) {
    appData.rooms.splice(index, 1);
    renderRoomsList();
    updateDashboardStats();
    showToast('Kamar telah dihapus.');
  }
}

// 10. Facilities CRUD
function openFacilityModalForAdd() {
  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Nama Fasilitas</label>
        <input type="text" id="mFacTitle" class="admin-input" placeholder="contoh: Sarapan Pagi Khas Lombok">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Fasilitas</label>
        <textarea id="mFacDesc" class="admin-textarea" placeholder="Jelaskan fasilitas ini..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah Fasilitas Baru', bodyHtml, () => {
    const title = document.getElementById('mFacTitle').value.trim();
    if (!title) return alert('Nama fasilitas harus diisi!');

    appData.facilities.push({
      id: `f-${Date.now()}`,
      title: title,
      desc: document.getElementById('mFacDesc').value || ''
    });

    renderFacilitiesList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Fasilitas baru ditambahkan!');
  });
}

function editFacility(index) {
  const f = appData.facilities[index];
  if (!f) return;

  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Nama Fasilitas</label>
        <input type="text" id="mFacTitle" class="admin-input" value="${f.title}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Fasilitas</label>
        <textarea id="mFacDesc" class="admin-textarea">${f.desc}</textarea>
      </div>
    </div>
  `;

  openGenericModal(`Edit Fasilitas: ${f.title}`, bodyHtml, () => {
    f.title = document.getElementById('mFacTitle').value;
    f.desc = document.getElementById('mFacDesc').value;
    renderFacilitiesList();
    closeGenericModal();
    showToast('Fasilitas diperbarui!');
  });
}

function deleteFacility(index) {
  if (confirm(`Hapus fasilitas "${appData.facilities[index].title}"?`)) {
    appData.facilities.splice(index, 1);
    renderFacilitiesList();
    updateDashboardStats();
    showToast('Fasilitas telah dihapus.');
  }
}

// 11. Experiences CRUD
function openExpModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Paket Wisata</label>
        <input type="text" id="mExpTitle" class="admin-input" placeholder="contoh: Trip Sunset Bukit Selong">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Harga Paket (IDR)</label>
        <input type="number" id="mExpPrice" class="admin-input" placeholder="100000">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Tag / Label (e.g. Terpopuler, Eksklusif)</label>
        <input type="text" id="mExpTag" class="admin-input" placeholder="Terpopuler">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Poin Fasilitas (Pisahkan Koma)</label>
        <input type="text" id="mExpPerks" class="admin-input" placeholder="Guide Lokal, Kopi Hangat, Tiket">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Paket</label>
        <textarea id="mExpDesc" class="admin-textarea"></textarea>
      </div>
    </div>
    <div class="image-selector-box">
      <img src="images/pergasingan.jpg" id="mExpImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Pilih / Unggah Foto Paket:</div>
        <select class="image-preset-select" onchange="onPresetImageChange(this, 'mExpImgPreview', 'mExpImgInput')">
          <option value="images/pergasingan.jpg">images/pergasingan.jpg</option>
          <option value="images/strawberry.jpg">images/strawberry.jpg</option>
          <option value="images/bonfire.jpg">images/bonfire.jpg</option>
        </select>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mExpImgPreview', 'mExpImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mExpImgInput" class="admin-input" style="flex:1;" value="images/pergasingan.jpg" oninput="onCustomUrlInput(this, 'mExpImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal('Tambah Paket Wisata', bodyHtml, () => {
    const title = document.getElementById('mExpTitle').value.trim();
    if (!title) return alert('Judul paket wisata harus diisi!');

    appData.experiences.push({
      id: `exp-${Date.now()}`,
      title: title,
      price: parseInt(document.getElementById('mExpPrice').value) || 100000,
      tag: document.getElementById('mExpTag').value || 'Wisata',
      desc: document.getElementById('mExpDesc').value || '',
      image: document.getElementById('mExpImgInput').value || 'images/pergasingan.jpg',
      perks: document.getElementById('mExpPerks').value.split(',').map(s => s.trim()).filter(Boolean)
    });

    renderExperiencesList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Paket wisata baru ditambahkan!');
  });
}

function editExperience(index) {
  const exp = appData.experiences[index];
  if (!exp) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Paket</label>
        <input type="text" id="mExpTitle" class="admin-input" value="${exp.title}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Harga Paket (IDR)</label>
        <input type="number" id="mExpPrice" class="admin-input" value="${exp.price}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Tag / Label</label>
        <input type="text" id="mExpTag" class="admin-input" value="${exp.tag || ''}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Poin Fasilitas (Pisahkan Koma)</label>
        <input type="text" id="mExpPerks" class="admin-input" value="${(exp.perks || []).join(', ')}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Paket</label>
        <textarea id="mExpDesc" class="admin-textarea">${exp.desc || ''}</textarea>
      </div>
    </div>
    <div class="image-selector-box">
      <img src="${exp.image || 'images/pergasingan.jpg'}" id="mExpImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto Paket:</div>
        <select class="image-preset-select" onchange="onPresetImageChange(this, 'mExpImgPreview', 'mExpImgInput')">
          <option value="images/pergasingan.jpg">images/pergasingan.jpg</option>
          <option value="images/strawberry.jpg">images/strawberry.jpg</option>
          <option value="images/bonfire.jpg">images/bonfire.jpg</option>
        </select>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mExpImgPreview', 'mExpImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mExpImgInput" class="admin-input" style="flex:1;" value="${exp.image || ''}" oninput="onCustomUrlInput(this, 'mExpImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal(`Edit Paket: ${exp.title}`, bodyHtml, () => {
    exp.title = document.getElementById('mExpTitle').value;
    exp.price = parseInt(document.getElementById('mExpPrice').value) || exp.price;
    exp.tag = document.getElementById('mExpTag').value;
    exp.desc = document.getElementById('mExpDesc').value;
    exp.image = document.getElementById('mExpImgInput').value || exp.image;
    exp.perks = document.getElementById('mExpPerks').value.split(',').map(s => s.trim()).filter(Boolean);

    renderExperiencesList();
    closeGenericModal();
    showToast('Paket wisata diperbarui!');
  });
}

function deleteExperience(index) {
  if (confirm(`Hapus paket wisata "${appData.experiences[index].title}"?`)) {
    appData.experiences.splice(index, 1);
    renderExperiencesList();
    updateDashboardStats();
    showToast('Paket wisata telah dihapus.');
  }
}

// 12. Gallery CRUD
function openGalleryModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Foto</label>
        <input type="text" id="mGalTitle" class="admin-input" placeholder="Judul foto...">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Kategori</label>
        <select id="mGalCat" class="admin-select">
          <option value="pemandangan">Pemandangan</option>
          <option value="kamar">Kamar</option>
          <option value="aktivitas">Aktivitas</option>
        </select>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan Singkat / Subtitle</label>
        <input type="text" id="mGalSub" class="admin-input" placeholder="Keterangan foto...">
      </div>
    </div>
    <div class="form-row full">
      <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem;">
        <input type="checkbox" id="mGalSpan2"> Tampilkan dengan Ukuran Lebar (Span 2 Kolom)
      </label>
    </div>
    <div class="image-selector-box">
      <img src="images/hero.jpg" id="mGalImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Pilih / Unggah Foto:</div>
        <select class="image-preset-select" onchange="onPresetImageChange(this, 'mGalImgPreview', 'mGalImgInput')">
          <option value="images/hero.jpg">images/hero.jpg</option>
          <option value="images/room-deluxe.jpg">images/room-deluxe.jpg</option>
          <option value="images/room-family.jpg">images/room-family.jpg</option>
          <option value="images/pergasingan.jpg">images/pergasingan.jpg</option>
          <option value="images/bonfire.jpg">images/bonfire.jpg</option>
          <option value="images/strawberry.jpg">images/strawberry.jpg</option>
        </select>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mGalImgPreview', 'mGalImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mGalImgInput" class="admin-input" style="flex:1;" value="images/hero.jpg" oninput="onCustomUrlInput(this, 'mGalImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal('Tambah Foto Galeri', bodyHtml, () => {
    const title = document.getElementById('mGalTitle').value.trim();
    if (!title) return alert('Judul foto harus diisi!');

    appData.gallery.push({
      id: `g-${Date.now()}`,
      title: title,
      subtitle: document.getElementById('mGalSub').value || '',
      category: document.getElementById('mGalCat').value,
      span2: document.getElementById('mGalSpan2').checked,
      image: document.getElementById('mGalImgInput').value || 'images/hero.jpg'
    });

    renderGalleryList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Foto galeri berhasil ditambahkan!');
  });
}

function editGalleryItem(index) {
  const g = appData.gallery[index];
  if (!g) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Foto</label>
        <input type="text" id="mGalTitle" class="admin-input" value="${g.title}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Kategori</label>
        <select id="mGalCat" class="admin-select">
          <option value="pemandangan" ${g.category === 'pemandangan' ? 'selected' : ''}>Pemandangan</option>
          <option value="kamar" ${g.category === 'kamar' ? 'selected' : ''}>Kamar</option>
          <option value="aktivitas" ${g.category === 'aktivitas' ? 'selected' : ''}>Aktivitas</option>
        </select>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan Singkat</label>
        <input type="text" id="mGalSub" class="admin-input" value="${g.subtitle || ''}">
      </div>
    </div>
    <div class="form-row full">
      <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem;">
        <input type="checkbox" id="mGalSpan2" ${g.span2 ? 'checked' : ''}> Tampilkan dengan Ukuran Lebar (Span 2 Kolom)
      </label>
    </div>
    <div class="image-selector-box">
      <img src="${g.image || 'images/hero.jpg'}" id="mGalImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto:</div>
        <input type="text" id="mGalImgInput" class="admin-input" value="${g.image || ''}" oninput="onCustomUrlInput(this, 'mGalImgPreview')">
      </div>
    </div>
  `;

  openGenericModal(`Edit Foto Galeri: ${g.title}`, bodyHtml, () => {
    g.title = document.getElementById('mGalTitle').value;
    g.category = document.getElementById('mGalCat').value;
    g.subtitle = document.getElementById('mGalSub').value;
    g.span2 = document.getElementById('mGalSpan2').checked;
    g.image = document.getElementById('mGalImgInput').value || g.image;

    renderGalleryList();
    closeGenericModal();
    showToast('Foto galeri diperbarui!');
  });
}

function deleteGalleryItem(index) {
  if (confirm(`Hapus foto "${appData.gallery[index].title}" dari galeri?`)) {
    appData.gallery.splice(index, 1);
    renderGalleryList();
    updateDashboardStats();
    showToast('Foto galeri dihapus.');
  }
}

// 13. Reviews CRUD
function openReviewModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Nama Tamu / Rombongan</label>
        <input type="text" id="mRevName" class="admin-input" placeholder="contoh: Keluarga Pratama">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Asal Kota / Komunitas</label>
        <input type="text" id="mRevOrigin" class="admin-input" placeholder="contoh: Jakarta">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Teks Ulasan / Testimoni</label>
        <textarea id="mRevText" class="admin-textarea" placeholder="Tuliskan ulasan tamu..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah Ulasan Tamu', bodyHtml, () => {
    const name = document.getElementById('mRevName').value.trim();
    if (!name) return alert('Nama tamu harus diisi!');

    appData.reviews.push({
      id: `r-${Date.now()}`,
      name: name,
      origin: document.getElementById('mRevOrigin').value || 'Wisatawan',
      avatar: name.charAt(0).toUpperCase(),
      rating: 5,
      text: document.getElementById('mRevText').value || 'Pengalaman luar biasa di Bale Keluarga!'
    });

    renderReviewsList();
    closeGenericModal();
    showToast('Ulasan berhasil ditambahkan!');
  });
}

function editReview(index) {
  const r = appData.reviews[index];
  if (!r) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Nama Tamu</label>
        <input type="text" id="mRevName" class="admin-input" value="${r.name}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Asal Kota</label>
        <input type="text" id="mRevOrigin" class="admin-input" value="${r.origin}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Teks Ulasan</label>
        <textarea id="mRevText" class="admin-textarea">${r.text}</textarea>
      </div>
    </div>
  `;

  openGenericModal(`Edit Ulasan: ${r.name}`, bodyHtml, () => {
    r.name = document.getElementById('mRevName').value;
    r.origin = document.getElementById('mRevOrigin').value;
    r.text = document.getElementById('mRevText').value;
    renderReviewsList();
    closeGenericModal();
    showToast('Ulasan diperbarui!');
  });
}

function deleteReview(index) {
  if (confirm(`Hapus ulasan dari "${appData.reviews[index].name}"?`)) {
    appData.reviews.splice(index, 1);
    renderReviewsList();
    showToast('Ulasan telah dihapus.');
  }
}

// 14. FAQs CRUD
function openFaqModalForAdd() {
  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Pertanyaan (FAQ)</label>
        <input type="text" id="mFaqQ" class="admin-input" placeholder="contoh: Apakah ada layanan rental motor?">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Jawaban Lengkap</label>
        <textarea id="mFaqA" class="admin-textarea" placeholder="Tuliskan jawaban informatif..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah FAQ Baru', bodyHtml, () => {
    const q = document.getElementById('mFaqQ').value.trim();
    if (!q) return alert('Pertanyaan harus diisi!');

    appData.faqs.push({
      id: `faq-${Date.now()}`,
      question: q,
      answer: document.getElementById('mFaqA').value || ''
    });

    renderFaqsList();
    closeGenericModal();
    showToast('FAQ baru ditambahkan!');
  });
}

function editFaq(index) {
  const f = appData.faqs[index];
  if (!f) return;

  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Pertanyaan</label>
        <input type="text" id="mFaqQ" class="admin-input" value="${f.question}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Jawaban</label>
        <textarea id="mFaqA" class="admin-textarea">${f.answer}</textarea>
      </div>
    </div>
  `;

  openGenericModal('Edit FAQ', bodyHtml, () => {
    f.question = document.getElementById('mFaqQ').value;
    f.answer = document.getElementById('mFaqA').value;
    renderFaqsList();
    closeGenericModal();
    showToast('FAQ berhasil diperbarui!');
  });
}

function deleteFaq(index) {
  if (confirm(`Hapus pertanyaan FAQ ini?`)) {
    appData.faqs.splice(index, 1);
    renderFaqsList();
    showToast('FAQ telah dihapus.');
  }
}

// 15. Backup, Export, Import, & Factory Reset
function exportDataJson() {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", jsonStr);
  dlAnchor.setAttribute("download", `bale_keluarga_backup_${Date.now()}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast('📥 File backup JSON berhasil diunduh!');
}

function importDataJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.profile && imported.rooms) {
        appData = imported;
        populateAllSections();
        updateDashboardStats();
        showToast('📤 Data berhasil dipulihkan dari file JSON! Silakan klik "Simpan Semua Perubahan".');
      } else {
        alert('Format file JSON tidak sesuai struktur data homestay!');
      }
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToFactoryDefault() {
  if (confirm('PERINGATAN: Seluruh teks, harga, dan foto akan dikembalikan ke pengaturan awal Sembalun. Lanjutkan?')) {
    fetch('/api/data?reset=1')
      .catch(() => {})
      .finally(async () => {
        // Fetch raw data.json or fallback
        try {
          const res = await fetch('data.json');
          if (res.ok) {
            appData = await res.json();
          } else {
            appData = JSON.parse(JSON.stringify(defaultFactoryData));
          }
        } catch (e) {
          appData = JSON.parse(JSON.stringify(defaultFactoryData));
        }

        populateAllSections();
        updateDashboardStats();
        showToast('⚠️ Data dikembalikan ke default. Klik "Simpan Semua Perubahan" untuk konfirmasi.');
      });
  }
}

// 16. Toast Utility
function showToast(message) {
  const toast = document.getElementById('adminToast');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
