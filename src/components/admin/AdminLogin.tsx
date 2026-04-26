/**
 * AdminLogin.tsx
 * Pagina di login admin con design premium coerente con il tema.
 * Supporta login e registrazione primo admin.
 */
import { useState } from 'react';
import { LogIn, UserPlus, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { login, registerAdmin } from '../../services/authService';
import { useRouter } from '../../Router';

export function AdminLogin() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerAdmin(email, password);
      } else {
        await login(email, password);
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Credenziali non valide. Verifica email e password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Questa email è già registrata. Prova ad accedere.');
      } else if (code === 'auth/weak-password') {
        setError('La password deve avere almeno 6 caratteri.');
      } else if (code === 'auth/invalid-email') {
        setError('Indirizzo email non valido.');
      } else {
        setError(err?.message || 'Errore sconosciuto. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Torna al Creator
        </button>

        <div className="premium-card p-8 md:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield size={30} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-center mb-1">
            {isRegister ? 'Crea Account Admin' : 'Accesso Admin'}
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8">
            {isRegister
              ? 'Registra il primo account amministratore'
              : 'Inserisci le credenziali per accedere al pannello'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@scuola.it"
                required
                className="premium-input"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-500 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="premium-input pr-12"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus size={20} />
                  <span>Registra Admin</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Accedi</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {isRegister
                ? 'Hai già un account? Accedi'
                : 'Primo accesso? Crea account admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
