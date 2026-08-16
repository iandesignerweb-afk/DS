import React, { useState, useMemo } from 'react';
import {
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Building2,
  X,
  FileCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Percent,
} from 'lucide-react';
import { Product, Supplier, StockInwardItem, StockInwardInvoice } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';

interface StockInwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  userRole: string;
  onSuccess: () => void;
}

interface DraftItem {
  id: string;
  product_id?: string;
  product_name: string;
  sku?: string;
  barcode?: string;
  category: 'PEÇA' | 'ACESSÓRIO' | 'OUTROS';
  quantity: number;
  cost_price: number;
  current_selling_price?: number;
  new_selling_price: number;
  markup_percentage: number;
  is_new_product: boolean;
}

// Sample XML content for instant demonstration
const SAMPLE_NFE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260812345678000190550010000124501198765432">
      <ide>
        <nNF>12450</nNF>
        <serie>1</serie>
        <dhEmi>2026-08-16T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>Mega Distribuicao de Pecas e Componentes Celular Ltda</xNome>
        <xFant>Mega Peças & Telas SP</xFant>
      </emit>
      <det nItem="1">
        <prod>
          <cProd>TEL-IPH13-INC</cProd>
          <cEAN>789123456001</cEAN>
          <xProd>Tela Display iPhone 13 Incell Premium Black</xProd>
          <NCM>85177010</NCM>
          <qCom>10</qCom>
          <vUnCom>185.00</vUnCom>
          <vProd>1850.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>BAT-IPH11-ORG</cProd>
          <cEAN>789123456002</cEAN>
          <xProd>Bateria iPhone 11 3110mAh Selo Anatel Original</xProd>
          <NCM>85076000</NCM>
          <qCom>15</qCom>
          <vUnCom>65.00</vUnCom>
          <vProd>975.00</vProd>
        </prod>
      </det>
      <det nItem="3">
        <prod>
          <cProd>TEL-SMA54-ARO</cProd>
          <cEAN>789123456004</cEAN>
          <xProd>Tela Display Galaxy A54 5G com Aro Preto</xProd>
          <NCM>85177010</NCM>
          <qCom>8</qCom>
          <vUnCom>215.00</vUnCom>
          <vProd>1720.00</vProd>
        </prod>
      </det>
      <det nItem="4">
        <prod>
          <cProd>CHG-30W-USBC</cProd>
          <cEAN>789123456999</cEAN>
          <xProd>Carregador Turbo Power 30W USB-C Dual Cell GaN</xProd>
          <NCM>85044010</NCM>
          <qCom>25</qCom>
          <vUnCom>22.00</vUnCom>
          <vProd>550.00</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vProd>5095.00</vProd>
          <vNF>5095.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

export const StockInwardModal: React.FC<StockInwardModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  userRole,
  onSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'XML' | 'MANUAL'>('XML');

  // Invoice header state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [series, setSeries] = useState('1');
  const [accessKey, setAccessKey] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierCnpj, setSupplierCnpj] = useState('');
  const [notes, setNotes] = useState('');

  // Financial Integration
  const [createFinancialPayable, setCreateFinancialPayable] = useState(true);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PENDING');

  // Items in the current inward entry
  const [items, setItems] = useState<DraftItem[]>([]);

  // Default global markup for fast price suggestions
  const [globalMarkupPct, setGlobalMarkupPct] = useState<number>(100);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xmlFileName, setXmlFileName] = useState('');
  const [xmlParseError, setXmlParseError] = useState('');
  const [successInvoice, setSuccessInvoice] = useState<StockInwardInvoice | null>(null);

  // Manual Item Entry State
  const [manualSelectedProdId, setManualSelectedProdId] = useState('');
  const [manualProdName, setManualProdName] = useState('');
  const [manualSku, setManualSku] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualCategory, setManualCategory] = useState<'PEÇA' | 'ACESSÓRIO' | 'OUTROS'>('PEÇA');
  const [manualQuantity, setManualQuantity] = useState('5');
  const [manualCostPrice, setManualCostPrice] = useState('50.00');
  const [manualSellingPrice, setManualSellingPrice] = useState('120.00');

  if (!isOpen) return null;

  // Helper to calculate selling price based on cost and markup
  const calcPriceFromMarkup = (cost: number, markup: number) => {
    return Math.round((cost * (1 + markup / 100)) * 100) / 100;
  };

  // Helper to calculate markup based on cost and selling price
  const calcMarkupFromPrice = (cost: number, sell: number) => {
    if (cost <= 0) return 100;
    return Math.round(((sell - cost) / cost) * 100);
  };

  // XML Parser Function
  const parseNfeXml = (xmlString: string, fileName?: string) => {
    setXmlParseError('');
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // Check parse error
      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        setXmlParseError('Não foi possível ler o arquivo XML. Verifique se é um XML de NF-e válido.');
        return;
      }

      // Invoice info
      const nNFElem = xmlDoc.getElementsByTagName('nNF')[0];
      const serieElem = xmlDoc.getElementsByTagName('serie')[0];
      const dhEmiElem = xmlDoc.getElementsByTagName('dhEmi')[0] || xmlDoc.getElementsByTagName('dEmi')[0];
      const infNFeElem = xmlDoc.getElementsByTagName('infNFe')[0];
      const chNFe = infNFeElem ? infNFeElem.getAttribute('Id')?.replace('NFe', '') || '' : '';

      // Issuer / Supplier
      const emitElem = xmlDoc.getElementsByTagName('emit')[0];
      let foundSupplierName = 'Fornecedor XML';
      let foundCnpj = '';

      if (emitElem) {
        const xNome = emitElem.getElementsByTagName('xNome')[0]?.textContent;
        const xFant = emitElem.getElementsByTagName('xFant')[0]?.textContent;
        const cnpj = emitElem.getElementsByTagName('CNPJ')[0]?.textContent;
        foundSupplierName = xFant || xNome || 'Fornecedor XML';
        foundCnpj = cnpj || '';
      }

      // Match supplier if existing in system
      const existingSupplier = suppliers.find(
        (s) =>
          (foundCnpj && s.document && s.document.replace(/\D/g, '') === foundCnpj.replace(/\D/g, '')) ||
          s.name.toLowerCase().includes(foundSupplierName.toLowerCase())
      );

      setInvoiceNumber(nNFElem ? `NF-e ${nNFElem.textContent?.padStart(6, '0')}` : 'NF-e 0001');
      setSeries(serieElem?.textContent || '1');
      setAccessKey(chNFe);
      if (dhEmiElem?.textContent) {
        setIssueDate(dhEmiElem.textContent.split('T')[0]);
      }
      if (existingSupplier) {
        setSupplierId(existingSupplier.id);
        setSupplierName(existingSupplier.name);
        setSupplierCnpj(existingSupplier.document || foundCnpj);
      } else {
        setSupplierId('');
        setSupplierName(foundSupplierName);
        setSupplierCnpj(foundCnpj);
      }

      // Parse items
      const detElements = xmlDoc.getElementsByTagName('det');
      const parsedItems: DraftItem[] = [];

      for (let i = 0; i < detElements.length; i++) {
        const det = detElements[i];
        const prodElem = det.getElementsByTagName('prod')[0];
        if (!prodElem) continue;

        const cProd = prodElem.getElementsByTagName('cProd')[0]?.textContent || '';
        const cEAN = prodElem.getElementsByTagName('cEAN')[0]?.textContent || '';
        const xProd = prodElem.getElementsByTagName('xProd')[0]?.textContent || `Item ${i + 1}`;
        const qCom = parseFloat(prodElem.getElementsByTagName('qCom')[0]?.textContent || '1');
        const vUnCom = parseFloat(prodElem.getElementsByTagName('vUnCom')[0]?.textContent || '0');

        // Match with local products
        const cleanEan = cEAN !== 'SEM GTIN' ? cEAN : '';
        const matchedProduct = products.find(
          (p) =>
            (cleanEan && p.barcode === cleanEan) ||
            (cProd && p.sku.toLowerCase() === cProd.toLowerCase()) ||
            p.name.toLowerCase().trim() === xProd.toLowerCase().trim()
        );

        const currentSell = matchedProduct ? matchedProduct.selling_price : 0;
        const suggestedSell = currentSell > 0 ? currentSell : calcPriceFromMarkup(vUnCom, globalMarkupPct);
        const calculatedMarkup = calcMarkupFromPrice(vUnCom, suggestedSell);

        // Determine category
        const lowerName = xProd.toLowerCase();
        const detectedCat: 'PEÇA' | 'ACESSÓRIO' | 'OUTROS' =
          matchedProduct?.category ||
          (lowerName.includes('tela') ||
          lowerName.includes('display') ||
          lowerName.includes('bateria') ||
          lowerName.includes('conector') ||
          lowerName.includes('flex') ||
          lowerName.includes('placa')
            ? 'PEÇA'
            : lowerName.includes('capa') ||
              lowerName.includes('pelicula') ||
              lowerName.includes('película') ||
              lowerName.includes('carregador') ||
              lowerName.includes('cabo') ||
              lowerName.includes('fone')
            ? 'ACESSÓRIO'
            : 'PEÇA');

        parsedItems.push({
          id: `draft_${Date.now()}_${i}`,
          product_id: matchedProduct?.id,
          product_name: matchedProduct ? matchedProduct.name : xProd,
          sku: matchedProduct?.sku || cProd,
          barcode: matchedProduct?.barcode || cleanEan,
          category: detectedCat,
          quantity: qCom > 0 ? qCom : 1,
          cost_price: vUnCom,
          current_selling_price: matchedProduct?.selling_price,
          new_selling_price: suggestedSell,
          markup_percentage: calculatedMarkup,
          is_new_product: !matchedProduct,
        });
      }

      setItems(parsedItems);
      if (fileName) setXmlFileName(fileName);
    } catch (err: any) {
      console.error(err);
      setXmlParseError('Erro ao processar o XML: ' + (err.message || 'Estrutura inválida.'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseNfeXml(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleXml = () => {
    parseNfeXml(SAMPLE_NFE_XML, 'NFe_MegaPecas_12450_Exemplo.xml');
  };

  // Update item in draft
  const handleUpdateItem = (id: string, updates: Partial<DraftItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate if cost or price changed
        if (updates.cost_price !== undefined || updates.new_selling_price !== undefined) {
          updated.markup_percentage = calcMarkupFromPrice(updated.cost_price, updated.new_selling_price);
        } else if (updates.markup_percentage !== undefined) {
          updated.new_selling_price = calcPriceFromMarkup(updated.cost_price, updates.markup_percentage);
        }
        return updated;
      })
    );
  };

  // Apply batch markup to all items
  const handleApplyBatchMarkup = (markup: number) => {
    setGlobalMarkupPct(markup);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        markup_percentage: markup,
        new_selling_price: calcPriceFromMarkup(item.cost_price, markup),
      }))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Add Manual Item to List
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProdName.trim() && !manualSelectedProdId) {
      alert('Selecione ou digite o nome do produto.');
      return;
    }

    const matchedProd = products.find((p) => p.id === manualSelectedProdId);
    const qty = parseInt(manualQuantity) || 1;
    const cost = parseFloat(manualCostPrice) || 0;
    const sell = parseFloat(manualSellingPrice) || cost * 1.8;

    const newItem: DraftItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      product_id: matchedProd?.id,
      product_name: matchedProd ? matchedProd.name : manualProdName.trim(),
      sku: matchedProd?.sku || manualSku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: matchedProd?.barcode || manualBarcode.trim() || '',
      category: matchedProd?.category || manualCategory,
      quantity: qty,
      cost_price: cost,
      current_selling_price: matchedProd?.selling_price,
      new_selling_price: sell,
      markup_percentage: calcMarkupFromPrice(cost, sell),
      is_new_product: !matchedProd,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset manual item form
    setManualSelectedProdId('');
    setManualProdName('');
    setManualSku('');
    setManualBarcode('');
    setManualQuantity('5');
    setManualCostPrice('50.00');
    setManualSellingPrice('120.00');
  };

  // Invoice calculations
  const totalUnits = useMemo(() => items.reduce((acc, it) => acc + (it.quantity || 0), 0), [items]);
  const totalCostAmount = useMemo(
    () => items.reduce((acc, it) => acc + (it.quantity || 0) * (it.cost_price || 0), 0),
    [items]
  );
  const totalSalesPotential = useMemo(
    () => items.reduce((acc, it) => acc + (it.quantity || 0) * (it.new_selling_price || 0), 0),
    [items]
  );
  const totalEstimatedProfit = useMemo(() => totalSalesPotential - totalCostAmount, [
    totalSalesPotential,
    totalCostAmount,
  ]);

  // Submit Invoice
  const handleSubmitInvoice = async () => {
    if (!invoiceNumber.trim()) {
      alert('Por favor, informe o número da Nota Fiscal ou Romaneio.');
      return;
    }
    if (!supplierName.trim()) {
      alert('Por favor, selecione ou informe o fornecedor.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um produto para dar entrada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        invoice_number: invoiceNumber.trim(),
        series: series.trim() || '1',
        access_key: accessKey.trim() || undefined,
        issue_date: issueDate,
        entry_date: new Date().toISOString(),
        supplier_id: supplierId || undefined,
        supplier_name: supplierName.trim(),
        supplier_cnpj: supplierCnpj.trim() || undefined,
        items: items.map((it) => ({
          product_id: it.product_id,
          product_name: it.product_name,
          sku: it.sku,
          barcode: it.barcode,
          category: it.category,
          quantity: it.quantity,
          cost_price: it.cost_price,
          current_selling_price: it.current_selling_price,
          new_selling_price: it.new_selling_price,
          markup_percentage: it.markup_percentage,
          total_cost: it.quantity * it.cost_price,
          is_new_product: it.is_new_product,
        })),
        notes: notes.trim() || undefined,
        payment_status: paymentStatus,
        due_date: createFinancialPayable ? dueDate : undefined,
        create_financial_payable: createFinancialPayable,
      };

      const res = await fetch('/api/stock-inward-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessInvoice(data.invoice);
        onSuccess();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Erro ao processar entrada de nota fiscal.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar a entrada de estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setSuccessInvoice(null);
    setInvoiceNumber('');
    setAccessKey('');
    setItems([]);
    setXmlFileName('');
    setXmlParseError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white flex items-center justify-between border-b border-emerald-600/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <FileText className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Entrada de Estoque por Nota Fiscal / XML
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-md">
                  Almoxarifado & Compras
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Importe arquivo XML de NF-e da SEFAZ ou lance manualmente romaneios com atualização de estoque e contas a pagar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {successInvoice ? (
          <div className="p-8 space-y-6 overflow-y-auto text-center flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center border-4 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Entrada Concluída com Sucesso!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O estoque de todas as peças e produtos foi atualizado no sistema e o lançamento financeiro registrado.
              </p>
            </div>

            <div className="w-full max-w-xl bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">Documento / Nota:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {successInvoice.invoice_number}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">Fornecedor:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {successInvoice.supplier_name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">Total de Itens / Peças:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {successInvoice.total_items} itens ({successInvoice.total_units} unidades adicionadas)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">Valor Total de Custo da Nota:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrencyBR(successInvoice.total_cost_amount)}
                </span>
              </div>
              {successInvoice.create_financial_payable && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Lançado em Contas a Pagar:</span>
                  <span>Vencimento em {successInvoice.due_date ? new Date(successInvoice.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '15 dias'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={resetAll}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                + Dar Entrada em Outra Nota
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                Fechar e Ver Estoque
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveMode('XML')}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeMode === 'XML'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Importar XML de NF-e</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('MANUAL')}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeMode === 'MANUAL'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Digitação Manual / Romaneio</span>
                </button>
              </div>

              {activeMode === 'XML' && (
                <button
                  type="button"
                  onClick={handleLoadSampleXml}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-[11px] font-extrabold shadow-sm transition-all"
                  title="Carregar nota XML fictícia de distribuidora de telas e baterias para teste imediato"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ Carregar XML de Exemplo (Teste Rápido)</span>
                </button>
              )}
            </div>

            {/* XML Upload Area (if XML mode) */}
            {activeMode === 'XML' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 dark:border-emerald-700/60 dark:hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-6 text-center transition-all relative">
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                      <UploadCloud className="w-7 h-7 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Clique para selecionar ou arraste o arquivo XML da NF-e (.xml)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md">
                      O sistema lê automaticamente os produtos, código de barras, NCM, quantidades, preços de custo e dados do fornecedor.
                    </p>
                    {xmlFileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Arquivo Carregado: {xmlFileName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {xmlParseError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{xmlParseError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Invoice Header Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dados do Documento Fiscal & Fornecedor</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nº da Nota / Romaneio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: NF-e 004820 ou ROM-102"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Fornecedor *
                  </label>
                  <div className="flex gap-1.5">
                    {suppliers.length > 0 ? (
                      <select
                        value={supplierId}
                        onChange={(e) => {
                          setSupplierId(e.target.value);
                          const s = suppliers.find((sup) => sup.id === e.target.value);
                          if (s) {
                            setSupplierName(s.name);
                            if (s.document) setSupplierCnpj(s.document);
                          }
                        }}
                        className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Selecione ou digite abaixo...</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nome do Fornecedor / Distribuidora"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    CNPJ do Fornecedor
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={supplierCnpj}
                    onChange={(e) => setSupplierCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {accessKey && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Chave NF-e: {accessKey}
                  </span>
                </div>
              )}
            </div>

            {/* Manual Add Item Form (Only if MANUAL mode) */}
            {activeMode === 'MANUAL' && (
              <form
                onSubmit={handleAddManualItem}
                className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Item / Produto na Nota</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Selecione do catálogo ou crie um novo produto instantaneamente
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Produto Existente ou Novo *
                    </label>
                    <div className="space-y-1">
                      <select
                        value={manualSelectedProdId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualSelectedProdId(val);
                          const prod = products.find((p) => p.id === val);
                          if (prod) {
                            setManualProdName(prod.name);
                            setManualSku(prod.sku);
                            setManualBarcode(prod.barcode || '');
                            setManualCategory(prod.category);
                            if (prod.cost_price) setManualCostPrice(prod.cost_price.toFixed(2));
                            setManualSellingPrice(prod.selling_price.toFixed(2));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-xs"
                      >
                        <option value="">+ Digitar Novo Produto...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Atual: {p.stock_quantity} un)
                          </option>
                        ))}
                      </select>
                      {!manualSelectedProdId && (
                        <input
                          type="text"
                          required
                          placeholder="Nome do Novo Produto / Peça"
                          value={manualProdName}
                          onChange={(e) => setManualProdName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-xs font-semibold"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Categoria
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-xs"
                    >
                      <option value="PEÇA">🔧 Peça</option>
                      <option value="ACESSÓRIO">📱 Acessório</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Qtd. Entrada
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={manualQuantity}
                      onChange={(e) => setManualQuantity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Custo Unit. (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={manualCostPrice}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        setManualCostPrice(e.target.value);
                        setManualSellingPrice(calcPriceFromMarkup(cost, globalMarkupPct).toFixed(2));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Preço Venda (R$)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={manualSellingPrice}
                        onChange={(e) => setManualSellingPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shrink-0 shadow-sm"
                        title="Adicionar à lista da nota"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Items Table & Markup Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Itens para Entrada no Estoque ({items.length})</span>
                  </h3>
                  {items.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      Total: {totalUnits} unidades
                    </span>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Markup Rápido em Lote:</span>
                    {[50, 80, 100, 120, 150, 200].map((mk) => (
                      <button
                        key={mk}
                        type="button"
                        onClick={() => handleApplyBatchMarkup(mk)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          globalMarkupPct === mk
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
                        }`}
                      >
                        +{mk}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <Package className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Nenhum produto adicionado na nota ainda.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Faça upload de um arquivo XML de NF-e ou use a digitação manual acima.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Produto / Descrição</th>
                          <th className="py-2.5 px-3">Qtd. Entrada</th>
                          <th className="py-2.5 px-3">Custo Unit.</th>
                          <th className="py-2.5 px-3">Margem (%)</th>
                          <th className="py-2.5 px-3">Preço Venda</th>
                          <th className="py-2.5 px-3 text-right">Subtotal Custo</th>
                          <th className="py-2.5 px-2 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                          >
                            <td className="py-2 px-3">
                              {item.is_new_product ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-md">
                                  + Novo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-md">
                                  ✓ Catálogo
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {item.product_name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                {item.sku && <span>SKU: {item.sku}</span>}
                                {item.barcode && <span>EAN: {item.barcode}</span>}
                                <span className="uppercase text-slate-500 font-semibold">
                                  {item.category}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, {
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-xs outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.cost_price}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, {
                                    cost_price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-emerald-600 dark:text-emerald-400 outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={item.markup_percentage}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, {
                                      markup_percentage: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-14 px-1.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold text-xs text-indigo-600 dark:text-indigo-400 outline-none"
                                />
                                <span className="text-[10px] text-slate-400">%</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.new_selling_price}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, {
                                    new_selling_price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                              {formatCurrencyBR(item.quantity * item.cost_price)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                title="Remover item da nota"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Financial & Accounts Payable Integration */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createFinancialPayable}
                    onChange={(e) => setCreateFinancialPayable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Lançar automaticamente no Contas a Pagar (Módulo Financeiro)
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Integração direta com o fluxo de caixa
                </span>
              </div>

              {createFinancialPayable && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Data de Vencimento do Boleto / Fatura
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Status de Pagamento
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="PENDING">⏳ A Pagar (Boleto / Faturado)</option>
                      <option value="PAID">✓ Já Pago (À Vista / PIX)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Observações da Compra
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Lote de reposição mensal com frete incluso"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Summary & Action Bar */}
        {!successInvoice && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full sm:w-auto text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL CUSTO DA NOTA</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyBR(totalCostAmount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">POTENCIAL DE VENDA</span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrencyBR(totalSalesPotential)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">LUCRO BRUTO ESTIMADO</span>
                <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrencyBR(totalEstimatedProfit)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSubmitting || items.length === 0}
                onClick={handleSubmitInvoice}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span>Processando Entrada...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Entrada no Estoque ({totalUnits} un)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
