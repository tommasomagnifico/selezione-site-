/* Rigenera sitemap.xml leggendo le pagine HTML del sito.
 *
 * Uso:  node tools/genera-sitemap.mjs
 *
 * Non serve installare nulla: usa solo i moduli di Node. Va lanciato dopo
 * aver aggiunto un articolo al blog (o una pagina qualsiasi), così la sitemap
 * resta allineata senza doverla modificare a mano.
 *
 * Come decide cosa includere:
 * - prende ogni file .html della root e ogni blog/<slug>/index.html;
 * - salta le pagine con <meta name="robots" content="noindex"> (es. 404.html);
 * - l'URL è quello del <link rel="canonical">: se manca, la pagina viene
 *   segnalata e saltata, perché senza canonical non è pubblicabile;
 * - <lastmod> è il "dateModified" del JSON-LD, se c'è, altrimenti la data di
 *   ultima modifica del file.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

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

function paginaHtml(dir) {
  const trovate = [];
  for (const voce of readdirSync(dir, { withFileTypes: true })) {
    if (voce.name.startsWith('.') || voce.name === 'node_modules' || voce.name === 'tools') continue;
    const percorso = join(dir, voce.name);
    if (voce.isDirectory()) trovate.push(...paginaHtml(percorso));
    else if (voce.name.endsWith('.html')) trovate.push(percorso);
  }
  return trovate;
}

function dataFile(percorso) {
  return statSync(percorso).mtime.toISOString().slice(0, 10);
}

const voci = [];
const saltate = [];

for (const percorso of paginaHtml(ROOT)) {
  const html = readFileSync(percorso, 'utf8');
  const relativo = relative(ROOT, percorso).split(sep).join('/');

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
  const modificato = html.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
  const regola = REGOLE[percorsoUrl] || DEFAULT;

  voci.push({
    loc,
    lastmod: modificato ? modificato[1] : dataFile(percorso),
    ...regola
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

writeFileSync(join(ROOT, 'sitemap.xml'), xml);

console.log(`sitemap.xml rigenerata: ${voci.length} URL`);
for (const v of voci) console.log(`  ${v.loc}  (${v.lastmod})`);
if (saltate.length) console.log(`saltate: ${saltate.join(', ')}`);
