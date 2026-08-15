import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatusType, STATUS_CONFIG } from '../../types/serviceOrder';

interface ChangeStatusModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onStatusUpdated: (updatedOrder: ServiceOrder) => void;
}

const AVAILABLE_STATUSES: { key: ServiceOrderStatusType; label: string; description: string }[] = [
  { key: 'OPEN', label: 'Aberta', description: 'Ordem recém-aberta aguardando triagem ou diagnóstico.' },
  { key: 'WAITING_PARTS', label: 'Aguardando Peças', description: 'Pausada aguardando entrega de componentes ou peças.' },
  { key: 'IN_PROGRESS', label: 'Em Manutenção', description: 'Aparelho em execução e testes na bancada técnica.' },
  { key: 'ANALYSIS_BOARD', label: 'Em Análise de Placa', description: 'Microeletrônica, reconstrução de trilhas ou reballing.' },
  { key: 'FINISHED_READY', label: 'Pronto', description: 'Serviço concluído e testes 100% aprovados na bancada.' },
  { key: 'WAITING_PICKUP', label: 'Aguardando Retirada', description: 'Cliente avisado, equipamento aguardando retirada na loja.' },
  { key: 'CANCELLED', label: 'Cancelada', description: 'Orçamento não aprovado ou serviço cancelado.' },
];

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatusType>(order.status);
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(order.technical_diagnosis || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/service-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          technical_diagnosis: technicalDiagnosis,
          notes: notes.trim() || `Status alterado para ${STATUS_CONFIG[selectedStatus]?.label || selectedStatus}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar status da OS.');
      }

      onStatusUpdated(data.serviceOrder);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao salvar o novo status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded">
                OS #{order.order_number}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Alterar Status da Ordem de Serviço
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cliente: <span className="font-medium text-slate-700 dark:text-slate-300">{order.client_name}</span> | Aparelho: <span className="font-medium text-slate-700 dark:text-slate-300">{order.device_name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Status Indicator */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Status Atual:
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_CONFIG[order.status]?.badge || 'bg-slate-100'}`}>
              {STATUS_CONFIG[order.status]?.label || order.status}
            </span>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Selecione o Novo Status *
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {AVAILABLE_STATUSES.map((st) => {
                const isSelected = selectedStatus === st.key;
                const config = STATUS_CONFIG[st.key];
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setSelectedStatus(st.key)}
                    className={`flex items-start gap-3 p-2.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full mt-0.5 shrink-0 border ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {st.label}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${config.badge}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {st.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Diagnosis / Observation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Laudo Técnico / Diagnóstico de Bancada
            </label>
            <textarea
              rows={2}
              value={technicalDiagnosis}
              onChange={(e) => setTechnicalDiagnosis(e.target.value)}
              placeholder="Ex: Módulo display substituído e testado. True Tone ativo..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Observation for the History Log */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observação para o Histórico de Auditoria
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Peça chegou do fornecedor. Iniciando montagem."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Confirmar Novo Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
