/**
 * ══════════════════════════════════════════════════════════════════
 *  BRUTE FORCE SIMULATOR — Analisi Bug + Versione Corretta
 * ══════════════════════════════════════════════════════════════════
 *
 *  🐛 BUG TROVATO:
 *  Il problema si manifesta SOLO con password composte da "a" ripetuta
 *  (es. "aa", "aaa"). Con altre password (es. "ab", "ba") sembra
 *  funzionare perché l'errore visivo non è evidente.
 *
 *  CAUSA REALE: Due errori combinati:
 *
 *  1) Il terminale stampa `password` (il target) invece di `attempt`
 *     (il tentativo generato). Risultato: vedi sempre "aa".
 *
 *  2) Il confronto password===attempt avviene FUORI dal loop,
 *     quindi il sistema non si ferma mai al primo tentativo.
 *
 *  PERCHÉ SOLO CON "aa"?
 *  Perché "aa" è l'indice 0, cioè il PRIMO tentativo.
 *  Se il confronto funzionasse, si fermerebbe subito.
 *  Ma siccome il confronto è fuori dal loop, gira 676 volte
 *  e poi dichiara "trovata" senza mai aver confrontato davvero.
 *  Con "ab" o "ba" l'utente non nota il bug perché i tentativi
 *  scorrono troppo veloci per leggere che la stringa è sempre uguale.
 *
 * ══════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════
//  SEZIONE 1: CODICE BUGGATO (per confronto didattico)
// ═══════════════════════════════════════════════════════

function bruteForce_BUGGATO(password) {
  const charset = 'abcdefghijklmnopqrstuvwxyz';
  const length = password.length;
  const base = charset.length;
  const totalCombinations = Math.pow(base, length);

  console.log(`\n── VERSIONE BUGGATA (password: "${password}") ──`);
  console.log(`   Combinazioni: ${totalCombinations}`);

  for (let i = 0; i < totalCombinations; i++) {
    let attempt = generateAttempt(i, charset, length);

    // ❌ BUG #1: Stampa `password` invece di `attempt`
    //    Con password="aa", vedi SEMPRE "aa" anche quando
    //    attempt è "ab", "ac", "ba", ecc.
    //
    //    console.log(`[TRY] ${password} => Access Denied`);
    //                        ^^^^^^^^ SBAGLIATO!

    // ❌ BUG #2: Nessun confronto dentro il loop!
    //    Il ciclo gira TUTTE le combinazioni senza mai fermarsi.
  }

  // ❌ BUG #3: Il "successo" è FUORI dal loop → viene sempre stampato
  //    Non verifica nulla, dichiara vittoria a prescindere.
  //    console.log('[SUCCESS] Password trovata');

  // Simuliamo l'output buggato (solo prime 5 righe per brevità)
  for (let i = 0; i < Math.min(5, totalCombinations); i++) {
    console.log(`   [TRY] ${password} => Access Denied`);
    //                      ^^^^^^^^ sempre "aa"!
  }
  console.log(`   ... (ripetuto ${totalCombinations} volte, sempre "${password}")`);
  console.log(`   [SUCCESS] Password trovata`);
  console.log(`   ⚠️  Non ha mai confrontato nulla!\n`);
}


// ═══════════════════════════════════════════════════════
//  SEZIONE 2: FUNZIONE GENERAZIONE (questa è corretta)
// ═══════════════════════════════════════════════════════

/**
 * Converte un indice numerico in una stringa di lunghezza fissa
 * usando il charset come base numerica.
 *
 * Algoritmo: conversione decimale → base N
 *   - % (modulo) estrae la cifra meno significativa
 *   - Math.floor(/ base) sposta alla cifra successiva
 *   - Costruisce da DESTRA a SINISTRA
 *
 * @param {number} index   - Indice della combinazione (0, 1, 2, ...)
 * @param {string} charset - Caratteri disponibili (es. "abcdefghijklmnopqrstuvwxyz")
 * @param {number} length  - Lunghezza della password da generare
 * @returns {string}
 */
function generateAttempt(index, charset, length) {
  const base = charset.length;
  let n = index;
  let result = '';

  for (let i = 0; i < length; i++) {
    result = charset[n % base] + result; // cifra corrente → prepend
    n = Math.floor(n / base);            // ← CRUCIALE: avanza alla prossima cifra
  }

  return result;
}


// ═══════════════════════════════════════════════════════
//  SEZIONE 3: VERSIONE CORRETTA
// ═══════════════════════════════════════════════════════

/**
 * Simulazione brute force CORRETTA.
 *
 * FIX applicati:
 *   1. Stampa `attempt` (non `password`) nel terminale
 *   2. Confronto `attempt === password` DENTRO il loop
 *   3. `break` immediato quando trova la password
 */
function bruteForce_CORRETTO(password) {
  const charset = 'abcdefghijklmnopqrstuvwxyz';
  const length = password.length;
  const base = charset.length;
  const totalCombinations = Math.pow(base, length);
  const MAX_PRINT = 40; // limite stampe per non intasare il terminale

  console.log('══════════════════════════════════════════════════════');
  console.log('  🔓 BRUTE FORCE SIMULATOR — Versione Corretta');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Password target  : ${'*'.repeat(length)} (${length} caratteri)`);
  console.log(`  Charset          : a-z (${base} simboli)`);
  console.log(`  Combinazioni     : ${base}^${length} = ${totalCombinations.toLocaleString()}`);
  console.log('══════════════════════════════════════════════════════\n');

  const startTime = performance.now();
  let printed = 0;

  for (let i = 0; i < totalCombinations; i++) {
    // ✅ FIX: Genera il tentativo dall'indice (non dalla password!)
    const attempt = generateAttempt(i, charset, length);

    // ✅ FIX: Confronto DENTRO il loop → si ferma subito se trova
    if (attempt === password) {
      const elapsed = (performance.now() - startTime).toFixed(2);
      const attempts = i + 1;

      console.log(`  [TRY #${String(attempts).padStart(4, '0')}]  ${attempt}  =>  ✅ MATCH!\n`);
      console.log('  ╔══════════════════════════════════════════════╗');
      console.log(`  ║  PASSWORD TROVATA: "${attempt}"`.padEnd(49) + '║');
      console.log('  ╠══════════════════════════════════════════════╣');
      console.log(`  ║  Tentativi : ${attempts.toLocaleString().padEnd(33)}║`);
      console.log(`  ║  Tempo     : ${elapsed} ms`.padEnd(49) + '║');
      console.log('  ╚══════════════════════════════════════════════╝\n');

      // ✅ FIX: break! Non continuare dopo aver trovato la password
      return { found: true, attempts, elapsed };
    }

    // ✅ FIX: Stampa `attempt` (il tentativo reale), non `password`
    if (printed < MAX_PRINT) {
      console.log(`  [TRY #${String(i + 1).padStart(4, '0')}]  ${attempt}  =>  Access Denied`);
      printed++;
    } else if (printed === MAX_PRINT) {
      console.log(`  ... (${totalCombinations - MAX_PRINT} tentativi omessi) ...`);
      printed++;
    }
  }

  console.log('\n  ❌ Password non trovata nel charset.\n');
  return { found: false, attempts: totalCombinations };
}


// ═══════════════════════════════════════════════════════
//  SEZIONE 4: TEST COMPARATIVO
// ═══════════════════════════════════════════════════════

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║        BRUTE FORCE — ANALISI BUG DIDATTICA          ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// ── Test 1: Mostra il comportamento buggato ──
bruteForce_BUGGATO('aa');

// ── Test 2: Versione corretta con "aa" (indice 0 → trovata subito) ──
console.log('─────────────────────────────────────────────────────');
console.log('  TEST: password = "aa" (prima combinazione)\n');
bruteForce_CORRETTO('aa');

// ── Test 3: Versione corretta con "cb" (deve scorrere fino a indice 53) ──
console.log('─────────────────────────────────────────────────────');
console.log('  TEST: password = "cb" (combinazione #54)\n');
bruteForce_CORRETTO('cb');

// ── Test 4: Versione corretta con "az" (indice 25) ──
console.log('─────────────────────────────────────────────────────');
console.log('  TEST: password = "az" (ultima della serie "a*")\n');
bruteForce_CORRETTO('az');

// ── Verifica generatore con prime 30 combinazioni ──
console.log('─────────────────────────────────────────────────────');
console.log('  VERIFICA: prime 30 combinazioni generate\n');
const charset = 'abcdefghijklmnopqrstuvwxyz';
for (let i = 0; i < 30; i++) {
  const str = generateAttempt(i, charset, 2);
  console.log(`  i=${String(i).padStart(2)}  →  "${str}"`);
}
console.log('  ...\n');
