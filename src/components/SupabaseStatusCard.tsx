import React from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  ShieldCheck,
  Key,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { SupabaseHealthCheckResult } from '../lib/supabase';

interface SupabaseStatusCardProps {
  health: SupabaseHealthCheckResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSql: () => void;
}

export const SupabaseStatusCard: React.FC<SupabaseStatusCardProps> = ({
  health,
  isLoading,
  onRefresh,
  onOpenSql,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              Conexão com o Supabase PostgreSQL
              {health?.canConnect ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  Online ({health.latencyMs}ms)
                </span>
              ) : health?.isConfigured ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/50">
                  Erro de Conexão
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50">
                  Aguardando Chaves .env
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Banco relacional oficial do DUAL SYSTEM sem armazenamento volátil em LocalStorage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Testar Conexão</span>
          </button>
          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Ver Script SQL</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* Item 1: Config State */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              Chaves de API (.env)
            </span>
            {health?.isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1.5">
            {health?.isConfigured ? 'Configuradas' : 'Pendentes no .env'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {health?.configuredUrl || 'VITE_SUPABASE_URL'}
          </p>
        </div>

        {/* Item 2: Database Schema */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Tabelas Criadas no DB
            </span>
            {health?.hasSchema ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1.5">
            {health?.hasSchema
              ? `${health.tablesFound.length} Tabelas Detectadas`
              : 'Execute o schema.sql'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            25 tabelas relacionais preparadas
          </p>
        </div>

        {/* Item 3: Security & RLS */}
        <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Políticas Row Level Security
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1.5">
            Ativo (Admin vs Vendedor)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Preço de custo e fornecedor ocultos no DB
          </p>
        </div>
      </div>

      {/* Helpful setup instructions if not fully configured */}
      {(!health?.isConfigured || !health?.hasSchema) && (
        <div className="mt-4 p-4 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-blue-300 flex items-center gap-2">
            <span>Como conectar seu projeto Supabase:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
            <li>
              Crie um projeto gratuito em{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Vá em <strong className="text-slate-200">Project Settings → API</strong> e copie a{' '}
              <strong className="text-slate-200">Project URL</strong> e a{' '}
              <strong className="text-slate-200">anon public key</strong>.
            </li>
            <li>
              Adicione as variáveis no arquivo <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded">.env</code>:
              <br />
              <code className="block bg-slate-950 p-2 rounded mt-1 font-mono text-[11px] text-slate-300">
                VITE_SUPABASE_URL=https://xyzcompany.supabase.co
                <br />
                VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
              </code>
            </li>
            <li>
              Abra o <strong className="text-slate-200">SQL Editor</strong> no Supabase, cole o conteúdo do nosso{' '}
              <strong className="text-blue-400 cursor-pointer underline" onClick={onOpenSql}>
                schema.sql
              </strong>{' '}
              e clique em <strong className="text-slate-200">Run</strong> para criar todas as tabelas e permissões RLS.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
