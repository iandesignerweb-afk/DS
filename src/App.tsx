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

type NavTab =
  | 'DASHBOARD'
  | 'POS'
  | 'ORDERS'
  | 'BRANDS_MODELS'
  | 'PRODUCTS'
  | 'CLIENTS'
  | 'SERVICES'
  | 'SUPPLIERS'
  | 'FINANCIAL';

export function App() {
  // Authentication & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserType>(TEST_USERS.ADMIN);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');

  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
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
      ]);

      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      if (clientsRes.ok) {
        const d = await clientsRes.json();
        setClients(d.clients || []);
      }
      if (brandsRes.ok) {
        const d = await brandsRes.json();
        setBrands(d.brands || []);
      }
      if (modelsRes.ok) {
        const d = await modelsRes.json();
        setModels(d.models || []);
      }
      if (productsRes.ok) {
        const d = await productsRes.json();
        setProducts(d.products || []);
      }
      if (servicesRes.ok) {
        const d = await servicesRes.json();
        setServicesList(d.services || []);
      }
      if (suppliersRes.ok) {
        const d = await suppliersRes.json();
        setSuppliers(d.suppliers || []);
      }
      if (ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || d.serviceOrders || []);
      }
      if (salesRes.ok) {
        const d = await salesRes.json();
        setSales(d.sales || []);
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
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
    setActiveTab('DASHBOARD');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleSwitchRole = (role: UserRole) => {
    setUserRole(role);
    const targetUser = TEST_USERS[role] || TEST_USERS.ADMIN;
    setCurrentUser(targetUser);
    // If on a restricted tab, reset to Dashboard
    if ((role === 'SELLER' || role === 'TECHNICIAN') && (activeTab === 'SUPPLIERS' || activeTab === 'FINANCIAL')) {
      setActiveTab('DASHBOARD');
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
      id: 'DASHBOARD' as NavTab,
      label: userRole === 'SELLER' ? 'Painel do Vendedor' : userRole === 'TECHNICIAN' ? 'Painel do Laboratório' : 'Painel Geral',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      id: 'POS' as NavTab,
      label: 'PDV Balcão & Caixa',
      icon: ShoppingCart,
      badge: 'Vendas',
      badgeColor: 'bg-emerald-500 text-white',
      roles: ['ADMIN', 'SELLER', 'CASHIER'],
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
              onClick={() => setActiveTab('DASHBOARD')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  DUAL CELL <span className="text-indigo-600 dark:text-indigo-400">PRO</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                  Assistência Técnica & PDV
                </span>
              </div>
            </div>
          </div>

          {/* Center / Right: LOGGED USER PROFILE BADGE, THEME TOGGLE & LOGOUT */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current Logged User Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">
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
              <div className="text-left">
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
            </div>

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
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
              onOpenNewOS={handleOpenNewOS}
            />
          )}

          {activeTab === 'POS' && (
            <PosModule
              products={products}
              clients={clients}
              users={users}
              userRole={userRole}
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
        </main>
      </div>
    </div>
  );
}

export default App;
