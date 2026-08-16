import React, { useState } from 'react';
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
  Shield,
  MessageSquare,
  Award,
  Sparkles,
  Calendar,
  Printer,
} from 'lucide-react';
import { ServiceOrder, Sale, Product, STATUS_CONFIG, UserRole } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';
import { ThermalReceiptModal } from '../pos/ThermalReceiptModal';

interface DashboardModuleProps {
  orders: ServiceOrder[];
  sales: Sale[];
  products: Product[];
  userRole: UserRole;
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
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  const countAnalysisBoard = orders.filter((o) => o.status === 'ANALYSIS_BOARD').length;
  const countWaitingParts = orders.filter((o) => o.status === 'WAITING_PARTS').length;
  const countInProgress = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const countReady = orders.filter((o) => o.status === 'FINISHED_READY').length;
  const countWaitingPickup = orders.filter((o) => o.status === 'WAITING_PICKUP').length;
  const countUrgent = orders.filter((o) => o.priority === 'URGENT' && o.status !== 'DELIVERED').length;

  const totalSalesToday = sales.reduce((acc, s) => acc + s.total, 0);
  const totalCommissionsEarned = sales.reduce((acc, s) => acc + (s.commission_amount || s.total * 0.04), 0);
  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.min_stock);

  // OS waiting for pickup (ready for seller to notify client)
  const pickupOrders = orders.filter((o) => o.status === 'WAITING_PICKUP' || o.status === 'FINISHED_READY');

  // Sorted orders chronologically (FIFO / 1º Cadastrado no Topo)
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = new Date(a.created_at || a.entry_date || 0).getTime();
    const timeB = new Date(b.created_at || b.entry_date || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (a.order_number || 0) - (b.order_number || 0);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner with Role-Specific Visual Identity */}
      <div
        className={`text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          userRole === 'ADMIN'
            ? 'bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 border border-indigo-800/40'
            : userRole === 'SELLER'
            ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 border border-emerald-800/40'
            : 'bg-gradient-to-r from-purple-950 via-purple-900 to-slate-900 border border-purple-800/40'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider border border-white/10">
              {userRole === 'ADMIN' && '👑 Painel Geral do Administrador'}
              {userRole === 'SELLER' && '💼 Painel do Vendedor & Balcão'}
              {userRole === 'TECHNICIAN' && '🔧 Painel da Bancada & Laboratório'}
            </span>
          </div>

          <h1 className="text-2xl font-black mt-2">
            {userRole === 'ADMIN' && 'Controle Geral de Assistência, Estoque & Vendas'}
            {userRole === 'SELLER' && 'Frente de Caixa, Balcão & Minhas Comissões'}
            {userRole === 'TECHNICIAN' && 'Fila de Reparos, Microeletrônica & Peças'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {userRole === 'ADMIN' &&
              'Visão 360° da operação: faturamento do dia, margens, ordens em andamento e estoque.'}
            {userRole === 'SELLER' &&
              'Acompanhe suas vendas no PDV, comissões acumuladas e aparelhos prontos para avisar os clientes.'}
            {userRole === 'TECHNICIAN' &&
              'Foco técnico na bancada: placas para reparo, aparelhos aguardando componentes e diagnósticos.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'TECHNICIAN' && (
            <button
              onClick={() => onNavigate('POS')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Abrir PDV Balcão
            </button>
          )}

          <button
            onClick={onOpenNewOS}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-black rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            + Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* Role-Specific Metric Highlights */}
      {userRole === 'SELLER' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
              <span className="text-xs font-bold uppercase tracking-wider">Vendas Realizadas Hoje</span>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-2">
              {formatCurrencyBR(totalSalesToday)}
            </p>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {sales.length} vendas computadas no caixa
            </span>
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
              <span className="text-xs font-bold uppercase tracking-wider">Minhas Comissões (4%)</span>
              <Award className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-indigo-950 dark:text-indigo-100 mt-2">
              {formatCurrencyBR(totalCommissionsEarned)}
            </p>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
              Comissão creditada sobre suas vendas
            </span>
          </div>

          <div className="p-5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-teal-700 dark:text-teal-300">
              <span className="text-xs font-bold uppercase tracking-wider">Prontos p/ Retirada</span>
              <Gift className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-teal-950 dark:text-teal-100 mt-2">
              {countWaitingPickup + countReady} aparelhos
            </p>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
              Avisar cliente via WhatsApp para retirada
            </span>
          </div>
        </div>
      )}

      {/* Operational Status Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Foi para Análise de Placa */}
        <div
          onClick={() => onNavigate('ORDERS')}
          className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">Placas</span>
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
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Peças</span>
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
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Bancada</span>
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
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Pronto</span>
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
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">Retirada</span>
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
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Urgência</span>
          </div>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-2">
            {countUrgent}
          </p>
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold block mt-0.5">
            Reparos Urgentes
          </span>
        </div>
      </div>

      {/* Grid: Active Service Orders & Recent Sales or Lab Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active OS List */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {userRole === 'TECHNICIAN'
                  ? 'Fila de Reparos Técnicos em Aberto'
                  : 'Ordens de Serviço em Andamento'}
              </h3>
              <p className="text-xs text-slate-500">
                {userRole === 'TECHNICIAN'
                  ? 'Aparelhos na bancada aguardando laudo ou peças'
                  : 'Últimos aparelhos que deram entrada na assistência'}
              </p>
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
            {sortedOrders.slice(0, 5).map((os) => {
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
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-indigo-500" />
                        <span>Entrada: {formatDateTimeBR(os.created_at || os.entry_date)}</span>
                      </div>
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

        {/* Right Column: POS Sales for Admin/Seller OR Lab Priorities for Technician */}
        <div className="lg:col-span-5 space-y-4">
          {userRole !== 'TECHNICIAN' ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Últimas Vendas no PDV
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume do dia: {formatCurrencyBR(totalSalesToday)}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('POS')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Abrir PDV
                </button>
              </div>

              <div className="space-y-2">
                {sales.slice(0, 4).map((sale, idx) => (
                  <div
                    key={`${sale.id || 'sale'}_${sale.sale_number}_${idx}`}
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
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyBR(sale.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        title="Imprimir Cupom 80mm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Diagnósticos & Microeletrônica
                  </h3>
                  <p className="text-xs text-slate-500">Aparelhos prioritários na bancada técnica</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md">
                  Laboratório
                </span>
              </div>

              <div className="space-y-2">
                {orders
                  .filter((o) => o.status === 'ANALYSIS_BOARD' || o.status === 'WAITING_PARTS')
                  .slice(0, 4)
                  .map((os) => (
                    <div
                      key={os.id}
                      onClick={() => onNavigate('ORDERS')}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-purple-500 border border-transparent transition-all"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          OS #{os.order_number} - {os.brand_name} {os.model_name}
                        </span>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          {os.status === 'ANALYSIS_BOARD'
                            ? '🔬 Foi p/ Análise de Placa'
                            : '📦 Aguardando Peças'}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Entrada: {formatDateTimeBR(os.created_at || os.entry_date)}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-bold">
                        Ver Laudo
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Nav Shortcuts based on Role */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('BRANDS_MODELS')}
              className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group"
            >
              <Smartphone className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marcas & Modelos</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Cadastrar aparelhos para OS</p>
            </button>

            {userRole !== 'TECHNICIAN' ? (
              <button
                onClick={() => onNavigate('CLIENTS')}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group"
              >
                <Users className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clientes & WhatsApp</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Cadastrar clientes e contatos</p>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('SERVICES')}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-all group"
              >
                <Wrench className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tabela de Serviços</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Mão de obra e garantias</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up do Cupom Térmico (80mm) */}
      <ThermalReceiptModal
        sale={selectedSaleForReceipt}
        isOpen={!!selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
      />
    </div>
  );
};

