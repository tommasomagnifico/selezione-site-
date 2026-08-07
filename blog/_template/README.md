# Come si pubblica un articolo

Sostituisce il vecchio `blog/LEGGIMI.txt`. Il sito è HTML statico senza build
step: un articolo è **una cartella con dentro un `index.html`**, così l'URL è
già leggibile e i meta tag stanno nel sorgente invece di essere generati a
runtime.

    blog/come-vendere-console-usate/index.html
    →  https://selezioneshop.it/blog/come-vendere-console-usate/

Lo slug va minuscolo, in kebab-case, senza accenti e senza date.
**Non si cambia mai dopo la pubblicazione**: romperebbe canonical, sitemap e
tutti i link interni.

---

## Procedura

### 1. Crea la cartella

Copia `blog/_template/article.html` in `blog/<nuovo-slug>/index.html`.

### 2. Sostituisci i placeholder

Sono tutti nella forma `{{NOME}}`. In ordine di comparsa:

| Placeholder | Cos'è | Vincolo |
|---|---|---|
| `{{TITLE}}` | titolo per browser e motori | **max 60 caratteri**, senza " \| Selezione." che è già nel template |
| `{{DESCRIPTION}}` | meta description | **max 155 caratteri**, unica: non riusare quella di un altro articolo |
| `{{CANONICAL}}` | URL completo | `https://selezioneshop.it/blog/<slug>/` — con la barra finale |
| `{{OG_IMAGE}}` | anteprima social 1200×630 | se non ce l'hai, lascia `https://selezioneshop.it/og-image.jpg` |
| `{{DATE_PUBLISHED}}` | data di pubblicazione | formato `AAAA-MM-GG` |
| `{{DATE_MODIFIED}}` | data ultima modifica | uguale alla precedente al primo giro |
| `{{DATA_LEGGIBILE}}` | data per l'occhio | es. `6 agosto 2026` |
| `{{CATEGORY}}` | categoria | vedi sotto |
| `{{SLUG}}` | slug della cartella | serve anche nell'UTM della CTA |
| `{{H1}}` | titolo in pagina | può essere più lungo del `{{TITLE}}` e contenere `<em>` |
| `{{RISPOSTA_DIRETTA}}` | il paragrafo di apertura | **45-55 parole** |
| `{{MINUTI}}` | minuti di lettura | parole ÷ 200, arrotondato |
| `{{ALT_COPERTINA}}` | alt della copertina | descrittivo, **max 125 caratteri** |

Poi i blocchi di testo (`{{H2_...}}`, `{{TESTO}}`, le due domande frequenti) e
i campi dei due articoli correlati.

Cerca `{{` prima di committare: se ne resta uno, finisce online.

### 3. La risposta diretta

Il paragrafo sotto l'H1 è il pezzo che Google può prendere come featured
snippet. Deve rispondere alla domanda del titolo **subito**, in 45-55 parole,
senza preamboli tipo "in questo articolo vedremo".

### 4. Copertina

Un file 1200×630 in `img/blog/<slug>.svg`. Le copertine attuali sono SVG
vettoriali da ~1,5 KB: si aprono con un editor di testo e si cambiano colori e
parole senza software di grafica. Copia una esistente e modificala.

Se un domani le copertine diventano fotografie, vanno servite in WebP + JPG
dentro un `<picture>`, come le card categoria della home.

### 5. Aggiungi la card all'indice

In `blog/index.html`, in cima alla griglia `#blogGrid` (dal più recente al più
vecchio). La card ha bisogno di `data-category="<Categoria>"`: è il valore che
finisce nella barra dei filtri.

Aggiungi il nuovo articolo anche all'array `blogPost` del JSON-LD di quella
pagina.

### 6. Collega l'articolo agli altri

Un articolo nuovo deve avere **almeno 4 link interni**:

1. uno a `/vendi.html` con anchor descrittiva — mai "clicca qui";
2. due ad articoli fratelli (le card "Continua a leggere");
3. uno nella CTA finale, con l'UTM.

E deve **ricevere** almeno un link: aggiungi una card verso di lui negli
articoli già pubblicati che trattano temi vicini. Se non lo fai resta
raggiungibile solo dall'indice.

### 7. Rigenera la sitemap

    node build-sitemap.js

Legge i `<link rel="canonical">` di tutte le pagine, salta le `noindex` e
questa cartella `_template`, e prende il `lastmod` dal `dateModified` del
JSON-LD. Non si scrive a mano.

### 8. Controlla i link da inserire

    node find-retrofit.js

Elenca i punti dove hai lasciato un promemoria di collegamento
(vedi "Retrofit dei link" più sotto).

---

## Categorie

Non esistono in un elenco separato: `js/blog.js` le ricava dai `data-category`
delle card. Per crearne una nuova basta scriverla nella card, il filtro compare
da solo. La barra appare solo se le categorie sono almeno due.

Oggi in uso: **Vendere**, **Collezionismo**, **Valutazioni**.

I filtri sono **solo client-side**: non generano URL propri, quindi non c'è
niente da mettere in `noindex` e nessuna pagina categoria da gestire. Se un
domani servissero URL veri, la regola è che una categoria esiste per Google solo
con almeno 3 articoli: sotto quella soglia va in `noindex,follow`.

---

## Paginazione

L'indice mostra **9 articoli** (costante `PAGE_SIZE` in `js/blog.js`) e nasconde
i successivi dietro "Carica altri articoli".

Le card sono comunque **tutte presenti nell'HTML**: senza JavaScript si vedono
tutte, e Googlebot le raggiunge tutte da `/blog/` senza eseguire niente. Il JS
nasconde elementi già nel DOM, non ne inserisce.

Oltre la ventina di articoli conviene passare a pagine vere (`/blog/page/2/`).
In quel caso: canonical self-referencing su ogni pagina, `<title>` "Blog —
pagina N | Selezione.", e `noindex,follow` dalla pagina 2 in poi per non
duplicare le anteprime mantenendo il flusso di link verso gli articoli.

---

## Retrofit dei link

Quando pubblichi un articolo che dovrà essere linkato da uno futuro, o quando
sai che un articolo vecchio andrà collegato a uno nuovo, lascia un promemoria
nell'HTML in questa forma esatta:

    <!-- RETROFIT: aggiungere link a [slug-articolo] quando pubblicato -->

`node find-retrofit.js` li elenca tutti con file e riga, così ogni settimana sai
quali link ti mancano. Vanno tolti man mano che li risolvi: sono promemoria di
lavoro, non devono restare nel sorgente pubblicato a tempo indeterminato.

---

## Cosa non fare

- Due `<h1>` nella stessa pagina.
- Saltare livelli di heading: un `<h3>` sta solo dentro un `<h2>`.
- Riusare `title` o `description` di un altro articolo: le pagine si
  cannibalizzano nei risultati di ricerca.
- Aggiungere CSS o JS dentro il file dell'articolo: lo stile sta tutto in
  `css/style.css`.
- Tenere il nodo `FAQPage` nel JSON-LD se togli la sezione "Domande frequenti"
  dalla pagina: schema che non corrisponde a contenuto visibile viola le linee
  guida di Google.
- Cambiare lo slug di un articolo già pubblicato.
