import React from 'react';
import {
  X,
  Database,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MODULES, ModuleItem } from './Sidebar';
import { useAuth } from '../lib/auth-context';

interface ModuleDetailsModalProps {
  moduleId: string | null;
  onClose: () => void;
}

export const ModuleDetailsModal: React.FC<ModuleDetailsModalProps> = ({
  moduleId,
  onClose,
}) => {
  const { role } = useAuth();

  if (!moduleId) return null;

  const moduleItem = MODULES.find((m) => m.id === moduleId);
  if (!moduleItem) return null;

  const Icon = moduleItem.icon;
  const isRestricted = moduleItem.adminOnly && role !== 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 shadow-md">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{moduleItem.name}</h3>
              {moduleItem.adminOnly ? (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Exclusivo Admin
                </span>
              ) : (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <Unlock className="w-2.5 h-2.5" /> Operacional & Vendas
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mapeamento de Arquitetura & Banco de Dados DUAL SYSTEM
            </p>
          </div>
        </div>

        {/* Security Alert if User is Vendedor & Restricted */}
        {isRestricted && (
          <div className="mb-4 p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">
                Acesso Restrito pelo RLS (Row Level Security)
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Usuários com o perfil <strong>VENDEDOR</strong> não possuem permissão de leitura ou escrita nesta tabela no PostgreSQL.
              </p>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="space-y-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Tabelas Relacionais Vinculadas no PostgreSQL:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {moduleItem.tableRefs.map((table) => (
                <span
                  key={table}
                  className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {table}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Status da Arquitetura:</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px] pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tabelas, colunas, chaves primárias e chaves estrangeiras declaradas em <code className="text-blue-300 font-mono">schema.sql</code></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tipagem TypeScript completa configurada em <code className="text-blue-300 font-mono">src/types/database.ts</code></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Políticas de segurança RLS (Row Level Security) ativas para proteção em nível de banco de dados</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Próxima etapa: Implementação das telas e fluxos operacionais
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
