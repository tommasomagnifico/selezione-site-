# CHANGELOG

- [Google Analytics 4](#google-analytics-4) — 2026-08-07
- [Intervento strutturale sul blog](#intervento-strutturale-sul-blog) — 2026-08-07

---

# Google Analytics 4

Installazione con Consent Mode v2, eventi di conversione e informativa.
ID misurazione: `G-TSMYGTDLV7`.

## Diagnosi di partenza (Fase A)

1. **Nessun tag preesistente.** Nessun analytics, nessun GTM, nessun pixel su
   nessuna delle 12 pagine. Via libera all'installazione, nessun conflitto.
2. **Banner cookie**: implementato in `js/main.js`, memorizza la scelta in
   `localStorage` alla chiave `cookieConsent` con valore `all` o `necessary`.
   È un **accetta/rifiuta secco**, senza categorie. **Non esponeva nessun evento
   né callback**: l'aggancio è stato creato in questa fase.
3. **`legale.html`** conteneva già una cookie policy con la frase "se in futuro
   verranno attivati strumenti statistici… saranno elencati qui". Quel futuro è
   arrivato: la voce ora c'è.
4. **Nessun `<head>` condiviso.** Ogni pagina ha il proprio, autonomo: il tag va
   inserito 12 volte e resta 12 volte da mantenere. È il costo del sito statico
   senza build step.
5. **UTM su link interni**: presenti su 5 file (i 3 articoli, l'indice del blog
   e il template). Erano stati aggiunti nella tornata precedente. **Rimossi**,
   vedi punto D.1.

## File creati

| File | Perché |
|---|---|
| `js/analytics.js` | Tutta la logica degli eventi in un file solo, come chiede il punto D.7. Un listener delegato per i click, un ascoltatore per l'evento del form, uno scroll listener per la lettura profonda. Nessun `onclick` sparso nell'HTML |

## File modificati

| File | Cosa è cambiato | Fase |
|---|---|---|
| 12 pagine HTML (`index`, `negozio`, `vendi`, `chi-siamo`, `faq`, `legale`, `404`, `/blog/`, i 3 articoli, `_template/article.html`) | Blocco Consent Mode v2 con tutti i consensi negati, seguito da `gtag.js` e dalla `config`, subito dopo il `<meta viewport>` e **prima di ogni altro script**, `gate.js` compreso. Aggiunto `js/analytics.js` in fondo, accanto a `main.js` | B.1, B.2, B.3, D.7 |
| i 3 articoli + `/blog/` + template | Rimossi i parametri `utm_` dai link interni verso `vendi.html` | D.1 |
| `js/main.js` | `gtag('consent','update')` su "Accetta"; comando **"Gestisci cookie"** inserito nella riga legale del footer, che revoca il consenso, riporta `analytics_storage` a `denied`, cancella i cookie `_ga` già presenti e rimostra il banner | C.1, C.2, C.4, C.5 |
| `js/form.js` | Dopo l'apertura di WhatsApp emette `selezione:lead`, l'evento che `analytics.js` traduce in `generate_lead` | D.4 |
| `css/style.css` | Classe `.footer-link-btn`: un `<button>` vero travestito da link, per non spezzare la riga legale del footer | C.5 |
| `legale.html` | Voce Google Analytics 4 nella cookie policy: finalità, titolare, base giuridica, anonimizzazione IP, modalità di revoca con riferimento al comando del footer | E.1, E.2 |
| `blog/_template/README.md` | Documentato il tag ereditato dal template e il divieto di UTM sui link interni | B.3 |
| `VERIFICHE.md` | Aggiornata la verifica 6.2: la CTA ora deve portare a `/vendi.html` pulito | D.1 |

## Scelte implementative dove esistevano alternative

**1. Il tag va prima di `gate.js`.** Il punto B.1 dice "subito dopo il `<head>`,
prima di qualsiasi altro script". `gate.js` era il primo script della pagina.
Ho messo il blocco Analytics prima di lui, rispettando la lettera del requisito.
Unica deviazione: `<meta charset>` e `<meta viewport>` restano in testa, perché
il charset deve stare nei primi 1024 byte del documento — spostarlo dopo uno
script di venti righe è il modo classico di rompere gli accenti.
Conseguenza minore: finché il gate è attivo, le pagine da cui si viene
rediretti caricano comunque `gtag.js`. Con il consenso negato non scrive nulla,
e il gate è temporaneo.

**2. Il comando di revoca è creato da JavaScript, non scritto nelle 12 pagine.**
Revocare un consenso richiede JavaScript: un comando che compare solo se il
JavaScript c'è è coerente con quello che fa. In più non può disallinearsi tra
le pagine, e chi naviga senza JavaScript non ha cookie da revocare. È un
`<button>` vero, non un finto link, quindi raggiungibile da tastiera e
annunciato correttamente dagli screen reader.

**3. L'update del consenso "già dato" sta in `analytics.js`, non nell'`<head>`.**
Il punto C.3 chiede di eseguirlo al caricamento di ogni pagina. Metterlo inline
nell'head sarebbe stato qualche millisecondo più rapido, ma avrebbe richiesto di
modificare il blocco che mi hai dato alla lettera. Il parametro
`wait_for_update: 500` esiste esattamente per questo: `gtag.js` aspetta mezzo
secondo un eventuale aggiornamento prima di inviare la prima pageview, e uno
script `defer` gira ben dentro quella finestra.

**4. L'evento del form passa da un evento personalizzato.** Ascoltare il
`submit` avrebbe registrato un lead anche quando la validazione fallisce.
`js/form.js` emette `selezione:lead` solo dopo che i controlli sono passati e la
richiesta è partita davvero. Il dettaglio dell'evento contiene solo
`{metodo: 'form_vendi'}`: nessun nome, nessun numero, nessuna email, nessun
testo del messaggio arriva mai a Google.

**5. `cta_valutazione` scatta solo dalle pagine del blog.** Il punto D.2 dice
"su ogni link che porta a vendi.html da una pagina blog". Sulla home e sulle
altre pagine il click sulla CTA non genera l'evento: lì la CTA è l'azione
principale della pagina, non una conversione dal contenuto editoriale.

## Cosa non ho fatto, e perché

**1. Non ho misurato LCP e CLS prima e dopo (punto F.6).**
Servirebbe un browser che renderizzi le pagine e in questo ambiente non ce n'è
uno. Inventare due coppie di numeri sarebbe stato peggio che non darli. Quello
che posso dire dalla struttura: `gtag.js` è caricato con `async`, quindi non
blocca il rendering, e non inserisce nulla nel layout, quindi non può causare
CLS. Il blocco inline di Consent Mode è di circa 500 byte. La procedura per
misurarli è al punto 5.1 di `VERIFICHE.md`.

**2. Non ho compilato durata dei cookie e trasferimento extra-UE.**
Il punto E.1 lo vieta esplicitamente e ha ragione: sono dati che non posso
accertare dal codice. In `legale.html` trovi due `[DA VERIFICARE]`, elencati
qui sotto al punto G.3.

**3. Non ho toccato `preview-access.html`.** Non è nell'elenco delle pagine ed
è la pagina del gate temporaneo: metterci Analytics avrebbe solo sporcato i dati
con le visite di chi sta guardando l'anteprima.

## Verifica tecnica (Fase F)

| # | Cosa | Strumento | Atteso | Se è diverso |
|---|---|---|---|---|
| 1 | Cookie **prima** di accettare | DevTools → Application → Cookies | **Nessun** `_ga` né `_ga_TSMYGTDLV7` | Il Consent Mode non sta funzionando: controlla che il blocco `consent default` preceda `gtag.js` |
| 2 | Cookie **dopo** aver accettato | idem, premi "Accetta" e ricarica | I cookie `_ga` compaiono | L'update non parte: verifica che `js/main.js` sia caricato |
| 3 | Visita registrata | GA4 → Rapporti → Tempo reale | La tua visita compare entro pochi secondi | Controlla che l'ID sia `G-TSMYGTDLV7` e che il gate non ti stia rimandando alla pagina del codice |
| 4 | Eventi di conversione | GA4 → Amministrazione → DebugView, con l'estensione **Google Analytics Debugger** attiva | `cta_valutazione` cliccando la CTA di un articolo, `click_whatsapp` su un link WhatsApp, `generate_lead` inviando il form | Se non arrivano: hai accettato i cookie? Il DebugView mostra solo i dispositivi in modalità debug |
| 5 | Nessun errore con consenso negato | DevTools → Console, dopo aver premuto "Rifiuta" | Console pulita, nessuna richiesta a `google-analytics.com` | — |
| 6 | Prestazioni | PageSpeed Insights, `/blog/` e un articolo, mobile e desktop | LCP e CLS non peggiorati in modo significativo | `gtag.js` è `async`, non dovrebbe spostare l'ago |
| 7 | Un solo tag per pagina | `grep -rc "G-TSMYGTDLV7" --include=*.html .` | **2 occorrenze per file**: una nell'URL di `gtag.js`, una nella `config`. Mai 4 | 4 occorrenze significano tag doppio |

**Verifica in più, sulla revoca (punto C.5).** Accetta i cookie, controlla che
`_ga` esista, poi clicca **"Gestisci cookie"** in fondo alla pagina: i cookie
`_ga` devono sparire e il banner ricomparire.

**Nota sul gate.** Finché `gate.js` è attivo, gli strumenti che caricano l'URL
dal vivo (PageSpeed, Tempo reale) misurano la pagina del codice di accesso. Il
codice è `SELEZIONE-2026`.

## AZIONI MANUALI RICHIESTE A TOMMASO

Tre cose che devi fare tu: non sono nel codice, sono nei pannelli di Google.

### G.1 Segnare gli eventi come conversioni in GA4

**Percorso:** GA4 → Amministrazione → Eventi → interruttore **"Segna come
conversione"** su questi tre:

- `generate_lead` — qualcuno ha inviato il modulo di valutazione
- `cta_valutazione` — qualcuno ha cliccato la CTA da un articolo
- `click_whatsapp` — qualcuno ti ha scritto su WhatsApp

Senza questo passaggio restano eventi normali e **non compaiono nei report di
conversione**: li vedresti solo scavando nel rapporto eventi.

**Attenzione all'ordine.** Gli eventi devono essersi già attivati almeno una
volta per comparire nell'elenco. Se non li vedi, naviga il sito accettando i
cookie, clicca una CTA e un link WhatsApp, e riprova dopo qualche ora.

### G.2 Collegare Search Console a GA4

**Percorso:** GA4 → Amministrazione → Collegamenti a prodotti → **Collegamenti a
Search Console**.

Dopo il collegamento va attivato il report: Rapporti → Libreria → raccolta
**"Search Console"** → **Pubblica**. Senza quest'ultimo passaggio il
collegamento c'è ma i dati non si vedono da nessuna parte.

È ciò che permette di rispondere alla domanda vera a fine ottobre: **quali query
portano persone che poi ti scrivono**. Search Console da sola dice quali ricerche
portano clic; GA4 da solo dice chi converte. Solo collegati dicono se sono le
stesse persone.

### G.3 Far verificare informativa e banner a un consulente privacy

L'installazione è in Consent Mode con default negato, che è l'impostazione
tecnicamente corretta per l'Italia: i cookie analitici richiedono consenso
preventivo e qui, finché non si accetta, non viene scritto nulla. Ma il quadro
normativo su Google Analytics in Europa è cambiato più volte, e trattandosi di
attività con P.IVA vale la pena una verifica professionale.

**I punti lasciati `[DA VERIFICARE]` in `legale.html`, sezione Cookie policy,
da sottoporre al consulente:**

1. **Durata dei cookie di Google Analytics 4.** Va presa dalla documentazione
   Google e trascritta. Non l'ho scritta perché non è un dato che posso
   accertare dal codice del sito.
2. **Trasferimento dei dati fuori dall'Unione Europea.** È il punto su cui la
   normativa si è mossa di più. Richiede una dichiarazione precisa che dipende
   dalle impostazioni della tua proprietà GA4 e dagli accordi in vigore.

Vale la pena far guardare al consulente anche **il banner**: oggi è un
accetta/rifiuta secco, senza granularità per categoria. È proporzionato al fatto
che l'unico strumento non necessario è Analytics, ma è una valutazione che
conviene far confermare.

---

# Intervento strutturale sul blog

Lavoro richiesto da `correzioni.txt`, Fasi 0→6. Data: 2026-08-07.
La diagnosi che ha guidato tutto è in [FASE-0-DIAGNOSI.md](FASE-0-DIAGNOSI.md).

---

## File creati

| File | Perché |
|---|---|
| `FASE-0-DIAGNOSI.md` | Report della Fase 0: stato, problemi e gravità voce per voce, con i numeri misurati sul codice |
| `blog/_template/article.html` | Modello da duplicare a ogni nuovo articolo. Head completo con placeholder `{{...}}`, header e footer identici al resto del sito, breadcrumb, struttura del corpo commentata, blocco CTA con UTM, blocco correlati, JSON-LD completo |
| `blog/_template/README.md` | Procedura di pubblicazione in 8 passi, tabella dei placeholder con i vincoli di lunghezza, regole su categorie, paginazione e retrofit |
| `build-sitemap.js` | Rigenera `sitemap.xml` con `node build-sitemap.js`. Zero dipendenze. Sostituisce `tools/genera-sitemap.mjs`. Il `lastmod` viene dal `dateModified` del nodo JSON-LD che descrive **quella** pagina — riconosciuto confrontando `mainEntityOfPage`/`url`/`@id` col canonical — e non dalla prima data che compare nel file: l'indice del blog elenca nel suo JSON-LD anche le date dei singoli articoli, e una ricerca per espressione regolare gli avrebbe assegnato la data del primo articolo. Se il nodo non esiste, si usa la data di modifica del file |
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
