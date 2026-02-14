const header = document.querySelector('.site-header');
const mainNav = document.getElementById('main-nav');
const navToggle = document.querySelector('.nav-toggle');
const revealElements = document.querySelectorAll('.reveal');
const form = document.querySelector('.contact-form');
const offerPopup = document.getElementById('offer-popup');
const offerPopupClose = document.getElementById('offer-popup-close');
const offerPopupPrev = document.getElementById('offer-popup-prev');
const offerPopupNext = document.getElementById('offer-popup-next');
const offerPopupProgress = document.getElementById('offer-popup-progress');
const offerPopupImage = document.getElementById('offer-popup-image');
const concernSelect = form ? form.querySelector('select[name="concern"]') : null;
const otherConcernField = form ? form.querySelector('.other-concern-field') : null;
const otherConcernInput = form ? form.querySelector('textarea[name="other_concern"]') : null;
const year = document.getElementById('year');

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (mainNav && navToggle) {
  const setNavState = (isOpen) => {
    mainNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('open');
    setNavState(!isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavState(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      setNavState(false);
    }
  });
}

function onScroll() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
}

function revealOnView() {
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => observer.observe(el));
}

if (form) {
  const toggleOtherConcern = () => {
    if (!concernSelect || !otherConcernField || !otherConcernInput) return;
    const isOther = concernSelect.value === 'Other';
    otherConcernField.hidden = !isOther;
    otherConcernInput.required = isOther;
    if (!isOther) {
      otherConcernInput.value = '';
    }
  };

  if (concernSelect) {
    concernSelect.addEventListener('change', toggleOtherConcern);
    toggleOtherConcern();
  }
}

if (offerPopup) {
  const offersStorageKey = 'dr_shyla_offers_v1';
  let offerTimer = null;
  let offerProgressTimer = null;
  const offerDuration = 7000;
  const offerTick = 100;
  const ringRadius = 15;
  const ringLength = 2 * Math.PI * ringRadius;
  let activeOffers = [];
  let currentOfferIndex = 0;

  if (offerPopupProgress) {
    offerPopupProgress.style.strokeDasharray = `${ringLength}`;
    offerPopupProgress.style.strokeDashoffset = '0';
  }

  const toLocalYMD = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getActiveOffers = () => {
    const today = toLocalYMD();
    let offers = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(offersStorageKey) || '[]');
      offers = Array.isArray(parsed) ? parsed : [];
    } catch {
      offers = [];
    }

    const filtered = offers
      .filter((offer) => {
        if (!offer || !offer.imageUrl || !offer.endDate) return false;
        const start = offer.startDate || offer.endDate;
        const isActive = offer.isActive !== false;
        return isActive && start <= today && offer.endDate >= today;
      })
      .sort((a, b) => {
        if (a.endDate !== b.endDate) return b.endDate.localeCompare(a.endDate);
        return (b.createdAt || 0) - (a.createdAt || 0);
      })
      .map((offer) => ({
        title: offer.title || '',
        imageData: offer.imageUrl
      }));

    const unique = [];
    const seen = new Set();
    filtered.forEach((offer) => {
      const key = `${offer.title}::${offer.imageData}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(offer);
      }
    });

    return unique;
  };

  const renderCurrentOffer = () => {
    const offer = activeOffers[currentOfferIndex];
    if (!offer || !offerPopupImage) return;
    offerPopupImage.src = offer.imageData;
    offerPopupImage.alt = offer.title ? `${offer.title} offer` : 'Clinic special offer';
    if (offerPopupPrev) {
      offerPopupPrev.hidden = activeOffers.length <= 1;
    }
    if (offerPopupNext) {
      offerPopupNext.hidden = activeOffers.length <= 1;
    }
  };

  const startOfferTimers = () => {
    if (offerTimer) {
      clearTimeout(offerTimer);
      offerTimer = null;
    }
    if (offerProgressTimer) {
      clearInterval(offerProgressTimer);
      offerProgressTimer = null;
    }

    if (offerPopupProgress) {
      offerPopupProgress.style.strokeDashoffset = '0';
      const startTime = Date.now();
      offerProgressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / offerDuration, 1);
        offerPopupProgress.style.strokeDashoffset = `${ringLength * progress}`;
      }, offerTick);
    }

    offerTimer = setTimeout(() => {
      if (activeOffers.length > 1 && currentOfferIndex < activeOffers.length - 1) {
        currentOfferIndex += 1;
        renderCurrentOffer();
        startOfferTimers();
      } else {
        closeOfferPopup();
      }
    }, offerDuration);
  };

  const closeOfferPopup = () => {
    offerPopup.classList.remove('show');
    offerPopup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (offerTimer) {
      clearTimeout(offerTimer);
      offerTimer = null;
    }
    if (offerProgressTimer) {
      clearInterval(offerProgressTimer);
      offerProgressTimer = null;
    }
    if (offerPopupProgress) {
      offerPopupProgress.style.strokeDashoffset = '0';
    }
    currentOfferIndex = 0;
    activeOffers = [];
  };

  const showOfferPopup = () => {
    activeOffers = getActiveOffers();
    if (!activeOffers.length || !offerPopupImage) return;
    const singleOffer = activeOffers.length <= 1;
    if (offerPopupPrev) offerPopupPrev.hidden = singleOffer;
    if (offerPopupNext) offerPopupNext.hidden = singleOffer;

    offerPopup.classList.add('show');
    offerPopup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    currentOfferIndex = 0;
    renderCurrentOffer();
    startOfferTimers();
  };

  if (offerPopupClose) {
    offerPopupClose.addEventListener('click', closeOfferPopup);
  }

  if (offerPopupNext) {
    offerPopupNext.addEventListener('click', () => {
      if (!activeOffers.length) return;
      currentOfferIndex = (currentOfferIndex + 1) % activeOffers.length;
      renderCurrentOffer();
      startOfferTimers();
    });
  }

  if (offerPopupPrev) {
    offerPopupPrev.addEventListener('click', () => {
      if (!activeOffers.length) return;
      currentOfferIndex =
        (currentOfferIndex - 1 + activeOffers.length) % activeOffers.length;
      renderCurrentOffer();
      startOfferTimers();
    });
  }

  offerPopup.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeOffer === 'true') {
      closeOfferPopup();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && offerPopup.classList.contains('show')) {
      closeOfferPopup();
    }
  });

  window.addEventListener('load', showOfferPopup);
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
  onScroll();
  revealOnView();
});
