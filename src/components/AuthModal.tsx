import { X, Shield, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from '../Router';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { navigate } = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold dark:text-white mb-2">
            Salvataggio Cloud
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Per salvare le tue verifiche nel database e riprenderle in futuro, devi avere un account.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/register')}
            className="w-full py-4 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-between group transition-all shadow-md shadow-primary-500/20"
          >
            <div className="flex items-center gap-3">
              <Shield size={20} />
              <span>Registrati Gratis</span>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-600"
          >
            Hai già un account? Accedi
          </button>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6">
          Il tuo lavoro attuale non andrà perso durante la registrazione.
        </p>
      </div>
    </div>
  );
}
