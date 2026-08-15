import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Product, Supplier, Brand } from '../../types';
import { formatCurrencyBR } from '../../lib/formatters';

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

  // Form State
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
      {/* Header */}
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
              Peças de reposição, telas, baterias e acessórios com controle de estoque
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          + Novo Produto / Peça
        </button>
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
                {isAdmin && <th className="py-3 px-4">Preço Custo [Admin]</th>}
                <th className="py-3 px-4">Preço Venda</th>
                {isAdmin && <th className="py-3 px-4">Margem Lucro</th>}
                <th className="py-3 px-4 text-center">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const markup =
                    isAdmin && prod.cost_price && prod.cost_price > 0
                      ? (((prod.selling_price - prod.cost_price) / prod.cost_price) * 100).toFixed(0)
                      : null;
                  const isLow = prod.stock_quantity <= prod.min_stock;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-mono text-slate-400 block">{prod.sku}</span>
                        <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                          {prod.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px]">
                          {prod.category}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {formatCurrencyBR(prod.cost_price)}
                        </td>
                      )}

                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                        {formatCurrencyBR(prod.selling_price)}
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          {markup ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              +{markup}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">--</span>
                          )}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {prod.stock_quantity} {prod.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 5}
                    className="py-12 text-center text-slate-400 text-xs italic"
                  >
                    Nenhum produto cadastrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cadastrar Novo Produto ou Peça
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tela Frontal iPhone 12 Incell, Bateria Galaxy S20..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                    Código SKU / Barras
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TEL-IP12-INC"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
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
