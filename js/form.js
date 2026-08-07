(function () {
  // ⬇️ INCOLLA QUI il tuo endpoint Formspree (es. https://formspree.io/f/abcdwxyz)
  // Crealo gratis su formspree.io → New Form → copia il link che ti danno.
  var FORM_ENDPOINT = "https://formspree.io/f/INSERISCI_ID";

  var WHATSAPP_NUMERO = "393315453138";
  var EMAIL_FALLBACK = "selezioneresellshop@gmail.com";

  /* Codice di riferimento SS-XXXX: serve a ricollegare la conversazione
     WhatsApp al record salvato sul backend. */
  function generaRiferimento() {
    var alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var codice = "";
    for (var i = 0; i < 4; i++) {
      codice += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
    }
    return "SS-" + codice;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function mostraErrore(testo) {
    var box = document.getElementById('sellError');
    box.textContent = testo;
    box.classList.add('show');
  }

  function nascondiErrore() {
    document.getElementById('sellError').classList.remove('show');
  }

  function inviaAlBackend(riferimento) {
    var dati = new FormData();
    dati.append('Riferimento', riferimento);
    dati.append('Nome', val('nome'));
    dati.append('Cellulare', val('cellulare'));
    dati.append('Email', val('email') || '—');
    dati.append('Tipo articolo', val('tipo'));
    dati.append('Descrizione', val('dettagli'));
    dati.append('Consenso privacy', 'Sì');
    dati.append('Consenso marketing', document.getElementById('marketing').checked ? 'Sì' : 'No');
    dati.append('_subject', 'Richiesta ' + riferimento + ' — ' + val('tipo'));

    var foto = document.getElementById('foto');
    if (foto && foto.files) {
      for (var i = 0; i < foto.files.length; i++) {
        dati.append('foto', foto.files[i]);
      }
    }

    // Non aspettiamo la risposta: se il salvataggio fallisce si prosegue
    // comunque verso WhatsApp — meglio perdere il dato che il contatto.
    return fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: dati,
      headers: { 'Accept': 'application/json' }
    });
  }

  function costruisciMessaggio(riferimento) {
    var testo =
      'Ciao, ti scrivo da selezioneshop.it\n' +
      'Rif. ' + riferimento + '\n' +
      '\n' +
      'Nome: ' + val('nome') + '\n' +
      'Tipo: ' + val('tipo') + '\n' +
      'Descrizione: ' + val('dettagli') + '\n' +
      '\n' +
      'Ti mando subito le foto.';
    return testo;
  }

  function mostraConferma(riferimento, urlWhatsApp) {
    document.getElementById('sellFormFields').style.display = 'none';

    document.getElementById('sellRef').textContent = riferimento;
    document.getElementById('sellRefInline').textContent = riferimento;
    document.getElementById('sellWaLink').href = urlWhatsApp;
    document.getElementById('sellMailLink').href =
      'mailto:' + EMAIL_FALLBACK +
      '?subject=' + encodeURIComponent('Richiesta di valutazione ' + riferimento);

    var box = document.getElementById('sellSuccess');
    box.classList.add('show');
    box.setAttribute('tabindex', '-1');
    box.focus();
  }

  function inviaRichiesta(e) {
    if (e) e.preventDefault();
    nascondiErrore();

    /* Honeypot: il campo #sito è fuori schermo e fuori dall'ordine di
       tabulazione, quindi solo un bot lo compila. Si esce senza messaggi né
       segnali: chi invia non deve capire perché non è passato. */
    var esca = document.getElementById('sito');
    if (esca && esca.value) return;

    if (!val('nome') || !val('cellulare') || !val('tipo') || !val('dettagli')) {
      mostraErrore('Compila nome, cellulare, tipo di articolo e descrizione.');
      return;
    }
    if (!document.getElementById('privacy').checked) {
      mostraErrore('Per procedere devi accettare l\'informativa privacy.');
      return;
    }

    var btn = document.getElementById('sellSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Apro WhatsApp…';

    // a. codice di riferimento
    var riferimento = generaRiferimento();

    // b. salvataggio sul backend (asincrono, non blocca il resto)
    inviaAlBackend(riferimento).catch(function () { /* vedi commento in inviaAlBackend */ });

    // c. URL WhatsApp con il messaggio precompilato
    var urlWhatsApp = 'https://wa.me/' + WHATSAPP_NUMERO +
      '?text=' + encodeURIComponent(costruisciMessaggio(riferimento));

    // d. apertura di WhatsApp. Nessun await prima di qui: la chiamata resta
    //    dentro il gesto dell'utente, altrimenti i blocchi popup la fermano.
    window.open(urlWhatsApp, '_blank', 'noopener');

    // e. schermata di conferma (con lo stesso link, se il popup è stato bloccato)
    mostraConferma(riferimento, urlWhatsApp);

    // f. segnale per js/analytics.js, che lo traduce nell'evento generate_lead.
    //    Sta qui e non su un listener di submit perché deve partire solo a
    //    validazione superata. Non porta con sé nessun dato dell'utente.
    document.dispatchEvent(new CustomEvent('selezione:lead', {
      detail: { metodo: 'form_vendi' }
    }));
  }

  var btnInvio = document.getElementById('sellSubmitBtn');
  if (btnInvio) {
    btnInvio.addEventListener('click', inviaRichiesta);
  }
})();
