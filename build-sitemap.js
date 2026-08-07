/* Rigenera sitemap.xml leggendo le pagine HTML del sito.
 *
 *   node build-sitemap.js
 *
 * Nessuna dipendenza: usa solo i moduli di Node. Va lanciato dopo ogni nuovo
 * articolo, così la sitemap resta allineata senza doverla scrivere a mano.
 * La procedura completa è in blog/_template/README.md.
 *
 * Cosa include e cosa no:
 * - prende ogni .html della root e ogni blog/<slug>/index.html;
 * - salta la cartella blog/_template/ (è un modello, non una pagina);
 * - salta le pagine con <meta name="robots" content="...noindex..."> —
 *   quindi 404.html, preview-access.html ed eventuali pagine paginate o
 *   di categoria messe in noindex;
 * - l'URL è quello del <link rel="canonical">: senza canonical la pagina
 *   viene segnalata e saltata, perché non è pubblicabile;
 * - <lastmod> è il "dateModified" del JSON-LD se c'è, altrimenti la data di
 *   ultima modifica del file.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;

/* Cartelle mai scansionate. */
const ESCLUSE = new Set(['node_modules', 'tools', '_template']);

/* changefreq e priority per percorso; le pagine non elencate (gli articoli
   del blog) usano DEFAULT. */
const REGOLE = {
  '/': { changefreq: 'weekly', priority: '1.0' },
  '/vendi.html': { changefreq: 'monthly', priority: '0.9' },
  '/negozio.html': { changefreq: 'weekly', priority: '0.8' },
  '/blog/': { changefreq: 'weekly', priority: '0.8' },
  '/chi-siamo.html': { changefreq: 'monthly', priority: '0.7' },
  '/faq.html': { changefreq: 'monthly', priority: '0.6' },
  '/legale.html': { changefreq: 'yearly', priority: '0.3' }
};
const DEFAULT = { changefreq: 'monthly', priority: '0.6' };

function pagineHtml(dir) {
  const trovate = [];
  for (const voce of fs.readdirSync(dir, { withFileTypes: true })) {
    if (voce.name.startsWith('.') || ESCLUSE.has(voce.name)) continue;
    const percorso = path.join(dir, voce.name);
    if (voce.isDirectory()) trovate.push(...pagineHtml(percorso));
    else if (voce.name.endsWith('.html')) trovate.push(percorso);
  }
  return trovate;
}

/* Il "dateModified" della pagina, non il primo che capita nel file.
   Serve la distinzione: l'indice del blog elenca nel suo JSON-LD anche i
   dateModified dei singoli articoli, e una ricerca per espressione regolare
   pescherebbe la data del primo articolo invece di quella dell'indice.
   Si prende quindi solo dal nodo che descrive QUESTA pagina, cioè quello il
   cui mainEntityOfPage (o url, o @id) coincide col canonical. */
function dataModifica(html, canonical) {
  for (const blocco of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let dati;
    try {
      dati = JSON.parse(blocco[1]);
    } catch (e) {
      continue; // JSON-LD malformato: lo salta invece di far fallire tutto
    }
    const nodi = [].concat(dati['@graph'] || dati);
    for (const nodo of nodi) {
      if (!nodo || typeof nodo !== 'object' || !nodo.dateModified) continue;
      const riferimenti = [nodo.mainEntityOfPage, nodo.url, nodo['@id']];
      if (riferimenti.some((r) => typeof r === 'string' && r.split('#')[0] === canonical)) {
        return String(nodo.dateModified).slice(0, 10);
      }
    }
  }
  return null;
}

const voci = [];
const saltate = [];

for (const percorso of pagineHtml(ROOT)) {
  const html = fs.readFileSync(percorso, 'utf8');
  const relativo = path.relative(ROOT, percorso).split(path.sep).join('/');

  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) {
    saltate.push(`${relativo} (noindex)`);
    continue;
  }

  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonical) {
    saltate.push(`${relativo} (manca il canonical)`);
    continue;
  }

  const loc = canonical[1];
  const percorsoUrl = new URL(loc).pathname;
  const regola = REGOLE[percorsoUrl] || DEFAULT;

  voci.push({
    loc,
    lastmod: dataModifica(html, loc) || fs.statSync(percorso).mtime.toISOString().slice(0, 10),
    changefreq: regola.changefreq,
    priority: regola.priority
  });
}

voci.sort((a, b) => Number(b.priority) - Number(a.priority) || a.loc.localeCompare(b.loc));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...voci.map((v) => [
    '  <url>',
    `    <loc>${v.loc}</loc>`,
    `    <lastmod>${v.lastmod}</lastmod>`,
    `    <changefreq>${v.changefreq}</changefreq>`,
    `    <priority>${v.priority}</priority>`,
    '  </url>'
  ].join('\n')),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);

console.log(`sitemap.xml rigenerata: ${voci.length} URL`);
for (const v of voci) console.log(`  ${v.loc}  (${v.lastmod})`);
if (saltate.length) console.log(`saltate: ${saltate.join(', ')}`);
