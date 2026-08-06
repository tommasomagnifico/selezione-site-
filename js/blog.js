/* Blog — filtro per categoria e caricamento progressivo.
   Miglioramento progressivo puro: le card sono già tutte nell'HTML (quindi
   indicizzabili e leggibili senza JS). Questo file si limita a costruire la
   barra dei filtri e a nascondere le card oltre la prima "pagina".
   Caricato solo da /blog/, con defer: non blocca il rendering. */
(function () {
  var grid = document.getElementById('blogGrid');
  var filtersEl = document.getElementById('blogFilters');
  var loadMoreWrap = document.getElementById('blogLoadMoreWrap');
  var loadMoreBtn = document.getElementById('blogLoadMore');
  var emptyEl = document.getElementById('blogEmpty');
  if (!grid) return;

  var PAGE_SIZE = 6;
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
    if (emptyEl) emptyEl.classList.toggle('show', total === 0);
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
      shown += PAGE_SIZE;
      apply();
    });
  }

  apply();
})();
