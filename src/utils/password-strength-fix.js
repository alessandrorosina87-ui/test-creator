/**
 * ══════════════════════════════════════════════════════════════════
 *  PASSWORD STRENGTH & TIME CALCULATOR (FIXED)
 * ══════════════════════════════════════════════════════════════════
 * 
 *  Il problema riscontrato (combinazioni corrette ma tempo incoerente 
 *  per password molto complesse come "EoLo90@?39") è causato da un 
 *  limite numerico o da un errore nella funzione di formattazione del tempo.
 * 
 *  In JavaScript, numeri oltre 9.007.199.254.740.991 (Number.MAX_SAFE_INTEGER)
 *  perdono precisione se usati con operatori bit a bit o moduli non sicuri.
 *  "EoLo90@?39" genera ~5.38e19 combinazioni, superando ampiamente il limite!
 * 
 *  Questa implementazione risolve il bug usando calcoli sicuri in virgola 
 *  mobile per tempi giganteschi e formatta correttamente le unità di misura.
 */

function calculateBruteForceTime(password, attemptsPerSecond = 1e9) {
    if (!password) return { combinations: 0, timeString: "Istantaneo", seconds: 0 };

    // 1. Calcolo del Charset (Insieme di caratteri)
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26; // Minuscole
    if (/[A-Z]/.test(password)) charsetSize += 26; // Maiuscole
    if (/[0-9]/.test(password)) charsetSize += 10; // Numeri
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Simboli base

    // 2. Calcolo Combinazioni (usiamo Math.pow, gestisce fino a 1e308 in JS)
    // "Alessandro" -> 10 char, size 52 -> 52^10 = 1.44e17
    // "EoLo90@?39" -> 10 char, size 94 -> 94^10 = 5.38e19
    const combinations = Math.pow(charsetSize, password.length);

    // 3. Calcolo Secondi
    const seconds = combinations / attemptsPerSecond;

    // 4. Formattazione sicura del tempo (evita operatori bit a bit o % su grandi numeri)
    return {
        charsetSize,
        combinations,
        seconds,
        timeString: formatTime(seconds)
    };
}

function formatTime(seconds) {
    if (seconds < 1) return "Istantaneo";
    
    const MINUTE = 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    const YEAR = DAY * 365.25;
    const CENTURY = YEAR * 100;
    const MILLENNIUM = YEAR * 1000;

    // Se il tempo è colossale, mostriamo direttamente l'ordine di grandezza
    if (seconds >= MILLENNIUM * 1e6) {
        return "Miliardi di anni"; // Es. 5.38e10 secondi = ~1700 anni, ma se fosse 1e20 sec...
    }
    if (seconds >= MILLENNIUM * 1000) {
        const millions = Math.floor(seconds / (YEAR * 1e6));
        return `${millions.toLocaleString('it-IT')} milioni di anni`;
    }
    if (seconds >= MILLENNIUM) {
        const millennia = Math.floor(seconds / MILLENNIUM);
        return `${millennia.toLocaleString('it-IT')} millenni`;
    }
    if (seconds >= CENTURY) {
        const centuries = Math.floor(seconds / CENTURY);
        return `${centuries.toLocaleString('it-IT')} secoli`;
    }
    if (seconds >= YEAR) {
        const years = Math.floor(seconds / YEAR);
        return `${years.toLocaleString('it-IT')} anni`;
    }
    if (seconds >= DAY) {
        const days = Math.floor(seconds / DAY);
        return `${days} giorni`;
    }
    if (seconds >= HOUR) {
        const hours = Math.floor(seconds / HOUR);
        return `${hours} ore`;
    }
    if (seconds >= MINUTE) {
        const minutes = Math.floor(seconds / MINUTE);
        return `${minutes} minuti`;
    }
    
    return `${Math.floor(seconds)} secondi`;
}

// ==========================================
// TEST E DIMOSTRAZIONE DEL FIX
// ==========================================
console.log("=== TEST COMPLESSITÀ PASSWORD ===");

const p1 = "Alessandro";
const res1 = calculateBruteForceTime(p1);
console.log(`\nPassword: "${p1}"`);
console.log(`- Charset: ${res1.charsetSize}`);
console.log(`- Combinazioni: ${res1.combinations.toExponential(2)}`);
console.log(`- Tempo stimato: ${res1.timeString}`);

const p2 = "EoLo90@?39";
const res2 = calculateBruteForceTime(p2);
console.log(`\nPassword: "${p2}"`);
console.log(`- Charset: ${res2.charsetSize}`);
console.log(`- Combinazioni: ${res2.combinations.toExponential(2)}`);
console.log(`- Tempo stimato: ${res2.timeString}`);

console.log("\nConclusione:");
console.log(`"EoLo90@?39" richiede circa ${(res2.seconds / res1.seconds).toFixed(0)} volte più tempo di "Alessandro"!`);
