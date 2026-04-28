import { useEffect } from 'react';
import { Shield, BookOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from '../Router';

export function PrivacyPolicy() {
  const { navigate } = useRouter();

  useEffect(() => {
    document.title = "Privacy Policy - VerifichePro";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-primary-100">
      {/* ─── Header Semplificato ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen size={20} />
              </div>
              <span className="font-display font-bold text-xl dark:text-white">Verifiche<span className="text-primary-600">Pro</span></span>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 transition-colors">
              <ArrowLeft size={16} /> Torna alla Home
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenuto ─── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Informativa sul trattamento dei dati personali (GDPR)</p>
          <p className="text-sm text-slate-400 mt-2">Ultimo aggiornamento: Aprile 2026</p>
        </div>

        <div className="premium-card p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          <h3>1. Titolare del Trattamento</h3>
          <p>
            Il titolare del trattamento dei dati raccolti attraverso il portale <strong>VerifichePro</strong> è Alessandro Rosina.
            Per qualsiasi chiarimento o per l'esercizio dei diritti dell'utente, è possibile contattare il titolare all'indirizzo email: <a href="mailto:Alessandro.rosina87@gmail.com" className="text-primary-600 font-bold hover:underline">Alessandro.rosina87@gmail.com</a>.
          </p>

          <h3>2. Dati Raccolti e Finalità</h3>
          <p>Raccogliamo esclusivamente i dati strettamente necessari per il funzionamento del servizio:</p>
          <ul>
            <li><strong>Dati di Account:</strong> Indirizzo email e nome utente, utilizzati per la registrazione, l'autenticazione (login) e l'accesso all'area personale.</li>
            <li><strong>Dati di Utilizzo (Verifiche):</strong> Titoli, classi, materie, e contenuti dei test generati. Questi dati vengono salvati unicamente per permettere all'utente di ritrovare e modificare i propri lavori all'interno del proprio archivio privato.</li>
            <li><strong>Dati Tecnici:</strong> Cookie tecnici strettamente necessari per mantenere attiva la sessione e garantire il funzionamento sicuro della piattaforma.</li>
          </ul>

          <h3>3. Conservazione e Sicurezza dei Dati</h3>
          <p>
            I dati personali e i contenuti delle verifiche sono archiviati in modo sicuro utilizzando l'infrastruttura Cloud (Firebase Firestore).
            Il sistema è configurato come piattaforma <em>multi-tenant</em>, il che garantisce che <strong>ogni utente abbia accesso esclusivo e privato</strong> alle proprie verifiche, senza alcuna possibilità di lettura, modifica o cancellazione da parte di altri utenti registrati.
          </p>

          <h3>4. Diritti dell'Utente (GDPR)</h3>
          <p>In conformità al Regolamento Generale sulla Protezione dei Dati (GDPR), gli utenti hanno il diritto di:</p>
          <ul>
            <li>Accedere ai propri dati personali e ai file salvati.</li>
            <li>Rettificare informazioni inesatte.</li>
            <li><strong>Diritto all'Oblio:</strong> Richiedere la cancellazione permanente del proprio account e di tutte le verifiche ad esso collegate (eliminazione totale dei dati).</li>
            <li>Limitare o opporsi al trattamento dei dati.</li>
          </ul>
          <p>Per esercitare questi diritti, si prega di inviare una richiesta all'indirizzo email del Titolare.</p>

          <h3>5. Cookie Policy</h3>
          <p>
            VerifichePro utilizza unicamente <strong>cookie tecnici e token di autenticazione sicuri</strong> forniti dall'infrastruttura di gestione identità per mantenere le sessioni attive e verificare che un utente sia legittimato a visualizzare il proprio archivio.
            Non utilizziamo cookie di profilazione o tracciamento a scopo pubblicitario. Non raccogliamo dati per terze parti.
          </p>

          <h3>6. Modifiche alla Privacy Policy</h3>
          <p>
            Ci riserviamo il diritto di aggiornare o modificare questa Informativa in qualsiasi momento. Gli utenti saranno notificati di eventuali cambiamenti significativi riguardanti le modalità di trattamento dei propri dati tramite avviso sul portale o via email.
          </p>

        </div>
      </main>

      {/* ─── Footer Semplificato ─── */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4">
          <p>© 2026 VerifichePro. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
