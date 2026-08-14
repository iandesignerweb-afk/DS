import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, ShieldCheck, Database } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface AccessDeniedViewProps {
  moduleName: string;
  requiredRole?: string;
  onBack: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  moduleName,
  requiredRole = 'ADMINISTRADOR',
  onBack,
}) => {
  const { role, setSimulatedRole } = useAuth();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto my-8 shadow-2xl text-center space-y-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-950/50">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40">
          <Lock className="w-3 h-3" />
          <span>HTTP 403 - ACESSO NEGADO / RLS BLOQUEADO</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Acesso Restrito ao Módulo: {moduleName}
        </h2>
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          O seu usuário está autenticado no perfil <strong className="text-amber-400 font-bold">VENDEDOR</strong>.
          Por motivos de segurança e sigilo comercial, este módulo exige permissões de{' '}
          <strong className="text-blue-400 font-bold">{requiredRole}</strong>.
        </p>
      </div>

      {/* RLS Enforcement Explanation */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 text-slate-300">
        <div className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Proteção Ativa em Nível de Banco de Dados (PostgreSQL RLS)</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Esta proteção não ocorre apenas visualmente na interface. Caso uma requisição direta seja feita via API
          ou SDK do Supabase, o banco de dados PostgreSQL rejeitará a consulta automaticamente conforme a política de segurança:
        </p>
        <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-blue-300 border border-slate-800">
          CREATE POLICY "supplier_admin_only" ON suppliers FOR ALL TO authenticated USING (auth.jwt() -&gt;&gt; 'role' = 'ADMIN');
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <button
          onClick={() => setSimulatedRole('ADMIN')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Alternar para ADMIN para Testar Acesso</span>
        </button>
      </div>
    </div>
  );
};
