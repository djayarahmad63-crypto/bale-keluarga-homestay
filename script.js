/**
 * Bale Keluarga Homestay Sembalun - Interactive Engine
 * Handles Dynamic Content Hydration (from data.json / localStorage / API),
 * Real-time WhatsApp Calculator, Modals, Gallery Filters, and Accordion
 */

let homestayData = null;
let roomDatabase = {};
let addonPrices = {
  'pergasingan': 150000,
  'motorbike': 85000,
  'bonfire': 120000,
  'transfer': 450000
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Navigation Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-header');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      siteNav.classList.toggle('mobile-nav-active');
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('mobile-nav-active');
    });
  });

  // 2. Load Dynamic Content from Server API or LocalStorage
  await loadAndHydrateData();

  // 3. Initialize Interactive Components
  initBookingCalculator();
  initGalleryFilters();
  initFaqAccordion();
  initAdminLoginModal();
});

// Load Data and Hydrate DOM Elements
async function loadAndHydrateData() {
  // 1. Check if Google Sheet Database is configured
  const defaultSheetUrl = 'https://script.google.com/macros/s/AKfycbz-fWSD4VWqrb8vZqmMNCW9t8DV4UZTR1nWg_VJl71dn4wKHWVRnF49eK-tB2JJP6HuRg/exec';
  const sheetUrl = localStorage.getItem('bale_google_sheet_url') || defaultSheetUrl;
  if (sheetUrl) {
    try {
      const sRes = await fetch(sheetUrl);
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.profile) {
          homestayData = sData;
          localStorage.setItem('bale_homestay_data', JSON.stringify(sData));
        }
      }
    } catch (e) {
      console.warn('Google Sheet fetch error:', e);
    }
  }

  // 2. Fallback to /api/data or local storage
  if (!homestayData) {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        homestayData = await res.json();
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      const local = localStorage.getItem('bale_homestay_data');
      if (local) {
        homestayData = JSON.parse(local);
      }
    }
  }

  if (!homestayData) return;

  // Hydrate Profile & Identity
  if (homestayData.profile) {
    const p = homestayData.profile;
    document.querySelectorAll('.brand-title').forEach(el => el.textContent = p.brandName || 'Bale Keluarga');
    document.querySelectorAll('.brand-subtitle').forEach(el => el.textContent = p.brandSubtitle || 'Homestay Sembalun');

    const leadEl = document.querySelector('.about-lead');
    if (leadEl && p.aboutLead) leadEl.textContent = p.aboutLead;

    const descEl = document.querySelector('.about-desc');
    if (descEl && p.aboutDesc) descEl.textContent = p.aboutDesc;

    const badgeNum = document.querySelector('.about-badge-number');
    if (badgeNum && p.badgeNumber) badgeNum.textContent = p.badgeNumber;

    const badgeTxt = document.querySelector('.about-badge-text');
    if (badgeTxt && p.badgeText) badgeTxt.textContent = p.badgeText;

    const aboutImg = document.querySelector('.about-main-img');
    if (aboutImg && p.aboutImage) aboutImg.src = p.aboutImage;

    // Contact in Footer
    const footerPhone = document.querySelector('.footer-contact-item:nth-child(2) span');
    if (footerPhone && p.phone) footerPhone.textContent = `WhatsApp: ${p.phone}`;

    const footerAddress = document.querySelector('.footer-contact-item:nth-child(1) span');
    if (footerAddress && p.address) footerAddress.textContent = p.address;
  }

  // Hydrate Hero Section
  if (homestayData.hero) {
    const h = homestayData.hero;
    const heroSec = document.querySelector('.hero-section');
    if (heroSec && h.bgImage) {
      heroSec.style.background = `linear-gradient(180deg, rgba(22, 17, 31, 0.65) 0%, rgba(22, 17, 31, 0.82) 100%), url('${h.bgImage}') center/cover no-repeat`;
    }

    const badgeSpan = document.querySelector('.hero-badge span:last-child');
    if (badgeSpan && h.badge) {
      badgeSpan.textContent = h.badge.replace(/^[^0-9]*/, '').trim() || '4.9/5 Rating Terverifikasi (140+ Ulasan)';
    }

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && h.title) {
      heroTitle.innerHTML = `${h.title} <span>${h.highlightWord || 'Sembalun'}</span>`;
    }

    const heroDesc = document.querySelector('.hero-description');
    if (heroDesc && h.description) heroDesc.textContent = h.description;

    const hl1 = document.querySelector('.hero-highlights .highlight-item:nth-child(1) .highlight-label');
    if (hl1 && h.highlight1) hl1.textContent = h.highlight1;

    const hl2 = document.querySelector('.hero-highlights .highlight-item:nth-child(2) .highlight-label');
    if (hl2 && h.highlight2) hl2.textContent = h.highlight2;

    const hl3 = document.querySelector('.hero-highlights .highlight-item:nth-child(3) .highlight-label');
    if (hl3 && h.highlight3) hl3.textContent = h.highlight3;
  }

  // Hydrate Rooms
  if (homestayData.rooms && homestayData.rooms.length > 0) {
    roomDatabase = {};
    const roomsGrid = document.querySelector('.rooms-grid');
    if (roomsGrid) roomsGrid.innerHTML = '';

    const heroRoomSelect = document.getElementById('hero-room-type');
    const calcRoomSelect = document.getElementById('calc-room');
    if (heroRoomSelect) heroRoomSelect.innerHTML = '';
    if (calcRoomSelect) calcRoomSelect.innerHTML = '';

    homestayData.rooms.forEach((room, idx) => {
      roomDatabase[room.id] = {
        title: room.title,
        pricePerNight: Number(room.price),
        capacity: room.capacity,
        bed: room.bed,
        view: room.badge || 'Pemandangan Pegunungan',
        image: room.image || 'images/hero.jpg',
        description: room.description,
        amenities: room.amenities || []
      };

      // Add to selects
      const optText = `${room.title} (Rp ${Number(room.price).toLocaleString('id-ID')})`;
      if (heroRoomSelect) heroRoomSelect.add(new Option(room.title, room.id));
      if (calcRoomSelect) calcRoomSelect.add(new Option(optText, room.id));

      // Append Room Card
      if (roomsGrid) {
        const card = document.createElement('article');
        card.className = 'room-card';
        card.id = `cardRoom_${room.id}`;
        card.innerHTML = `
          <div class="room-thumb-wrapper">
            <img src="${room.image || 'images/hero.jpg'}" alt="${room.title}" class="room-thumb" loading="lazy">
            <span class="room-badge">${room.badge || 'Pilihan Favorit'}</span>
            <div class="room-price-tag">
              <span>Rp ${Number(room.price).toLocaleString('id-ID')}</span> / malam
            </div>
          </div>
          <div class="room-body">
            <h3 class="room-title">${room.title}</h3>
            <div class="room-meta">
              <div class="room-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                ${room.capacity}
              </div>
              <div class="room-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path></svg>
                ${room.bed}
              </div>
            </div>
            <p class="room-desc">${room.description}</p>
            <div class="room-amenities-tags">
              ${(room.amenities || []).slice(0, 4).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
            </div>
            <div class="room-footer">
              <button class="btn-select-room" data-room="${room.id}">Pilih Kamar Ini</button>
              <button class="btn-detail-room" data-room="${room.id}" aria-label="Lihat detail">Detail</button>
            </div>
          </div>
        `;
        roomsGrid.appendChild(card);
      }
    });

    bindRoomActionButtons();
  }

  // Hydrate Facilities
  if (homestayData.facilities && homestayData.facilities.length > 0) {
    const facGrid = document.querySelector('.facilities-grid');
    if (facGrid) {
      facGrid.innerHTML = '';
      homestayData.facilities.forEach(f => {
        const div = document.createElement('div');
        div.className = 'facility-card';
        div.innerHTML = `
          <div class="facility-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <h3 class="facility-title">${f.title}</h3>
          <p class="facility-text">${f.desc}</p>
        `;
        facGrid.appendChild(div);
      });
    }
  }

  // Hydrate Experiences
  if (homestayData.experiences && homestayData.experiences.length > 0) {
    const expGrid = document.querySelector('.experiences-grid');
    if (expGrid) {
      expGrid.innerHTML = '';
      homestayData.experiences.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'experience-card';
        card.innerHTML = `
          <div class="experience-img-wrap">
            <img src="${exp.image || 'images/pergasingan.jpg'}" alt="${exp.title}" class="experience-img" loading="lazy">
            <span class="experience-tag">${exp.tag || 'Wisata'}</span>
          </div>
          <div class="experience-body">
            <h3 class="experience-title">${exp.title}</h3>
            <p class="experience-desc">${exp.desc}</p>
            <ul class="experience-perks">
              ${(exp.perks || []).map(p => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${p}</li>`).join('')}
            </ul>
            <a href="#reservasi" class="btn-book-exp">Booking dengan Kamar</a>
          </div>
        `;
        expGrid.appendChild(card);
      });
    }
  }

  // Hydrate Gallery
  if (homestayData.gallery && homestayData.gallery.length > 0) {
    const galGrid = document.querySelector('.gallery-grid');
    if (galGrid) {
      galGrid.innerHTML = '';
      homestayData.gallery.forEach(item => {
        const div = document.createElement('div');
        div.className = `gallery-item ${item.span2 ? 'span-2' : ''}`;
        div.dataset.category = item.category || 'pemandangan';
        div.innerHTML = `
          <img src="${item.image || 'images/hero.jpg'}" alt="${item.title}" loading="lazy">
          <div class="gallery-item-overlay">
            <span class="gallery-caption-title">${item.title}</span>
            <span class="gallery-caption-sub">${item.subtitle || ''}</span>
          </div>
        `;
        galGrid.appendChild(div);
      });
    }
  }

  // Hydrate Reviews
  if (homestayData.reviews && homestayData.reviews.length > 0) {
    const revGrid = document.querySelector('.reviews-grid');
    if (revGrid) {
      revGrid.innerHTML = '';
      homestayData.reviews.forEach(rev => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
          <div>
            <div class="review-stars">★★★★★</div>
            <p class="review-text">"${rev.text}"</p>
          </div>
          <div class="reviewer-profile">
            <div class="reviewer-avatar">${rev.avatar || rev.name.charAt(0)}</div>
            <div>
              <div class="reviewer-name">${rev.name}</div>
              <div class="reviewer-origin">${rev.origin}</div>
            </div>
          </div>
        `;
        revGrid.appendChild(card);
      });
    }
  }

  // Hydrate FAQs
  if (homestayData.faqs && homestayData.faqs.length > 0) {
    const faqContainer = document.querySelector('.faq-accordion');
    if (faqContainer) {
      faqContainer.innerHTML = '';
      homestayData.faqs.forEach((faq, idx) => {
        const div = document.createElement('div');
        div.className = `faq-item ${idx === 0 ? 'active' : ''}`;
        div.innerHTML = `
          <button class="faq-question">
            <span>${faq.question}</span>
            <svg class="faq-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="faq-answer">${faq.answer}</div>
        `;
        faqContainer.appendChild(div);
      });
    }
  }

function formatWhatsAppNumber(num) {
  if (!num) return '6285801112024';
  let clean = num.toString().replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);
  if (clean.startsWith('68')) clean = '62' + clean.slice(1);
  return clean || '6285801112024';
}

  // Floating WhatsApp Action
  const floatingWa = document.getElementById('floatingWhatsappBtn');
  if (floatingWa) {
    floatingWa.onclick = () => {
      const waNumber = formatWhatsAppNumber(homestayData?.profile?.whatsapp);
      const msg = encodeURIComponent(`Halo ${homestayData?.profile?.brandName || 'Bale Keluarga Homestay'}, saya ingin menanyakan ketersediaan kamar dan paket wisata Sembalun. Terima kasih!`);
      window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');
    };
  }
}

// 4. Interactive Booking Calculator & WhatsApp Generator
function initBookingCalculator() {
  const checkinInput = document.getElementById('calc-checkin');
  const checkoutInput = document.getElementById('calc-checkout');
  const roomSelect = document.getElementById('calc-room');
  const guestsSelect = document.getElementById('calc-guests');

  const summaryRoomName = document.getElementById('sum-room-name');
  const summaryNights = document.getElementById('sum-nights');
  const summaryRoomCost = document.getElementById('sum-room-cost');
  const summaryAddonsCost = document.getElementById('sum-addons-cost');
  const summaryTotalCost = document.getElementById('sum-total-cost');
  const btnWhatsapp = document.getElementById('btn-whatsapp-booking');

  function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  function formatDateForInput(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  if (checkinInput && checkoutInput) {
    checkinInput.min = formatDateForInput(today);
    checkinInput.value = formatDateForInput(tomorrow);
    checkoutInput.min = formatDateForInput(tomorrow);
    checkoutInput.value = formatDateForInput(dayAfterTomorrow);

    checkinInput.addEventListener('change', () => {
      const inDate = new Date(checkinInput.value);
      const minOut = new Date(inDate);
      minOut.setDate(minOut.getDate() + 1);
      checkoutInput.min = formatDateForInput(minOut);
      if (new Date(checkoutInput.value) <= inDate) {
        checkoutInput.value = formatDateForInput(minOut);
      }
      calculateBookingTotal();
    });

    checkoutInput.addEventListener('change', calculateBookingTotal);
  }

  function calculateBookingTotal() {
    if (!checkinInput || !checkoutInput || !roomSelect) return;

    const checkinDate = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);
    
    let nights = Math.ceil(Math.abs(checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    if (nights < 1 || isNaN(nights)) nights = 1;

    const selectedRoomKey = roomSelect.value;
    const roomData = roomDatabase[selectedRoomKey] || Object.values(roomDatabase)[0] || { title: 'Kamar', pricePerNight: 400000 };
    const roomCost = roomData.pricePerNight * nights;

    let addonsCost = 0;
    const selectedAddonNames = [];

    document.querySelectorAll('.addon-item-cb').forEach(cb => {
      if (cb.checked) {
        const addonKey = cb.dataset.addon;
        const price = addonPrices[addonKey] || 0;
        addonsCost += price;
        selectedAddonNames.push(cb.dataset.name);
      }
    });

    const totalCost = roomCost + addonsCost;

    if (summaryRoomName) summaryRoomName.textContent = roomData.title;
    if (summaryNights) summaryNights.textContent = `${nights} Malam`;
    if (summaryRoomCost) summaryRoomCost.textContent = formatIDR(roomCost);
    if (summaryAddonsCost) summaryAddonsCost.textContent = formatIDR(addonsCost);
    if (summaryTotalCost) summaryTotalCost.textContent = formatIDR(totalCost);

    const guests = guestsSelect ? guestsSelect.value : '2 Orang';
    const checkinFormatted = checkinDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkoutFormatted = checkoutDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    let message = `Halo Pengelola ${homestayData?.profile?.brandName || 'Bale Keluarga Homestay Sembalun'},\n\n`;
    message += `Saya tertarik untuk melakukan reservasi menginap:\n`;
    message += `🏡 *Tipe Kamar:* ${roomData.title}\n`;
    message += `📅 *Jadwal:* ${checkinFormatted} s/d ${checkoutFormatted} (${nights} Malam)\n`;
    message += `👥 *Jumlah Tamu:* ${guests}\n`;
    
    if (selectedAddonNames.length > 0) {
      message += `✨ *Layanan Tambahan:* ${selectedAddonNames.join(', ')}\n`;
    }
    
    message += `💰 *Estimasi Total:* ${formatIDR(totalCost)}\n\n`;
    message += `Apakah pada tanggal tersebut kamar masih tersedia? Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const waPhoneNumber = formatWhatsAppNumber(homestayData?.profile?.whatsapp);
    const waUrl = `https://wa.me/${waPhoneNumber}?text=${encodedMessage}`;

    if (btnWhatsapp) {
      btnWhatsapp.onclick = () => {
        window.open(waUrl, '_blank');
      };
    }
  }

  if (roomSelect) roomSelect.addEventListener('change', calculateBookingTotal);
  if (guestsSelect) guestsSelect.addEventListener('change', calculateBookingTotal);
  document.querySelectorAll('.addon-item-cb').forEach(cb => {
    cb.addEventListener('change', calculateBookingTotal);
  });

  calculateBookingTotal();

  // Quick Hero Form listener
  const heroForm = document.getElementById('quickBookingForm');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const heroIn = document.getElementById('hero-checkin').value;
      const heroOut = document.getElementById('hero-checkout').value;
      const heroRoom = document.getElementById('hero-room-type').value;
      const heroGuests = document.getElementById('hero-guests').value;

      if (checkinInput && heroIn) checkinInput.value = heroIn;
      if (checkoutInput && heroOut) checkoutInput.value = heroOut;
      if (roomSelect && heroRoom) roomSelect.value = heroRoom;
      if (guestsSelect && heroGuests) guestsSelect.value = heroGuests;

      calculateBookingTotal();
      const calcSec = document.getElementById('reservasi');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// 5. Room Selection & Detail Modal Handling
function bindRoomActionButtons() {
  const roomSelect = document.getElementById('calc-room');

  document.querySelectorAll('.btn-select-room').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const roomKey = e.currentTarget.dataset.room;
      if (roomSelect && roomKey) {
        roomSelect.value = roomKey;
        const calcSec = document.getElementById('reservasi');
        if (calcSec) {
          calcSec.scrollIntoView({ behavior: 'smooth' });
          const event = new Event('change');
          roomSelect.dispatchEvent(event);
        }
      }
    });
  });

  // Modal setup
  const modal = document.getElementById('roomDetailModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalImg = document.getElementById('modal-room-img');
  const modalTitle = document.getElementById('modal-room-title');
  const modalPrice = document.getElementById('modal-room-price');
  const modalDesc = document.getElementById('modal-room-desc');
  const modalAmenities = document.getElementById('modal-room-amenities');
  const modalBookBtn = document.getElementById('modal-btn-book');

  function openRoomModal(roomKey) {
    const data = roomDatabase[roomKey];
    if (!data || !modal) return;

    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalPrice.textContent = `Rp ${Number(data.pricePerNight).toLocaleString('id-ID')} / malam`;
    modalDesc.textContent = data.description;

    modalAmenities.innerHTML = '';
    (data.amenities || []).forEach(item => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.gap = '8px';
      li.style.marginBottom = '8px';
      li.style.fontSize = '0.92rem';
      li.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c3b24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${item}</span>
      `;
      modalAmenities.appendChild(li);
    });

    if (modalBookBtn) {
      modalBookBtn.onclick = () => {
        closeModal();
        if (roomSelect) {
          roomSelect.value = roomKey;
          const event = new Event('change');
          roomSelect.dispatchEvent(event);
        }
        const calcSection = document.getElementById('reservasi');
        if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });
      };
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.btn-detail-room').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const roomKey = e.currentTarget.dataset.room;
      openRoomModal(roomKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// 6. Gallery Filters
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// 7. FAQ Accordion
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

// 8. Admin Secret Login Modal (Password: 122027)
function initAdminLoginModal() {
  const trigger = document.getElementById('adminSecretTrigger');
  const modal = document.getElementById('adminLoginModal');
  const form = document.getElementById('adminLoginForm');
  const passInput = document.getElementById('adminPassInput');
  const errorMsg = document.getElementById('adminLoginError');
  const closeBtn = document.getElementById('closeAdminLoginModal');

  if (trigger && modal) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      // If already logged in this session, navigate directly
      if (sessionStorage.getItem('bale_admin_auth') === '122027') {
        window.location.href = 'admin.html';
        return;
      }
      modal.classList.add('active');
      if (errorMsg) errorMsg.style.display = 'none';
      if (passInput) {
        passInput.value = '';
        setTimeout(() => passInput.focus(), 150);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPass = passInput ? passInput.value.trim() : '';
      if (enteredPass === '122027') {
        sessionStorage.setItem('bale_admin_auth', '122027');
        if (errorMsg) errorMsg.style.display = 'none';
        const submitBtn = document.getElementById('btnSubmitAdminLogin');
        if (submitBtn) {
          submitBtn.textContent = 'Berhasil Masuk...';
          submitBtn.style.background = '#16a34a';
        }
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 350);
      } else {
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.textContent = 'Kata sandi salah! Silakan coba lagi.';
        }
        if (passInput) {
          passInput.focus();
          passInput.select();
        }
      }
    });
  }
}

function toggleAdminPassVisibility() {
  const input = document.getElementById('adminPassInput');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}
