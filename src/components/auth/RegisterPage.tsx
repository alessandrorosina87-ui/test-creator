import { useState } from 'react';
import { BookOpen, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from '../../Router';
import { registerWithEmail } from '../../services/authService';

export function RegisterPage() {
  const { navigate } = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confermaPassword) {
      setError('Le password non coincidono');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await registerWithEmail(email, password, nome);
      // Dopo la registrazione, reindirizziamo alla dashboard o al creator
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email già in uso da un altro account.');
      } else if (err.code === 'auth/weak-password') {
        setError('La password è troppo debole (minimo 6 caratteri).');
      } else {
        setError(err.message || 'Errore durante la registrazione.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="w-full max-w-md">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Torna alla home</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/20">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold dark:text-white">Crea un Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-2 text-sm">
              Registrati gratis per salvare le tue verifiche nel cloud e accedere all'archivio.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nome e Cognome</label>
              <input 
                type="text" 
                required 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Es. Mario Rossi"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@scuola.it"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caratteri"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Conferma Password</label>
              <input 
                type="password" 
                required 
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
                placeholder="Ridigita la password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              <span>{loading ? 'Creazione in corso...' : 'Registrati Gratis'}</span>
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-6">
            Hai già un account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              Accedi qui
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
