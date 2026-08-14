import React, { useState } from 'react';
import {
  Users,
  Smartphone,
  Package,
  Wrench,
  Truck,
  FileText,
  Boxes,
  ShoppingCart,
  UserCheck,
  Percent,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Lock,
  CheckCircle2,
  LogOut,
  User,
  Settings,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export interface ModuleItem {
  id: string;
  name: string;
  category: 'OPERATIONAL' | 'COMMERCIAL' | 'FINANCIAL' | 'SECURITY';
  icon: React.ElementType;
  adminOnly?: boolean;
  tableRefs: string[];
}

export const MODULES: ModuleItem[] = [
  // Operacional
  { id: 'clients', name: 'Clientes', category: 'OPERATIONAL', icon: Users, tableRefs: ['clients'] },
  { id: 'brands_models', name: 'Marcas e Modelos', category: 'OPERATIONAL', icon: Smartphone, tableRefs: ['brands', 'phone_models'] },
  { id: 'service_orders', name: 'Ordens de Serviço', category: 'OPERATIONAL', icon: FileText, tableRefs: ['service_orders', 'service_order_items', 'service_order_history'] },
  { id: 'services', name: 'Catálogo de Serviços', category: 'OPERATIONAL', icon: Wrench, tableRefs: ['services'] },
  { id: 'products', name: 'Produtos & Peças', category: 'OPERATIONAL', icon: Package, tableRefs: ['products', 'product_categories'] },
  { id: 'inventory', name: 'Controle de Estoque', category: 'OPERATIONAL', icon: Boxes, tableRefs: ['inventory', 'inventory_movements'] },
  
  // Comercial / PDV
  { id: 'pos', name: 'PDV / Vendas Rápidas', category: 'COMMERCIAL', icon: ShoppingCart, tableRefs: ['sales', 'sale_items'] },
  { id: 'sellers', name: 'Vendedores', category: 'COMMERCIAL', icon: UserCheck, adminOnly: true, tableRefs: ['sellers'] },
  { id: 'commissions', name: 'Comissões', category: 'COMMERCIAL', icon: Percent, tableRefs: ['commissions'] },
  
  // Financeiro (Restrito em grande parte)
  { id: 'cash_register', name: 'Caixa do Dia', category: 'FINANCIAL', icon: Wallet, tableRefs: ['cash_registers', 'cash_movements'] },
  { id: 'cash_supply', name: 'Suprimento', category: 'FINANCIAL', icon: ArrowDownRight, tableRefs: ['cash_movements'] },
  { id: 'cash_bleed', name: 'Sangria', category: 'FINANCIAL', icon: ArrowUpRight, tableRefs: ['cash_movements'] },
  { id: 'suppliers', name: 'Fornecedores', category: 'FINANCIAL', icon: Truck, adminOnly: true, tableRefs: ['suppliers'] },
  { id: 'accounts_receivable', name: 'Contas a Receber', category: 'FINANCIAL', icon: DollarSign, tableRefs: ['accounts_receivable', 'payments'] },
  { id: 'accounts_payable', name: 'Contas a Pagar', category: 'FINANCIAL', icon: DollarSign, adminOnly: true, tableRefs: ['accounts_payable'] },
  { id: 'reports', name: 'Relatórios & DRE', category: 'FINANCIAL', icon: BarChart3, adminOnly: true, tableRefs: ['sales', 'service_orders', 'payments'] },

  // Segurança & Gestão
  { id: 'users_roles', name: 'Usuários do Sistema', category: 'SECURITY', icon: ShieldCheck, adminOnly: true, tableRefs: ['profiles', 'roles', 'audit_logs'] },
];

interface SidebarProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  onOpenProfile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenProfile,
}) => {
  const { role, profile, signOut } = useAuth();
  const [hideRestricted, setHideRestricted] = useState(true);

  const categories = [
    { key: 'OPERATIONAL', label: 'Operacional & Assistência' },
    { key: 'COMMERCIAL', label: 'Comercial & Vendas' },
    { key: 'FINANCIAL', label: 'Financeiro & Caixa' },
    { key: 'SECURITY', label: 'Gestão & Segurança' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Header Info & Menu Mode Toggle */}
      <div className="p-3.5 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navegação por Perfil
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
              role === 'ADMIN'
                ? 'bg-blue-950 text-blue-400 border-blue-800/60'
                : 'bg-amber-950 text-amber-400 border-amber-800/60'
            }`}
          >
            {role === 'ADMIN' ? 'Menu Admin' : 'Menu Vendedor'}
          </span>
        </div>

        {/* Filter Toggle for Seller */}
        {role === 'SELLER' && (
          <button
            onClick={() => setHideRestricted(!hideRestricted)}
            className="w-full flex items-center justify-between px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1">
              {hideRestricted ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
              <span>{hideRestricted ? 'Ocultando itens restritos' : 'Exibindo bloqueados'}</span>
            </span>
            <span className="text-blue-400 underline">Alternar</span>
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {categories.map((cat) => {
          let items = MODULES.filter((m) => m.category === cat.key);

          // If role is SELLER and hideRestricted is active, remove adminOnly items from view
          if (role !== 'ADMIN' && hideRestricted) {
            items = items.filter((m) => !m.adminOnly);
          }

          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1">
              <h4 className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {cat.label}
              </h4>
              <div className="mt-1 space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isRestricted = item.adminOnly && role !== 'ADMIN';
                  const isSelected = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                          : isRestricted
                          ? 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40 opacity-70'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected
                              ? 'text-blue-400'
                              : isRestricted
                              ? 'text-slate-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {isRestricted ? (
                        <div
                          title="Restrito: Bloqueado pelo RLS para Vendedores"
                          className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40 shrink-0"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>Bloqueado</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-emerald-400/80 font-mono shrink-0">
                          {isSelected ? '● Ativo' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logged-In User Profile Identification Box */}
      {profile && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                role === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-amber-600 text-white shadow-sm'
              }`}
            >
              {profile.full_name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-300">
                  {profile.full_name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-semibold ${
                    role === 'ADMIN' ? 'text-blue-400' : 'text-amber-400'
                  }`}
                >
                  {role === 'ADMIN' ? 'ADMINISTRADOR' : 'VENDEDOR'}
                </span>
                <span className="text-[10px] text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400 font-mono">Ativo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfile}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
            >
              <User className="w-3 h-3 text-slate-400" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={signOut}
              title="Encerrar Sessão (Logout)"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/40 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
