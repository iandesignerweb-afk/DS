import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Lock,
  LogOut,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';

interface TestingGuideCardProps {
  onTriggerDeniedTest: () => void;
  onOpenAuthModal: () => void;
  onSelectUsersModule: () => void;
}

export const TestingGuideCard: React.FC<TestingGuideCardProps> = ({
  onTriggerDeniedTest,
  onOpenAuthModal,
  onSelectUsersModule,
}) => {
  const {
    role,
    profile,
    user,
    loginAsDemoUser,
    signOut,
    simulateSessionTimeout,
  } = useAuth();

  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  const handleScenario1 = () => {
    setActiveScenario(1);
    loginAsDemoUser('ADMIN');
  };

  const handleScenario2 = () => {
    setActiveScenario(2);
    loginAsDemoUser('SELLER');
  };

  const handleScenario3 = async () => {
    setActiveScenario(3);
    await signOut();
  };

  const handleScenario4 = () => {
    setActiveScenario(4);
    simulateSessionTimeout();
  };

  const handleScenario5 = () => {
    setActiveScenario(5);
    loginAsDemoUser('SELLER');
    onTriggerDeniedTest();
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-md border border-indigo-800/40 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Painel de Testes Guiados de Autenticação</span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Validação dos 5 Requisitos de Autenticação & Perfis
          </h3>
          <p className="text-xs text-slate-400">
            Execute os 5 fluxos solicitados com 1 clique para inspecionar o comportamento da aplicação em tempo real.
          </p>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs shrink-0">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              role === 'ADMIN' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-400">Logado como:</span>
          <span className={`font-bold ${role === 'ADMIN' ? 'text-blue-400' : 'text-amber-400'}`}>
            {role === 'ADMIN' ? 'ADMIN (Acesso Total)' : 'VENDEDOR (Operacional)'}
          </span>
        </div>
      </div>

      {/* 5 Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Scenario 1 */}
        <button
          onClick={handleScenario1}
          className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between ${
            role === 'ADMIN' && profile
              ? 'bg-blue-950/40 border-blue-500/50 shadow-md'
              : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>1. Login Admin</span>
              </span>
              {role === 'ADMIN' && profile && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Acessa módulo de Usuários, Fornecedores e Custos.
            </p>
          </div>
          <span className="text-[10px] text-blue-300 font-semibold mt-2 group-hover:underline">
            Testar Login Admin →
          </span>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={handleScenario2}
          className={`p-3.5 rounded-xl border text-left transition-all group flex flex-col justify-between ${
            role === 'SELLER' && profile
              ? 'bg-amber-950/40 border-amber-500/50 shadow-md'
              : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>2. Login Vendedor</span>
              </span>
              {role === 'SELLER' && profile && (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Acesso restrito: Preços de custo e fornecedores ocultos.
            </p>
          </div>
          <span className="text-[10px] text-amber-300 font-semibold mt-2 group-hover:underline">
            Testar Login Vendedor →
          </span>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={handleScenario3}
          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:bg-slate-900 hover:border-rose-800/50 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                <span>3. Logout</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Encerra sessão e limpa credenciais locais.
            </p>
          </div>
          <span className="text-[10px] text-rose-300 font-semibold mt-2 group-hover:underline">
            Executar Logout →
          </span>
        </button>

        {/* Scenario 4 */}
        <button
          onClick={handleScenario4}
          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:bg-slate-900 hover:border-orange-800/50 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>4. Expiração Sessão</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simula timeout do token JWT e bloqueio automático.
            </p>
          </div>
          <span className="text-[10px] text-orange-300 font-semibold mt-2 group-hover:underline">
            Simular Expiração →
          </span>
        </button>

        {/* Scenario 5 */}
        <button
          onClick={handleScenario5}
          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:bg-slate-900 hover:border-rose-500/50 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>5. Acesso Negado</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tenta acessar Usuários/Fornecedores como Vendedor.
            </p>
          </div>
          <span className="text-[10px] text-rose-300 font-semibold mt-2 group-hover:underline">
            Simular Bloqueio 403 →
          </span>
        </button>
      </div>
    </div>
  );
};
