import { useState } from 'react';
import { LogIn, ArrowLeft, Eye, EyeOff, BookOpen } from 'lucide-react';
import { login } from '../../services/authService';
import { isCurrentUserAdmin } from '../../services/adminService';
import { useRouter } from '../../Router';

export function LoginPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Controlla se l'utente è admin e redireziona di conseguenza
      const admin = await isCurrentUserAdmin();
      if (admin) {
        navigate('/superadmin');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Credenziali non valide. Verifica email e password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Troppi tentativi falliti. Riprova più tardi.');
      } else {
        setError(err?.message || 'Errore durante l\'accesso. Riprova.');
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
            <h1 className="text-2xl font-display font-bold dark:text-white">Bentornato</h1>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-2 text-sm">
              Accedi al tuo account per gestire le verifiche salvate.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@scuola.it"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Accedi</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-6">
            Gli account vengono creati dall'amministratore della piattaforma.
          </div>

        </div>
      </div>
    </div>
  );
}
