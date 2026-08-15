import React from 'react';
import {
  Wrench,
  ShoppingCart,
  Cpu,
  Package,
  CheckCircle2,
  Gift,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Smartphone,
  Users,
} from 'lucide-react';
import { ServiceOrder, Sale, Product, STATUS_CONFIG } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';

interface DashboardModuleProps {
  orders: ServiceOrder[];
  sales: Sale[];
  products: Product[];
  userRole: string;
  onNavigate: (tab: string) => void;
  onOpenNewOS: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  orders,
  sales,
  products,
  userRole,
  onNavigate,
  onOpenNewOS,
}) => {
  const countAnalysisBoard = orders.filter((o) => o.status === 'ANALYSIS_BOARD').length;
  const countWaitingParts = orders.filter((o) => o.status === 'WAITING_PARTS').length;
  const countInProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const countReady = orders.filter((o) => o.status === 'FINISHED_READY').length;
  const countWaitingPickup = orders.filter((o) => o.status === 'WAITING_PICKUP').length;
  const countUrgent = orders.filter((o) => o.priority === 'URGENT' && o.status !== 'DELIVERED').length;

  const totalSalesToday = sales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/10 text-indigo-200 text-[10px] font-extrabold uppercase rounded-full tracking-wider border border-white/10">
            Painel Operacional Assistência Técnica
          </span>
          <h1 className="text-2xl font-black mt-2">Visão Geral da Bancada & Vendas</h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Acompanhe o fluxo de reparos, dispositivos em análise de placas, peças aguardando chegada
            e movimentações do PDV em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewOS}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-black rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            + Abrir Nova OS
          </button>
          <button
            onClick={() => onNavigate('POS')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Abrir PDV Frente de Caixa
          </button>
        </div>
      </div>

      {/* Operational Status Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Foi para Análise de Placa */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] font-bold text-purple-700 uppercase">Placas</span>
          </div>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-2">
            {countAnalysisBoard}
          </p>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold block mt-0.5">
            Análise de Placa
          </span>
        </div>

        {/* Aguardando Peças */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-bold text-amber-700 uppercase">Peças</span>
          </div>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-2">
            {countWaitingParts}
          </p>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block mt-0.5">
            Aguardando Peças
          </span>
        </div>

        {/* Em Manutenção */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-700 uppercase">Bancada</span>
          </div>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-2">
            {countInProgress}
          </p>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold block mt-0.5">
            Em Manutenção
          </span>
        </div>

        {/* Pronto */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Pronto</span>
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-2">
            {countReady}
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-0.5">
            Serviço Pronto
          </span>
        </div>

        {/* Aguardando Retirada */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Gift className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-[10px] font-bold text-teal-700 uppercase">Retirada</span>
          </div>
          <p className="text-2xl font-black text-teal-900 dark:text-teal-200 mt-2">
            {countWaitingPickup}
          </p>
          <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold block mt-0.5">
            Aguardando Retirada
          </span>
        </div>

        {/* Urgentes */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="text-[10px] font-bold text-rose-700 uppercase">Urgência</span>
          </div>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">
            {countUrgent}
          </p>
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold block mt-0.5">
            Reparos Urgentes
          </span>
        </div>
      </div>

      {/* Grid: Active Service Orders & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active OS List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ordens de Serviço em Andamento
              </h3>
              <p className="text-xs text-slate-500">Últimos aparelhos que entraram na assistência</p>
            </div>
            <button
              onClick={() => onNavigate('ORDERS')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.slice(0, 5).map((os) => {
              const statusCfg = STATUS_CONFIG[os.status] || STATUS_CONFIG.OPEN;
              return (
                <div
                  key={os.id}
                  onClick={() => onNavigate('ORDERS')}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-xl flex items-center justify-center font-bold text-xs">
                      #{os.order_number}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {os.brand_name} {os.model_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {os.client_name} • {os.reported_defect}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.badge}`}
                    >
                      {statusCfg.label}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                      {formatCurrencyBR(os.total_amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent POS Sales & Fast Shortcuts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Últimas Vendas no PDV
                </h3>
                <p className="text-xs text-slate-500">Volume do dia: {formatCurrencyBR(totalSalesToday)}</p>
              </div>
              <button
                onClick={() => onNavigate('POS')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Abrir PDV
              </button>
            </div>

            <div className="space-y-2">
              {sales.slice(0, 4).map((sale) => (
                <div
                  key={sale.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Venda #{sale.sale_number}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {sale.seller_name} • {sale.items.length} itens ({sale.payment_method})
                    </p>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyBR(sale.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('BRANDS_MODELS')}
              className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group"
            >
              <Smartphone className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marcas & Modelos</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Cadastrar aparelhos para a OS</p>
            </button>

            <button
              onClick={() => onNavigate('CLIENTS')}
              className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group"
            >
              <Users className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clientes & Contato</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Cadastrar clientes e WhatsApp</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
