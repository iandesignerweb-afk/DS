import React, { useState } from 'react';
import {
  Database,
  Table,
  Layers,
  Link,
  Search,
  CheckCircle,
  FileCode,
  Shield,
  Key,
} from 'lucide-react';

interface TableDefinition {
  name: string;
  category: 'CORE' | 'ASSISTÊNCIA' | 'ESTOQUE' | 'VENDAS' | 'FINANCEIRO' | 'SEGURANÇA';
  description: string;
  columnsCount: number;
  primaryKey: string;
  foreignKeys: string[];
  sensitive: boolean;
  indexes: string[];
}

const TABLES: TableDefinition[] = [
  {
    name: 'roles',
    category: 'SEGURANÇA',
    description: 'Definição dos níveis de privilégios (ADMIN, SELLER, TECHNICIAN)',
    columnsCount: 4,
    primaryKey: 'id (UUID)',
    foreignKeys: [],
    sensitive: false,
    indexes: ['roles_pkey'],
  },
  {
    name: 'profiles',
    category: 'SEGURANÇA',
    description: 'Extensão de perfil dos usuários vinculada ao auth.users do Supabase',
    columnsCount: 8,
    primaryKey: 'id (UUID -> auth.users.id)',
    foreignKeys: ['role_id -> roles.id'],
    sensitive: false,
    indexes: ['idx_profiles_role_id'],
  },
  {
    name: 'clients',
    category: 'ASSISTÊNCIA',
    description: 'Cadastro de clientes com CPF/CNPJ, telefones, endereço e histórico',
    columnsCount: 15,
    primaryKey: 'id (UUID)',
    foreignKeys: ['created_by -> profiles.id'],
    sensitive: false,
    indexes: ['idx_clients_phone', 'idx_clients_document'],
  },
  {
    name: 'brands',
    category: 'ASSISTÊNCIA',
    description: 'Marcas de celulares (Apple, Samsung, Motorola, Xiaomi, etc)',
    columnsCount: 4,
    primaryKey: 'id (UUID)',
    foreignKeys: [],
    sensitive: false,
    indexes: ['brands_name_key'],
  },
  {
    name: 'phone_models',
    category: 'ASSISTÊNCIA',
    description: 'Modelos de aparelhos vinculados às marcas com número de modelo',
    columnsCount: 5,
    primaryKey: 'id (UUID)',
    foreignKeys: ['brand_id -> brands.id'],
    sensitive: false,
    indexes: ['idx_phone_models_brand_id', 'uq_brand_model_name'],
  },
  {
    name: 'product_categories',
    category: 'ESTOQUE',
    description: 'Categorias de produtos (Telas, Baterias, Conectores, Películas, etc)',
    columnsCount: 4,
    primaryKey: 'id (UUID)',
    foreignKeys: [],
    sensitive: false,
    indexes: ['product_categories_name_key'],
  },
  {
    name: 'suppliers',
    category: 'ESTOQUE',
    description: 'Fornecedores de peças e acessórios (RESTRITO AO ADMIN)',
    columnsCount: 11,
    primaryKey: 'id (UUID)',
    foreignKeys: [],
    sensitive: true,
    indexes: ['suppliers_pkey'],
  },
  {
    name: 'products',
    category: 'ESTOQUE',
    description: 'Produtos e peças com preço de venda e custo confidencial',
    columnsCount: 14,
    primaryKey: 'id (UUID)',
    foreignKeys: ['category_id -> product_categories.id', 'brand_id -> brands.id', 'phone_model_id -> phone_models.id', 'supplier_id -> suppliers.id'],
    sensitive: true,
    indexes: ['idx_products_sku', 'idx_products_barcode', 'idx_products_category', 'idx_products_brand'],
  },
  {
    name: 'services',
    category: 'ASSISTÊNCIA',
    description: 'Catálogo de serviços de mão de obra (Troca de tela, banho químico, reparo em placa)',
    columnsCount: 7,
    primaryKey: 'id (UUID)',
    foreignKeys: [],
    sensitive: false,
    indexes: ['services_pkey'],
  },
  {
    name: 'sellers',
    category: 'VENDAS',
    description: 'Cadastro de vendedores com percentual de comissionamento padrão',
    columnsCount: 6,
    primaryKey: 'id (UUID)',
    foreignKeys: ['user_id -> auth.users.id'],
    sensitive: false,
    indexes: ['sellers_user_id_key'],
  },
  {
    name: 'service_orders',
    category: 'ASSISTÊNCIA',
    description: 'Ordens de serviço completas com IMEI, defeito relatado, laudo, prazos e status',
    columnsCount: 26,
    primaryKey: 'id (UUID), order_number (BIGSERIAL)',
    foreignKeys: ['client_id -> clients.id', 'brand_id -> brands.id', 'phone_model_id -> phone_models.id', 'seller_id -> sellers.id', 'technician_id -> profiles.id'],
    sensitive: false,
    indexes: ['idx_service_orders_client', 'idx_service_orders_status', 'idx_service_orders_imei', 'idx_service_orders_created_at'],
  },
  {
    name: 'service_order_items',
    category: 'ASSISTÊNCIA',
    description: 'Peças e serviços utilizados na OS com valores e custos',
    columnsCount: 10,
    primaryKey: 'id (UUID)',
    foreignKeys: ['service_order_id -> service_orders.id', 'service_id -> services.id', 'product_id -> products.id'],
    sensitive: true,
    indexes: ['service_order_items_service_order_id_idx'],
  },
  {
    name: 'service_order_history',
    category: 'ASSISTÊNCIA',
    description: 'Rastreabilidade de alterações de status e observações técnicas da OS',
    columnsCount: 6,
    primaryKey: 'id (UUID)',
    foreignKeys: ['service_order_id -> service_orders.id', 'changed_by -> profiles.id'],
    sensitive: false,
    indexes: ['service_order_history_service_order_id_idx'],
  },
  {
    name: 'inventory',
    category: 'ESTOQUE',
    description: 'Saldo consolidado (físico, reservado em OS, disponível) e localização na prateleira',
    columnsCount: 6,
    primaryKey: 'id (UUID)',
    foreignKeys: ['product_id -> products.id'],
    sensitive: false,
    indexes: ['inventory_product_id_key'],
  },
  {
    name: 'inventory_movements',
    category: 'ESTOQUE',
    description: 'Kardex/movimentações de entrada, saída por venda, uso em OS e ajustes manuais',
    columnsCount: 9,
    primaryKey: 'id (UUID)',
    foreignKeys: ['product_id -> products.id', 'created_by -> profiles.id'],
    sensitive: true,
    indexes: ['inventory_movements_product_id_idx'],
  },
  {
    name: 'sales',
    category: 'VENDAS',
    description: 'Vendas diretas no PDV com cliente, vendedor, subtotais e descontos',
    columnsCount: 9,
    primaryKey: 'id (UUID), sale_number (BIGSERIAL)',
    foreignKeys: ['client_id -> clients.id', 'seller_id -> sellers.id', 'created_by -> profiles.id'],
    sensitive: false,
    indexes: ['idx_sales_created_at'],
  },
  {
    name: 'sale_items',
    category: 'VENDAS',
    description: 'Itens inclusos na venda do PDV com preço praticado e custo',
    columnsCount: 8,
    primaryKey: 'id (UUID)',
    foreignKeys: ['sale_id -> sales.id', 'product_id -> products.id'],
    sensitive: true,
    indexes: ['sale_items_sale_id_idx'],
  },
  {
    name: 'commissions',
    category: 'VENDAS',
    description: 'Registro individual de comissões por venda ou OS fechada',
    columnsCount: 9,
    primaryKey: 'id (UUID)',
    foreignKeys: ['seller_id -> sellers.id', 'sale_id -> sales.id', 'service_order_id -> service_orders.id'],
    sensitive: false,
    indexes: ['idx_commissions_seller'],
  },
  {
    name: 'cash_registers',
    category: 'FINANCEIRO',
    description: 'Turnos e abertura/fechamento diário de caixas da loja',
    columnsCount: 9,
    primaryKey: 'id (UUID)',
    foreignKeys: ['opened_by -> profiles.id', 'closed_by -> profiles.id'],
    sensitive: false,
    indexes: ['cash_registers_opened_at_idx'],
  },
  {
    name: 'cash_movements',
    category: 'FINANCEIRO',
    description: 'Lançamentos de Sangria, Suprimento, Entradas de Vendas e Despesas',
    columnsCount: 8,
    primaryKey: 'id (UUID)',
    foreignKeys: ['cash_register_id -> cash_registers.id', 'performed_by -> profiles.id'],
    sensitive: false,
    indexes: ['idx_cash_movements_register'],
  },
  {
    name: 'accounts_receivable',
    category: 'FINANCEIRO',
    description: 'Contas a receber de vendas a prazo, convênios e ordens faturadas',
    columnsCount: 11,
    primaryKey: 'id (UUID)',
    foreignKeys: ['client_id -> clients.id', 'sale_id -> sales.id', 'service_order_id -> service_orders.id'],
    sensitive: false,
    indexes: ['idx_accounts_receivable_due'],
  },
  {
    name: 'accounts_payable',
    category: 'FINANCEIRO',
    description: 'Contas a pagar de fornecedores, aluguel e despesas (RESTRITO AO ADMIN)',
    columnsCount: 11,
    primaryKey: 'id (UUID)',
    foreignKeys: ['supplier_id -> suppliers.id'],
    sensitive: true,
    indexes: ['idx_accounts_payable_due'],
  },
  {
    name: 'payments',
    category: 'FINANCEIRO',
    description: 'Transações de pagamento (PIX, Cartão, Dinheiro, Transferência, Boleto)',
    columnsCount: 12,
    primaryKey: 'id (UUID)',
    foreignKeys: ['cash_register_id -> cash_registers.id', 'sale_id -> sales.id', 'service_order_id -> service_orders.id'],
    sensitive: false,
    indexes: ['payments_created_at_idx'],
  },
  {
    name: 'audit_logs',
    category: 'SEGURANÇA',
    description: 'Auditoria de ações críticas com dados antigos/novos em JSONB (RESTRITO AO ADMIN)',
    columnsCount: 10,
    primaryKey: 'id (UUID)',
    foreignKeys: ['user_id -> profiles.id'],
    sensitive: true,
    indexes: ['idx_audit_logs_table_record'],
  },
];

export const DatabaseSchemaExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredTables = TABLES.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'ALL', label: 'Todas as Tabelas (24)' },
    { key: 'ASSISTÊNCIA', label: 'Assistência & OS' },
    { key: 'ESTOQUE', label: 'Estoque & Produtos' },
    { key: 'VENDAS', label: 'Vendas & PDV' },
    { key: 'FINANCEIRO', label: 'Financeiro & Caixa' },
    { key: 'SEGURANÇA', label: 'Segurança & Auth' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Catálogo de Estrutura Relacional (PostgreSQL)
            </h3>
            <p className="text-xs text-slate-400">
              Mapeamento de chaves primárias, estrangeiras e índices do DUAL SYSTEM
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filtrar tabelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {filteredTables.map((table) => (
          <div
            key={table.name}
            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {table.name}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {table.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {table.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-500">
                <span>Campos:</span>
                <span className="font-mono text-slate-300 font-medium">
                  {table.columnsCount} colunas
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> PK:
                </span>
                <span className="font-mono text-slate-400 truncate max-w-[150px]">
                  {table.primaryKey}
                </span>
              </div>

              {table.foreignKeys.length > 0 && (
                <div className="text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <Link className="w-3 h-3 text-blue-400" /> Relacionamentos FK:
                  </span>
                  <div className="space-y-0.5 mt-0.5">
                    {table.foreignKeys.slice(0, 2).map((fk, i) => (
                      <p key={i} className="font-mono text-[10px] text-slate-400 truncate pl-4">
                        ↳ {fk}
                      </p>
                    ))}
                    {table.foreignKeys.length > 2 && (
                      <p className="font-mono text-[10px] text-slate-500 pl-4">
                        + {table.foreignKeys.length - 2} outros relacionamentos
                      </p>
                    )}
                  </div>
                </div>
              )}

              {table.sensitive && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/40">
                    <Shield className="w-2.5 h-2.5" /> Protegido por RLS
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
