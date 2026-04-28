import { useEffect, useState } from 'react';
import { Mail, Phone, User, Send, BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from '../Router';

export function Contatti() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Contatti - VerifichePro";
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulazione invio messaggio lato client
    console.log("Messaggio inviato:", formData);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-primary-100">
      {/* ─── Header Semplificato ─── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">Contattaci</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Hai domande su VerifichePro? Vuoi proporre una collaborazione o segnalare un problema? Siamo qui per aiutarti.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Colonna Sinistra: Info Contatti */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <div className="premium-card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 border-none text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <h2 className="text-2xl font-display font-bold mb-8">Informazioni Dirette</h2>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm font-medium">Responsabile</p>
                    <p className="text-xl font-bold">Alessandro Rosina</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm font-medium">Telefono</p>
                    <a href="tel:+393400845664" className="text-xl font-bold hover:text-primary-200 transition-colors">340 084 5664</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm font-medium">Email</p>
                    <a href="mailto:Alessandro.rosina87@gmail.com" className="text-xl font-bold hover:text-primary-200 transition-colors break-all">Alessandro.rosina87@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-8 dark:bg-slate-800 dark:border-slate-700">
              <h3 className="font-bold text-lg mb-2 dark:text-white">Orari di Assistenza</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Il nostro team (o meglio, Alessandro) cercherà di rispondere a tutte le richieste nel più breve tempo possibile, solitamente entro 24-48 ore lavorative.
              </p>
            </div>
          </div>

          {/* Colonna Destra: Form */}
          <div className="premium-card p-8 md:p-10 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <h2 className="text-2xl font-display font-bold mb-6 dark:text-white">Inviaci un messaggio</h2>
            
            {sent ? (
              <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Messaggio Inviato!</h3>
                <p className="text-slate-500">Grazie per averci contattato. Ti risponderemo al più presto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:bg-slate-700 dark:text-white"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Indirizzo Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:bg-slate-700 dark:text-white"
                    placeholder="mario@esempio.it"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Il tuo messaggio</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none dark:bg-slate-700 dark:text-white"
                    placeholder="Come possiamo aiutarti?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  <Send size={18} />
                  Invia Messaggio
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  Per comunicazioni urgenti, suggeriamo di utilizzare l'indirizzo email diretto riportato a lato.
                </p>
              </form>
            )}
          </div>

        </div>
      </main>

      {/* ─── Footer Semplificato ─── */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 VerifichePro. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
