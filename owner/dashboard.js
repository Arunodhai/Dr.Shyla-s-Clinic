// Dashboard Singleton to prevent multiple initializations
if (window.OwnerDashboard) {
  console.log('OwnerDashboard already initialized. Skipping re-init.');
} else {
  window.OwnerDashboard = {
    initialized: false,

    init: async function () {
      if (this.initialized) return;
      this.initialized = true;

      console.log('Initializing OwnerDashboard...');

      const offerList = document.getElementById('offer-list');
      // Only run if we are on the dashboard page
      if (!offerList) return;

      // Show loading state
      offerList.innerHTML = '<p class="form-message">Verifying authentication...</p>';

      // Small delay to ensure Supabase client is ready
      await new Promise(r => setTimeout(r, 500));

      // Check auth
      const { data: { session } } = await window.supabase.auth.getSession();
      if (!session) {
        window.location.replace('/owner');
        return;
      }

      const offerForm = document.getElementById('offer-form');
      const formMessage = document.getElementById('form-message');
      const clearExpiredBtn = document.getElementById('clear-expired');
      const logoutBtn = document.getElementById('logout-btn');

      this.setupEventListeners(offerForm, offerList, clearExpiredBtn, logoutBtn);
      this.renderOffers();
    },

    setMessage: function (text, isError = false) {
      const formMessage = document.getElementById('form-message');
      if (!formMessage) return;
      formMessage.textContent = text;
      formMessage.style.color = isError ? '#8f2b2b' : '#38514a';
    },

    formatDate: function (dateText) {
      if (!dateText) return '';
      const d = new Date(dateText);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    escapeHtml: function (value) {
      if (!value) return '';
      return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    },

    getOffers: async function () {
      const { data, error } = await window.supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        return [];
      }
      return data;
    },

    getOfferStatus: function (offer) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate = offer.start_date ? new Date(offer.start_date) : null;
      const endDate = offer.end_date ? new Date(offer.end_date) : null;

      if (!offer.is_active) return 'Inactive';
      if (endDate && today > endDate) return 'Expired';
      if (startDate && today < startDate) return 'Upcoming';
      return 'Active';
    },

    renderOffers: async function () {
      const offerList = document.getElementById('offer-list');
      if (!offerList) return;

      const offers = await this.getOffers();

      if (!offers.length) {
        offerList.innerHTML = '<p class="form-message">No offers added yet.</p>';
        return;
      }

      offerList.innerHTML = offers
        .map((offer) => {
          const safeTitle = this.escapeHtml(offer.title || 'Clinic Special Offer');
          const status = this.getOfferStatus(offer);
          return `
            <article class="offer-item">
              <img src="${offer.image_url}" alt="${safeTitle}" loading="lazy" />
              <div class="offer-meta">
                <h3>${safeTitle}</h3>
                <p>Display from: <strong>${this.formatDate(offer.start_date)}</strong></p>
                <p>Display until: <strong>${this.formatDate(offer.end_date)}</strong></p>
                <p class="${status === 'Expired' ? 'expired' : ''}">${status}</p>
              </div>
              <button type="button" class="offer-delete" data-id="${offer.id}">Delete</button>
            </article>
          `;
        })
        .join('');
    },

    setupEventListeners: function (offerForm, offerList, clearExpiredBtn, logoutBtn) {
      // 1. Offer Submission
      if (offerForm) {
        offerForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const formData = new FormData(offerForm);
          const title = String(formData.get('title') || '').trim();
          const startDate = String(formData.get('start_date') || '').trim();
          const endDate = String(formData.get('end_date') || '').trim();
          const file = formData.get('image');

          if (!(file instanceof File) || !file.name) {
            this.setMessage('Please choose an offer image.', true);
            return;
          }
          if (!startDate || !endDate) {
            this.setMessage('Please select both offer start and end dates.', true);
            return;
          }

          const start = new Date(startDate);
          const end = new Date(endDate);

          if (start > end) {
            this.setMessage('Offer start date must be on or before offer end date.', true);
            return;
          }

          try {
            this.setMessage('Uploading image...');
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { error: uploadError } = await window.supabase.storage
              .from('offer-images')
              .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = window.supabase.storage
              .from('offer-images')
              .getPublicUrl(fileName);

            this.setMessage('Saving offer details...');

            const { error: insertError } = await window.supabase
              .from('offers')
              .insert({
                title,
                start_date: startDate,
                end_date: endDate,
                image_url: publicUrl,
                is_active: true
              });

            if (insertError) throw insertError;

            offerForm.reset();
            this.setMessage('Offer added successfully.');
            this.renderOffers();

          } catch (error) {
            console.error(error);
            this.setMessage(error.message || 'Could not save offer.', true);
          }
        });
      }

      // 2. Delete Handler (Scoped strictly to offerList)
      if (offerList) {
        this.handleDelete = async (event) => {
          const target = event.target;
          if (!target.classList.contains('offer-delete')) return;

          event.stopPropagation();
          event.preventDefault();

          if (target.dataset.processing === 'true') return;

          const id = target.dataset.id;
          if (!id) return;

          if (!confirm('Are you sure you want to delete this offer?')) return;

          try {
            target.dataset.processing = 'true';
            target.textContent = 'Deleting...';
            target.disabled = true;

            const { error } = await window.supabase.from('offers').delete().eq('id', id);

            if (error) throw error;

            // Remove from DOM
            const item = target.closest('.offer-item');
            if (item) item.remove();
            this.setMessage('Offer deleted.');

          } catch (err) {
            console.error(err);
            alert('Failed to delete: ' + err.message);
            target.dataset.processing = 'false';
            target.textContent = 'Delete';
            target.disabled = false;
          }
        };

        // Remove old if any (though singleton prevents this, it's good practice)
        offerList.removeEventListener('click', this.handleDelete);
        offerList.addEventListener('click', this.handleDelete);
      }

      // 3. Clear Expired
      if (clearExpiredBtn) {
        clearExpiredBtn.addEventListener('click', async () => {
          if (!confirm('Delete all expired offers?')) return;
          try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await window.supabase.from('offers').delete().lt('end_date', today);
            if (error) throw error;
            this.renderOffers();
            this.setMessage('Expired offers removed.');
          } catch (err) {
            console.error(err);
            this.setMessage('Failed to delete expired offers.', true);
          }
        });
      }

      // 4. Logout
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await window.ownerAuth.logout();
          window.location.replace('/owner');
        });
      }
    }
  };

  // Run the singleton init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.OwnerDashboard.init());
  } else {
    window.OwnerDashboard.init();
  }
}
