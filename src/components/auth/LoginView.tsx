import React, { useState } from 'react';
import {
  Smartphone,
  Shield,
  Wrench,
  ShoppingCart,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  User,
} from 'lucide-react';
import { User as UserType, UserRole } from '../../types';

interface LoginViewProps {
  onLogin: (user: UserType) => void;
  availableUsers: UserType[];
}

// Predefined test user accounts with realistic profiles
export const TEST_USERS: Record<UserRole, UserType> = {
  ADMIN: {
    id: 'usr_admin',
    name: 'Carlos Mendes',
    email: 'admin@dualcell.com.br',
    role: 'ADMIN',
    commission_percentage: 5.0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  },
  SELLER: {
    id: 'usr_seller_1',
    name: 'Mariana Silva',
    email: 'vendedor@dualcell.com.br',
    role: 'SELLER',
    commission_percentage: 4.0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  },
  TECHNICIAN: {
    id: 'usr_tech_1',
    name: 'Lucas Rocha',
    email: 'tecnico@dualcell.com.br',
    role: 'TECHNICIAN',
    commission_percentage: 10.0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  },
  CASHIER: {
    id: 'usr_cashier_1',
    name: 'Mariana Silva',
    email: 'vendedor@dualcell.com.br',
    role: 'SELLER',
    commission_percentage: 4.0,
  },
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, availableUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Check if matches one of the test profiles or available users
      let foundUser = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        if (cleanEmail.includes('admin')) {
          foundUser = TEST_USERS.ADMIN;
        } else if (cleanEmail.includes('tec') || cleanEmail.includes('tech') || cleanEmail.includes('lucas')) {
          foundUser = TEST_USERS.TECHNICIAN;
        } else if (cleanEmail.includes('vend') || cleanEmail.includes('seller') || cleanEmail.includes('mariana')) {
          foundUser = TEST_USERS.SELLER;
        } else {
          // Default fallback to Admin for custom testing
          foundUser = {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0] || 'Usuário Operacional',
            email: email.trim(),
            role: 'ADMIN',
            commission_percentage: 5.0,
          };
        }
      }

      onLogin(foundUser);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const targetUser = TEST_USERS[role] || TEST_USERS.ADMIN;
      onLogin(targetUser);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Brand Icon & Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/20 mb-4">
          <Smartphone className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          DUAL CELL <span className="text-indigo-400">PRO</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          Sistema de Gestão para Assistência Técnica & PDV Balcão
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Main Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          {/* Quick Access Test Buttons Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Atalhos de Teste Rápidos (1-Clique)
              </span>
              <span className="text-[11px] text-slate-400">Selecione um perfil abaixo:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Admin Shortcut */}
              <button
                id="btn-login-admin"
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={isLoading}
                className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/80 rounded-2xl text-left transition-all duration-150 group relative flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-950/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    👑
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    Acesso Total
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Administrador
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Carlos Mendes</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 leading-tight">
                  Financeiro • Custos • Fornecedores • OS & PDV
                </div>
              </button>

              {/* 2. Seller Shortcut */}
              <button
                id="btn-login-seller"
                type="button"
                onClick={() => handleQuickLogin('SELLER')}
                disabled={isLoading}
                className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/80 rounded-2xl text-left transition-all duration-150 group relative flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-950/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    💼
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    Balcão
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Vendedor(a)
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Mariana Silva</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 leading-tight">
                  PDV • Comissões • Abertura OS • Sem Custos
                </div>
              </button>

              {/* 3. Technician Shortcut */}
              <button
                id="btn-login-tech"
                type="button"
                onClick={() => handleQuickLogin('TECHNICIAN')}
                disabled={isLoading}
                className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/80 rounded-2xl text-left transition-all duration-150 group relative flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-950/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    🔧
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                    Bancada
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Técnico Master
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Lucas Rocha</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 leading-tight">
                  Placas • Peças • Laudo Técnico • Modelos
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Ou autenticar manualmente
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail ou Nome de Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: admin@dualcell.com.br, vendedor@... ou tecnico@..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Senha de Acesso</label>
                <span className="text-[11px] text-slate-500 font-medium">Qualquer senha no modo demo</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Acessando sistema...</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* RBAC Security Summary Info Card */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Regras de Controle de Acesso (RBAC)</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-slate-400 leading-normal">
              <li>
                <strong className="text-indigo-300 font-semibold">Admin:</strong> Visão completa de
                lucro, DRE, custos de peças, fornecedores e relatórios financeiros.
              </li>
              <li>
                <strong className="text-emerald-300 font-semibold">Vendedor:</strong> Foco no PDV de
                balcão, abertura de OS, comissões de venda e catálogo com preço de venda (sem custos).
              </li>
              <li>
                <strong className="text-purple-300 font-semibold">Técnico:</strong> Foco nas OS em
                análise de placa, aguardando peças, manutenção e catálogo de modelos.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          DUAL CELL PRO v2.0 • Sistema Integral para Oficinas & Lojas de Celular
        </p>
      </div>
    </div>
  );
};
