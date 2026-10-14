import React, { useState } from 'react';
import { Lock, X, User, KeyRound, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { authenticateUser, UserSession } from '../services/security';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('clinician@cardiolens.org');
  const [password, setPassword] = useState('CardioLens2026!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authenticateUser(email, password);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
        onClose();
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication system error.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredential = (targetRole: 'clinician' | 'admin') => {
    if (targetRole === 'clinician') {
      setEmail('clinician@cardiolens.org');
      setPassword('CardioLens2026!');
    } else {
      setEmail('admin@cardiolens.org');
      setPassword('AuditShield#2026');
    }
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#0c1322] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 id="auth-modal-title" className="text-sm font-bold text-white tracking-wide">
                Clinical Access Authentication
              </h2>
              <span className="text-[10px] text-slate-400">
                PBKDF2 SHA-256 Authenticated Session
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Clinical Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cardiolens.org"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Passphrase</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Demo Credential Selectors */}
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              Demonstration Role Accounts:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillCredential('clinician')}
                className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-mono transition-colors"
              >
                Clinician Role
              </button>
              <button
                type="button"
                onClick={() => fillCredential('admin')}
                className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[10px] font-mono transition-colors"
              >
                Admin / Auditor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold transition-all disabled:opacity-60 cursor-pointer shadow-lg shadow-cyan-950/40"
          >
            {isLoading ? 'Verifying with Web Crypto...' : 'Authenticate Clinical Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
