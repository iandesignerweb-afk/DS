import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  DollarSign,
  User,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  Printer,
  ChevronRight,
  Menu,
  X,
  PackagePlus,
  ClipboardList,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Smartphone,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Product, Client, User as UserType, Sale, CashRegister, CashMovement } from '../../types';
import { formatCurrencyBR, formatDateTimeBR, formatDateBR } from '../../lib/formatters';

interface PosModuleProps {
  products: Product[];
  clients: Client[];
  users: UserType[];
  userRole: string;
  onRefreshData: () => void;
  onOpenNewOS: () => void;
}

export const PosModule: React.FC<PosModuleProps> = ({
  products,
  clients,
  users,
  userRole,
  onRefreshData,
  onOpenNewOS,
}) => {
  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedSellerId, setSelectedSellerId] = useState<string>(
    users.find((u) => u.role === 'SELLER')?.id || users[0]?.id || ''
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'>('PIX');
  const [amountGiven, setAmountGiven] = useState<string>('');
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);

  // Hidden Container Menu Drawer State
  const [isContainerMenuOpen, setIsContainerMenuOpen] = useState(false);
  const [activeContainerTab, setActiveContainerTab] = useState<'NONE' | 'QUICK_PROD' | 'SANGRIA' | 'SUPRIMENTO' | 'CAIXA_STATUS'>('NONE');

  // Cash Register State
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);

  // Sangria / Suprimento Form
  const [movementAmount, setMovementAmount] = useState<string>('');
  const [movementReason, setMovementReason] = useState<string>('');
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);

  // Quick Product Register Form
  const [quickProdName, setQuickProdName] = useState('');
  const [quickProdPrice, setQuickProdPrice] = useState('');
  const [quickProdCost, setQuickProdCost] = useState('');
  const [quickProdQty, setQuickProdQty] = useState('10');
  const [quickProdCategory, setQuickProdCategory] = useState<'ACESSÓRIO' | 'PEÇA'>('ACESSÓRIO');

  // Fetch Cash Register
  const fetchCashRegister = async () => {
    try {
      const res = await fetch('/api/pos/cash-register');
      const data = await res.json();
      if (data.cashRegister) {
        setCashRegister(data.cashRegister);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCashRegister();
  }, []);

  // Selected Seller
  const currentSeller = users.find((u) => u.id === selectedSellerId) || users[0];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.barcode && p.barcode.includes(productSearch));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, productSearch]);

  // Cart totals
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - discountAmount);

  // Commission calculation
  const sellerCommissionRate = currentSeller?.commission_percentage || 4.0;
  const estimatedCommission = (total * sellerCommissionRate) / 100;

  // Add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

  // Finalize Sale
  const handleFinalizeSale = async () => {
    if (!cart.length) return;
    try {
      const payload = {
        client_id: selectedClientId || undefined,
        seller_id: selectedSellerId,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        discount: discountAmount,
        payment_method: paymentMethod,
        notes: 'Venda realizada via PDV',
      };

      const res = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.sale) {
        setLastCompletedSale(data.sale);
        setIsCheckoutOpen(false);
        setIsPrintingReceipt(true);
        clearCart();
        fetchCashRegister();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sangria & Suprimento Actions
  const handleBleedOrSupply = async (type: 'BLEED' | 'SUPPLY') => {
    const numAmount = parseFloat(movementAmount);
    if (!numAmount || numAmount <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!movementReason.trim()) {
      alert('Informe a justificativa/motivo.');
      return;
    }

    setIsSubmittingMovement(true);
    try {
      const endpoint = type === 'BLEED' ? '/api/pos/cash-register/bleed' : '/api/pos/cash-register/supply';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          reason: movementReason,
        }),
      });
      const data = await res.json();
      if (data.cashRegister) {
        setCashRegister(data.cashRegister);
        setMovementAmount('');
        setMovementReason('');
        setActiveContainerTab('CAIXA_STATUS');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMovement(false);
    }
  };

  // Quick Product Register
  const handleQuickCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProdName.trim() || !quickProdPrice) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          name: quickProdName,
          selling_price: parseFloat(quickProdPrice),
          cost_price: userRole === 'ADMIN' && quickProdCost ? parseFloat(quickProdCost) : 0,
          stock_quantity: parseInt(quickProdQty) || 10,
          category: quickProdCategory,
        }),
      });
      if (res.ok) {
        setQuickProdName('');
        setQuickProdPrice('');
        setQuickProdCost('');
        setActiveContainerTab('NONE');
        setIsContainerMenuOpen(false);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeDue = useMemo(() => {
    const given = parseFloat(amountGiven) || 0;
    return Math.max(0, given - total);
  }, [amountGiven, total]);

  return (
    <div className="relative space-y-4 animate-in fade-in duration-200">
      {/* Top Banner with Hidden Container Menu Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                PDV Frente de Caixa
              </h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black rounded-full uppercase">
                Caixa Aberto: {formatCurrencyBR(cashRegister?.current_balance || 0)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Vendas ágeis de balcão, cálculo de comissões e gestão rápida
            </p>
          </div>
        </div>

        {/* Action button to open HIDDEN CONTAINER DRAWER */}
        <div className="flex items-center gap-2">
          <button
            id="pdv-hidden-container-menu-btn"
            onClick={() => {
              setIsContainerMenuOpen(true);
              if (activeContainerTab === 'NONE') setActiveContainerTab('CAIXA_STATUS');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl shadow-md transition-all border border-slate-700"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            <span>Menu Oculto do PDV (Contêiner)</span>
          </button>
        </div>
      </div>

      {/* POS Grid: Left catalog & Right Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Product Selection & Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search and Category filters */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, código de barras ou SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                onClick={() => setSelectedCategory('ACESSÓRIO')}
                className={`px-3 py-1.5 font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'ACESSÓRIO'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                📱 Acessórios & Películas
              </button>
              <button
                onClick={() => setSelectedCategory('PEÇA')}
                className={`px-3 py-1.5 font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === 'PEÇA'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                🔧 Telas & Peças
              </button>
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>{prod.sku}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        prod.stock_quantity <= prod.min_stock
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Estoque: {prod.stock_quantity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {prod.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrencyBR(prod.selling_price)}
                  </span>
                  <button className="p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 flex flex-col justify-between min-h-[580px]">
            <div className="space-y-4">
              {/* Header: Seller & Customer Selector */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Vendedor(a) & Comissão
                  </label>
                  <select
                    value={selectedSellerId}
                    onChange={(e) => setSelectedSellerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.commission_percentage || 4}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Cliente (Opcional)
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">Consumidor Final (Balcão)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60"
                    >
                      <div className="flex-1 pr-2">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {product.name}
                        </h5>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatCurrencyBR(product.selling_price)} un.
                        </span>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-slate-900 dark:text-white w-16 text-right">
                          {formatCurrencyBR(product.selling_price * quantity)}
                        </span>

                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    O carrinho está vazio. Clique nos produtos para adicionar.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Calculations & Checkout Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              {/* Discount Input & Commission badge */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Desconto R$:</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Comissão ({sellerCommissionRate}%): {formatCurrencyBR(estimatedCommission)}
                  </span>
                </div>
              </div>

              {/* Subtotal & Total */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrencyBR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-500 font-semibold mt-0.5">
                    <span>Desconto</span>
                    <span>- {formatCurrencyBR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Total da Venda</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                    {formatCurrencyBR(total)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!cart.length}
                  onClick={clearCart}
                  className="px-3 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 disabled:opacity-40"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  disabled={!cart.length}
                  onClick={() => setIsCheckoutOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all"
                >
                  <DollarSign className="w-4 h-4" />
                  Receber & Finalizar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- HIDDEN CONTAINER DRAWER (MENU ESCONDIDO TIPO CONTÊINER) --- */}
      {isContainerMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="bg-white dark:bg-slate-850 w-full max-w-xl h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Menu className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black">Menu Oculto do PDV (Contêiner)</h3>
                  <p className="text-[11px] text-slate-400">
                    Acesso rápido: Produtos, OS, Sangria, Suprimento e Caixa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsContainerMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs overflow-x-auto">
              <button
                onClick={() => setActiveContainerTab('CAIXA_STATUS')}
                className={`flex items-center gap-1.5 px-4 py-3 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'CAIXA_STATUS'
                    ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Fluxo do Caixa</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('SANGRIA')}
                className={`flex items-center gap-1.5 px-4 py-3 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'SANGRIA'
                    ? 'border-rose-600 text-rose-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
                <span>Sangria</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('SUPRIMENTO')}
                className={`flex items-center gap-1.5 px-4 py-3 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'SUPRIMENTO'
                    ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span>Suprimento</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('QUICK_PROD')}
                className={`flex items-center gap-1.5 px-4 py-3 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'QUICK_PROD'
                    ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <PackagePlus className="w-4 h-4 text-indigo-500" />
                <span>+ Novo Produto</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {/* Tab 1: Caixa Status & Movements */}
              {activeContainerTab === 'CAIXA_STATUS' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Saldo Total em Caixa
                    </span>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatCurrencyBR(cashRegister?.current_balance || 0)}
                    </p>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Abertura inicial: {formatCurrencyBR(cashRegister?.initial_amount || 0)} por{' '}
                      {cashRegister?.opened_by}
                    </span>
                  </div>

                  {/* Shortcut to Open OS right from container */}
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Atendimento & Ordem de Serviço
                      </h4>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                        Abra uma nova OS diretamente do PDV sem trocar de tela
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsContainerMenuOpen(false);
                        onOpenNewOS();
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      + Abrir OS
                    </button>
                  </div>

                  {/* Movements List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Movimentações Registradas Hoje
                    </h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {cashRegister?.movements && cashRegister.movements.length > 0 ? (
                        cashRegister.movements.map((mov) => (
                          <div
                            key={mov.id}
                            className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              {mov.type === 'BLEED' ? (
                                <div className="p-1.5 bg-rose-100 text-rose-600 dark:bg-rose-950/60 rounded-lg">
                                  <ArrowDownRight className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 rounded-lg">
                                  <ArrowUpRight className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {mov.description}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  {formatDateTimeBR(mov.date)} • {mov.user_name}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-xs font-black ${
                                mov.type === 'BLEED' ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {mov.type === 'BLEED' ? '-' : '+'} {formatCurrencyBR(mov.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">
                          Nenhuma movimentação registrada.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Sangria (Retirada de Dinheiro) */}
              {activeContainerTab === 'SANGRIA' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      A Sangria é a retirada de valores do caixa para o cofre, despesas urgentes ou depósito.
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor da Retirada (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={movementAmount}
                        onChange={(e) => setMovementAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Motivo / Justificativa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Retirada de excesso de notas para cofre master..."
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                      />
                    </div>

                    <button
                      disabled={isSubmittingMovement}
                      onClick={() => handleBleedOrSupply('BLEED')}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
                    >
                      {isSubmittingMovement ? 'Processando...' : 'Confirmar Sangria de Caixa'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Suprimento (Aporte de Dinheiro) */}
              {activeContainerTab === 'SUPRIMENTO' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      O Suprimento é o reforço de troco ou aporte de valores em dinheiro no caixa.
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor do Aporte (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100.00"
                        value={movementAmount}
                        onChange={(e) => setMovementAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Motivo / Justificativa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Reforço de moedas e notas de 5 reais para troco..."
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <button
                      disabled={isSubmittingMovement}
                      onClick={() => handleBleedOrSupply('SUPPLY')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all"
                    >
                      {isSubmittingMovement ? 'Processando...' : 'Confirmar Suprimento de Caixa'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Cadastro Rápido de Produtos */}
              {activeContainerTab === 'QUICK_PROD' && (
                <form onSubmit={handleQuickCreateProduct} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Cadastrar Produto / Acessório no Balcão
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fone Bluetooth TWS Pro, Película 3D..."
                      value={quickProdName}
                      onChange={(e) => setQuickProdName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preço Venda (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="Ex: 49.90"
                        value={quickProdPrice}
                        onChange={(e) => setQuickProdPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {userRole === 'ADMIN' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Preço Custo (R$) [Admin]
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 15.00"
                          value={quickProdCost}
                          onChange={(e) => setQuickProdCost(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Qtd em Estoque
                      </label>
                      <input
                        type="number"
                        value={quickProdQty}
                        onChange={(e) => setQuickProdQty(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={quickProdCategory}
                        onChange={(e) => setQuickProdCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                      >
                        <option value="ACESSÓRIO">Acessório</option>
                        <option value="PEÇA">Peça / Tela</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md mt-2"
                  >
                    Salvar Produto e Disponibilizar no PDV
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT / PAYMENT MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Finalizar Venda - {formatCurrencyBR(total)}
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'PIX'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-500" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DINHEIRO')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'DINHEIRO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-500" />
                <span>Dinheiro</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARTAO_CREDITO')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CARTAO_CREDITO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <span>C. Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARTAO_DEBITO')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'CARTAO_DEBITO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span>C. Débito</span>
              </button>
            </div>

            {/* If Dinheiro: Change Calculator */}
            {paymentMethod === 'DINHEIRO' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Valor Recebido do Cliente (R$):
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-black text-right"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Troco a Devolver:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyBR(changeDue)}
                  </span>
                </div>
              </div>
            )}

            {/* Sale summary row */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Vendedor Responsável:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentSeller?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Comissão Gerada:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyBR(estimatedCommission)} ({sellerCommissionRate}%)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Concluir Venda & Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- THERMAL RECEIPT PRINT MODAL --- */}
      {isPrintingReceipt && lastCompletedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Comprovante Não Fiscal
              </h3>
              <button
                onClick={() => setIsPrintingReceipt(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Canvas */}
            <div
              id="thermal-receipt"
              className="font-mono text-[11px] leading-tight space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700"
            >
              <div className="text-center pb-2 border-b border-slate-300 dark:border-slate-700">
                <h2 className="font-bold text-sm">DUAL CELL ASSISTÊNCIA</h2>
                <p className="text-[10px] text-slate-500">CNPJ: 00.000.000/0001-00</p>
                <p className="text-[10px] text-slate-500">Av. Principal, 1000 • São Paulo - SP</p>
              </div>

              <div className="py-1 border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <p>VENDA PDV: #{lastCompletedSale.sale_number}</p>
                <p>DATA: {formatDateTimeBR(lastCompletedSale.date)}</p>
                <p>VENDEDOR: {lastCompletedSale.seller_name}</p>
                <p>CLIENTE: {lastCompletedSale.client_name}</p>
              </div>

              <div className="py-1 space-y-1 border-b border-slate-200 dark:border-slate-800">
                {lastCompletedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product_name.slice(0, 18)}
                    </span>
                    <span>{formatCurrencyBR(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-right space-y-0.5 font-bold">
                <p>Subtotal: {formatCurrencyBR(lastCompletedSale.subtotal)}</p>
                {lastCompletedSale.discount > 0 && (
                  <p className="text-rose-600">Desconto: -{formatCurrencyBR(lastCompletedSale.discount)}</p>
                )}
                <p className="text-xs font-black text-emerald-600">
                  TOTAL PAGO: {formatCurrencyBR(lastCompletedSale.total)}
                </p>
                <p className="text-[10px] font-normal text-slate-400">
                  Forma: {lastCompletedSale.payment_method}
                </p>
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-400">
                Garantia de 90 dias com apresentação deste cupom.
                <br />
                Obrigado pela preferência!
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimir Cupom
              </button>
              <button
                onClick={() => setIsPrintingReceipt(false)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
