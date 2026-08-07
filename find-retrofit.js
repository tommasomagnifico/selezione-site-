/* Elenca i promemoria di collegamento lasciati nell'HTML.
 *
 *   node find-retrofit.js
 *
 * Quando pubblichi un articolo che dovrà essere linkato da uno futuro — o
 * quando sai che un articolo vecchio andrà collegato a uno nuovo — lascia nel
 * sorgente un commento in questa forma esatta:
 *
 *   <!-- RETROFIT: aggiungere link a [slug-articolo] quando pubblicato -->
 *
 * Questo script li trova tutti, con file e riga, così ogni settimana sai quali
 * link ti mancano. Vanno tolti man mano che li risolvi: sono promemoria di
 * lavoro, non devono restare nel sorgente pubblicato a tempo indeterminato.
 *
 * Esce con codice 0 sempre: è un promemoria, non un test che deve fallire.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const ESCLUSE = new Set(['node_modules', '.git']);
const RE = /<!--\s*RETROFIT:\s*(.*?)\s*-->/i;

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

const trovati = [];

for (const percorso of pagineHtml(ROOT)) {
  const relativo = path.relative(ROOT, percorso).split(path.sep).join('/');
  const righe = fs.readFileSync(percorso, 'utf8').split(/\r?\n/);
  righe.forEach((riga, i) => {
    const m = riga.match(RE);
    if (m) trovati.push({ file: relativo, riga: i + 1, nota: m[1] });
  });
}

if (!trovati.length) {
  console.log('Nessun link da inserire: non ci sono commenti RETROFIT nel sorgente.');
  console.log('La convenzione è documentata in blog/_template/README.md.');
} else {
  console.log(`${trovati.length} link ancora da inserire:\n`);
  for (const t of trovati) {
    console.log(`  ${t.file}:${t.riga}`);
    console.log(`    ${t.nota}\n`);
  }
}
