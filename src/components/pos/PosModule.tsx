import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  User,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Menu,
  X,
  PackagePlus,
  ArrowDownRight,
  ArrowUpRight,
  History,
  AlertCircle,
  ShoppingBag,
  Barcode,
  Sparkles,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { Product, Client, User as UserType, Sale, CashRegister } from '../../types';
import { formatCurrencyBR, formatDateTimeBR } from '../../lib/formatters';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface PosModuleProps {
  products: Product[];
  clients: Client[];
  users: UserType[];
  userRole: string;
  sales?: Sale[];
  onRefreshData: () => void;
  onOpenNewOS: () => void;
}

export const PosModule: React.FC<PosModuleProps> = ({
  products,
  clients,
  users,
  userRole,
  sales = [],
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO'>('PIX');
  const [amountGiven, setAmountGiven] = useState<string>('');
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);

  // Hidden Container Menu Drawer State (Menu do canto superior direito)
  const [isContainerMenuOpen, setIsContainerMenuOpen] = useState(false);
  const [activeContainerTab, setActiveContainerTab] = useState<'CAIXA_STATUS' | 'HISTORICO_VENDAS' | 'SANGRIA' | 'SUPRIMENTO' | 'QUICK_PROD'>('CAIXA_STATUS');

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
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Selected Seller
  const currentSeller = users.find((u) => u.id === selectedSellerId) || users[0];

  // Search filter - ONLY matched when user types something
  const searchResults = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchSku = p.sku.toLowerCase().includes(term);
      const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(term) : false;
      return matchName || matchSku || matchBarcode;
    }).slice(0, 8); // Top 8 matches
  }, [products, productSearch]);

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
    setProductSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle Enter key on barcode scanner or search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = productSearch.trim().toLowerCase();
      if (!term) return;

      // Check exact barcode or SKU match first
      const exactMatch = products.find(
        (p) => (p.barcode && p.barcode.toLowerCase() === term) || p.sku.toLowerCase() === term
      );

      if (exactMatch) {
        addToCart(exactMatch);
        return;
      }

      // If results exist, add first result
      if (searchResults.length > 0) {
        addToCart(searchResults[0]);
      }
    }
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
    setProductSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
        notes: 'Venda realizada via PDV Balcão',
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
    <div className="h-[calc(100vh-85px)] min-h-[500px] flex flex-col gap-2.5 animate-in fade-in duration-150 overflow-hidden">
      {/* Strict Vertical Split: 50% Left (Busca de Produtos) | 50% Right (Produtos Selecionados / Totais) */}
      <div className="flex-1 flex flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* --- LADO ESQUERDO (50%): SOMENTE O CAMPO DE BUSCA & AUTOCOMPLETE --- */}
        <div className="w-1/2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Busca de Produtos
                </h3>
                <p className="text-[11px] text-slate-400">
                  Passe o leitor ou digite o nome / SKU do produto
                </p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Barcode className="w-4 h-4" />
                <span>Leitor Pronto</span>
              </div>
            </div>

            {/* Campo de Busca Principal (Grande, com foco imediato) */}
            <div className="relative shrink-0">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder="Digite o nome ou bipe o código de barras..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
              />
              {productSearch && (
                <button
                  onClick={() => {
                    setProductSearch('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lista Dinâmica de Resultados da Busca (Aparece SOMENTE ao pesquisar) */}
            {productSearch.trim().length > 0 ? (
              <div className="flex-1 flex flex-col min-h-0 space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[11px] font-bold uppercase text-slate-400 px-1 shrink-0">
                  Resultados da Busca ({searchResults.length} itens - [Enter] para inserir)
                </span>
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
                  {searchResults.length > 0 ? (
                    searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => addToCart(prod)}
                        className="p-3 bg-slate-50 dark:bg-slate-900/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="pr-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {prod.sku}
                            </span>
                            <span>•</span>
                            <span>
                              Estoque:{' '}
                              <strong
                                className={
                                  prod.stock_quantity <= prod.min_stock
                                    ? 'text-rose-500'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              >
                                {prod.stock_quantity} un.
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                            {formatCurrencyBR(prod.selling_price)}
                          </span>
                          <button
                            type="button"
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full min-h-[140px] flex items-center justify-center text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      Nenhum produto cadastrado com "{productSearch}".
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Quando o campo está vazio: Apenas ilustração limpa */
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Barcode className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Aguardando Leitura / Busca
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                    Digite o nome ou passe o código de barras no leitor óptico.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vendedor e Cliente Simplificado no Rodapé da Coluna Esquerda */}
          <div className="shrink-0 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                Vendedor Responsável
              </label>
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.commission_percentage || 4}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">
                Cliente
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="">Consumidor Balcão</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- LADO DIREITO (50%): PRODUTOS ESCOLHIDOS, QUANTIDADES, VALORES E TOTAL --- */}
        <div className="w-1/2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div className="flex flex-col min-h-0 flex-1 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Produtos Escolhidos</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)} itens
                  </span>
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-bold px-2 py-1"
                  >
                    Limpar
                  </button>
                )}
                {/* Botão de Menu Conteiner Discreto no canto superior direito */}
                <button
                  id="pdv-container-menu-btn"
                  onClick={() => setIsContainerMenuOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all border border-slate-700 hover:border-slate-500"
                  title="Opções do Caixa (Sangria, Suprimento, OS, Novo Produto)"
                >
                  <Menu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Menu Caixa</span>
                </button>
              </div>
            </div>

            {/* Cabeçalho da Tabela de Itens */}
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400 px-2 shrink-0">
              <span>Item / Preço Un.</span>
              <div className="flex items-center gap-6 pr-2">
                <span>Qtd</span>
                <span className="w-16 text-right">Total</span>
              </div>
            </div>

            {/* Lista dos Produtos Selecionados com Scroll Próprio */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
              {cart.length > 0 ? (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex-1 pr-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {product.name}
                      </h5>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {formatCurrencyBR(product.selling_price)} un.
                      </span>
                    </div>

                    {/* Quantidade (+ / -), Total por Linha e Botão de Excluir */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 text-xs font-black text-slate-900 dark:text-white min-w-[20px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total por Linha */}
                      <span className="text-xs font-black text-slate-900 dark:text-white w-16 text-right font-mono">
                        {formatCurrencyBR(product.selling_price * quantity)}
                      </span>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remover Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs italic py-6">
                  <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1.5" />
                  <span>Nenhum produto adicionado ainda.</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Digite ou passe o leitor na coluna da esquerda.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé Fixo da Coluna Direita: Subtotal, Desconto e Total Final */}
          <div className="shrink-0 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
            {/* Desconto */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                  Desconto R$:
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-18 px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Comissão ({sellerCommissionRate}%): {formatCurrencyBR(estimatedCommission)}
              </span>
            </div>

            {/* Painel do Total */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens):</span>
                <span className="font-semibold font-mono">{formatCurrencyBR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-500 font-semibold mt-0.5">
                  <span>Desconto aplicado:</span>
                  <span className="font-mono">- {formatCurrencyBR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white mt-1 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span>TOTAL A PAGAR:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg font-mono">
                  {formatCurrencyBR(total)}
                </span>
              </div>
            </div>

            {/* Botão de Finalizar Venda */}
            <button
              type="button"
              disabled={!cart.length}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-40 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              Receber & Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU CONTEINER LATERAL (DRAWER NO CANTO SUPERIOR DIREITO) --- */}
      {isContainerMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="bg-white dark:bg-slate-850 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right duration-250">
            {/* Cabeçalho do Drawer */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Menu className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black">Menu do Caixa & Atalhos</h3>
                  <p className="text-[10px] text-slate-400">
                    Ações rápidas de sangria, suprimento e novo produto
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

            {/* Abas do Menu Conteiner */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs overflow-x-auto">
              <button
                onClick={() => setActiveContainerTab('CAIXA_STATUS')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'CAIXA_STATUS'
                    ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Fluxo</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('HISTORICO_VENDAS')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'HISTORICO_VENDAS'
                    ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Vendas ({sales.length})</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('SANGRIA')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'SANGRIA'
                    ? 'border-rose-600 text-rose-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                <span>Sangria</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('SUPRIMENTO')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'SUPRIMENTO'
                    ? 'border-emerald-600 text-emerald-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                <span>Suprimento</span>
              </button>
              <button
                onClick={() => setActiveContainerTab('QUICK_PROD')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeContainerTab === 'QUICK_PROD'
                    ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5 text-indigo-500" />
                <span>+ Produto</span>
              </button>
            </div>

            {/* Conteúdo do Drawer */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* Aba 1: Saldo e Atalho de OS */}
              {activeContainerTab === 'CAIXA_STATUS' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Saldo Total em Caixa
                    </span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatCurrencyBR(cashRegister?.current_balance || 0)}
                    </p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Abertura: {formatCurrencyBR(cashRegister?.initial_amount || 0)} por {cashRegister?.opened_by}
                    </span>
                  </div>

                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Ordem de Serviço (OS)
                      </h4>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400">
                        Abrir OS sem trocar de tela
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsContainerMenuOpen(false);
                        onOpenNewOS();
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      + Abrir OS
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Movimentações de Hoje
                    </h4>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {cashRegister?.movements && cashRegister.movements.length > 0 ? (
                        cashRegister.movements.map((mov) => (
                          <div
                            key={mov.id}
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {mov.type === 'BLEED' ? (
                                <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {mov.description}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  {formatDateTimeBR(mov.date)}
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

              {/* Aba: Histórico de Vendas & Cupons */}
              {activeContainerTab === 'HISTORICO_VENDAS' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                    <Receipt className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Clique no ícone de impressora para emitir a 2ª via do cupom (80mm).</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sales && sales.length > 0 ? (
                      sales.map((sale, idx) => (
                        <div
                          key={`${sale.id || 'sale'}_${sale.sale_number}_${idx}`}
                          className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                Venda #{sale.sale_number}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-bold">
                                {sale.payment_method}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {sale.seller_name} • {formatDateTimeBR(sale.date)}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                              {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} — {formatCurrencyBR(sale.total)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setLastCompletedSale(sale);
                              setIsPrintingReceipt(true);
                            }}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm flex items-center gap-1 text-xs font-bold transition-all"
                            title="Imprimir Cupom 80mm"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cupom</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-6">
                        Nenhuma venda registrada ainda no sistema.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Aba 2: Sangria */}
              {activeContainerTab === 'SANGRIA' && (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Retirada de dinheiro para cofre ou despesas urgentes.</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor da Retirada (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={movementAmount}
                        onChange={(e) => setMovementAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Motivo / Justificativa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Sangria para cofre master..."
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <button
                      disabled={isSubmittingMovement}
                      onClick={() => handleBleedOrSupply('BLEED')}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all"
                    >
                      {isSubmittingMovement ? 'Processando...' : 'Confirmar Sangria'}
                    </button>
                  </div>
                </div>
              )}

              {/* Aba 3: Suprimento */}
              {activeContainerTab === 'SUPRIMENTO' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Aporte de troco ou entrada adicional de dinheiro.</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor do Aporte (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 100.00"
                        value={movementAmount}
                        onChange={(e) => setMovementAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Motivo / Justificativa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Reforço de troco..."
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      disabled={isSubmittingMovement}
                      onClick={() => handleBleedOrSupply('SUPPLY')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all"
                    >
                      {isSubmittingMovement ? 'Processando...' : 'Confirmar Suprimento'}
                    </button>
                  </div>
                </div>
              )}

              {/* Aba 4: Novo Produto Rápido */}
              {activeContainerTab === 'QUICK_PROD' && (
                <form onSubmit={handleQuickCreateProduct} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Película 3D iPhone..."
                      value={quickProdName}
                      onChange={(e) => setQuickProdName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Preço Venda (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="49.90"
                        value={quickProdPrice}
                        onChange={(e) => setQuickProdPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Categoria
                      </label>
                      <select
                        value={quickProdCategory}
                        onChange={(e) => setQuickProdCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                      >
                        <option value="ACESSÓRIO">Acessório</option>
                        <option value="PEÇA">Peça</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm mt-1"
                  >
                    Salvar e Liberar no PDV
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE PAGAMENTO & FINALIZAÇÃO --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Receber Venda - {formatCurrencyBR(total)}
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formas de Pagamento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'PIX'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-500" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DINHEIRO')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'DINHEIRO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span>Dinheiro</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARTAO_CREDITO')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CARTAO_CREDITO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARTAO_DEBITO')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'CARTAO_DEBITO'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>Débito</span>
              </button>
            </div>

            {/* Calculadora de Troco */}
            {paymentMethod === 'DINHEIRO' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Valor Recebido (R$):
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    className="w-24 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-black text-right"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Troco:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyBR(changeDue)}
                  </span>
                </div>
              </div>
            )}

            {/* Botões do Checkout */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md"
              >
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL DO CUPOM TÉRMICO (80MM) --- */}
      <ThermalReceiptModal
        sale={lastCompletedSale}
        isOpen={isPrintingReceipt && !!lastCompletedSale}
        onClose={() => setIsPrintingReceipt(false)}
        client={clients.find((c) => c.id === (lastCompletedSale?.client_id || selectedClientId)) || null}
        amountGiven={amountGiven ? parseFloat(amountGiven) : null}
      />
    </div>
  );
};
