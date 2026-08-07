/* Blog — filtro per categoria e caricamento progressivo.
   Miglioramento progressivo puro: le card sono già tutte nell'HTML (quindi
   indicizzabili e leggibili senza JS). Questo file si limita a costruire la
   barra dei filtri e a nascondere le card oltre la prima "pagina".
   Caricato solo da /blog/, con defer: non blocca il rendering.

   Perché niente URL paginati (/blog/page/2/): tutti i link degli articoli
   stanno già nell'HTML statico, quindi Googlebot li raggiunge tutti da /blog/
   senza dover eseguire nulla. Il JS nasconde elementi che sono già nel DOM,
   non ne inserisce. Oltre la ventina di articoli conviene passare a pagine
   vere: la procedura è in blog/_template/README.md. */
(function () {
  var grid = document.getElementById('blogGrid');
  var filtersEl = document.getElementById('blogFilters');
  var loadMoreWrap = document.getElementById('blogLoadMoreWrap');
  var loadMoreBtn = document.getElementById('blogLoadMore');
  if (!grid) return;

  /* Quanti articoli si vedono prima di premere "Carica altri". */
  var PAGE_SIZE = 9;
  var ALL = 'Tutti';

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
  if (!cards.length) return;

  var active = ALL;
  var shown = PAGE_SIZE;

  /* --- Barra dei filtri, costruita dalle categorie realmente presenti --- */
  var categories = [ALL];
  cards.forEach(function (card) {
    var cat = card.getAttribute('data-category');
    if (cat && categories.indexOf(cat) === -1) categories.push(cat);
  });

  var buttons = [];
  if (filtersEl && categories.length > 2) {
    categories.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'blog-filter';
      btn.textContent = cat;
      btn.setAttribute('aria-pressed', cat === active ? 'true' : 'false');
      btn.addEventListener('click', function () {
        active = cat;
        shown = PAGE_SIZE;
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
      buttons.push(btn);
      filtersEl.appendChild(btn);
    });
    filtersEl.hidden = false;
  }

  /* --- Messaggio "nessun articolo": creato solo quando serve ---
     Non sta nell'HTML di partenza di proposito: sarebbe testo nel sorgente
     che non corrisponde a niente di visibile in pagina. */
  var emptyEl = null;
  function mostraVuoto(vuoto) {
    if (vuoto && !emptyEl) {
      emptyEl = document.createElement('p');
      emptyEl.className = 'blog-empty show';
      emptyEl.setAttribute('role', 'status');
      emptyEl.textContent = 'Nessun articolo in questa categoria, per ora.';
      grid.parentNode.insertBefore(emptyEl, grid.nextSibling);
    } else if (!vuoto && emptyEl) {
      emptyEl.parentNode.removeChild(emptyEl);
      emptyEl = null;
    }
  }

  /* --- Visibilità delle card --- */
  function apply() {
    var matching = 0;
    cards.forEach(function (card) {
      var isMatch = active === ALL || card.getAttribute('data-category') === active;
      var visible = isMatch && matching < shown;
      if (isMatch) matching++;
      card.style.display = visible ? '' : 'none';
    });
    var total = cards.filter(function (card) {
      return active === ALL || card.getAttribute('data-category') === active;
    }).length;
    if (loadMoreWrap) loadMoreWrap.classList.toggle('show', total > shown);
    mostraVuoto(total === 0);
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      shown += PAGE_SIZE;
      apply();
    });
  }

  apply();
})();
