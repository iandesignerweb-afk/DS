import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Package,
  Printer,
  X,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { StockInwardInvoice } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';

interface StockInwardHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: StockInwardInvoice[];
  onOpenNewInward: () => void;
}

export const StockInwardHistoryModal: React.FC<StockInwardHistoryModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onOpenNewInward,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<StockInwardInvoice | null>(
    invoices.length > 0 ? invoices[0] : null
  );
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.access_key && inv.access_key.includes(search))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-2xl">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Histórico de Notas Fiscais & Entradas de Estoque
              </h2>
              <p className="text-xs text-slate-300">
                Consulte todas as notas fiscais, XMLs e romaneios de compras lançados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNewInward();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Package className="w-4 h-4" />
              + Nova Entrada
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body with Left List & Right Detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Invoices List */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por Nº da Nota ou Fornecedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1.5">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Nenhuma nota de entrada encontrada.
                </div>
              ) : (
                filtered.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(inv.entry_date || inv.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate mb-1">
                        {inv.supplier_name}
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          {inv.total_items} itens ({inv.total_units} un)
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrencyBR(inv.total_cost_amount)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div className="md:col-span-7 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-5">
            {selectedInvoice ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {selectedInvoice.invoice_number}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-300 dark:border-emerald-800">
                        Entrada Confirmada
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Emitida em: {new Date(selectedInvoice.issue_date + 'T00:00:00').toLocaleDateString('pt-BR')} • Lançada por: {selectedInvoice.registered_by}
                    </span>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block">FORNECEDOR</span>
                    <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">
                      {selectedInvoice.supplier_name}
                    </span>
                    {selectedInvoice.supplier_cnpj && (
                      <span className="text-[11px] text-slate-500">
                        CNPJ: {selectedInvoice.supplier_cnpj}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      TOTAL DA NOTA FISCAL
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300 text-base mt-0.5 block">
                      {formatCurrencyBR(selectedInvoice.total_cost_amount)}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      {selectedInvoice.total_units} unidades adicionadas
                    </span>
                  </div>
                </div>

                {selectedInvoice.access_key && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 break-all">
                    Chave NF-e: {selectedInvoice.access_key}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Itens Lançados nesta Nota ({selectedInvoice.items.length})</span>
                  </h4>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2 px-3">Produto</th>
                          <th className="py-2 px-3 text-center">Qtd.</th>
                          <th className="py-2 px-3 text-right">Custo Unit.</th>
                          <th className="py-2 px-3 text-right">Preço Venda</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedInvoice.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {it.product_name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex gap-2">
                                {it.sku && <span>SKU: {it.sku}</span>}
                                <span>{it.category}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-900 dark:text-white">
                              +{it.quantity} un
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                              {formatCurrencyBR(it.cost_price)}
                            </td>
                            <td className="py-2 px-3 text-right text-indigo-600 dark:text-indigo-400 font-semibold">
                              {formatCurrencyBR(it.new_selling_price)}
                            </td>
                            <td className="py-2 px-3 text-right font-black text-slate-900 dark:text-white">
                              {formatCurrencyBR(it.total_cost || it.quantity * it.cost_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold block mb-0.5">Observações:</span>
                    {selectedInvoice.notes}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Selecione uma nota fiscal na lista ao lado para ver o espelho detalhado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
