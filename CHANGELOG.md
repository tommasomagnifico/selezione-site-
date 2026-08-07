# CHANGELOG — intervento strutturale sul blog

Lavoro richiesto da `correzioni.txt`, Fasi 0→6. Data: 2026-08-07.
La diagnosi che ha guidato tutto è in [FASE-0-DIAGNOSI.md](FASE-0-DIAGNOSI.md).

---

## File creati

| File | Perché |
|---|---|
| `FASE-0-DIAGNOSI.md` | Report della Fase 0: stato, problemi e gravità voce per voce, con i numeri misurati sul codice |
| `blog/_template/article.html` | Modello da duplicare a ogni nuovo articolo. Head completo con placeholder `{{...}}`, header e footer identici al resto del sito, breadcrumb, struttura del corpo commentata, blocco CTA con UTM, blocco correlati, JSON-LD completo |
| `blog/_template/README.md` | Procedura di pubblicazione in 8 passi, tabella dei placeholder con i vincoli di lunghezza, regole su categorie, paginazione e retrofit |
| `build-sitemap.js` | Rigenera `sitemap.xml` con `node build-sitemap.js`. Zero dipendenze. Sostituisce `tools/genera-sitemap.mjs` |
| `find-retrofit.js` | Elenca i commenti `<!-- RETROFIT: ... -->` con file e riga, per sapere ogni settimana quali link mancano |
| `CHANGELOG.md` | Questo file |

## File modificati

| File | Cosa è cambiato | Perché |
|---|---|---|
| `js/blog.js` | `PAGE_SIZE` da 6 a **9**; il messaggio "Nessun articolo in questa categoria" non è più letto dal DOM ma **creato al volo**; commento che spiega perché non ci sono URL paginati | Fase 1.1 (9 articoli per pagina) e 1.2 (messaggio condizionale) |
| `blog/index.html` | Tolto il `<p class="blog-empty">` statico; `<title>` da 65 a 56 caratteri; description da 182 a 132; `preload` del foglio font; CTA con UTM e secondo bottone WhatsApp | Fasi 1.2, 3.1, 5.2, 2.3 |
| `blog/come-vendere-console-usate/index.html` | description da 160 a 137 caratteri; `author.url`; `preload`; CTA con UTM + WhatsApp | Fasi 3.1, 3.2, 5.2, 2.3 |
| `blog/guida-carte-pokemon-sealed/index.html` | `<title>` da 62 a 54 caratteri; description da 156 a 123; `author.url`; `preload`; CTA con UTM + WhatsApp | idem |
| `blog/quanto-vale-la-tua-ps4/index.html` | description da 160 a 139 caratteri; `author.url`; `preload`; CTA con UTM + WhatsApp | idem |
| `css/style.css` | `--muted` `#767676`→`#8C8C8C`, `--muted2` `#777`→`#909090`, nuova `--cobalt-text: #5C82FF` applicata a 17 selettori di testo piccolo; `min-height: 44px` su `.btn-main`, `.btn-secondary`, `.blog-filter`, `.cookie-btn`; banner cookie più compatto sotto i 600px; nuovi blocchi `.sell-guides` e `.error-page .error-links` | Fase 5.3 (contrasto e tap target), 5.2 (banner), 6.1, 4.4 |
| `robots.txt` | Aggiunto `Disallow: /blog/_template/` | Fase 4.3 |
| `404.html` | Corpo con link a Home, Vendi, Blog e Negozio invece del solo "Torna alla home" | Fase 4.4 |
| `index.html` | Nel `.channels-note` due link contestuali al blog dentro `<main>` | Fase 6.2 |
| `vendi.html` | Nuovo blocco "Guide utili" con 3 link ad articoli e anchor descrittive, più link a `/blog/` | Fase 6.1 |
| `sitemap.xml` | Rigenerata con `build-sitemap.js` | Fase 4.1 |
| `.gitignore` | Aggiunto `*.bak` | I backup della regola 5 restano in locale |

## File eliminati

| File | Backup | Perché |
|---|---|---|
| `tools/genera-sitemap.mjs` | `tools/genera-sitemap.mjs.bak` (locale) | Sostituito da `build-sitemap.js` alla radice, come chiede il punto 4.2. Tenerli entrambi avrebbe creato due sorgenti della stessa sitemap |
| `blog/LEGGIMI.txt` | `blog/LEGGIMI.txt.bak` (locale) | Sostituito da `blog/_template/README.md`, che copre tutto quello che c'era dentro e in più il template. Due procedure sullo stesso argomento sarebbero divergute |

I `.bak` esistono in locale ma non vengono committati: su un repo git la cronologia
è già il backup vero, e un `.bak` pubblicato verrebbe servito da GitHub Pages.

---

## Scelte implementative dove esistevano alternative

**1. Paginazione: nessun URL `/blog/page/2/`.**
Il punto 1.1 offre esplicitamente un'alternativa — "mantieni tutti i link degli
articoli presenti nell'HTML statico e usa il JS solo per nascondere/mostrare" —
e il sito era già così. Ho preso quella strada e ho solo allineato `PAGE_SIZE` a 9.
Motivo: con 3 articoli le pagine 2+ non esisterebbero, e a 15 articoli tutti i
link restano comunque nell'HTML statico, quindi Googlebot li raggiunge tutti da
`/blog/` senza eseguire niente. Le pagine reali diventano utili oltre la ventina
di articoli: la procedura per aggiungerle è scritta in `blog/_template/README.md`.
Il JS nasconde elementi **già nel DOM**, non ne inserisce — il vincolo del punto
1.1 è rispettato.

**2. Fase 2.5: template applicato senza risposta diretta e senza FAQ.**
Il template prevede un "blocco risposta diretta 45-55 parole" e una sezione
"H2 Domande frequenti", ma le regole vietano di modificare i contenuti degli
articoli e di inventare. Ho applicato **solo struttura, meta, schema, CTA e
correlati**, come dice la stessa riga 2.5, e non ho scritto una parola nuova nel
corpo dei tre articoli. I tre `.article-standfirst` esistenti già svolgono il
ruolo del blocco di risposta diretta.

**3. `BlogPosting` invece di `Article` nel JSON-LD.**
Il punto 3.2 scrive `"@type": "Article"`. Ho tenuto `BlogPosting`, che è un
sottotipo di `Article` e per Google vale identico, ma dice a un parser che si
tratta di un articolo di blog. Ho tenuto anche il riferimento `@id`
all'`Organization` invece di ripetere i dati del publisher per esteso: così
P.IVA, telefono e canali social stanno scritti in un posto solo. Tutti i campi
che elenchi (headline, description, image, datePublished, dateModified, author
con `url`, publisher, mainEntityOfPage) ci sono.

**4. Nuova variabile `--cobalt-text` invece di cambiare il cobalto.**
La regola 4 dice di non cambiare la palette, il punto 5.3 chiede 4.5:1. Il
cobalto di marca `#2E5BFF` su nero sta a 4,06:1. Invece di toccarlo ho aggiunto
`--cobalt-text: #5C82FF` e l'ho applicata **solo al testo piccolo** (label, tag,
link nel corpo). Titoli, wordmark, bordi, sfondi dei bottoni e l'icona del form
restano sul cobalto originale: il colore di marca non cambia dove si vede di più.

**5. Grigi alzati, non ridisegnati.**
`--muted` e `--muted2` erano tarati sul nero puro. Li ho alzati del minimo
necessario perché superino 4.5:1 anche su `--black3` (`#141414`), il fondo più
chiaro che il sito usa. Da 4,28:1 a 5,48:1 e da 4,34:1 a 5,77:1.

**6. Copertine lasciate in SVG.**
Vedi "Cosa non ho fatto", punto 1.

**7. Preload del foglio di stile, non self-hosting dei font.**
Il punto 5.2 chiede il preload del font principale. Con Google Fonts l'URL del
`.woff2` cambia nel tempo, quindi un `preload` diretto del file si romperebbe da
solo. Ho messo `<link rel="preload" as="style">` sullo stesso URL del foglio già
richiesto: il browser lo dedùplica e alza la priorità, senza doppio scaricamento.
Il self-hosting dei tre font in `/fonts/` sarebbe la soluzione migliore — toglie
del tutto la dipendenza esterna dal percorso critico — ma tocca tutte le pagine
e non è una modifica che ha senso fare senza il tuo ok.

**8. Retrofit su file dedicato, non commenti già piantati.**
Il punto 6.4 chiede di "predisporre il supporto" ai commenti
`<!-- RETROFIT: ... -->` e uno script che li elenchi. Ho creato lo script e
documentato la convenzione, ma **non ho lasciato commenti RETROFIT nel sorgente**:
oggi non ce n'è motivo (tutti gli articoli sono già collegati fra loro) e
l'istruzione con cui mi hai lanciato il lavoro dice che non devono restare
commenti di lavoro nei file modificati. `node find-retrofit.js` oggi risponde
"nessun link da inserire"; appena ne scrivi uno lo trova.

---

## Cosa non ho fatto, e perché

**1. Non ho convertito le copertine in WebP (punto 5.1).**
Sono SVG vettoriali da 1,4–1,6 KB. Il WebP le renderebbe **più pesanti** (i WebP
delle card categoria pesano 6–11 KB) e meno nitide sugli schermi ad alta densità:
sarebbe un peggioramento misurabile su entrambi i fronti che il punto 5.1 vuole
migliorare. Restano dentro il target dei 150 KB con due ordini di grandezza di
margine, hanno `width`/`height`, `loading` corretto e `alt` sotto i 125 caratteri.
L'unico posto dove l'SVG davvero non funziona è `og:image`, perché i crawler
social non lo renderizzano — vedi il punto 2 qui sotto.

**2. Non ho creato le `og:image` per articolo (punto 3.1).**
Servono tre immagini raster 1200×630 e su questa macchina non c'è nessuno
strumento per generarle (niente ImageMagick, niente PIL, niente encoder WebP), e
installarne uno violerebbe il vincolo sulle dipendenze. Il punto 3.1 prevede
questo caso: "se non disponibile, usa il fallback attuale ma lascia il
placeholder pronto". Il fallback è `https://selezioneshop.it/og-image.jpg` e il
placeholder `{{OG_IMAGE}}` è nel template, documentato nel README.
**Attenzione: `og-image.jpg` non esiste**, quindi oggi tutte le anteprime social
del sito escono senza immagine. È la cosa più veloce da sistemare che hai in mano.

**3. Non ho fatto nulla sul gate di anteprima.**
`gate.js` manda Googlebot su `preview-access.html` da ogni pagina. Finché resta
attivo, tutto il lavoro di questo intervento non produce alcun effetto sui motori
di ricerca. Non l'ho toccato perché è una tua scelta e non rientra in nessuna
fase, ma è il primo prerequisito del go-live.

**4. Non ho aggiunto `noindex` a pagine paginate o di categoria (punti 1.2 e 4.1).**
Non esistono: i filtri sono solo client-side e non generano URL. Il punto 1.2
prevede esattamente questo caso — "se i filtri sono solo client-side senza URL:
va bene così, non toccarli". `build-sitemap.js` è comunque già pronto a escludere
qualsiasi pagina in `noindex`, se un domani ne nascessero.

**5. Non ho toccato il copy della logistica in `vendi.html`.**
Il segnaposto `<!-- COPY DA INSERIRE -->` sotto "Spedizione in tutta Italia o
ritiro a Roma" aspetta un testo tuo da luglio. Non è materia di queste fasi e
inventarlo sarebbe contro le regole.

**6. Non ho verificato l'ingombro reale del banner cookie su un dispositivo.**
La stima da codice diceva ~29% di uno schermo da 640px logici. Ho ridotto
padding, corpo e interlinea sotto i 600px, il che dovrebbe portarlo sotto il 20%,
ma è una stima: senza aprire il sito su un telefono vero non posso dichiararlo
verificato.

**7. Non ho configurato la 404 sull'hosting (punto 4.4).**
Non serve: GitHub Pages serve automaticamente `404.html` dalla radice per
qualsiasi URL inesistente, a qualsiasi profondità. Non c'è niente da impostare
in un pannello. È già attivo.

---

## Checklist di verifica manuale

Da fare nell'ordine. Prima di tutto serve il codice del gate: `SELEZIONE-2026`.

### In locale, da terminale

1. `node build-sitemap.js` → deve stampare **10 URL** e, in fondo,
   `saltate: 404.html (noindex), preview-access.html (noindex)`. Se compare
   `blog/_template` qualcosa non va.
2. `node find-retrofit.js` → oggi deve dire "nessun link da inserire".
3. Cerca i placeholder rimasti: `grep -rn "{{" --include=*.html . | grep -v _template`
   → non deve restituire niente.

### Nel browser, sul sito

4. **`/blog/`** — devono comparire 3 card e la barra dei filtri con
   Tutti / Vendere / Collezionismo / Valutazioni. Clicca una categoria: resta
   una card sola. Il bottone "Carica altri" non deve comparire (3 < 9).
5. **Disattiva JavaScript** (DevTools → Command Palette → "Disable JavaScript")
   e ricarica `/blog/`: le 3 card devono restare tutte visibili, la barra dei
   filtri sparire e **non** deve comparire il messaggio "Nessun articolo".
   Nota: con JS disattivato il gate non scatta, quindi la pagina si vede.
6. **Tasto destro → Visualizza sorgente** su `/blog/`: cerca `post-card`.
   Devono esserci 3 `<a href="/blog/...">` reali. È la prova che Googlebot li
   vede senza eseguire nulla.
7. **CTA di un articolo** — il bottone "Richiedi una valutazione" deve portare a
   `/vendi.html?utm_source=blog&utm_medium=cta&utm_campaign=<slug>`; accanto deve
   esserci "Scrivimi su WhatsApp".
8. **`/vendi.html`** — sotto la logistica deve esserci il blocco "Prima di
   scrivermi, se vuoi farti un'idea" con i 3 link agli articoli.
9. **Una pagina inesistente**, es. `/blog/non-esiste/` — deve uscire la 404
   **con lo stile applicato** e i link a Home, Vendi, Blog e Negozio.

### Con strumenti esterni

10. **Rich Results Test** (`search.google.com/test/rich-results`) — incolla il
    sorgente di un articolo: deve riconoscere `BlogPosting` e `BreadcrumbList`
    senza errori. L'URL diretto non funziona finché c'è il gate: usa "Codice".
11. **Validator dello schema** (`validator.schema.org`) — stesso sorgente,
    zero errori e zero warning bloccanti.
12. **Lighthouse** (DevTools → Lighthouse, modalità mobile) su un articolo:
    guarda Accessibilità e Prestazioni. Il contrasto ora deve passare.
    Nota: finché il gate è attivo Lighthouse misura la pagina del gate, non
    l'articolo — va eseguito dopo aver inserito il codice, oppure a gate rimosso.
13. **Banner cookie su telefono vero** — apri il sito su uno smartphone, svuota
    lo storage e controlla che il banner occupi meno di un quinto dello schermo.
    È l'unico punto che non ho potuto verificare da qui.
14. **WAVE** o **axe DevTools** su `/blog/` e su un articolo: zero errori di
    contrasto.

### Dopo il go-live (gate rimosso)

15. **Search Console** → Controllo URL su un articolo: "L'URL è su Google" e
    nella scheda "Pagina sottoposta a rendering" deve vedersi l'articolo, non il
    gate.
16. Invia `https://selezioneshop.it/sitemap.xml` in Search Console e controlla
    che risultino 10 URL leggibili.
