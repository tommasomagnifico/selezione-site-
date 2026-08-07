# Verifiche manuali e ripristino, fase per fase

Accompagna [CHANGELOG.md](CHANGELOG.md) (cosa è cambiato) e
[FASE-0-DIAGNOSI.md](FASE-0-DIAGNOSI.md) (perché).
Qui c'è cosa devi controllare tu, e come tornare indietro se qualcosa non va.

**Prima di qualsiasi verifica nel browser serve il codice del gate di anteprima:
`SELEZIONE-2026`.** Finché il gate è attivo, ogni pagina rimanda a
`/preview-access.html`, compresi gli strumenti che caricano l'URL dal vivo
(PageSpeed Insights, Rich Results Test su URL, Lighthouse). Per quelli usa
l'opzione "incolla il codice" dove esiste, oppure rimuovi prima il gate.

---

## Reversibilità

Le Fasi 1→6 sono state applicate in blocco su `main`, in due commit, prima che
arrivasse la regola "una fase alla volta". Non ci sono branch per fase: la
reversibilità è garantita dai commit.

| Commit | Contenuto |
|---|---|
| `b0442d2` | Fase 0 — solo il report, nessuna modifica al codice |
| `a8d6a83` | Fasi 1→6 |
| `05dbbcf` | Correzione al `lastmod` dell'indice in `build-sitemap.js` |

**Annullare tutto e tornare al sito com'era prima dell'intervento:**

    git revert --no-commit 05dbbcf a8d6a83
    git commit -m "Annulla le fasi 1-6"

**Ripristinare un singolo file** allo stato precedente all'intervento:

    git checkout a8d6a83^ -- <percorso/del/file>

Esistono anche copie `.bak` in locale dei file toccati, create prima delle
modifiche. Non sono su GitHub di proposito: sono escluse da `.gitignore`, perché
un `.bak` pubblicato verrebbe servito da GitHub Pages. Le trovi accanto agli
originali (`css/style.css.bak`, `js/blog.js.bak`, …).

### Quali file tocca ogni fase

| Fase | File |
|---|---|
| 1 | `js/blog.js`, `blog/index.html` |
| 2 | `blog/_template/article.html` e `README.md` (nuovi), `blog/LEGGIMI.txt` (eliminato), CTA nei 3 articoli |
| 3 | i 3 articoli e `blog/index.html` (title, description, `author.url`) |
| 4 | `build-sitemap.js` (era `tools/genera-sitemap.mjs`), `robots.txt`, `404.html`, `sitemap.xml` |
| 5 | `css/style.css`, `preload` nelle 4 pagine del blog |
| 6 | `vendi.html`, `index.html`, `find-retrofit.js` (nuovo), `css/style.css` |

---

## Fine Fase 1 — indicizzabilità

### 1.1 Quanti articoli sono raggiungibili senza JavaScript

**Strumento.** Chrome → F12 → `Ctrl+Shift+P` → digita "Disable JavaScript" →
Invio. Poi ricarica `/blog/`.

**Cosa fare.** Conta le card visibili e prova a cliccarle.

**Atteso.** Tutte e 3 le card visibili e tutte e 3 cliccabili. La barra dei
filtri **non** deve comparire. Il messaggio "Nessun articolo in questa
categoria" **non** deve comparire. Il bottone "Carica altri articoli" non deve
comparire.

**Se vedi meno di 3 card**, il JavaScript sta inserendo contenuto invece di
nasconderlo: è il problema bloccante. Ripristina `blog/index.html` e
`js/blog.js` e fermati.

**Se compare la barra dei filtri o il messaggio "nessun articolo"** con JS
disattivato, qualcosa è rimasto nell'HTML statico che non dovrebbe esserci.

**Nota.** Con JavaScript disattivato il gate di anteprima non scatta: la pagina
si vede senza inserire il codice. È il modo più veloce per vedere il sito con
gli occhi di un crawler che non esegue script.

### 1.2 Prova definitiva: il sorgente

**Strumento.** `Ctrl+U` su `/blog/` (sorgente, non "Ispeziona"), poi `Ctrl+F`
per `post-card`.

**Atteso.** 3 occorrenze di `<a href="/blog/…/" class="post-card…`, con gli
slug reali.

**Perché conta.** Questo è letteralmente ciò che Googlebot scarica prima di
eseguire qualsiasi script. Se i link ci sono qui, ci sono per Google.

### 1.3 Pagine categoria in `noindex`

**Non applicabile.** I filtri sono solo client-side e non generano URL: non
esiste nessuna pagina categoria da mettere in `noindex`. Il punto 1.2 del brief
prevede esattamente questo caso ("se i filtri sono solo client-side senza URL:
va bene così, non toccarli").

**Come confermarlo.** Clicca un filtro su `/blog/` e guarda la barra degli
indirizzi: l'URL non deve cambiare, deve restare `https://selezioneshop.it/blog/`.

**Se l'URL cambia**, qualcuno ha introdotto la navigazione per categoria e
allora servono i `noindex` sotto i 3 articoli.

### 1.4 Nessun articolo orfano

**Strumento.** Terminale, nella cartella del sito.

**Atteso.** Ogni articolo riceve almeno un link interno. Oggi ne riceve 3:
dall'indice e dai due articoli fratelli. Verificato in fase di diagnosi.

---

## Fine Fase 3 — meta e structured data

### 3.1 Rich Results Test

**Strumento.** <https://search.google.com/test/rich-results> → scheda **Codice**
(non URL: il gate bloccherebbe il test). Apri un articolo, `Ctrl+U`, copia
tutto, incolla.

**Atteso.** Rileva `BlogPosting` e `BreadcrumbList`. Zero errori. Eventuali
avvisi su campi consigliati mancanti sono accettabili.

**Se segnala errori sull'`image`**, è l'SVG: Google lo accetta nei dati
strutturati, ma se il test si lamenta il rimedio è la copertina raster di cui
al punto "og:image" qui sotto.

### 3.2 Le domande dello schema FAQ

**Non applicabile agli articoli.** Nessun articolo ha una sezione "Domande
frequenti" visibile, quindi nessun articolo ha il nodo `FAQPage`. È voluto:
aggiungere lo schema senza le domande in pagina viola le linee guida di Google.

`FAQPage` esiste **solo** su `faq.html`, dove le 5 domande sono visibili e
identiche parola per parola a quelle nello schema.

**Come confermarlo.** `Ctrl+U` su un articolo, `Ctrl+F` per `FAQPage`: zero
occorrenze. Su `faq.html`: una.

**Se un domani aggiungi la sezione FAQ a un articolo**, devi aggiungere anche il
nodo `FAQPage` con le stesse identiche domande. La regola è scritta nel template
e nel README.

### 3.3 `og:type` sugli articoli

**Strumento.** `Ctrl+U` su ciascun articolo, `Ctrl+F` per `og:type`.

**Atteso.** `<meta property="og:type" content="article">` sui 3 articoli.
Su `/blog/` invece deve restare `website`: l'indice non è un articolo.

**Se trovi `website` su un articolo**, Facebook e WhatsApp lo tratteranno come
una pagina qualsiasi e perderai data di pubblicazione e autore nell'anteprima.

### 3.4 Il campo `author`

**Strumento.** `Ctrl+U`, `Ctrl+F` per `"author"`.

**Atteso.**

    "author": {
      "@type": "Person",
      "name": "Tommaso Magnifico",
      "url": "https://selezioneshop.it/chi-siamo.html"
    }

**Da sapere.** Il campo è corretto, ma **`chi-siamo.html` non contiene il tuo
nome in chiaro**: il link porta a una pagina che non dice chi sei. Non l'ho
aggiunto perché è testo di presentazione e lo devi scrivere tu. Finché resta
così, Google segue il link e non trova conferma dell'autore. Dettagli in
[FASE-0-DIAGNOSI.md](FASE-0-DIAGNOSI.md).

### 3.5 Lunghezza di title e description

**Strumento.** Terminale:

    node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const s=fs.readFileSync(f,'utf8');console.log(f,(s.match(/<title>([^<]*)<\/title>/)||[])[1].length,(s.match(/name=\"description\" content=\"([^\"]*)\"/)||[])[1].length)}" blog/index.html blog/*/index.html

**Atteso.** Primo numero ≤ 60, secondo ≤ 155, su tutte e 4 le righe.

---

## Fine Fase 4 — sitemap e robots

Tre controlli, uno per uno.

### 4.1 La sitemap contiene tutti gli articoli

**Strumento.** Browser, `https://selezioneshop.it/sitemap.xml`.

**Atteso.** Si apre come XML e contiene **10 URL**: le 6 pagine principali,
`/blog/` e i 3 articoli. Ogni `<url>` ha il suo `<lastmod>`.
**Non** devono comparire `/404.html`, `/preview-access.html` né
`/blog/_template/`.

**Se manca un articolo**, hai dimenticato di rigenerarla: `node build-sitemap.js`.

**Se compare `/blog/_template/`**, l'esclusione nello script si è rotta.

### 4.2 robots.txt

**Strumento.** Browser, `https://selezioneshop.it/robots.txt`.

**Atteso.** Deve contenere, tra le altre righe:

    Disallow: /blog/_template/
    Sitemap: https://selezioneshop.it/sitemap.xml

e **non** deve contenere `Disallow:` su `/css/`, `/js/` o `/img/`.

**Se blocca CSS o JS**, Google non può renderizzare le pagine e le valuta come
inutilizzabili da mobile.

### 4.3 La 404 personalizzata

**Strumento.** Browser, un URL inventato:
`https://selezioneshop.it/pagina-che-non-esiste`.
Poi ripetilo in sottocartella: `https://selezioneshop.it/blog/non-esiste/`.

**Atteso.** In entrambi i casi la 404 del sito, **con lo stile applicato**
(fondo nero, "404" grande in cobalto) e i link a Home, Vendi, Blog e Negozio.

**Se la pagina esce senza stile**, i percorsi del CSS sono tornati relativi: la
404 va servita a qualsiasi profondità e ha bisogno di percorsi assoluti.

**Se esce la pagina bianca di GitHub**, il file `404.html` non è nella radice
del repository.

**Configurazione hosting.** Non serve fare niente: GitHub Pages serve
automaticamente `404.html` dalla radice per qualsiasi URL inesistente. Non c'è
nessuna impostazione da attivare in un pannello.

---

## Fine Fase 5 — performance e accessibilità

### 5.1 PageSpeed Insights

**Strumento.** <https://pagespeed.web.dev>, quattro esecuzioni separate:
`/blog/` mobile, `/blog/` desktop, un articolo mobile, un articolo desktop.

**Il gate blocca il test**: PageSpeed carica l'URL dal vivo e misurerebbe la
pagina del codice di accesso. Va eseguito **dopo aver rimosso il gate**, oppure
in locale con Lighthouse da DevTools dopo aver inserito il codice.

**Valori attesi.** LCP sotto 2,5s e CLS sotto 0,1 su tutte e quattro.

**Sul confronto prima/dopo che mi hai chiesto: non posso fornirlo.** Misurare
LCP e CLS richiede un browser che renderizzi la pagina, e in questo ambiente non
ce n'è uno. I numeri "prima" avrei dovuto inventarli. Quello che posso dirti è
cosa è cambiato nelle condizioni che li determinano:

| Fattore | Prima | Dopo |
|---|---|---|
| Immagini senza `width`/`height` (causa CLS) | nessuna | nessuna |
| Banner cookie | `position: fixed`, fuori dal flusso: **non causa CLS** | invariato, ma più basso su mobile |
| Risorse render-blocking nell'`<head>` | 3 (`gate.js`, foglio Google Fonts, `style.css`) | 3, con il foglio font a priorità alzata dal `preload` |
| Peso immagini | 1,4–1,6 KB | invariato |

L'LCP delle pagine del blog è la copertina dell'articolo (`loading="eager"`),
oppure l'H1 sull'indice. Il margine di miglioramento vero non è nelle immagini
— pesano già niente — ma nel togliere Google Fonts dal percorso critico
ospitando i font sul dominio. Non l'ho fatto: tocca tutte le pagine e cambia il
comportamento di caricamento del testo. È la prossima cosa da valutare se
PageSpeed segnala il foglio dei font.

### 5.2 Il banner cookie su mobile

**Strumento.** Uno smartphone vero, non l'emulatore. Apri il sito in finestra
privata (o svuota il "sito web dati") così il banner ricompare.

**Atteso.** Il banner occupa **meno di un quinto** dello schermo.

**Da sapere.** La stima da codice diceva ~29% su uno schermo da 640px logici.
Ho ridotto padding, corpo e interlinea sotto i 600px di larghezza, il che
dovrebbe portarlo sotto il 20%, **ma è una stima**: senza un dispositivo reale
non posso dichiararlo verificato. È l'unico punto della Fase 5 che resta aperto.

### 5.3 Contrasto e accessibilità

**Strumento.** Estensione **axe DevTools** o **WAVE**, su `/blog/` e su un
articolo.

**Atteso.** Zero errori di contrasto.

**Cosa è stato fatto.** I grigi del testo erano tarati sul nero puro (4,6:1) ma
scendevano a 4,1:1 sui fondi `#0d0d0d` e `#141414`, dove sta metà delle sezioni.
Ora stanno tra 5,48:1 e 6,58:1 ovunque. Il cobalto di marca `#2E5BFF` su testo
piccolo era a 4,06:1: non l'ho toccato dove si vede di più (titoli, wordmark,
sfondi dei bottoni) e ho introdotto `--cobalt-text` `#5C82FF` per label e link
nel corpo, che sta sopra il 5:1 su tutti i fondi del sito.

### 5.4 Navigazione da tastiera

**Strumento.** Solo `Tab`, `Shift+Tab`, `Invio` e `Esc`. Niente mouse.

**Cosa fare.** Da inizio pagina: attraversa nav, contenuto, footer. Poi apri il
menu mobile (riduci la finestra sotto i 900px) e chiudilo con `Esc`. Infine
raggiungi i due bottoni del banner cookie e premine uno.

**Atteso.** Ogni elemento che ricevi col `Tab` mostra un contorno cobalto
visibile. I link del menu mobile **non** devono essere raggiungibili quando il
menu è chiuso. Il banner cookie si deve poter accettare o rifiutare da tastiera.

### 5.5 Tap target

**Strumento.** DevTools, modalità dispositivo, ispeziona l'elemento e leggi
l'altezza nel riquadro del box model.

**Atteso.** Almeno 44px di altezza su: bottoni `.btn-main` e `.btn-secondary`,
filtri di categoria del blog, i due bottoni del banner cookie.

---

## Fine Fase 6 — collegamenti

### 6.1 Almeno 4 link interni per articolo

**Strumento.** Terminale.

**Atteso.** Ogni articolo: 1 link a `/vendi.html` con anchor descrittiva,
2 ad articoli fratelli, 1 nella CTA con UTM. Totale minimo 4; oggi
`come-vendere-console-usate` ne ha 5, gli altri due 4.

**Verifica che funzionino** cliccandoli: nessuno deve dare 404.

### 6.2 La CTA porta a Vendi con l'UTM giusto

**Strumento.** Browser. Apri un articolo, scorri fino in fondo, clicca
"Richiedi una valutazione".

**Atteso.** La barra degli indirizzi mostra:

    /vendi.html?utm_source=blog&utm_medium=cta&utm_campaign=<slug-dell-articolo>

con lo slug dell'articolo da cui sei partito, non un altro. Accanto al bottone
principale ci deve essere "Scrivimi su WhatsApp" che apre
`wa.me/393315453138`.

**Se `utm_campaign` è uguale su tutti gli articoli**, non potrai distinguere
quale guida porta più richieste: è il motivo per cui il parametro esiste.

**Nota.** In Google Analytics le richieste arrivate dal blog compariranno con
sorgente `blog` e mezzo `cta`. Se non usi Analytics, gli UTM non fanno danno:
restano nell'URL e basta.

### 6.3 Il flusso è bidirezionale

**Strumento.** Browser.

**Atteso.** Da `/vendi.html`, nella colonna di sinistra sotto la sezione sulla
spedizione, il blocco "Prima di scrivermi, se vuoi farti un'idea" con 3 link
agli articoli e "Tutte le guide →". Dalla home, nel testo sotto le card di eBay
e Vinted, due link: uno al blog e uno all'articolo sulla PS4.

### 6.4 I promemoria di collegamento

**Strumento.** Terminale: `node find-retrofit.js`

**Atteso, oggi.** "Nessun link da inserire": tutti gli articoli sono già
collegati fra loro.

**A cosa serve.** Quando pubblichi un articolo che dovrà essere linkato da uno
futuro, lascia nel sorgente:

    <!-- RETROFIT: aggiungere link a [slug-articolo] quando pubblicato -->

Lo script te li elenca con file e riga, così ogni settimana sai quali link ti
mancano. La convenzione è documentata in `blog/_template/README.md`.

---

## Le tre cose che restano aperte

1. **Il gate di anteprima.** Finché `gate.js` è attivo, Googlebot vede un
   redirect al posto di ogni pagina e nessuna di queste verifiche dà il
   risultato reale sul sito pubblicato. Procedura di rimozione in cima a
   `gate.js`.
2. **`og-image.jpg` non esiste.** Serve un'immagine 1200×630 nella radice del
   sito. Finché manca, ogni link condiviso esce senza anteprima.
3. **`chi-siamo.html` non ti nomina.** Il campo `author` dei tuoi articoli punta
   a quella pagina. Basta una riga.
