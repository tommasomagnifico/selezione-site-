/* ==========================================================================
   GATE DI ANTEPRIMA — FILE TEMPORANEO, DA RIMUOVERE PRIMA DI ANDARE ONLINE
   ==========================================================================

   COSA FA
   Finché il sito non è pubblico, chi apre una qualsiasi pagina viene mandato
   su /preview-access.html e deve inserire il codice di accesso. Superato il
   controllo, il token resta salvato nel browser (localStorage, chiave
   "slz_preview_access") e non viene più richiesto su quel dispositivo.

   --------------------------------------------------------------------------
   COME SI DISATTIVA AL GO-LIVE — tre cancellazioni, nient'altro
   --------------------------------------------------------------------------
   1. Cancella questo file:            gate.js
   2. Cancella la pagina del gate:     preview-access.html
   3. Togli da ogni pagina HTML le due righe:

          <!-- GATE DI ANTEPRIMA — riga temporanea, si toglie al go-live (vedi gate.js) -->
          <script src="/gate.js"></script>

      Stanno subito sotto il <meta name="viewport">. Per trovarle tutte:

          grep -rn "gate.js" --include=*.html .

   Non c'è altro da pulire: nessuna riga aggiunta a css/style.css, nessuna
   voce in sitemap.xml, nessuna modifica a js/main.js, js/form.js o js/blog.js.
   Cancellati i due file e tolto il tag, il sito torna esattamente com'era.

   --------------------------------------------------------------------------
   ATTENZIONE: NON È UNA PROTEZIONE, È UN PARAVENTO
   --------------------------------------------------------------------------
   Il codice di accesso qui sotto è leggibile da chiunque apra il sorgente
   della pagina, e i file del sito restano scaricabili con una richiesta
   diretta. Serve a tenere fuori chi capita per caso, non chi vuole entrare.
   Per una protezione vera serve il server: password di sito su Netlify,
   Cloudflare Access o simili. GitHub Pages non la offre.

   Nota SEO: se il sito è già indicizzato, il gate fa vedere a Google un
   redirect al posto dei contenuti e le pagine possono uscire dai risultati.
   Su un sito non ancora pubblicato non è un problema.
   ========================================================================== */

/* --- UNICA RIGA DA CAMBIARE PER CAMBIARE IL CODICE DI ACCESSO --- */
var CHIAVE_DI_ACCESSO = 'SELEZIONE-2026';

(function () {
  var TOKEN = 'slz_preview_access';
  var PAGINA_GATE = '/preview-access.html';

  /* Sulla pagina del gate il controllo non deve girare, o si entrerebbe in un
     ciclo di redirect infinito. preview-access.html carica comunque questo
     file per leggere CHIAVE_DI_ACCESSO: così il codice è scritto in un posto
     solo e non può disallinearsi tra i due file. */
  if (window.location.pathname.slice(-PAGINA_GATE.length) === PAGINA_GATE) return;

  var salvato = null;
  try {
    salvato = window.localStorage.getItem(TOKEN);
  } catch (e) {
    /* localStorage non disponibile (navigazione privata, storage bloccato):
       vale come "nessun accesso", si passa dal gate. */
  }

  if (salvato !== CHIAVE_DI_ACCESSO) {
    /* replace() e non href: così il tasto "indietro" non riporta sulla
       pagina bloccata creando un rimbalzo. */
    window.location.replace(PAGINA_GATE);
  }
})();
