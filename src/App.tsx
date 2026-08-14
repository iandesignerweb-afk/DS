import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Database,
  Layers,
  CheckCircle2,
  Server,
  Lock,
  Zap,
  FileCode2,
  ArrowRight,
  Sparkles,
  Users,
  Terminal,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { testSupabaseConnection, SupabaseHealthCheckResult } from './lib/supabase';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SupabaseStatusCard } from './components/SupabaseStatusCard';
import { SecurityMatrixCard } from './components/SecurityMatrixCard';
import { DatabaseSchemaExplorer } from './components/DatabaseSchemaExplorer';
import { AuthModal } from './components/AuthModal';
import { SqlSchemaViewerModal } from './components/SqlSchemaViewerModal';
import { ModuleDetailsModal } from './components/ModuleDetailsModal';
import { UserManagementModule } from './components/UserManagementModule';
import { SecurityAuditPanel } from './components/SecurityAuditPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { TestingGuideCard } from './components/TestingGuideCard';
import { AccessDeniedView } from './components/AccessDeniedView';
import { LoginView } from './components/LoginView';

type ViewMode = 'OVERVIEW' | 'USERS' | 'SECURITY_AUDIT' | 'LOGIN_SCREEN';

function MainLayout() {
  const { isConfigured, role, permissions, profile, isSessionExpired } = useAuth();
  const [health, setHealth] = useState<SupabaseHealthCheckResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('OVERVIEW');

  const runConnectionCheck = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setHealth(res);
    } catch (err) {
      console.error('Erro ao testar conexão Supabase:', err);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runConnectionCheck();
  }, []);

  const connectionStatus: 'connected' | 'unconfigured' | 'error' | 'idle' =
    health?.canConnect && health?.hasSchema
      ? 'connected'
      : !isConfigured
      ? 'unconfigured'
      : health?.canConnect === false
      ? 'error'
      : 'idle';

  // Handle module selection from Sidebar
  const handleSelectSection = (moduleId: string) => {
    if (moduleId === 'users_roles') {
      setActiveView('USERS');
      setSelectedModuleId('users_roles');
      return;
    }

    // Check if module is restricted to Admin
    const adminOnlyModules = ['suppliers', 'accounts_payable', 'reports', 'sellers'];
    if (adminOnlyModules.includes(moduleId) && role !== 'ADMIN') {
      setSelectedModuleId(moduleId);
      return;
    }

    setSelectedModuleId(moduleId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSchema={() => setIsSchemaOpen(true)}
        onTestConnection={runConnectionCheck}
        isTestingConnection={isTesting}
        connectionStatus={connectionStatus}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar with all system modules */}
        <Sidebar
          activeSection={selectedModuleId || ''}
          onSelectSection={handleSelectSection}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Central Content Area */}
        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          {/* Top View Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setActiveView('OVERVIEW');
                  setSelectedModuleId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'OVERVIEW' && !selectedModuleId
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Visão Geral & DB</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('USERS');
                  setSelectedModuleId('users_roles');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'USERS' || selectedModuleId === 'users_roles'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gestão de Usuários</span>
                {role === 'ADMIN' && (
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800/50">
                    Admin
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveView('SECURITY_AUDIT');
                  setSelectedModuleId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'SECURITY_AUDIT'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Auditoria Direta de APIs & RLS</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('LOGIN_SCREEN');
                  setSelectedModuleId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeView === 'LOGIN_SCREEN'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Tela de Login & Recuperação</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pr-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Perfil Atual:</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  role === 'ADMIN'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                }`}
              >
                {role === 'ADMIN' ? 'ADMINISTRADOR MASTER' : 'USUÁRIO / VENDEDOR'}
              </span>
            </div>
          </div>

          {/* Guided Testing Suite Card */}
          <TestingGuideCard
            onTriggerDeniedTest={() => {
              setSelectedModuleId('suppliers');
              setActiveView('OVERVIEW');
            }}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onSelectUsersModule={() => {
              setActiveView('USERS');
              setSelectedModuleId('users_roles');
            }}
          />

          {/* Conditional View Rendering */}

          {/* Restricted Module 403 Screen */}
          {selectedModuleId &&
            role !== 'ADMIN' &&
            ['suppliers', 'accounts_payable', 'reports', 'sellers'].includes(selectedModuleId) ? (
            <AccessDeniedView
              moduleName={
                selectedModuleId === 'suppliers'
                  ? 'Fornecedores'
                  : selectedModuleId === 'accounts_payable'
                  ? 'Contas a Pagar & Despesas'
                  : selectedModuleId === 'reports'
                  ? 'Relatórios Financeiros & DRE'
                  : 'Vendedores & Metas'
              }
              onBack={() => setSelectedModuleId(null)}
            />
          ) : activeView === 'LOGIN_SCREEN' ? (
            /* Dedicated Login & Password Recovery Screen */
            <LoginView onSuccess={() => setActiveView('OVERVIEW')} />
          ) : activeView === 'USERS' ? (
            /* Full Administrative User Management Module */
            <UserManagementModule />
          ) : activeView === 'SECURITY_AUDIT' ? (
            /* Live Direct Backend / RLS Test Suite */
            <SecurityAuditPanel />
          ) : (
            /* Default Architecture & Schema Overview */
            <>
              {/* Main Summary Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800/40">
                        Etapa 2 Concluída: Autenticação & Usuários
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40">
                        PostgreSQL RLS & JWT
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                      DUAL SYSTEM
                    </h1>
                    <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Sistema profissional de gestão para assistência técnica de celulares.
                      A autenticação Supabase Auth, módulo administrativo de usuários,
                      e controle estrito de permissões (ADMIN vs VENDEDOR) estão ativos e validados no backend.
                    </p>
                  </div>

                  {/* Checklist summary */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0 space-y-2 min-w-[260px]">
                    <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Requisitos Entregues</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Login, Senha & Recuperação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Módulo de Usuários (Admin)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Custo & Fornecedores Ocultos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Permissões validadas no Backend</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Supabase PostgreSQL Connectivity Diagnostic */}
              <SupabaseStatusCard
                health={health}
                isLoading={isTesting}
                onRefresh={runConnectionCheck}
                onOpenSql={() => setIsSchemaOpen(true)}
              />

              {/* 2. Security & RLS Matrix */}
              <SecurityMatrixCard />

              {/* 3. Database Schema Catalog Explorer */}
              <DatabaseSchemaExplorer />
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SqlSchemaViewerModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />
      {selectedModuleId &&
        !['suppliers', 'accounts_payable', 'reports', 'sellers', 'users_roles'].includes(
          selectedModuleId
        ) && (
          <ModuleDetailsModal
            moduleId={selectedModuleId}
            onClose={() => setSelectedModuleId(null)}
          />
        )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
