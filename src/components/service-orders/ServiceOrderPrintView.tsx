import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServiceOrder, STATUS_CONFIG } from '../../types/serviceOrder';
import { formatCurrencyBR, formatDateTimeBR, formatDateBR } from '../../lib/formatters';

interface ServiceOrderPrintViewProps {
  order: ServiceOrder;
  onClose: () => void;
}

export const ServiceOrderPrintView: React.FC<ServiceOrderPrintViewProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.OPEN;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Container with screen controls and print styling */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden my-auto print:m-0 print:shadow-none print:w-full print:max-w-none">
        {/* Print Header Controls (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">
              Visualização de Impressão — OS #{order.order_number}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Documento (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 CONTENT */}
        <div id="printable-service-order" className="p-8 text-xs sm:text-sm text-slate-800 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                DUAL SYSTEM
              </h1>
              <p className="text-xs font-semibold text-indigo-700 tracking-wider uppercase">
                Assistência Técnica Especializada & Manutenção Avançada
              </p>
              <p className="text-xs text-slate-600 mt-1">
                CNPJ: 12.345.678/0001-90 | Av. Paulista, 1000 - Bela Vista - São Paulo/SP
              </p>
              <p className="text-xs text-slate-600">
                Telefone: (11) 3322-1100 | WhatsApp: (11) 98111-2233 | contato@dualsystem.com.br
              </p>
            </div>
            <div className="text-right border-l-2 border-slate-200 pl-4">
              <div className="inline-block bg-slate-950 text-white font-mono font-bold text-lg px-3 py-1 rounded">
                OS #{order.order_number}
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-2">
                Status: <span className="uppercase text-indigo-700">{statusInfo.label}</span>
              </p>
              <p className="text-xs text-slate-500">
                Entrada: {formatDateTimeBR(order.entry_date)}
              </p>
              {order.delivery_forecast && (
                <p className="text-xs text-slate-500">
                  Previsão: {formatDateTimeBR(order.delivery_forecast)}
                </p>
              )}
            </div>
          </div>

          {/* Grid: Cliente e Aparelho */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Dados do Cliente */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">
                Dados do Cliente
              </h4>
              <div className="space-y-1 text-xs">
                <p><span className="font-semibold">Nome:</span> {order.client_name}</p>
                <p><span className="font-semibold">Telefone:</span> {order.client_phone}</p>
                {order.client_document && (
                  <p><span className="font-semibold">CPF/CNPJ:</span> {order.client_document}</p>
                )}
                {order.client_email && (
                  <p><span className="font-semibold">E-mail:</span> {order.client_email}</p>
                )}
                {order.client_address && (
                  <p><span className="font-semibold">Endereço:</span> {order.client_address}</p>
                )}
              </div>
            </div>

            {/* Dados do Aparelho */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">
                Identificação do Equipamento
              </h4>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-semibold">Marca/Modelo:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {order.brand_name || ''} {order.model_name || order.device_name}
                  </span>
                </p>
                {order.device_color && (
                  <p><span className="font-semibold">Cor:</span> {order.device_color}</p>
                )}
                <p><span className="font-semibold">IMEI 1:</span> {order.imei_1 || 'Não informado'}</p>
                {order.imei_2 && (
                  <p><span className="font-semibold">IMEI 2:</span> {order.imei_2}</p>
                )}
                <p><span className="font-semibold">Senha/Padrão:</span> {order.device_password || 'Sem senha'}</p>
                <p>
                  <span className="font-semibold">Técnico Resp.:</span> {order.technician_name || 'Mariana Santos'} |{' '}
                  <span className="font-semibold">Atendente:</span> {order.attendant_name || 'Carlos Silva'}
                </p>
              </div>
            </div>
          </div>

          {/* Estado Físico, Acessórios e Defeito */}
          <div className="border border-slate-300 rounded p-3 mb-4 space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-900">Problema Relatado pelo Cliente:</span>
              <p className="mt-0.5 text-slate-700 bg-slate-100 p-2 rounded italic">
                "{order.reported_defect}"
              </p>
            </div>

            {order.technical_diagnosis && (
              <div>
                <span className="font-bold text-slate-900">Laudo Técnico / Diagnóstico de Entrada:</span>
                <p className="mt-0.5 text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  {order.technical_diagnosis}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold text-slate-900">Estado Físico / Avarias de Entrada:</span>
                <p className="text-slate-600 mt-0.5">{order.physical_condition || 'Nenhuma avaria grave identificada.'}</p>
                {order.physical_conditions_checklist && order.physical_conditions_checklist.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.physical_conditions_checklist.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px]">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900">Acessórios Deixados com o Aparelho:</span>
                <p className="text-slate-600 mt-0.5">{order.accessories || 'Nenhum acessório adicional.'}</p>
                {order.accessories_checklist && order.accessories_checklist.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.accessories_checklist.map((a, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px]">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Serviços & Peças */}
          <div className="border border-slate-300 rounded overflow-hidden mb-4">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-xs uppercase text-slate-800 tracking-wider">
              Discriminação de Serviços & Peças
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th className="py-1.5 px-3">Tipo</th>
                  <th className="py-1.5 px-3">Item / Descrição</th>
                  <th className="py-1.5 px-3 text-center">Qtd</th>
                  <th className="py-1.5 px-3 text-right">Valor Unit.</th>
                  <th className="py-1.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Serviços */}
                {order.services_items && order.services_items.length > 0 ? (
                  order.services_items.map((item, idx) => (
                    <tr key={`srv_${idx}`}>
                      <td className="py-1.5 px-3 font-semibold text-indigo-700">Serviço</td>
                      <td className="py-1.5 px-3">{item.service_name}</td>
                      <td className="py-1.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrencyBR(item.unit_price)}</td>
                      <td className="py-1.5 px-3 text-right font-medium">{formatCurrencyBR(item.subtotal)}</td>
                    </tr>
                  ))
                ) : null}

                {/* Peças */}
                {order.parts_items && order.parts_items.length > 0 ? (
                  order.parts_items.map((item, idx) => (
                    <tr key={`prt_${idx}`}>
                      <td className="py-1.5 px-3 font-semibold text-emerald-700">Peça</td>
                      <td className="py-1.5 px-3">
                        {item.product_name}
                        {item.product_sku && <span className="text-slate-400 text-[10px]"> ({item.product_sku})</span>}
                      </td>
                      <td className="py-1.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrencyBR(item.unit_price)}</td>
                      <td className="py-1.5 px-3 text-right font-medium">{formatCurrencyBR(item.subtotal)}</td>
                    </tr>
                  ))
                ) : null}

                {(!order.services_items?.length && !order.parts_items?.length) && (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-slate-400 italic">
                      Orçamento em avaliação ou nenhum item adicionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumo Financeiro */}
          <div className="flex justify-end mb-4">
            <div className="w-72 border border-slate-300 rounded p-3 bg-slate-50 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Serviços:</span>
                <span>{formatCurrencyBR(order.services_subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Peças:</span>
                <span>{formatCurrencyBR(order.parts_subtotal || 0)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto Aplicado:</span>
                  <span>- {formatCurrencyBR(order.discount_amount)}</span>
                </div>
              )}
              {Number(order.surcharge_amount) > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Acréscimo:</span>
                  <span>+ {formatCurrencyBR(order.surcharge_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1">
                <span>VALOR TOTAL:</span>
                <span>{formatCurrencyBR(order.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-dashed border-slate-200">
                <span>Valor de Entrada (Sinal):</span>
                <span className="font-semibold">{formatCurrencyBR(order.deposit_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-indigo-900">
                <span>Restante a Pagar na Retirada:</span>
                <span>{formatCurrencyBR(order.remaining_amount || 0)}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 text-right">
                Forma de Pagamento: <span className="font-semibold text-slate-700">{order.payment_method || 'PIX'}</span>
              </div>
            </div>
          </div>

          {/* Termos de Garantia e Responsabilidade */}
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50 text-[10px] text-slate-600 leading-tight mb-6">
            <h5 className="font-bold text-slate-800 uppercase mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Termos de Responsabilidade & Condições de Garantia
            </h5>
            <ol className="list-decimal pl-3.5 space-y-0.5">
              <li>
                <strong>Garantia Legal:</strong> Os serviços e peças aplicados possuem garantia de 90 (noventa) dias a contar da data de entrega, conforme Art. 26 do Código de Defesa do Consumidor (CDC), cobrindo exclusivamente o defeito e componentes reparados nesta OS.
              </li>
              <li>
                <strong>Exclusão de Garantia:</strong> A garantia perderá total validade em casos de quedas, trincas no display, contato com líquidos/oxidação superveniente, intervenção técnica de terceiros ou rompimento do selo de garantia.
              </li>
              <li>
                <strong>Prazo de Retirada & Guarda:</strong> Aparelhos prontos não retirados em até 90 (noventa) dias após aviso de conclusão serão considerados abandonados para quitação de custos de armazenagem e peças conforme Art. 1.275 do Código Civil.
              </li>
              <li>
                <strong>Backup de Dados:</strong> A empresa não se responsabiliza por dados pessoais, fotos ou arquivos gravados no aparelho. É de inteira responsabilidade do cliente a realização prévia de backup.
              </li>
            </ol>
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="text-center">
              <div className="border-t border-slate-800 w-full pt-1"></div>
              <p className="font-bold text-xs text-slate-900">{order.client_name}</p>
              <p className="text-[10px] text-slate-500">Assinatura do Cliente / Responsável</p>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-800 w-full pt-1"></div>
              <p className="font-bold text-xs text-slate-900">DUAL SYSTEM ASSISTÊNCIA TÉCNICA</p>
              <p className="text-[10px] text-slate-500">Assinatura do Responsável Técnico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
