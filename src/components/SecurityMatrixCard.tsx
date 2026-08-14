import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Database,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export const SecurityMatrixCard: React.FC = () => {
  const { role, permissions, setSimulatedRole } = useAuth();

  const rules = [
    {
      feature: 'Preço de Custo (cost_price)',
      dbProtection: 'View v_products_seller & RLS',
      adminAccess: true,
      sellerAccess: false,
      description: 'Vendedores e usuários comuns só visualizam o preço final de venda. O custo das peças é ocultado diretamente no PostgreSQL.',
    },
    {
      feature: 'Fornecedores (suppliers)',
      dbProtection: 'RLS: Suppliers admin only',
      adminAccess: true,
      sellerAccess: false,
      description: 'Tabela com dados de contato, notas fiscais e compras dos fornecedores é restrita a administradores.',
    },
    {
      feature: 'Contas a Pagar (accounts_payable)',
      dbProtection: 'RLS: Accounts payable admin only',
      adminAccess: true,
      sellerAccess: false,
      description: 'Vendedores não possuem acesso aos compromissos a pagar da assistência e relatórios de despesas.',
    },
    {
      feature: 'Logs de Auditoria (audit_logs)',
      dbProtection: 'RLS: Audit logs admin only',
      adminAccess: true,
      sellerAccess: false,
      description: 'Histórico de alterações críticas de preços, exclusões e acessos fica protegido para auditoria da gerência.',
    },
    {
      feature: 'Ordens de Serviço & Clientes',
      dbProtection: 'RLS: Authenticated read/write',
      adminAccess: true,
      sellerAccess: true,
      description: 'Vendedores e técnicos criam clientes, abrem ordens de serviço, atualizam diagnósticos e realizam entregas.',
    },
    {
      feature: 'PDV & Vendas Rápidas',
      dbProtection: 'RLS: Authenticated read/write',
      adminAccess: true,
      sellerAccess: true,
      description: 'Lançamento de vendas de acessórios, peças balcão e recebimentos.',
    },
    {
      feature: 'Comissões de Vendas',
      dbProtection: 'RLS: Commissions read own or admin',
      adminAccess: true,
      sellerAccess: true, // apenas as próprias
      description: 'Vendedores visualizam unicamente o cálculo e extrato de suas próprias comissões; administradores visualizam de toda a equipe.',
    },
    {
      feature: 'Gerenciamento de Usuários & Papéis',
      dbProtection: 'RLS: Profiles & Roles write admin',
      adminAccess: true,
      sellerAccess: false,
      description: 'Criação de novos usuários, concessão de privilégios e troca de papéis reservados para administradores.',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Arquitetura de Segurança & Permissões (RLS)
            </h3>
            <p className="text-xs text-slate-400">
              Proteção nativa no banco de dados Supabase PostgreSQL para impedir vazamento de dados críticos
            </p>
          </div>
        </div>

        {/* Role Simulator Switch */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Testar visualização:</span>
          <button
            onClick={() => setSimulatedRole('ADMIN')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              role === 'ADMIN'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ADMIN
          </button>
          <button
            onClick={() => setSimulatedRole('SELLER')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              role === 'SELLER'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VENDEDOR
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Módulo / Informação Sensível</th>
              <th className="py-2.5 px-3">Mecanismo de Segurança</th>
              <th className="py-2.5 px-3 text-center">ADMIN</th>
              <th className="py-2.5 px-3 text-center">USUÁRIO / VENDEDOR</th>
              <th className="py-2.5 px-3">Regra de Negócio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rules.map((rule, idx) => {
              const isCurrentRoleAllowed =
                role === 'ADMIN' ? rule.adminAccess : rule.sellerAccess;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    !isCurrentRoleAllowed ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                    {isCurrentRoleAllowed ? (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span>{rule.feature}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-cyan-400/90">
                    {rule.dbProtection}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {rule.sellerAccess ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span
                        title="Bloqueado no PostgreSQL via RLS"
                        className="inline-flex items-center justify-center w-6 h-6 rounded bg-rose-950 text-rose-400 border border-rose-800/40"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs">
                    {rule.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
