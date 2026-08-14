import React from 'react';
import {
  Smartphone,
  Shield,
  UserCheck,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Database,
  Code2,
  RefreshCw,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSchema: () => void;
  onTestConnection: () => void;
  isTestingConnection: boolean;
  connectionStatus: 'connected' | 'unconfigured' | 'error' | 'idle';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenProfile,
  onOpenSchema,
  onTestConnection,
  isTestingConnection,
  connectionStatus,
}) => {
  const { user, profile, role, setSimulatedRole, signOut, isConfigured } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                DUAL SYSTEM
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Auth & RLS v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Gestão de Assistência Técnica & Ponto de Venda
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Connection Status Pill */}
          <button
            onClick={onTestConnection}
            disabled={isTestingConnection}
            title="Clique para testar conexão com o Supabase"
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              connectionStatus === 'connected'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40'
                : connectionStatus === 'error'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-900/40'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-400 hover:bg-amber-900/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isTestingConnection
                ? 'Testando...'
                : connectionStatus === 'connected'
                ? 'Supabase Ativo'
                : connectionStatus === 'error'
                ? 'Erro Supabase'
                : isConfigured
                ? 'Testar Conexão'
                : 'Supabase Configurado'}
            </span>
            {isTestingConnection ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : connectionStatus === 'connected' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400" />
            )}
          </button>

          {/* View SQL Schema Button */}
          <button
            onClick={onOpenSchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Ver SQL Schema</span>
          </button>

          {/* Role Switcher (Quick Simulator / Role Toggle) */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">Perfil:</span>
            <button
              onClick={() => setSimulatedRole('ADMIN')}
              className={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1 ${
                role === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>ADMIN</span>
            </button>
            <button
              onClick={() => setSimulatedRole('SELLER')}
              className={`px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1 ${
                role === 'SELLER'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>VENDEDOR</span>
            </button>
          </div>

          {/* User Auth Info or Login Button */}
          {profile ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors text-left group"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {profile.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {profile.full_name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono leading-none">
                    {role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                  </p>
                </div>
              </button>

              <button
                onClick={signOut}
                title="Encerrar Sessão (Logout)"
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
