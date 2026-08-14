import React, { useState } from 'react';
import {
  Smartphone,
  Shield,
  Lock,
  Mail,
  Key,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const {
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    loginAsDemoUser,
    isConfigured,
    isSessionExpired,
    clearSessionExpired,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'FORGOT_PASSWORD') {
        const { error, message } = await resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMessage(message || 'Instruções de redefinição de senha enviadas para o e-mail informado.');
      } else if (mode === 'SIGNUP') {
        const { error } = await signUpWithPassword(email, password, fullName, role);
        if (error) throw error;
        setSuccessMessage('Conta cadastrada com sucesso! Realize o login com suas credenciais.');
        setMode('LOGIN');
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        setSuccessMessage('Login efetuado com sucesso!');
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (demoRole: UserRole) => {
    loginAsDemoUser(demoRole);
    setSuccessMessage(`Conectado como ${demoRole === 'ADMIN' ? 'Administrador Master' : 'Vendedor Operacional'}`);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: System Value & Architecture info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                DUAL SYSTEM
              </h2>
              <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase">
                Controle de Acesso & Segurança RLS
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Plataforma corporativa de gestão de assistência técnica e ponto de venda com controle
            estrito de perfis de acesso e sigilo financeiro.
          </p>

          {/* Quick Role Switcher for Guided Testing */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Testes Rápidos de Perfil</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800/60">
                1-Clique
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-blue-950/40 border border-blue-900/40 hover:border-blue-500/60 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Entrar como ADMIN</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Acesso Total & Custos</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('SELLER')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500/60 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Entrar como VENDEDOR</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Custos/Fornecedores Ocultos</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sessão com tokens JWT criptografados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Políticas RLS aplicadas no PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bloqueio de visualização de custos para vendedores</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            {/* Session Expired Banner if simulated */}
            {isSessionExpired && (
              <div className="mb-6 p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Sua sessão expirou por inatividade</span>
                  <span>Por favor, insira suas credenciais novamente para continuar navegando com segurança.</span>
                </div>
                <button
                  onClick={clearSessionExpired}
                  className="text-amber-400 hover:text-amber-300 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'LOGIN'
                    ? 'Acessar o Sistema'
                    : mode === 'SIGNUP'
                    ? 'Criar Nova Conta'
                    : 'Recuperação de Senha'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'LOGIN'
                    ? 'Informe seu e-mail corporativo e senha de acesso'
                    : mode === 'SIGNUP'
                    ? 'Cadastre um novo perfil de usuário'
                    : 'Enviaremos instruções de redefinição para o seu e-mail'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    mode === 'LOGIN'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGNUP');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    mode === 'SIGNUP'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cadastro
                </button>
              </div>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@assistencia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'FORGOT_PASSWORD' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Senha de Acesso
                    </label>
                    {mode === 'LOGIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('FORGOT_PASSWORD');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Perfil de Acesso
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('ADMIN')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition-all ${
                        role === 'ADMIN'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>ADMINISTRADOR</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">Acesso irrestrito a todos os módulos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('SELLER')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition-all ${
                        role === 'SELLER'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <span>VENDEDOR / ATENDIMENTO</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">Apenas funções operacionais</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : mode === 'LOGIN' ? (
                  <>
                    <span>Entrar no DUAL SYSTEM</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'SIGNUP' ? (
                  <>
                    <span>Concluir Cadastro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Enviar Link de Recuperação</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === 'FORGOT_PASSWORD' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Voltar para a tela de Login
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
