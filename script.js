const header = document.querySelector('.site-header');
const mainNav = document.getElementById('main-nav');
const navToggle = document.querySelector('.nav-toggle');
const revealElements = document.querySelectorAll('.reveal');
const form = document.querySelector('.contact-form');
const offerPopup = document.getElementById('offer-popup');
const offerPopupClose = document.getElementById('offer-popup-close');
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
  let offerTimer = null;

  const closeOfferPopup = () => {
    offerPopup.classList.remove('show');
    offerPopup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (offerTimer) {
      clearTimeout(offerTimer);
      offerTimer = null;
    }
  };

  const showOfferPopup = () => {
    offerPopup.classList.add('show');
    offerPopup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    offerTimer = setTimeout(closeOfferPopup, 10000);
  };

  if (offerPopupClose) {
    offerPopupClose.addEventListener('click', closeOfferPopup);
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
