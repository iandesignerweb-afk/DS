import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Lock,
  Tag,
  DollarSign,
  Layers,
  Trash2,
  Edit2,
  X,
  TrendingUp,
  FileText,
  FileCode,
  Sparkles,
  History,
  ArrowDownToLine,
} from 'lucide-react';
import { Product, Supplier, Brand, StockInwardInvoice } from '../../types';
import { formatCurrencyBR } from '../../lib/formatters';
import { StockInwardModal } from './StockInwardModal';
import { StockInwardHistoryModal } from './StockInwardHistoryModal';

interface ProductsModuleProps {
  products: Product[];
  suppliers: Supplier[];
  brands: Brand[];
  userRole: string;
  onRefresh: () => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  suppliers,
  brands,
  userRole,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInwardModalOpen, setIsStockInwardModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<StockInwardInvoice[]>([]);

  // Form State for Manual Single Product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<'PEÇA' | 'ACESSÓRIO' | 'OUTROS'>('ACESSÓRIO');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [supplierId, setSupplierId] = useState('');
  const [unit, setUnit] = useState('UN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userRole === 'ADMIN';

  // Fetch Invoices History
  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/stock-inward-invoices', {
        headers: { 'x-user-role': userRole },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || data.stockInvoices || []);
      }
    } catch (err) {
      console.error('Error fetching stock inward invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleInwardSuccess = () => {
    onRefresh();
    fetchInvoices();
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  // Inventory Totals
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock_quantity, 0);
  }, [products]);

  const totalStockSalesValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.selling_price * p.stock_quantity, 0);
  }, [products]);

  const totalStockCostValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.cost_price || 0) * p.stock_quantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock_quantity <= p.min_stock).length;
  }, [products]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        sku: sku || undefined,
        barcode: barcode || undefined,
        category,
        cost_price: isAdmin && costPrice ? parseFloat(costPrice) : 0,
        selling_price: parseFloat(sellingPrice),
        stock_quantity: parseInt(stockQuantity) || 0,
        min_stock: parseInt(minStock) || 3,
        supplier_id: supplierId || undefined,
        unit,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setName('');
        setSku('');
        setBarcode('');
        setCostPrice('');
        setSellingPrice('');
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${prodName}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Stock Inward Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Produtos & Estoque de Peças
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Peças de reposição, telas, baterias e acessórios com entrada inteligente por Nota Fiscal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Inward Action Button */}
          <button
            onClick={() => setIsStockInwardModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            title="Importar XML da SEFAZ ou digitar romaneio de compra"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-200" />
            <span>📥 Entrada por Nota Fiscal / XML</span>
          </button>

          {/* History Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
            title="Ver notas fiscais e romaneios lançados"
          >
            <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Notas ({invoices.length})</span>
          </button>

          {/* Single Item Add */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Item Avulso</span>
          </button>
        </div>
      </div>

      {/* Stock Inward Fast Banner / Callout */}
      <div className="p-4 bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-slate-900/5 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900/40 border border-emerald-300/60 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Chegou mercadoria nova na assistência?
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-600 text-white rounded-full">
                NF-e XML & Romaneio
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Dê entrada em lote via XML da NF-e com cálculo automático de margem de lucro e lançamento no Contas a Pagar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsStockInwardModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dar Entrada na Nota</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Itens Cadastrados</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {products.length} produtos
          </p>
          <span className="text-[11px] text-slate-400">{totalStockUnits} unidades no total</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Potencial de Venda (Estoque)</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrencyBR(totalStockSalesValue)}
          </p>
          <span className="text-[11px] text-slate-400">Preço de venda total</span>
        </div>

        {isAdmin ? (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Custo Total do Estoque [Admin]
            </span>
            <p className="text-xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {formatCurrencyBR(totalStockCostValue)}
            </p>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
              Margem média estimada: +
              {totalStockCostValue > 0
                ? (((totalStockSalesValue - totalStockCostValue) / totalStockCostValue) * 100).toFixed(0)
                : 0}
              %
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-400 text-xs">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Preço de custo visível apenas para perfil Administrador.</span>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Estoque Baixo</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {lowStockCount} itens
          </p>
          <span className="text-[11px] text-slate-400">Abaixo do mínimo recomendado</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, SKU, código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="PEÇA">🔧 Peças de Reposição</option>
            <option value="ACESSÓRIO">📱 Acessórios & Películas</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU / Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Estoque Atual</th>
                {isAdmin && <th className="py-3 px-4">Custo Unit.</th>}
                <th className="py-3 px-4">Preço de Venda</th>
                {isAdmin && <th className="py-3 px-4">Fornecedor</th>}
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum produto ou peça encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock_quantity <= p.min_stock;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>SKU: {p.sku}</span>
                          {p.barcode && <span>• EAN: {p.barcode}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            p.category === 'PEÇA'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : p.category === 'ACESSÓRIO'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-sm ${
                              isLow
                                ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {p.stock_quantity} {p.unit}
                          </span>
                          {isLow && (
                            <span
                              className="p-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-md"
                              title="Abaixo do estoque mínimo!"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Min: {p.min_stock} un</span>
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {p.cost_price ? formatCurrencyBR(p.cost_price) : 'R$ 0,00'}
                          </span>
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrencyBR(p.selling_price)}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {p.supplier_name || '—'}
                        </td>
                      )}

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Inward Entry Modal */}
      <StockInwardModal
        isOpen={isStockInwardModalOpen}
        onClose={() => setIsStockInwardModalOpen(false)}
        products={products}
        suppliers={suppliers}
        userRole={userRole}
        onSuccess={handleInwardSuccess}
      />

      {/* Stock Inward History Modal */}
      <StockInwardHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        invoices={invoices}
        onOpenNewInward={() => setIsStockInwardModalOpen(true)}
      />

      {/* Single Product Manual Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Cadastrar Novo Produto / Peça
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Produto / Descrição da Peça *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tela Display iPhone 13 Incell"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TEL-IPH13"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Barras (EAN)
                  </label>
                  <input
                    type="text"
                    placeholder="789..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="PEÇA">🔧 Peça de Reposição</option>
                    <option value="ACESSÓRIO">📱 Acessório</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unidade
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="PAR">Par</option>
                    <option value="METRO">Metro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isAdmin ? (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Preço de Custo (R$) [Admin]
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="block font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qtd em Estoque *
                  </label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {isAdmin && suppliers.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fornecedor Principal [Admin]
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Nenhum Fornecedor Vinculado</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
