import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit,
  DollarSign,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  Smartphone,
  ShieldAlert,
  Wrench,
  Package,
  History,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { ServiceOrder, STATUS_CONFIG } from '../../types/serviceOrder';
import { formatCurrencyBR, formatDateTimeBR, formatDateBR } from '../../lib/formatters';

interface ServiceOrderDetailModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onEdit: (order: ServiceOrder) => void;
  onOpenStatusModal: (order: ServiceOrder) => void;
  onOpenPaymentModal: (order: ServiceOrder) => void;
  onOpenPrintModal: (order: ServiceOrder) => void;
}

export const ServiceOrderDetailModal: React.FC<ServiceOrderDetailModalProps> = ({
  order,
  onClose,
  onEdit,
  onOpenStatusModal,
  onOpenPaymentModal,
  onOpenPrintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'history' | 'finance'>('details');

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.OPEN;

  const handleSendWhatsApp = () => {
    const cleanPhone = (order.client_phone || '').replace(/\D/g, '');
    if (!cleanPhone) return;

    const message = `Olá, ${order.client_name}! Informamos que a sua Ordem de Serviço *#${order.order_number}* do aparelho *${order.device_name}* está com status: *${statusConfig.label}*. Total: ${formatCurrencyBR(order.total_amount || 0)}. Dúvidas? Estamos à disposição! — Dual System Assistência`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-sm font-mono font-bold bg-indigo-600 text-white rounded-lg shadow-sm">
                OS #{order.order_number}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
            </div>
            {order.is_motherboard_analysis && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 rounded">
                🔬 Análise de Placa
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenStatusModal(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Alterar Status
            </button>
            <button
              onClick={() => onOpenPaymentModal(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Pagamento
            </button>
            <button
              onClick={() => onOpenPrintModal(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
              title="Notificar cliente via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={() => onEdit(order)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Editar OS"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-850 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Visão Geral do Aparelho & Defeito
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'items'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Serviços & Peças ({ (order.services_items?.length || 0) + (order.parts_items?.length || 0) })
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'finance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Financeiro & Pagamentos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico & Linha do Tempo ({order.history?.length || 0})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Row 1: Cards Cliente e Aparelho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    <User className="w-4 h-4 text-indigo-600" />
                    Dados do Cliente
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Nome:</span> {order.client_name}</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Telefone:</span> {order.client_phone}</p>
                    {order.client_document && (
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">CPF/CNPJ:</span> {order.client_document}</p>
                    )}
                    {order.client_email && (
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">E-mail:</span> {order.client_email}</p>
                    )}
                    {order.client_address && (
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">Endereço:</span> {order.client_address}</p>
                    )}
                  </div>
                </div>

                {/* Aparelho */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Identificação do Aparelho
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Marca / Modelo:</span>{' '}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {order.brand_name || ''} {order.model_name || order.device_name}
                      </span>
                    </p>
                    {order.device_color && (
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">Cor:</span> {order.device_color}</p>
                    )}
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">IMEI 1:</span> {order.imei_1 || 'Não informado'}</p>
                    {order.imei_2 && (
                      <p><span className="font-semibold text-slate-800 dark:text-slate-200">IMEI 2:</span> {order.imei_2}</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Senha/Padrão:</span>{' '}
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {order.device_password || 'Sem senha'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Defeito Relatado e Laudo */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Problema Relatado pelo Cliente:
                  </span>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                    "{order.reported_defect}"
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Laudo Técnico / Diagnóstico de Bancada:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {order.technical_diagnosis || 'Nenhum laudo técnico preenchido até o momento.'}
                  </p>
                </div>
              </div>

              {/* Estado Físico & Acessórios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Estado Físico / Avarias:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{order.physical_condition || 'Nenhuma avaria grave.'}</p>
                  {order.physical_conditions_checklist && order.physical_conditions_checklist.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {order.physical_conditions_checklist.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Acessórios Deixados:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{order.accessories || 'Sem acessórios.'}</p>
                  {order.accessories_checklist && order.accessories_checklist.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {order.accessories_checklist.map((item, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipe e Prazos */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Técnico:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.technician_name || 'Mariana Santos'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Atendente:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.attendant_name || 'Carlos Silva'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Data de Entrada:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatDateTimeBR(order.entry_date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Previsão de Entrega:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {order.delivery_forecast ? formatDateTimeBR(order.delivery_forecast) : 'A combinar'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVIÇOS & PEÇAS */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Tipo</th>
                      <th className="py-2.5 px-4">Item / Descrição</th>
                      <th className="py-2.5 px-4 text-center">Qtd</th>
                      <th className="py-2.5 px-4 text-right">Valor Unitário</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Serviços */}
                    {order.services_items?.map((item, idx) => (
                      <tr key={`srv_${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          Serviço
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">{item.service_name}</td>
                        <td className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-300">{formatCurrencyBR(item.unit_price)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrencyBR(item.subtotal)}</td>
                      </tr>
                    ))}

                    {/* Peças */}
                    {order.parts_items?.map((item, idx) => (
                      <tr key={`prt_${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          Peça
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                          {item.product_name}
                          {item.product_sku && <span className="text-slate-400 text-[11px]"> ({item.product_sku})</span>}
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-600 dark:text-slate-300">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-300">{formatCurrencyBR(item.unit_price)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">{formatCurrencyBR(item.subtotal)}</td>
                      </tr>
                    ))}

                    {(!order.services_items?.length && !order.parts_items?.length) && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          Nenhum serviço ou peça vinculada a esta Ordem de Serviço.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totalizador */}
              <div className="flex justify-end pt-2">
                <div className="w-80 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal Serviços:</span>
                    <span>{formatCurrencyBR(order.services_subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal Peças:</span>
                    <span>{formatCurrencyBR(order.parts_subtotal || 0)}</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Desconto:</span>
                      <span>- {formatCurrencyBR(order.discount_amount)}</span>
                    </div>
                  )}
                  {Number(order.surcharge_amount) > 0 && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>Acréscimo:</span>
                      <span>+ {formatCurrencyBR(order.surcharge_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>VALOR TOTAL:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatCurrencyBR(order.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCEIRO & PAGAMENTOS */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Valor Total da OS</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {formatCurrencyBR(order.total_amount)}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">Valor Pago / Entrada</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    {formatCurrencyBR(order.deposit_amount || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <span className="text-xs text-indigo-700 dark:text-indigo-300">Saldo Restante</span>
                  <p className="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-1">
                    {formatCurrencyBR(order.remaining_amount || 0)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Status Financeiro:</span>
                  <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded">
                    {order.financial_status === 'PAID'
                      ? 'Totalmente Quitado'
                      : order.financial_status === 'PARTIALLY_PAID'
                      ? 'Parcialmente Pago (Com Sinal)'
                      : 'Pendente de Pagamento'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Forma de Pagamento Preferencial:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{order.payment_method || 'PIX'}</span>
                </div>
              </div>

              {Number(order.remaining_amount) > 0 && (
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                  <div>
                    <h5 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                      Existe saldo pendente de {formatCurrencyBR(order.remaining_amount)}
                    </h5>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      Você pode lançar recebimento parcial ou quitação integral com um clique.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenPaymentModal(order)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Lançar Pagamento
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTÓRICO & LINHA DO TEMPO */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Trilha de Auditoria & Modificações da OS
              </h4>
              <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                {order.history && order.history.length > 0 ? (
                  order.history.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {hist.user_name || 'Administrador'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium">
                              {hist.user_role || 'ADMIN'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {formatDateTimeBR(hist.created_at)}
                          </span>
                        </div>
                        {hist.previous_status && hist.new_status && hist.previous_status !== hist.new_status && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            Transição: {STATUS_CONFIG[hist.previous_status as any]?.label || hist.previous_status} →{' '}
                            {STATUS_CONFIG[hist.new_status as any]?.label || hist.new_status}
                          </div>
                        )}
                        <p className="text-slate-700 dark:text-slate-300 mt-1">
                          {hist.notes}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhum evento registrado no histórico.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
