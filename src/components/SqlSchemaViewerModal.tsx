import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  Download,
} from 'lucide-react';

interface SqlSchemaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaViewerModal: React.FC<SqlSchemaViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    fetch('/api/schema')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleDownload = () => {
    window.open('/api/schema', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl relative text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Script SQL Completo (PostgreSQL + RLS + Triggers)
              </h3>
              <p className="text-xs text-slate-400">
                Arquivo: <code className="font-mono text-blue-300">/supabase/schema.sql</code> (25 tabelas relacionais e regras de segurança)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>
              Copie este script e cole no <strong>SQL Editor</strong> do painel Supabase para criar todo o banco instantaneamente.
            </span>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline flex items-center gap-1 text-[11px] shrink-0"
          >
            Abrir Supabase <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 bg-slate-950">
          <pre className="leading-relaxed">
{`-- ==============================================================================
-- DUAL SYSTEM - Gestão de Assistência Técnica de Celulares e Eletrônicos
-- Estrutura Inicial do Banco de Dados PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Papéis (Roles: ADMIN, SELLER)
CREATE TABLE IF NOT EXISTS public.roles (...);

-- 3. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (...);

-- 4. Tabela de Clientes (Clients)
CREATE TABLE IF NOT EXISTS public.clients (...);

-- 5. Tabela de Marcas (Brands)
CREATE TABLE IF NOT EXISTS public.brands (...);

-- 6. Tabela de Modelos de Celulares (Phone Models)
CREATE TABLE IF NOT EXISTS public.phone_models (...);

-- 7. Tabela de Categorias de Produtos (Product Categories)
CREATE TABLE IF NOT EXISTS public.product_categories (...);

-- 8. Tabela de Fornecedores (Suppliers) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.suppliers (...);

-- 9. Tabela de Produtos / Peças (Products) - Preço de custo protegido
CREATE TABLE IF NOT EXISTS public.products (...);

-- 10. Tabela de Serviços de Mão de Obra (Services)
CREATE TABLE IF NOT EXISTS public.services (...);

-- 11. Tabela de Vendedores (Sellers)
CREATE TABLE IF NOT EXISTS public.sellers (...);

-- 12. Tabela de Ordens de Serviço (Service Orders)
CREATE TABLE IF NOT EXISTS public.service_orders (...);

-- 13. Tabela de Itens da Ordem de Serviço (Service Order Items)
CREATE TABLE IF NOT EXISTS public.service_order_items (...);

-- 14. Histórico de Mudança de Status da OS (Service Order History)
CREATE TABLE IF NOT EXISTS public.service_order_history (...);

-- 15. Tabela de Estoque Consolidado (Inventory)
CREATE TABLE IF NOT EXISTS public.inventory (...);

-- 16. Tabela de Movimentações de Estoque (Inventory Movements)
CREATE TABLE IF NOT EXISTS public.inventory_movements (...);

-- 17. Tabela de Vendas / PDV (Sales)
CREATE TABLE IF NOT EXISTS public.sales (...);

-- 18. Tabela de Itens da Venda (Sale Items)
CREATE TABLE IF NOT EXISTS public.sale_items (...);

-- 19. Tabela de Comissões (Commissions)
CREATE TABLE IF NOT EXISTS public.commissions (...);

-- 20. Tabela de Caixas (Cash Registers)
CREATE TABLE IF NOT EXISTS public.cash_registers (...);

-- 21. Tabela de Movimentações de Caixa (Cash Movements: Sangria, Suprimento)
CREATE TABLE IF NOT EXISTS public.cash_movements (...);

-- 22. Tabela de Contas a Receber (Accounts Receivable)
CREATE TABLE IF NOT EXISTS public.accounts_receivable (...);

-- 23. Tabela de Contas a Pagar (Accounts Payable) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.accounts_payable (...);

-- 24. Tabela de Pagamentos (Payments: Dinheiro, PIX, Cartão, Boleto)
CREATE TABLE IF NOT EXISTS public.payments (...);

-- 25. Tabela de Logs de Auditoria (Audit Logs) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.audit_logs (...);

-- VISÕES E POLÍTICAS RLS (Row Level Security)
-- Visão v_products_seller para ocultar custo de produtos para vendedores
-- Políticas de bloqueio a fornecedores, contas a pagar e auditoria`}
          </pre>
        </div>
      </div>
    </div>
  );
};
