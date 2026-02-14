if (!window.ownerAuth?.isAuthenticated?.()) {
  window.location.replace('index.html');
}

const offersStorageKey = 'dr_shyla_offers_v1';
const offerForm = document.getElementById('offer-form');
const offerList = document.getElementById('offer-list');
const formMessage = document.getElementById('form-message');
const clearExpiredBtn = document.getElementById('clear-expired');
const logoutBtn = document.getElementById('logout-btn');

function toStartOfDay(dateText) {
  const parts = String(dateText).split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEndOfDay(dateText) {
  const parts = String(dateText).split('-').map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getOffers() {
  try {
    const data = JSON.parse(localStorage.getItem(offersStorageKey) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveOffers(offers) {
  localStorage.setItem(offersStorageKey, JSON.stringify(offers));
}

function getOfferStatus(offer) {
  const now = new Date();
  const start = offer.startDate ? toStartOfDay(offer.startDate) : new Date(0);
  const end = toEndOfDay(offer.endDate);
  if (!end || !start || offer.isActive === false) return 'Inactive';
  if (now > end) return 'Expired';
  if (now < start) return 'Upcoming';
  return 'Active';
}

function setMessage(text, isError = false) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.style.color = isError ? '#8f2b2b' : '#38514a';
}

function formatDate(dateText) {
  const d = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderOffers() {
  if (!offerList) return;
  const offers = getOffers().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (!offers.length) {
    offerList.innerHTML = '<p class="form-message">No offers added yet.</p>';
    return;
  }

  offerList.innerHTML = offers
    .map((offer) => {
      const status = getOfferStatus(offer);
      const safeTitle = escapeHtml(offer.title || 'Clinic Special Offer');
      return `
        <article class="offer-item">
          <img src="${offer.imageUrl}" alt="${safeTitle}" loading="lazy" />
          <div class="offer-meta">
            <h3>${safeTitle}</h3>
            <p>Display from: <strong>${formatDate(offer.startDate || offer.endDate)}</strong></p>
            <p>Display until: <strong>${formatDate(offer.endDate)}</strong></p>
            <p class="${status === 'Expired' ? 'expired' : ''}">${status}</p>
          </div>
          <button type="button" class="offer-delete" data-id="${offer.id}">Delete</button>
        </article>
      `;
    })
    .join('');
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function resizeImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 1400;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not process image.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => reject(new Error('Could not load selected image.'));
    img.src = dataUrl;
  });
}

if (offerForm) {
  offerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(offerForm);
    const title = String(formData.get('title') || '').trim();
    const startDate = String(formData.get('start_date') || '').trim();
    const endDate = String(formData.get('end_date') || '').trim();
    const file = formData.get('image');

    if (!(file instanceof File) || !file.name) {
      setMessage('Please choose an offer image.', true);
      return;
    }
    if (!startDate || !endDate) {
      setMessage('Please select both offer start and end dates.', true);
      return;
    }

    const start = toStartOfDay(startDate);
    const end = toEndOfDay(endDate);
    if (!start || !end || start > end) {
      setMessage('Offer start date must be on or before offer end date.', true);
      return;
    }

    try {
      setMessage('Saving offer...');
      const rawData = await readFileAsDataURL(file);
      const imageUrl = await resizeImage(rawData);
      const offers = getOffers();
      offers.push({
        id: `offer_${Date.now()}`,
        title,
        startDate,
        endDate,
        imageUrl,
        isActive: true,
        createdAt: Date.now()
      });
      saveOffers(offers);
      offerForm.reset();
      setMessage('Offer added successfully.');
      renderOffers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save offer.', true);
    }
  });
}

if (offerList) {
  offerList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const id = target.dataset.id;
    if (!id) return;

    const offers = getOffers().filter((offer) => offer.id !== id);
    saveOffers(offers);
    renderOffers();
    setMessage('Offer deleted.');
  });
}

if (clearExpiredBtn) {
  clearExpiredBtn.addEventListener('click', () => {
    const now = new Date();
    const offers = getOffers().filter((offer) => {
      const end = toEndOfDay(offer.endDate);
      return end && now <= end;
    });
    saveOffers(offers);
    renderOffers();
    setMessage('Expired offers removed.');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    window.ownerAuth?.logout?.();
    window.location.replace('index.html');
  });
}

renderOffers();
