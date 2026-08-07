(function () {
  /* --- /index.html -> / ---
     GitHub Pages non permette redirect 301 server-side: questo è il ripiego
     lato client. Il canonical di index.html punta già alla root, quindi per
     Google l'URL valido resta uno solo. Se il sito passerà a Netlify/Vercel/
     Apache, il file _redirects nella root contiene la regola 301 vera. */
  if (window.location.pathname === '/index.html') {
    window.location.replace('/' + window.location.search + window.location.hash);
    return;
  }

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

  /* --- COOKIE BANNER (con persistenza) ---
     La scelta è secca, accetta o rifiuta, e vale per l'unica categoria non
     necessaria che il sito usa: le statistiche (Google Analytics 4).
     "Accetta" -> analytics_storage granted. "Rifiuta" -> non si tocca niente,
     perché il tag nell'head parte già con tutti i consensi negati. */
  function aggiornaConsenso(concesso) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      'analytics_storage': concesso ? 'granted' : 'denied'
    });
  }

  var cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    if (localStorage.getItem('cookieConsent')) {
      cookieBanner.style.display = 'none';
    }

    function setCookie(accepted) {
      localStorage.setItem('cookieConsent', accepted ? 'all' : 'necessary');
      cookieBanner.style.display = 'none';
      if (accepted) aggiornaConsenso(true);
    }

    var acceptBtn = cookieBanner.querySelector('.cookie-btn.solid');
    var rejectBtn = cookieBanner.querySelector('.cookie-btn.ghost');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { setCookie(true); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { setCookie(false); });
  }

  /* --- REVOCA DEL CONSENSO ---
     Il comando viene inserito da qui e non scritto nell'HTML di ogni pagina:
     revocare richiede JavaScript, quindi un comando che compare solo se il
     JavaScript c'è è coerente, e non può disallinearsi tra le 12 pagine.
     Compare accanto ai link legali in fondo, ed è raggiungibile da tastiera
     perché è un <button> vero. */
  var rigaLegale = document.querySelector('.footer-bottom p');
  if (rigaLegale && !document.getElementById('revocaCookie')) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'revocaCookie';
    btn.className = 'footer-link-btn';
    btn.textContent = 'Gestisci cookie';
    rigaLegale.appendChild(document.createTextNode(' · '));
    rigaLegale.appendChild(btn);

    btn.addEventListener('click', function () {
      localStorage.removeItem('cookieConsent');
      aggiornaConsenso(false);

      /* Il Consent Mode impedisce di scriverne di nuovi, ma quelli già sul
         dispositivo vanno tolti: altrimenti l'identificativo resta lì. */
      var dominio = location.hostname.replace(/^www\./, '');
      ['_ga', '_ga_TSMYGTDLV7', '_gid'].forEach(function (nome) {
        document.cookie = nome + '=; Max-Age=0; path=/';
        document.cookie = nome + '=; Max-Age=0; path=/; domain=.' + dominio;
      });

      if (cookieBanner) cookieBanner.style.display = '';
      btn.textContent = 'Consenso revocato';
      setTimeout(function () { btn.textContent = 'Gestisci cookie'; }, 4000);
    });
  }
})();
