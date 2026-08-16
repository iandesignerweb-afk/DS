import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Wrench,
  ShoppingCart,
  Layers,
  Users,
  Package,
  Truck,
  DollarSign,
  LayoutDashboard,
  Shield,
  UserCheck,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Sparkles,
  AlertCircle,
  LogOut,
  Lock,
  Award,
  ArrowRight,
  Settings,
} from 'lucide-react';
import {
  UserRole,
  User as UserType,
  Client,
  Brand,
  DeviceModel,
  Product,
  Service,
  Supplier,
  ServiceOrder,
  Sale,
  STATUS_CONFIG,
  StoreSettings,
} from './types';
import { LoginView, TEST_USERS } from './components/auth/LoginView';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { PosModule } from './components/pos/PosModule';
import { ServiceOrdersModule } from './components/service-orders/ServiceOrdersModule';
import { BrandsModelsModule } from './components/brands-models/BrandsModelsModule';
import { ProductsModule } from './components/products/ProductsModule';
import { ClientsModule } from './components/clients/ClientsModule';
import { ServicesModule } from './components/services/ServicesModule';
import { SuppliersModule } from './components/suppliers/SuppliersModule';
import { FinancialModule } from './components/financial/FinancialModule';
import { SettingsModule } from './components/settings/SettingsModule';

type NavTab =
  | 'DASHBOARD'
  | 'POS'
  | 'ORDERS'
  | 'BRANDS_MODELS'
  | 'PRODUCTS'
  | 'CLIENTS'
  | 'SERVICES'
  | 'SUPPLIERS'
  | 'FINANCIAL'
  | 'SETTINGS';

export function App() {
  // Authentication & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserType>(TEST_USERS.ADMIN);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');

  const [activeTab, setActiveTab] = useState<NavTab>('POS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Master Data States
  const [users, setUsers] = useState<UserType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Store Settings & Identity State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('dualcell_store_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      store_name: 'DUAL CELL PRO',
      store_subtitle: 'Assistência Técnica & PDV',
      logo_url: '',
      cnpj_cpf: '12.345.678/0001-90',
      phone: '(11) 3322-1100',
      whatsapp: '(11) 98111-2233',
      email: 'contato@dualcellpro.com.br',
      address_street: 'Av. Principal',
      address_number: '1000',
      address_neighborhood: 'Centro',
      address_city: 'São Paulo',
      address_state: 'SP',
      address_zip: '01001-000',
      receipt_footer_msg:
        'Garantia legal de 90 dias para defeitos de fabricação (apresente este cupom). Não trocamos produtos com marcas de mau uso, umidade ou rompimento de lacre. Agradecemos a sua preferência!',
      warranty_terms:
        'Garantia de 90 dias referente aos serviços executados e peças substituídas descritas neste termo. Aparelhos não retirados em até 90 dias serão considerados abandonados conforme Artigo 1.275 do Código Civil.',
      default_commission_pct: 4.0,
      auto_print_receipt: true,
      paper_size: '80mm',
    };
  });

  // Trigger for Opening New OS from Dashboard or POS
  const [isCreateOSModalOpen, setIsCreateOSModalOpen] = useState(false);

  // Fetch all core system data
  const fetchData = async () => {
    try {
      const headers = { 'x-user-role': userRole };

      const [
        usersRes,
        clientsRes,
        brandsRes,
        modelsRes,
        productsRes,
        servicesRes,
        suppliersRes,
        ordersRes,
        salesRes,
        settingsRes,
      ] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/clients', { headers }),
        fetch('/api/brands', { headers }),
        fetch('/api/models', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/suppliers', { headers }),
        fetch('/api/service-orders', { headers }),
        fetch('/api/pos/sales', { headers }),
        fetch('/api/settings', { headers }),
      ]);

      if (usersRes.ok) {
        const d = await usersRes.json().catch(() => ({}));
        setUsers(d.users || []);
      }
      if (clientsRes.ok) {
        const d = await clientsRes.json().catch(() => ({}));
        setClients(d.clients || []);
      }
      if (brandsRes.ok) {
        const d = await brandsRes.json().catch(() => ({}));
        setBrands(d.brands || []);
      }
      if (modelsRes.ok) {
        const d = await modelsRes.json().catch(() => ({}));
        setModels(d.models || []);
      }
      if (productsRes.ok) {
        const d = await productsRes.json().catch(() => ({}));
        setProducts(d.products || []);
      }
      if (servicesRes.ok) {
        const d = await servicesRes.json().catch(() => ({}));
        setServicesList(d.services || []);
      }
      if (suppliersRes.ok) {
        const d = await suppliersRes.json().catch(() => ({}));
        setSuppliers(d.suppliers || []);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json().catch(() => ({}));
        setOrders(d.orders || d.serviceOrders || []);
      }
      if (salesRes.ok) {
        const d = await salesRes.json().catch(() => ({}));
        setSales(d.sales || []);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json().catch(() => ({}));
        if (d.settings) {
          setStoreSettings(d.settings);
          localStorage.setItem('dualcell_store_settings', JSON.stringify(d.settings));
        }
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    }
  };

  // Update Store Settings Handler
  const handleUpdateStoreSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const merged = { ...storeSettings, ...newSettings };
      setStoreSettings(merged);
      localStorage.setItem('dualcell_store_settings', JSON.stringify(merged));

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.settings) {
          setStoreSettings(data.settings);
          localStorage.setItem('dualcell_store_settings', JSON.stringify(data.settings));
        }
        return true;
      }
      return true; // Still true since saved locally
    } catch (err) {
      console.error('Failed to update store settings:', err);
      return true;
    }
  };

  // Update User Profile Handler
  const handleUpdateUserProfile = async (updatedProfile: Partial<UserType>): Promise<boolean> => {
    try {
      const updatedUser = { ...currentUser, ...updatedProfile };
      setCurrentUser(updatedUser);

      // Also update in users array
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...updatedProfile } : u)));

      if (currentUser?.id) {
        await fetch(`/api/users/${currentUser.id}/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
          },
          body: JSON.stringify(updatedProfile),
        }).catch(() => {});
      }
      return true;
    } catch (err) {
      console.error('Failed to update user profile:', err);
      return true;
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    if (user.role === 'TECHNICIAN') {
      setActiveTab('ORDERS');
    } else {
      setActiveTab('POS');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSwitchRole = (role: UserRole) => {
    setUserRole(role);
    const targetUser = TEST_USERS[role] || TEST_USERS.ADMIN;
    setCurrentUser(targetUser);
    // If on a restricted tab, reset to POS or Orders
    if ((role === 'SELLER' || role === 'TECHNICIAN') && (activeTab === 'SUPPLIERS' || activeTab === 'FINANCIAL')) {
      setActiveTab(role === 'TECHNICIAN' ? 'ORDERS' : 'POS');
    }
  };

  const handleOpenNewOS = () => {
    setActiveTab('ORDERS');
    setIsCreateOSModalOpen(true);
  };

  // If user is not authenticated, show Login View
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} availableUsers={users} />;
  }

  // Determine navigation items visible per role
  const allNavItems = [
    {
      id: 'POS' as NavTab,
      label: 'PDV Frente de Caixa',
      icon: ShoppingCart,
      badge: 'Vendas',
      badgeColor: 'bg-emerald-500 text-white',
      roles: ['ADMIN', 'SELLER', 'CASHIER'],
    },
    {
      id: 'DASHBOARD' as NavTab,
      label: userRole === 'SELLER' ? 'Painel do Vendedor' : userRole === 'TECHNICIAN' ? 'Painel do Laboratório' : 'Painel Geral',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      id: 'ORDERS' as NavTab,
      label: userRole === 'TECHNICIAN' ? 'Bancada & Reparos (OS)' : 'Ordens de Serviço (OS)',
      icon: Wrench,
      badge: `${orders.filter((o) => o.status !== 'DELIVERED').length}`,
      badgeColor: 'bg-indigo-600 text-white',
      roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      id: 'BRANDS_MODELS' as NavTab,
      label: 'Marcas & Modelos',
      icon: Smartphone,
      roles: ['ADMIN', 'TECHNICIAN'],
    },
    {
      id: 'CLIENTS' as NavTab,
      label: 'Clientes & WhatsApp',
      icon: Users,
      roles: ['ADMIN', 'SELLER', 'CASHIER'],
    },
    {
      id: 'PRODUCTS' as NavTab,
      label: userRole === 'TECHNICIAN' ? 'Estoque de Peças' : 'Produtos & Peças',
      icon: Package,
      roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      id: 'SERVICES' as NavTab,
      label: 'Serviços de Bancada',
      icon: Layers,
      roles: ['ADMIN', 'TECHNICIAN'],
    },
    {
      id: 'SUPPLIERS' as NavTab,
      label: 'Fornecedores',
      icon: Truck,
      adminOnly: true,
      roles: ['ADMIN'],
    },
    {
      id: 'FINANCIAL' as NavTab,
      label: 'Financeiro & Comissões',
      icon: DollarSign,
      adminOnly: true,
      roles: ['ADMIN'],
    },
    {
      id: 'SETTINGS' as NavTab,
      label: 'Configurações da Conta & Loja',
      icon: Settings,
      roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header / RBAC Simulator Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab(userRole === 'TECHNICIAN' ? 'ORDERS' : 'POS')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30 overflow-hidden shrink-0">
                {storeSettings.logo_url ? (
                  <img
                    src={storeSettings.logo_url}
                    alt={storeSettings.store_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                  {storeSettings.store_name || 'DUAL CELL PRO'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate max-w-[190px]">
                  {storeSettings.store_subtitle || 'Assistência Técnica & PDV'}
                </span>
              </div>
            </div>
          </div>

          {/* Center / Right: LOGGED USER PROFILE BADGE, THEME TOGGLE & LOGOUT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current Logged User Profile Pill (Click to open Settings / Profile) */}
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all text-left ${
                activeTab === 'SETTINGS'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-750'
              }`}
              title="Clique para abrir Configurações e Meu Perfil"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block leading-none">
                  {userRole === 'ADMIN'
                    ? '👑 Administrador'
                    : userRole === 'SELLER'
                    ? '💼 Vendedor(a)'
                    : '🔧 Técnico de Bancada'}
                </span>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600 transition-colors ml-0.5" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema Claro / Escuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout Button */}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Encerrar sessão e voltar à tela de login"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Main View */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 space-y-3 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Módulos do Sistema ({userRole === 'ADMIN' ? 'Admin' : userRole === 'SELLER' ? 'Vendedor' : 'Técnico'})
            </span>

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? userRole === 'ADMIN'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : userRole === 'SELLER'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          item.badgeColor || 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick RBAC Info Card */}
          <div
            className={`p-4 rounded-2xl border shadow-md space-y-2 text-white ${
              userRole === 'ADMIN'
                ? 'bg-gradient-to-br from-slate-900 to-indigo-950 border-slate-800'
                : userRole === 'SELLER'
                ? 'bg-gradient-to-br from-slate-900 to-emerald-950 border-slate-800'
                : 'bg-gradient-to-br from-slate-900 to-purple-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Perfil Conectado:</span>
              <span
                className={`font-black ${
                  userRole === 'ADMIN'
                    ? 'text-indigo-400'
                    : userRole === 'SELLER'
                    ? 'text-emerald-400'
                    : 'text-purple-400'
                }`}
              >
                {userRole === 'ADMIN'
                  ? 'Administrador'
                  : userRole === 'SELLER'
                  ? 'Vendedor(a)'
                  : 'Técnico(a)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {userRole === 'ADMIN' &&
                'Acesso irrestrito a margens financeiras, relatórios, preços de custo e fornecedores.'}
              {userRole === 'SELLER' &&
                'Acesso a vendas no PDV, abertura de OS e comissões. Preço de custo e financeiro ocultados.'}
              {userRole === 'TECHNICIAN' &&
                'Acesso à bancada técnica de reparo, análise de placas e peças. Financeiro e fornecedores ocultados.'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'DASHBOARD' && (
            <DashboardModule
              orders={orders}
              sales={sales}
              products={products}
              userRole={userRole}
              storeSettings={storeSettings}
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
              onOpenNewOS={handleOpenNewOS}
            />
          )}

          {activeTab === 'POS' && (
            <PosModule
              products={products}
              clients={clients}
              brands={brands}
              models={models}
              servicesList={servicesList}
              users={users}
              userRole={userRole}
              sales={sales}
              storeSettings={storeSettings}
              onRefreshData={fetchData}
              onOpenNewOS={handleOpenNewOS}
            />
          )}

          {activeTab === 'ORDERS' && (
            <ServiceOrdersModule
              orders={orders}
              clients={clients}
              brands={brands}
              models={models}
              servicesList={servicesList}
              productsList={products}
              users={users}
              userRole={userRole}
              onRefresh={fetchData}
              isCreateModalOpenExternal={isCreateOSModalOpen}
              onCloseCreateModalExternal={() => setIsCreateOSModalOpen(false)}
            />
          )}

          {activeTab === 'BRANDS_MODELS' && (
            <BrandsModelsModule
              brands={brands}
              models={models}
              userRole={userRole}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'PRODUCTS' && (
            <ProductsModule
              products={products}
              suppliers={suppliers}
              brands={brands}
              userRole={userRole}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'CLIENTS' && (
            <ClientsModule
              clients={clients}
              orders={orders}
              userRole={userRole}
              onRefresh={fetchData}
              onOpenOSForClient={(cId) => {
                setActiveTab('ORDERS');
                setIsCreateOSModalOpen(true);
              }}
            />
          )}

          {activeTab === 'SERVICES' && (
            <ServicesModule
              orders={orders}
              services={servicesList}
              clients={clients}
              brands={brands}
              models={models}
              productsList={products}
              users={users}
              userRole={userRole}
              onRefresh={fetchData}
              onOpenNewOS={handleOpenNewOS}
            />
          )}

          {activeTab === 'SUPPLIERS' && (
            <>
              {userRole === 'ADMIN' ? (
                <SuppliersModule
                  suppliers={suppliers}
                  userRole={userRole}
                  onRefresh={fetchData}
                />
              ) : (
                <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-sm text-center max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Acesso Restrito ao Administrador
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O módulo de gestão de Fornecedores e Contatos Comerciais é exclusivo para usuários com perfil de Administrador.
                  </p>
                  <button
                    onClick={() => handleSwitchRole('ADMIN')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Trocar para Perfil Admin
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'FINANCIAL' && (
            <>
              {userRole === 'ADMIN' ? (
                <FinancialModule
                  userRole={userRole}
                  users={users}
                  sales={sales}
                  onRefresh={fetchData}
                />
              ) : (
                <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-sm text-center max-w-lg mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Acesso Restrito ao Administrador
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O módulo de Controle Financeiro, DRE, Contas a Pagar/Receber e Margens de Lucro é restrito exclusivamente a Administradores.
                  </p>
                  <button
                    onClick={() => handleSwitchRole('ADMIN')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Trocar para Perfil Admin
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsModule
              storeSettings={storeSettings}
              currentUser={currentUser}
              userRole={userRole}
              onUpdateStoreSettings={handleUpdateStoreSettings}
              onUpdateUserProfile={handleUpdateUserProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
