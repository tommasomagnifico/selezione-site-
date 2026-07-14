(function () {
  // ⬇️ INCOLLA QUI il tuo endpoint Formspree (es. https://formspree.io/f/abcdwxyz)
  // Crealo gratis su formspree.io → New Form → copia il link che ti danno.
  var FORM_ENDPOINT = "https://formspree.io/f/INSERISCI_ID";

  async function submitSellForm(e) {
    if (e) e.preventDefault();

    var nome = document.getElementById('nome').value.trim();
    var email = document.getElementById('email').value.trim();
    var tipo = document.getElementById('tipo').value;
    var piattaforma = document.getElementById('piattaforma').value;
    var condizione = document.getElementById('condizione').value;
    var citta = document.getElementById('citta').value.trim();
    var dettagli = document.getElementById('dettagli').value.trim();
    var foto = document.getElementById('foto');
    var privacy = document.getElementById('privacy').checked;
    var btn = document.getElementById('sellSubmitBtn');
    var errBox = document.getElementById('sellError');

    errBox.classList.remove('show');

    if (!nome || !email || !tipo || !dettagli) {
      alert('Compila almeno: nome, email, tipo di articolo e descrizione.');
      return;
    }
    if (!privacy) {
      alert('Per procedere devi accettare l\'informativa privacy.');
      return;
    }

    var data = new FormData();
    data.append('Nome', nome);
    data.append('Email', email);
    data.append('Tipo articolo', tipo);
    data.append('Piattaforma', piattaforma || '—');
    data.append('Condizione', condizione || '—');
    data.append('Città ritiro', citta || '—');
    data.append('Descrizione', dettagli);
    data.append('Consenso privacy', 'Sì');
    data.append('_subject', 'Vendita a Selezione. — ' + tipo);
    if (foto && foto.files) {
      for (var i = 0; i < foto.files.length; i++) {
        data.append('foto', foto.files[i]);
      }
    }

    btn.disabled = true;
    btn.textContent = 'Invio in corso…';

    try {
      var res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        document.getElementById('sellFormFields').style.display = 'none';
        document.getElementById('sellSuccess').classList.add('show');
      } else {
        throw new Error('Risposta non valida');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Invia richiesta →';
      errBox.classList.add('show');
    }
  }

  var submitBtn = document.getElementById('sellSubmitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitSellForm);
  }
})();
