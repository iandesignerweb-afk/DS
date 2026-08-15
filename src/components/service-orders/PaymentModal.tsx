import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Banknote, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceOrder } from '../../types/serviceOrder';
import { formatCurrencyBR } from '../../lib/formatters';

interface PaymentModalProps {
  order: ServiceOrder;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: ServiceOrder) => void;
}

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode },
  { id: 'CASH', label: 'Dinheiro em Espécie', icon: Banknote },
  { id: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'DEBIT_CARD', label: 'Cartão de Débito', icon: CreditCard },
  { id: 'TRANSFER', label: 'Transferência Bancária', icon: DollarSign },
  { id: 'BOLETO', label: 'Boleto Bancário', icon: DollarSign },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  onClose,
  onPaymentSuccess,
}) => {
  const [amount, setAmount] = useState<number>(order.remaining_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage('O valor do pagamento deve ser maior que zero.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/service-orders/${order.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          notes: notes.trim() || `Pagamento de ${formatCurrencyBR(amount)} via ${paymentMethod}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar pagamento.');
      }

      onPaymentSuccess(data.serviceOrder);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Lançar Pagamento / Entrada
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OS #{order.order_number} — {order.client_name}
              </p>
            </div>
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

          {/* Totals Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Valor Total da OS:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrencyBR(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Já Pago / Entrada:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyBR(order.deposit_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-sm text-indigo-700 dark:text-indigo-300 border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Saldo Restante a Quitar:</span>
              <span>{formatCurrencyBR(order.remaining_amount || 0)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Valor do Pagamento (R$) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(order.remaining_amount || 0)}
                className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Quitar Valor Total ({formatCurrencyBR(order.remaining_amount || 0)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={order.remaining_amount || 99999}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <span className="truncate">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observação / Comprovante
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagamento no balcão via QR Code PIX"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Confirmando...' : `Confirmar Recebimento (${formatCurrencyBR(amount)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
