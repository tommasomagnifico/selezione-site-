# Selezione. — Sito multi-pagina

Sito statico (HTML/CSS/JS puri, nessun framework, nessuna build) per "Selezione.",
attività di compravendita di sneakers limited, carte Pokémon, console/videogiochi
e oggettistica da collezione, con sede a Roma. Vendita tramite eBay e Vinted;
acquisto diretto dagli utenti tramite il form "Vendi a noi".

Origine: il sito nasce dalla trasformazione di una landing one-page (fornita
dall'utente) in un sito multi-pagina, mantenendo identico lo stile e il copy.

## Dati fissi del brand (non modificare senza conferma dell'utente)

- Dominio: https://selezione.store/
- Email: selezioneresellshop@gmail.com
- WhatsApp: +39 331 545 3138 → link https://wa.me/393315453138
- Instagram: https://instagram.com/selezione.shop (@selezione.shop)
- eBay: https://www.ebay.it/str/selezioneshop
- Vinted: https://www.vinted.it/member/70497170
- P.IVA: 18554041006 · REA: RM-1792120 · Sede: Roma (RM), Italia
- Payoff: "Chiacchiere, tempo e pezzi rari."
- Copyright footer: © 2026 Selezione.

## Design system

Stile nordico-minimal dark.

- Palette: nero `#000000` (sfondo), antracite `#2C2C2C`, bianco sporco (offwhite)
  `#F9F9F9`, blu cobalto `#2E5BFF` (accento). Variabili CSS in `:root` dentro
  `css/style.css` (`--black`, `--black2`, `--black3`, `--anthracite`, `--offwhite`,
  `--cobalt`, `--muted`, `--muted2`, `--border`, `--img-bg`).
- Font (Google Fonts, caricati via `<link>` nell'head, non `@import`):
  - **DM Serif Display** (ital 0/1) → titoli h1/h2/h3, testo in corsivo colorato cobalto
  - **DM Sans** (300/400/500) → corpo testo
  - **Barlow Condensed** (500/600/700) → label maiuscole, eyebrow, numeri (about-num,
    sell-step-num), tag categoria, nav-links, footer-nav (uppercase,
    letter-spacing largo)
- Componenti riutilizzabili principali (tutti in `css/style.css`):
  `.page-hero` (hero compatto pagine interne), `.cta-band` (banda CTA centrata),
  `.legal-section`,
  `.contact-cards`/`.contact-card` (griglia 3 col email/WhatsApp/Instagram),
  `.error-page` (404), oltre ai componenti storici della one-page: `.hero`,
  `.divider` (marquee scorrevole), `.about`, `.cat-grid`/`.cat-card`,
  `.channels-grid`/`.channel-card`, `.sell`/`.sell-form`, `.faq`, `.cookie-banner`,
  `.to-top`, nav + hamburger mobile.
- Animazioni: scroll reveal via IntersectionObserver (classe `.reveal` → `.visible`),
  hero-in scaglionato via `animation-delay`, rispetta `prefers-reduced-motion`.

## Struttura del progetto

```
selezione-site/
├── index.html          Home
├── chi-siamo.html       Chi siamo
├── vendi.html           Vendi a noi (form Formspree)
├── faq.html             FAQ (con JSON-LD FAQPage)
├── legale.html          Privacy / Cookie / Note legali / Termini (4 sezioni ancorate)
├── 404.html             Pagina di errore
├── css/style.css        Design system unico condiviso da tutte le pagine
├── js/main.js           Menu mobile, nav scrolled, back-to-top, scroll reveal, cookie banner
├── js/form.js           Solo su vendi.html: invio del form "Vendi a noi" via fetch/Formspree
├── img/LEGGIMI.txt       Istruzioni sulle immagini mancanti (nomi e dimensioni richieste)
├── sitemap.xml
└── robots.txt
```

Nessuna dipendenza esterna oltre ai Google Fonts. Nessun bundler/build step:
si apre `index.html` direttamente nel browser (i link sono tutti relativi) oppure
si serve la cartella con un server statico qualsiasi.

## Header e footer condivisi

- **Nav**: logo (→ index.html) + link Home / Chi siamo / Vendi a noi / FAQ / Acquista
  (→ index.html#negozi). La pagina corrente ha `aria-current="page"` (evidenziata in CSS).
  Hamburger su mobile con stesso menu.
- **Footer**: contatti (email, WhatsApp, Instagram), riga con P.IVA/REA e link
  Privacy/Cookie/Note legali/Termini (puntano a `legale.html#privacy`, `#cookie`,
  `#note-legali`, `#termini` — link `<a href>` reali, non `onclick`), footer-nav
  (Home, Chi siamo, Vendi, FAQ, Legale).
- **Cookie banner**: presente su ogni pagina, persiste la scelta in `localStorage`
  (`cookieConsent` = `all` | `necessary`) tramite `js/main.js` — non si ripresenta
  a ogni cambio pagina.
- **Back-to-top**: presente su ogni pagina.

## Contenuto pagina per pagina

1. **index.html** — hero (CTA "Acquista ora" → `#negozi`, "Vendi i tuoi pezzi" →
   `vendi.html`), marquee, categorie (`#categorie`: sneakers, Pokémon, gaming,
   oggettistica), canali (`#negozi`: eBay, Vinted), teaser "Chi siamo" con link
   a `chi-siamo.html`, banda CTA verso `vendi.html`, anteprima FAQ (3 domande) con
   link "Tutte le domande" → `faq.html`. JSON-LD: `Organization` + `WebSite` + `Store`.
2. **chi-siamo.html** — storia del brand, sezione "Il metodo" (i 3 valori,
   testi espansi rispetto all'originale), marquee, sezione canali (eBay/Vinted),
   `.contact-cards` (email/WhatsApp/Instagram), banda CTA finale.
3. **vendi.html** — i 3 step del processo di vendita + nota su cosa si acquista
   (con link a `legale.html#termini`), form completo (nome, email, tipo articolo,
   piattaforma, condizione, città, descrizione, foto, checkbox privacy con link a
   `legale.html#privacy`), FAQ mirate alla vendita, link a `faq.html`.
4. **faq.html** — tutte le 5 domande/risposte originali, JSON-LD `FAQPage`,
   `.contact-cards` in fondo.
5. **legale.html** — le 4 vecchie modali sono diventate sezioni ancorate
   (`#privacy`, `#cookie`, `#note-legali`, `#termini`) raggiungibili dai link
   legali nel footer di ogni pagina; testi legali copiati parola per parola
   dall'originale, incluso il placeholder `[Nome e Cognome]` e le note
   "modello di base, fallo verificare da un consulente".
6. **404.html** — pagina di errore con link di ritorno a `index.html`.

## Form "Vendi a noi" (js/form.js)

Invio via `fetch` a Formspree. **Da fare prima della pubblicazione**: sostituire
il placeholder in `js/form.js` (variabile `FORM_ENDPOINT`, riga ~4:
`https://formspree.io/f/INSERISCI_ID`) con l'endpoint Formspree reale
(si crea gratis su formspree.io → New Form).

## Cose da completare prima di andare online

1. **Formspree**: incollare l'ID reale in `js/form.js` (vedi sopra).
2. **Immagini**: caricare in `img/` i file elencati in `img/LEGGIMI.txt`
   (categoria-sneakers.jpg, categoria-pokemon.jpg, categoria-gaming.jpg,
   categoria-oggetti.jpg — 900×900; og-image.jpg — 1200×630; logo.png).
   Finché mancano, i placeholder con icona SVG restano visibili (gestito via
   `onerror` sugli `<img>`).
3. **Dati titolare**: sostituire `[Nome e Cognome]` in `legale.html` col nome
   reale del titolare dell'attività.
4. **Revisione legale**: far verificare i testi di privacy/cookie/note
   legali/termini da un consulente prima della pubblicazione definitiva
   (le note promemoria nel testo lo ricordano esplicitamente).

## Cronologia modifiche

- **2026-07-04**: conversione della landing one-page originale (fornita
  dall'utente, HTML singolo con tutto inline) in sito multi-pagina a 6 pagine.
  Estratti CSS e JS in file condivisi. Aggiunto sistema di persistenza cookie
  banner via localStorage. Introdotto Barlow Condensed per label/numeri/nav
  (prima non utilizzato, solo importato). Le 4 modali legali (privacy, cookie,
  note legali, termini) trasformate in sezioni ancorate indicizzabili su
  `legale.html`. Rimossa ogni funzione JS legata alle vecchie modali
  (`openModal`/`closeModal`/`openPrivacy`). Creati sitemap.xml e robots.txt.
  Su richiesta dell'utente, rimossa la sotto-nav sticky `.legal-nav` da
  `legale.html` (HTML + CSS): le sezioni legali restano raggiungibili dai
  link Privacy/Cookie/Note legali/Termini già presenti nel footer di ogni
  pagina; adeguato lo `scroll-margin-top` di `.legal-section` da 9rem a
  5.5rem.

## Convenzioni da rispettare in modifiche future

- Non reintrodurre `@import` per i font: restano `<link>` nell'`<head>` di
  ogni pagina (per performance — preconnect già presente).
- Mantenere `css/style.css` e `js/main.js` come unica fonte di stile/comportamento
  condiviso: non duplicare CSS/JS dentro le singole pagine HTML.
- I link legali nel footer e nel form devono restare `<a href="legale.html#...">`
  veri (niente `onclick`/JS per aprire modali: le modali non esistono più).
- Ogni nuova pagina deve includere: nav+footer condivisi, cookie banner,
  back-to-top, `css/style.css`, `js/main.js`, meta SEO/OG coerenti con le altre
  pagine (canonical, og:url, title/description specifici), e va aggiunta a
  `sitemap.xml`.
