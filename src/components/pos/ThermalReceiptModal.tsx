import React from 'react';
import { Printer, X, Check, ShieldCheck } from 'lucide-react';
import { Sale, Client } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';

interface ThermalReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  amountGiven?: number | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  isOpen,
  onClose,
  client,
  amountGiven,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculatedSubtotal = sale.items.reduce(
    (acc, item) => acc + (item.unit_price || item.total / item.quantity) * item.quantity,
    0
  );
  const discount = sale.discount || Math.max(0, calculatedSubtotal - sale.total);
  const total = sale.total;
  const received = amountGiven && amountGiven > total ? amountGiven : total;
  const change = amountGiven && amountGiven > total ? amountGiven - total : 0;

  // Format payment method text
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'DINHEIRO':
        return 'DINHEIRO';
      case 'PIX':
        return 'PIX (TRANSFERÊNCIA DIRETA)';
      case 'CARTAO_CREDITO':
        return 'CARTÃO DE CRÉDITO';
      case 'CARTAO_DEBITO':
        return 'CARTÃO DE DÉBITO';
      default:
        return method;
    }
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static print:h-auto"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 my-auto print:m-0 print:border-none print:shadow-none print:w-auto print:max-w-none">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Comprovante de Venda</h3>
              <p className="text-[10px] text-slate-400">Padrão Cupom Térmico (80mm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Preview Area (Screen) */}
        <div className="p-4 sm:p-6 bg-slate-950/80 max-h-[72vh] overflow-y-auto flex justify-center print:p-0 print:overflow-visible print:bg-white">
          
          {/* ======================================================== */}
          {/* 80mm THERMAL RECEIPT CONTAINER (Target for screen & print) */}
          {/* ======================================================== */}
          <div
            id="printable-receipt-80mm"
            className="w-full max-w-[320px] bg-white text-black p-4 sm:p-5 rounded-lg shadow-md print:shadow-none print:p-1 font-mono text-[11px] leading-[1.3] select-none border border-slate-200 print:border-none print:rounded-none"
          >
            {/* Header da Loja */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-0.5">
              <h2 className="font-black text-sm tracking-tight text-black">DUAL CELL PRO</h2>
              <p className="text-[10px] font-bold text-slate-800">ASSISTÊNCIA TÉCNICA & ACESSÓRIOS</p>
              <p className="text-[9px] text-slate-700">CNPJ: 12.345.678/0001-90</p>
              <p className="text-[9px] text-slate-700">Av. Principal, 1000 - Centro</p>
              <p className="text-[9px] text-slate-700">WhatsApp: (11) 98111-2233 | Tel: (11) 3322-1100</p>
            </div>

            {/* Dados do Cupom */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between font-bold">
                <span>CUPOM NÃO FISCAL</span>
                <span>Nº #{sale.sale_number}</span>
              </div>
              <div className="flex justify-between">
                <span>DATA/HORA:</span>
                <span>{formatDateTimeBR(sale.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>VENDEDOR:</span>
                <span>{sale.seller_name}</span>
              </div>
              {client ? (
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="font-bold truncate max-w-[170px]">{client.name}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>CLIENTE:</span>
                  <span>Consumidor Final</span>
                </div>
              )}
            </div>

            {/* Cabeçalho da Lista de Itens */}
            <div className="pt-2 pb-1 text-[10px] font-bold border-b border-slate-300">
              <div className="flex justify-between">
                <span>QTD x DESCRIÇÃO</span>
                <span>TOTAL (R$)</span>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="py-1.5 space-y-1.5 border-b border-dashed border-slate-400">
              {sale.items.map((item, idx) => {
                const unitPrice = item.unit_price || item.total / item.quantity;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold pr-1 break-words text-slate-900">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-bold whitespace-nowrap text-right text-slate-950">
                        {formatCurrencyBR(item.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-600 pl-2">
                      <span>({item.quantity} un x {formatCurrencyBR(unitPrice)})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totais & Pagamento */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Qtd. Itens:</span>
                <span className="font-bold">
                  {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrencyBR(calculatedSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Desconto:</span>
                  <span>- {formatCurrencyBR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-xs font-black border-t border-slate-300 text-slate-950">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrencyBR(total)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Forma de Pagto:</span>
                <span className="font-bold">{getPaymentMethodLabel(sale.payment_method)}</span>
              </div>
              {sale.payment_method === 'DINHEIRO' && (
                <>
                  <div className="flex justify-between text-[9px]">
                    <span>Valor Recebido:</span>
                    <span>{formatCurrencyBR(received)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between text-[9px] font-bold text-emerald-800">
                      <span>Troco:</span>
                      <span>{formatCurrencyBR(change)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Termos de Garantia e Rodapé */}
            <div className="pt-2 text-center space-y-1 text-[9px] text-slate-700">
              <p className="font-bold text-slate-900">
                Garantia legal de 90 dias para defeitos de fabricação (apresente este cupom).
              </p>
              <p>Não trocamos produtos com marcas de mau uso, umidade ou rompimento de lacre.</p>
              <p className="font-bold pt-0.5 text-black">Agradecemos a sua preferência!</p>
              
              {/* Simulação de Código de Barras */}
              <div className="pt-1 flex flex-col items-center justify-center">
                <div className="font-mono text-[8px] tracking-[3px] text-black border-y border-black py-0.5 px-4 font-black">
                  ||| | | |||| | ||| || |||| | | |||
                </div>
                <span className="text-[8px] tracking-wider text-slate-600 mt-0.5">
                  VD{sale.sale_number}-{new Date(sale.date).getTime().toString().slice(-6)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls (Hidden during print) */}
        <div className="flex items-center gap-3 p-4 bg-slate-850 border-t border-slate-800 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cupom (80mm)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
