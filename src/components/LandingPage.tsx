import { Check, BookOpen, Layers, Shield, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from '../Router';

export function LandingPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans selection:bg-primary-100">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm">
                <BookOpen size={20} />
              </div>
              <span className="font-display font-bold text-xl dark:text-white">Verifiche<span className="text-primary-600">Pro</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#come-funziona" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 transition-colors">Come funziona</a>
              <a href="#prezzi" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 transition-colors">Prezzi</a>
              <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-700 hover:text-primary-600 dark:text-white transition-colors">
                Accedi
              </button>
              <button onClick={() => navigate('/register')} className="text-sm font-bold bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                Registrati Gratis
              </button>
            </div>

            {/* Mobile menu button could go here */}
            <div className="md:hidden flex items-center gap-4">
               <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-700 dark:text-white">Accedi</button>
               <button onClick={() => navigate('/creator')} className="text-sm font-bold bg-primary-600 text-white px-4 py-2 rounded-xl">Crea</button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-white to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold mb-8 ring-1 ring-inset ring-primary-500/20">
            ✨ Il nuovo standard per la didattica
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            Crea verifiche scolastiche in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">pochi secondi</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Genera compiti personalizzati, scaricali subito in PDF e organizza tutto nel tuo cloud privato. Semplice, veloce e pronto per la stampa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/creator')} className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Crea Gratis Ora <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center">
              Accedi al tuo account
            </button>
          </div>
        </div>
      </section>

      {/* ─── Come Funziona (3 Step) ─── */}
      <section id="come-funziona" className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Come Funziona</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Tre semplici passi per rivoluzionare il tuo metodo di valutazione.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Layers size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">1. Inserisci domande</h3>
              <p className="text-slate-600 dark:text-slate-400">Usa il nostro editor intuitivo per creare domande a risposta multipla, vero/falso o aperte.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">2. Scarica subito</h3>
              <p className="text-slate-600 dark:text-slate-400">Genera in tempo reale il PDF pronto per la stampa, formattato in modo professionale.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">3. Salva nel cloud</h3>
              <p className="text-slate-600 dark:text-slate-400">Registrati per salvare le tue verifiche, ricercarle tramite codice e modificarle in futuro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Differenza Ospite / Registrato ─── */}
      <section id="prezzi" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Scegli il tuo piano</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Il creatore base è sempre gratuito. Registrati per sbloccare il cloud.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Guest Card */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-2xl font-bold mb-2 dark:text-white">Utente Ospite</h3>
              <p className="text-slate-500 mb-6">Perfetto per test veloci "usa e getta".</p>
              <div className="text-4xl font-display font-bold mb-8 dark:text-white">Gratis</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Check size={20} className="text-emerald-500" /> <span className="dark:text-slate-300">Crea verifiche</span></li>
                <li className="flex items-center gap-3"><Check size={20} className="text-emerald-500" /> <span className="dark:text-slate-300">Scarica PDF Studente</span></li>
                <li className="flex items-center gap-3 text-slate-400"><div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">X</div> <span>Salvataggio archivio</span></li>
                <li className="flex items-center gap-3 text-slate-400"><div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">X</div> <span>Storico verifiche</span></li>
              </ul>
              <button onClick={() => navigate('/creator')} className="w-full py-3 rounded-xl font-bold border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors dark:text-white">
                Prova Senza Registrazione
              </button>
            </div>

            {/* Premium Card */}
            <div className="p-8 rounded-3xl border-2 border-primary-500 bg-white dark:bg-slate-800 relative shadow-2xl shadow-primary-500/10 scale-105 z-10">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Consigliato
              </div>
              <h3 className="text-2xl font-bold mb-2 dark:text-white">Utente Registrato</h3>
              <p className="text-slate-500 mb-6">Tutto il potenziale sbloccato per i docenti.</p>
              <div className="text-4xl font-display font-bold mb-8 dark:text-white">Gratis <span className="text-base font-normal text-slate-400">per sempre</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><Check size={20} className="text-primary-500" /> <span className="font-medium dark:text-slate-200">Tutto il piano Ospite</span></li>
                <li className="flex items-center gap-3"><Check size={20} className="text-primary-500" /> <span className="font-medium dark:text-slate-200">Salvataggio cloud</span></li>
                <li className="flex items-center gap-3"><Check size={20} className="text-primary-500" /> <span className="font-medium dark:text-slate-200">Archivio personale illimitato</span></li>
                <li className="flex items-center gap-3"><Check size={20} className="text-primary-500" /> <span className="font-medium dark:text-slate-200">Ricerca verifiche per codice</span></li>
                <li className="flex items-center gap-3"><Check size={20} className="text-primary-500" /> <span className="font-medium dark:text-slate-200">PDF Docente (con soluzioni)</span></li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md">
                Registrati Ora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-primary-600" />
            <span className="font-display font-bold text-xl dark:text-white">Verifiche<span className="text-primary-600">Pro</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Contatti</button>
            <button onClick={() => navigate('/login')} className="hover:text-primary-600 transition-colors">Login</button>
            <button onClick={() => navigate('/register')} className="hover:text-primary-600 transition-colors">Registrazione</button>
          </div>
          <p className="text-sm text-slate-400">© 2026 VerifichePro. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
