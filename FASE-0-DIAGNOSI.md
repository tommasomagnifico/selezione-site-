# Fase 0 — Diagnosi del blog

Report richiesto da `correzioni.txt`. **Nessuna modifica al codice**: la Fase 0
dice di fermarsi qui e aspettare il tuo ok.

Dati misurati sul codice, non stimati, salvo dove scritto esplicitamente.
Data della rilevazione: 2026-08-07 · commit `5c7a43d`.

---

## Prima di tutto: il gate di anteprima annulla l'intero lavoro SEO

**Stato attuale.** Ogni pagina carica `/gate.js` come primo script dell'`<head>`.
Se in `localStorage` manca il token, lo script fa `location.replace('/preview-access.html')`.

**Problema.** Googlebot esegue il JavaScript e non ha `localStorage` con il token:
vede un redirect al posto del contenuto, su **tutte le 11 pagine**. Finché il gate
è attivo, indicizzabilità, sitemap, structured data e link interni non producono
alcun effetto. È il presupposto di tutte le fasi successive, non un dettaglio.

**Gravità: bloccante** — ma è una scelta tua e voluta, quindi la segnalo e basta.
Va tolto prima o contestualmente alla pubblicazione (procedura in cima a `gate.js`).

---

## Architettura blog

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| Generazione indice `/blog/` | **HTML statico.** 3 `<a href>` reali nel sorgente, uno per articolo, con `data-category` | Nessuno | — |
| "Carica altri articoli" | **Solo JavaScript**, nessun URL. `js/blog.js` fa `style.display = 'none'` sulle card oltre `PAGE_SIZE = 6`. Non tocca `history` né `location` | Nessun URL paginato esiste. Oggi è innocuo (3 articoli < 6: il bottone non compare mai). A 15 articoli servirebbero 15 `<a>` nel sorgente — Google li vedrebbe comunque, ma l'utente senza JS scorrerebbe una lista lunga | minore oggi, **importante** oltre i ~20 articoli |
| Articoli nell'HTML statico prima del JS | **3 su 3.** Il JS nasconde elementi già presenti nel DOM, non ne inserisce | Nessuno. È già la "alternativa accettabile" descritta al punto 1.1 di `correzioni.txt` | — |

## Filtri categoria

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| URL propri | **No.** Filtro puramente client-side. I bottoni sono creati da `js/blog.js` leggendo i `data-category`; nessuna pagina `/blog/categoria/...` esiste | Nessuno ai fini SEO: niente URL = niente contenuto duplicato, niente da mettere in noindex. Rientra nel caso "va bene così, non toccarli" del punto 1.2 | — |
| Indicizzabilità / canonical propri | Non applicabile | — | — |
| Messaggio "Nessun articolo in questa categoria" | **Sempre presente nel DOM** (`<p class="blog-empty" id="blogEmpty">`), nascosto con `display:none` e mostrato dal JS | È testo nel sorgente che non corrisponde a nulla di visibile. Il punto 1.2 chiede di renderlo condizionale | minore |
| Distribuzione categorie | Vendere 1 · Collezionismo 1 · Valutazioni 1 | Con la regola "una categoria esiste per Google solo con ≥3 articoli", oggi nessuna categoria la soddisfa. Irrilevante finché non esistono URL di categoria | — |

## Meta e structured data

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| Meta propri per articolo | **Sì, tutti.** `title`, `description`, `canonical` self-referencing, `og:*` e `twitter:*` specifici. Nessuna ereditarietà | Nessuno | — |
| Lunghezza `title` | come-vendere 55 · ps4 45 · pokemon **62** · /blog/ **65** | Due superano i 60 caratteri chiesti al punto 3.1 | minore |
| Lunghezza `description` | 160 · 160 · 156 · **182** (indice) | Tutte e quattro superano i 155 caratteri chiesti | minore |
| `og:type` | `article` sui 3 articoli, `website` su `/blog/` e sulle pagine principali | Corretto | — |
| `og:image` | **La stessa per tutte le pagine**: `https://selezioneshop.it/og-image.jpg` | Duplicata *e* **il file non esiste**: ogni condivisione su WhatsApp, Facebook o X esce senza immagine | **importante** |
| JSON-LD articoli | `Organization` + `BreadcrumbList` + `BlogPosting` (sottotipo di `Article`), con headline, description, datePublished, dateModified, image, author, publisher, mainEntityOfPage, isPartOf | Manca solo `author.url` verso `/chi-siamo.html`, richiesto al punto 3.2 | minore |
| JSON-LD indice | `Organization` + `BreadcrumbList` + `Blog` con array `blogPost` | Conforme al punto 3.3 | — |
| `Organization` + `LocalBusiness` (punto 3.4) | `Organization` su tutte le pagine. `LocalBusiness` con indirizzo Roma IT-RM, telefono e `vatID` su **`index.html` e `vendi.html`** | Presente. Nessun intervento richiesto | — |
| Autore reale (punto 3.5) | **`Tommaso Magnifico`**, già nei meta `author`, nella byline visibile e nel JSON-LD. È il nome del titolare, presente anche in `legale.html` | Nessun placeholder da lasciare | — |
| Schema senza riscontro in pagina | Nessuno. `FAQPage` esiste solo su `faq.html`, dove le domande sono visibili e identiche parola per parola | Nessuno | — |

## SEO tecnica

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| `sitemap.xml` | Esiste. **10 URL**, tutti con `lastmod`. Include `/blog/` e i 3 articoli | Nessuno | — |
| Generazione sitemap | `tools/genera-sitemap.mjs`, Node puro senza dipendenze. Legge i canonical, salta le `noindex`, prende `lastmod` dal `dateModified` del JSON-LD | Il punto 4.2 chiede `node build-sitemap.js` nella root: stessa funzione, nome e percorso diversi | minore |
| `robots.txt` | Esiste. `Allow: /` più `Allow:` espliciti per `/css/`, `/js/`, `/img/`. Contiene `Sitemap: https://selezioneshop.it/sitemap.xml` | Non blocca nulla di necessario al rendering. Manca solo il `Disallow: /blog/_template/` chiesto al 4.3, ma quella cartella non esiste ancora | — |
| Pagina 404 | **Esiste**, `404.html`, tono del sito, `noindex`, percorsi root-absolute. GitHub Pages la serve già in automatico a qualsiasi profondità | Ha il link alla Home ma **non** a Blog, Negozio e Vendi nel corpo (solo in nav e footer) | minore |
| Pagine orfane | `404.html` e `preview-access.html` non ricevono link interni | Corretto per entrambe: la prima la serve l'hosting, la seconda è il gate. **Nessun articolo è orfano**: ognuno riceve 3 link interni (indice + i due fratelli) | — |

## Template e ripetibilità

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| Struttura dei 3 articoli | **File indipendenti scritti a mano**, ~300 righe l'uno. **157 righe non banali sono identiche in tutti e tre** (head, nav, menu mobile, footer, cookie banner, CTA): circa metà di ogni file è boilerplate copiato | Ogni nuovo articolo va ricopiato a mano; una modifica al footer va replicata su N file. A 15 articoli diventa la voce di costo principale | **importante** |
| Meccanismo di include/partial | **Nessuno.** Nessun build tool, per vincolo di progetto | Senza build step non esistono partial veri in HTML statico. Le opzioni realistiche sono: template da duplicare (quello che chiede la Fase 2), oppure iniezione JS di header/footer — che però li renderebbe invisibili a chi non esegue JS | — |
| `blog/_template/` | Assente | Da creare in Fase 2 | — |
| Procedura di pubblicazione | Esiste già in `blog/LEGGIMI.txt` (8 passi) | Va sostituita o assorbita dal `README.md` chiesto al punto 2.2 | minore |

## Performance e accessibilità

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| Formato e peso immagini blog | **SVG vettoriali, 1,4–1,6 KB** l'una | Nessun problema di peso: sono ~100 volte sotto il target di 150 KB. Il punto 5.1 chiede WebP, che qui sarebbe **più pesante e meno nitido** (i WebP delle card categoria pesano 6–11 KB). Da decidere insieme | — (vedi domanda 5) |
| `width`/`height` dichiarati | **Sì su tutte** (1200×630) | Nessuno: niente CLS dalle immagini | — |
| `loading` | `eager` sulla copertina above-the-fold di ogni articolo, `lazy` su tutte le altre | Esattamente quanto chiede il 5.1 | — |
| `alt` | 59–101 caratteri, tutti descrittivi, tutti sotto i 125 | Nessuno | — |
| Render-blocking nell'`<head>` | Tre risorse: **`gate.js` (sincrono)**, il CSS di Google Fonts, `css/style.css` | `gate.js` sparisce al go-live. Il CSS proprio è una richiesta sola e piccola. Il foglio Google Fonts è l'unica dipendenza esterna sul percorso critico | importante |
| Preload del font | **Assente** | Chiesto al 5.2. Con Google Fonts l'URL del `.woff2` cambia nel tempo, quindi le strade sono più d'una | — (vedi domanda 6) |
| Gerarchia heading | **Un solo H1 per pagina, zero salti di livello su tutte e 12 le pagine** (verificato) | Nessuno | — |
| `:focus-visible` | Presente su `a`, `button`, `input`, `select`, `textarea`, `label`, `summary`, `[tabindex]`: outline cobalto 2px con offset | Nessuno | — |
| Tap target 44×44 | `.to-top` 46px ✓ · voci menu mobile ~46px ✓ · `.form-submit` ~45px ✓ · **`.btn-main` ~42px** · **`.cookie-btn` ~35px** · **`.blog-filter` ~33px** | Tre elementi sotto la soglia che hai indicato. (Nota: i 44px sono WCAG AAA; il minimo AA della 2.2 è 24×24, che è rispettato ovunque) | minore |
| Contrasto testo | offwhite su nero **19,95:1** ✓ · `--muted`/`--muted2` su nero **4,62 / 4,69:1** ✓ · gli stessi grigi **su `--black2` 4,28 / 4,34:1** e **su `--black3` 4,06 / 4,11:1** ✗ · cobalto su nero **4,06:1** ✗ | I grigi sono stati tarati su fondo nero puro, ma le sezioni `.categories`, `.cta-band`, `.related`, `.post-card` e il cookie banner hanno fondo `#0d0d0d`, e l'hover delle card `#141414`. Lì il testo secondario scende sotto 4.5:1. Il cobalto su nero è a 4,06:1: sotto soglia per il testo normale, a norma per il testo grande | **importante** |
| Banner cookie: layout shift | `position: fixed`, fuori dal flusso: **non causa CLS**. Su visita di ritorno viene nascosto da `js/main.js` (`defer`), quindi può comparire per un istante prima di sparire | Lampeggio, non spostamento | minore |
| Banner cookie: ingombro su mobile | **Stima, non misura**: a 360px di larghezza il paragrafo occupa ~5 righe → altezza totale ~185px. Su uno schermo da 640px logici è **~29%**, su uno da 780px **~24%** | Sopra il 20% che indichi al 5.2. Da confermare su dispositivo reale prima di intervenire | importante (da verificare) |
| Navigazione da tastiera | Menu mobile: `visibility:hidden` da chiuso, quindi i link escono dal tab order ✓. Esc chiude il menu ✓. Banner cookie: due `<button>` veri, raggiungibili e attivabili da tastiera ✓ | Il banner non intrappola il focus né lo sposta all'apertura, ma non è un dialog modale: è accettabile | — |

## Collegamento al resto del sito (rilevato ora, interviene la Fase 6)

| Voce | Stato attuale | Problema | Gravità |
|---|---|---|---|
| Link contestuali a `/blog/` | **Zero dentro `<main>`** sia in `index.html` sia in `vendi.html`. Il blog è raggiungibile solo da nav e footer | Chiesto ai punti 6.1 e 6.2 | importante |
| Link interni per articolo | 3 in uscita verso altri articoli/indice + 2–3 verso `/vendi.html`, `/negozio.html`, `/faq.html` | Il minimo di 4 del punto 6.3 è già raggiunto, ma **manca la CTA con UTM** | minore |
| `find-retrofit.js` | Assente | Da creare in Fase 6 | — |

---

## Riepilogo per gravità

**Bloccante**
1. Il gate di anteprima nasconde il sito a Googlebot. Ogni intervento SEO resta inerte finché è attivo.

**Importante**
2. `og-image.jpg` non esiste: tutte le anteprime social sono senza immagine, e l'immagine è comunque la stessa per ogni pagina.
3. Metà di ogni articolo è boilerplate duplicato: pubblicare il 12° costerà quanto il 4° solo se si introduce il template.
4. Testo secondario sotto 4.5:1 sui fondi `#0d0d0d` e `#141414`, e cobalto su nero a 4,06:1.
5. Nessun link contestuale al blog dal corpo di home e pagina Vendi.
6. Google Fonts sul percorso critico di rendering.
7. Ingombro del banner cookie su mobile oltre il 20% (stima da confermare).

**Minore**
8. `title` e `description` oltre i limiti su 4 pagine del blog.
9. Messaggio "Nessun articolo in questa categoria" sempre nel DOM.
10. Manca `author.url` nel JSON-LD degli articoli.
11. Lo script sitemap si chiama diversamente da quanto chiesto.
12. La 404 non linka Blog, Negozio e Vendi nel corpo.
13. Tre tipi di bottone sotto i 44px di altezza.

**Nessun problema**
Indice generato staticamente · articoli tutti nell'HTML · nessuna pagina orfana ·
canonical, `og:type` e JSON-LD corretti su ogni articolo · `Organization` e
`LocalBusiness` presenti · autore reale già valorizzato · sitemap completa con
`lastmod` · robots.txt corretto · 404 personalizzata esistente · immagini leggere
con dimensioni dichiarate e `alt` descrittivi · gerarchia heading senza salti ·
`:focus-visible` su tutti gli interattivi · nessuno schema senza riscontro in pagina.

---

## Domande a cui devo rispondere prima di procedere

La regola 6 dice di fermarmi quando esiste più di una strada valida. Sono sette.

**1. Paginazione (punto 1.1).** Oggi siamo già nella "alternativa accettabile":
tutti i link nell'HTML statico, il JS nasconde e mostra. Costruisco comunque
`/blog/page/2/` con 9 articoli per pagina, oppure resto così e ne riparliamo
al 15° articolo? Le pagine reali sono più lavoro per articolo (vanno rigenerate
a ogni pubblicazione) e, se le metti in `noindex` come chiedi, servono soprattutto
all'utente, non a Google.

**2. Fase 2.5, il conflitto più serio.** Il template prevede un "blocco risposta
diretta 45-55 parole" e una sezione "H2 Domande frequenti". Applicarlo ai 3
articoli esistenti significa **scrivere testo nuovo**, ma le regole dicono di non
modificare i contenuti e di non inventare niente. Tre strade: (a) applico solo
struttura, meta, schema, CTA e correlati e lascio gli articoli senza risposta
diretta e senza FAQ; (b) scrivo io quei blocchi e me li rivedi prima del commit;
(c) li scrivi tu e io li inserisco. Io farei la (a) ora e la (c) quando hai tempo.

**3. Forma del JSON-LD (punto 3.2).** Il tuo schema usa `Article` e ripete
`publisher` per esteso. Il sito usa `BlogPosting` — che *è* un `Article` per
Google — e punta all'`Organization` con un `@id`, così i dati dell'attività
stanno scritti in un posto solo. Allineo alla lettera del tuo schema o tengo
l'impianto attuale aggiungendo solo `author.url`?

**4. Nome dello script sitemap (punto 4.2).** Esiste già
`tools/genera-sitemap.mjs` che fa esattamente quello. Lo rinomino in
`build-sitemap.js` nella root come chiedi, oppure tengo il nome attuale e lo
documento nel README? Rinominarlo va bene, ma è un file in più nella root.

**5. Immagini in WebP (punto 5.1).** Le copertine sono SVG vettoriali da 1,4 KB.
Convertirle in WebP le renderebbe **più pesanti** (6–11 KB) e meno nitide sugli
schermi ad alta densità: sarebbe un peggioramento. L'unico motivo reale per avere
un raster è `og:image`, che l'SVG non copre perché i crawler social non lo
renderizzano. Proposta: tengo l'SVG in pagina e genero **in più** un JPG o WebP
1200×630 per articolo da usare solo come `og:image`. Confermi?

**6. Preload del font (punto 5.2).** Con Google Fonts l'URL del `.woff2` cambia
nel tempo, quindi un `preload` diretto si rompe da solo. Le strade sono:
(a) `preload` del foglio di stile con swap `onload`, (b) self-hosting dei tre
font nella cartella `/fonts/`, che toglie del tutto la dipendenza esterna dal
percorso critico. La (b) è la soluzione buona ma tocca tutte le pagine e la
cartella del progetto. Quale?

**7. Commenti RETROFIT (punto 6.4) contro la regola dei TODO.** Mi chiedi di
lasciare nei file commenti `<!-- RETROFIT: ... -->`, ma l'istruzione con cui mi
lanci il lavoro dice che non devono restare commenti di lavoro nei file
modificati. Sono in contraddizione. Alternativa: tengo l'elenco dei link da
inserire in un file dedicato (`blog/RETROFIT.md`) e `find-retrofit.js` legge
quello — stessa funzione, niente commenti sparsi nel sorgente. Va bene?

---

## Cosa serve da te

Un ok sul report e le risposte alle sette domande. Poi procedo con le Fasi 1→6
nell'ordine, con backup `.bak` prima di ogni modifica distruttiva come da regola 5,
e chiudo con il `CHANGELOG.md` richiesto.
