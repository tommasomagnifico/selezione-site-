(function () {
  /* --- MENU MOBILE --- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuBackdrop = document.getElementById('menuBackdrop');

  function toggleMenu(open) {
    if (!navToggle || !mobileMenu || !menuBackdrop) return;
    var isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    menuBackdrop.classList.toggle('open', isOpen);
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Chiudi menu' : 'Apri menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () { toggleMenu(); });
  }
  if (menuBackdrop) {
    menuBackdrop.addEventListener('click', function () { toggleMenu(false); });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggleMenu(false); });
    });
  }

  /* --- NAV OMBRA + BACK TO TOP --- */
  var navEl = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY;
    if (navEl) navEl.classList.toggle('scrolled', y > 20);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* --- SCROLL REVEAL --- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- ESCAPE CHIUDE IL MENU --- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { toggleMenu(false); }
  });

  /* --- COOKIE BANNER (con persistenza) --- */
  var cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    if (localStorage.getItem('cookieConsent')) {
      cookieBanner.style.display = 'none';
    }

    function setCookie(accepted) {
      localStorage.setItem('cookieConsent', accepted ? 'all' : 'necessary');
      cookieBanner.style.display = 'none';
    }

    var acceptBtn = cookieBanner.querySelector('.cookie-btn.solid');
    var rejectBtn = cookieBanner.querySelector('.cookie-btn.ghost');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { setCookie(true); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { setCookie(false); });
  }
})();
