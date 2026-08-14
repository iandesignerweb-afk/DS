import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Key,
  HelpCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    loginAsDemoUser,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'FORGOT') {
        const { error, message } = await resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMessage(message || 'Instruções de redefinição enviadas para o e-mail informado.');
      } else if (mode === 'SIGNUP') {
        const { error } = await signUpWithPassword(
          email,
          password,
          fullName,
          role
        );
        if (error) throw error;
        setSuccessMessage('Conta cadastrada com sucesso! Você já pode realizar login.');
        setMode('LOGIN');
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        setSuccessMessage('Autenticação realizada com sucesso!');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Erro ao realizar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (demoRole: UserRole) => {
    loginAsDemoUser(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
            {mode === 'SIGNUP' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'SIGNUP'
                ? 'Cadastrar Usuário'
                : mode === 'FORGOT'
                ? 'Recuperar Senha'
                : 'Acesso ao DUAL SYSTEM'}
            </h3>
            <p className="text-xs text-slate-400">
              Autenticação segura via Supabase Auth & JWT
            </p>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="seu-email@assistencia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'FORGOT' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Senha
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Perfil de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    role === 'ADMIN'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>ADMINISTRADOR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('SELLER')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    role === 'SELLER'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>VENDEDOR</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Processando...'
              : mode === 'SIGNUP'
              ? 'Cadastrar Usuário'
              : mode === 'FORGOT'
              ? 'Enviar Instruções'
              : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Acesso Rápido para Demonstração:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemo('ADMIN')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-blue-950/40 border border-blue-900/40 text-[11px] font-bold text-blue-400 transition-colors text-center"
            >
              Entrar como Admin
            </button>
            <button
              onClick={() => handleDemo('SELLER')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 text-[11px] font-bold text-amber-400 transition-colors text-center"
            >
              Entrar como Vendedor
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            {mode === 'SIGNUP'
              ? 'Já possui conta? Faça login aqui'
              : mode === 'FORGOT'
              ? '← Voltar para o Login'
              : 'Não tem conta? Cadastre-se aqui'}
          </button>
        </div>
      </div>
    </div>
  );
};
