/* Eventi di conversione — Google Analytics 4.
 *
 * Il tag e il Consent Mode v2 stanno nell'<head> di ogni pagina, con tutti i
 * consensi negati per default. Qui c'è solo la logica degli eventi, raccolta in
 * un file solo invece che sparsa negli onclick delle pagine.
 *
 * Regola che vale per tutto il file: se il consenso analytics non è stato dato,
 * i listener restano attivi ma non parte nulla verso Google. Nessun errore in
 * console, nessuna richiesta di rete.
 *
 * Caricato con defer su tutte le pagine: non blocca il rendering.
 */
(function () {
  /* --- Consenso ------------------------------------------------------ */

  function consensoDato() {
    try {
      return window.localStorage.getItem('cookieConsent') === 'all';
    } catch (e) {
      return false; /* storage bloccato: vale come rifiuto */
    }
  }

  function invia(nome, parametri) {
    if (!consensoDato()) return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', nome, parametri || {});
  }

  /* Se il consenso c'era già da una visita precedente, gtag va avvisato subito:
     è per questo che il tag nell'head dichiara wait_for_update, cioè aspetta
     mezzo secondo un eventuale aggiornamento prima di inviare la pageview. */
  if (consensoDato() && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
  }

  /* --- Contesto della pagina ------------------------------------------ */

  var percorso = window.location.pathname;
  var inArticolo = /^\/blog\/[^/]+\/$/.test(percorso) && !/\/blog\/_template\//.test(percorso);

  function slugArticolo() {
    var m = percorso.match(/^\/blog\/([^/]+)\/$/);
    return m ? m[1] : '';
  }

  /* --- D.2 e D.3 — click, con un solo listener delegato ---------------- */

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';

    /* WhatsApp: qualunque link wa.me, su qualunque pagina. */
    if (href.indexOf('https://wa.me/') === 0) {
      invia('click_whatsapp', { 'pagina': percorso });
      return;
    }

    /* CTA di valutazione: solo dai link verso vendi.html che partono dal blog.
       Il confronto è sul percorso, così regge sia /vendi.html sia vendi.html. */
    var vaAVendi = href === '/vendi.html' || href === 'vendi.html' ||
                   href.indexOf('/vendi.html#') === 0 || href.indexOf('vendi.html#') === 0;
    if (vaAVendi && percorso.indexOf('/blog/') === 0) {
      invia('cta_valutazione', {
        'articolo': slugArticolo() || 'indice_blog',
        'posizione': link.closest('.cta-band') ? 'cta_finale' : 'link_contestuale'
      });
    }
  }, { passive: true });

  /* --- D.4 — invio del form su vendi.html ------------------------------
     js/form.js emette l'evento 'selezione:lead' solo dopo che la validazione è
     passata e la richiesta è partita davvero. Non arriva qui nessun dato
     dell'utente: né nome, né telefono, né email, né testo del messaggio. */

  document.addEventListener('selezione:lead', function () {
    invia('generate_lead', { 'metodo': 'form_vendi' });
  });

  /* --- D.5 — lettura profonda di un articolo --------------------------- */

  if (inArticolo) {
    var corpo = document.querySelector('.article-body');
    if (corpo) {
      var giaInviato = false;
      var controlla = function () {
        if (giaInviato) return;
        var fine = corpo.offsetTop + corpo.offsetHeight;
        var letto = window.scrollY + window.innerHeight;
        if (letto >= corpo.offsetTop + (fine - corpo.offsetTop) * 0.75) {
          giaInviato = true;
          window.removeEventListener('scroll', controlla);
          invia('lettura_completa', { 'articolo': slugArticolo() });
        }
      };
      window.addEventListener('scroll', controlla, { passive: true });
      controlla(); /* articoli corti: la soglia può essere già superata */
    }
  }
})();
