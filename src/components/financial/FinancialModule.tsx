import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { FinancialAccount, FinancialSummary, User as UserType, Sale } from '../../types';
import { formatCurrencyBR, formatDateBR, formatDateTimeBR } from '../../lib/formatters';

interface FinancialModuleProps {
  userRole: string;
  users: UserType[];
  sales: Sale[];
  onRefresh: () => void;
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  userRole,
  users,
  sales,
  onRefresh,
}) => {
  const isAdmin = userRole === 'ADMIN';

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMMISSIONS' | 'ACCOUNTS'>('OVERVIEW');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'ALL' | 'PAYABLE' | 'RECEIVABLE'>('ALL');

  // Modal: Add Account
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountType, setAccountType] = useState<'PAYABLE' | 'RECEIVABLE'>('PAYABLE');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Aluguel / Despesas');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [entityName, setEntityName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFinancialData = async () => {
    if (!isAdmin) return;
    try {
      const [sumRes, accRes] = await Promise.all([
        fetch('/api/financial/summary', { headers: { 'x-user-role': userRole } }),
        fetch('/api/financial/accounts', { headers: { 'x-user-role': userRole } }),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary);
      }
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData.accounts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [userRole]);

  // RBAC Guard
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Módulo Financeiro Restrito
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conforme as regras do sistema, relatórios de lucratividade, contas a pagar, custos e
            comissões gerais só podem ser acessados por usuários com perfil <strong>ADMIN</strong>.
          </p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Para testar a gestão financeira, altere seu perfil para "Administrador" no topo.</span>
        </div>
      </div>
    );
  }

  // Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !dueDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/financial/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          type: accountType,
          description,
          category,
          amount: parseFloat(amount),
          due_date: dueDate,
          entity_name: entityName || 'Diversos',
        }),
      });

      if (res.ok) {
        setDescription('');
        setAmount('');
        setDueDate('');
        setEntityName('');
        setIsModalOpen(false);
        fetchFinancialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Pay status
  const handleToggleStatus = async (account: FinancialAccount) => {
    const nextStatus = account.status === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const res = await fetch(`/api/financial/accounts/${account.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchFinancialData();
    } catch (err) {
      console.error(err);
    }
  };

  // Commission calculations per seller
  const sellerCommissionSummary = users.map((u) => {
    const userSales = sales.filter((s) => s.seller_id === u.id);
    const totalSold = userSales.reduce((acc, s) => acc + s.total, 0);
    const totalComm = userSales.reduce((acc, s) => acc + s.commission_amount, 0);

    return {
      user: u,
      salesCount: userSales.length,
      totalSold,
      totalCommission: totalComm,
    };
  });

  const filteredAccounts = accounts.filter(
    (a) => accountTypeFilter === 'ALL' || a.type === accountTypeFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Gestão Financeira & Comissões [Admin]
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Receita consolidada (PDV + OS), lucratividade real, fluxo de caixa e comissões
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          + Nova Conta a Pagar/Receber
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Receita Bruta Total</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrencyBR(summary.grossRevenue)}
            </p>
            <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>OS: {formatCurrencyBR(summary.totalOSRevenue)}</span>
              <span>PDV: {formatCurrencyBR(summary.totalSalesRevenue)}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Lucro Bruto Estimado
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrencyBR(summary.estimatedGrossProfit)}
            </p>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
              (Receita menos custo de peças/mercadorias)
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Saldo Atual em Caixa</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrencyBR(summary.cashBalance)}
            </p>
            <span className="text-[11px] text-slate-400">Disponível em gaveta/banco</span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Comissões de Vendas</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrencyBR(summary.totalCommissions)}
            </p>
            <span className="text-[11px] text-slate-400">Total a repassar aos vendedores</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-3 border-b-2 transition-all ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visão Consolidada
        </button>

        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'COMMISSIONS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Comissões dos Vendedores
        </button>

        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`px-4 py-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'ACCOUNTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Contas a Pagar & Receber ({accounts.length})
        </button>
      </div>

      {/* TAB CONTENT: COMMISSIONS */}
      {activeTab === 'COMMISSIONS' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Relatório de Comissões por Vendedor
              </h3>
              <p className="text-xs text-slate-500">
                Cálculo automático baseado no volume vendido de balcão (PDV)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vendedor(a)</th>
                  <th className="py-3 px-4">Cargo / Função</th>
                  <th className="py-3 px-4 text-center">Vendas Feitas</th>
                  <th className="py-3 px-4">% Comissão</th>
                  <th className="py-3 px-4">Volume Total Vendido</th>
                  <th className="py-3 px-4 text-right">Comissão Devida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {sellerCommissionSummary.map((item) => (
                  <tr key={item.user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.user.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{item.user.role}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{item.salesCount}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {item.user.commission_percentage}%
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {formatCurrencyBR(item.totalSold)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrencyBR(item.totalCommission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCOUNTS PAYABLE / RECEIVABLE */}
      {activeTab === 'ACCOUNTS' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setAccountTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  accountTypeFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setAccountTypeFilter('PAYABLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  accountTypeFilter === 'PAYABLE'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                }`}
              >
                Contas a Pagar
              </button>
              <button
                onClick={() => setAccountTypeFilter('RECEIVABLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  accountTypeFilter === 'RECEIVABLE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                }`}
              >
                Contas a Receber
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Fornecedor / Favorecido</th>
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        {acc.type === 'PAYABLE' ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded font-bold text-[10px]">
                            A PAGAR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded font-bold text-[10px]">
                            A RECEBER
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {acc.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{acc.entity_name}</td>
                      <td className="py-3 px-4 font-mono">{formatDateBR(acc.due_date)}</td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        {formatCurrencyBR(acc.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(acc)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            acc.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {acc.status === 'PAID' ? 'PAGO / BAIXADO' : 'PENDENTE'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(acc)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {acc.status === 'PAID' ? 'Reabrir' : 'Dar Baixa'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                      Nenhum lançamento financeiro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW BREAKDOWN */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Composição das Entradas (Receitas)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span>Vendas de Balcão & Acessórios (PDV)</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrencyBR(summary?.totalSalesRevenue)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span>Ordens de Serviço Recebidas (OS)</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrencyBR(summary?.totalOSPaid)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                <span>OS com Saldo a Receber na Retirada</span>
                <span className="font-bold">{formatCurrencyBR(summary?.totalOSPending)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Patrimônio & Estoque Imobilizado
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span>Valor de Custo em Estoque de Peças</span>
                <span className="font-bold text-indigo-600">
                  {formatCurrencyBR(summary?.inventoryCostValue)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <span>Valor de Venda Projetado do Estoque</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyBR(summary?.inventorySalesValue)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <span>Margem de Lucro Bruto Projetada do Estoque</span>
                <span className="font-bold">
                  {summary && summary.inventoryCostValue > 0
                    ? `+${(
                        ((summary.inventorySalesValue - summary.inventoryCostValue) /
                          summary.inventoryCostValue) *
                        100
                      ).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Financial Account */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cadastrar Lançamento Financeiro
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('PAYABLE')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    accountType === 'PAYABLE'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 dark:bg-slate-900'
                  }`}
                >
                  Conta a Pagar
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('RECEIVABLE')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    accountType === 'RECEIVABLE'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 dark:bg-slate-900'
                  }`}
                >
                  Conta a Receber
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de Telas Foxconn Lote 12"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 850.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fornecedor / Cliente / Favorecido
                </label>
                <input
                  type="text"
                  placeholder="Ex: Foxconn Brasil Distribuidora"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
