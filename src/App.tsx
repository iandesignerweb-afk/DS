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
  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
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
        setOrders(d.orders || []);
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

  const handleOpenNewOS = () => {
    setActiveTab('ORDERS');
    setIsCreateOSModalOpen(true);
  };

  const navItems = [
    { id: 'DASHBOARD' as NavTab, label: 'Painel Geral', icon: LayoutDashboard },
    {
      id: 'POS' as NavTab,
      label: 'PDV Balcão & Caixa',
      icon: ShoppingCart,
      badge: 'Vendas',
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'ORDERS' as NavTab,
      label: 'Ordens de Serviço (OS)',
      icon: Wrench,
      badge: `${orders.filter((o) => o.status !== 'DELIVERED').length}`,
      badgeColor: 'bg-indigo-600 text-white',
    },
    { id: 'BRANDS_MODELS' as NavTab, label: 'Marcas & Modelos', icon: Smartphone },
    { id: 'CLIENTS' as NavTab, label: 'Clientes', icon: Users },
    { id: 'PRODUCTS' as NavTab, label: 'Produtos & Peças', icon: Package },
    { id: 'SERVICES' as NavTab, label: 'Serviços de Bancada', icon: Layers },
    {
      id: 'SUPPLIERS' as NavTab,
      label: 'Fornecedores',
      icon: Truck,
      adminOnly: true,
    },
    {
      id: 'FINANCIAL' as NavTab,
      label: 'Financeiro & Comissões',
      icon: DollarSign,
      adminOnly: true,
    },
  ];

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

          {/* Center / Right: ROLE SELECTOR PILL & THEME TOGGLE */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Perfil de Acesso:
              </span>
              <button
                onClick={() => setUserRole('ADMIN')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRole === 'ADMIN'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Acesso completo ao financeiro, custos e fornecedores"
              >
                👑 Admin
              </button>
              <button
                onClick={() => setUserRole('SELLER')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRole === 'SELLER'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Acesso a vendas, comissões, OS e produtos (sem custos ou financeiro)"
              >
                💼 Vendedor
              </button>
              <button
                onClick={() => setUserRole('TECHNICIAN')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRole === 'TECHNICIAN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
                title="Acesso a OS e bancada técnica"
              >
                🔧 Técnico
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema Claro / Escuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Main View */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 space-y-1.5 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Módulos Principais
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.adminOnly && userRole !== 'ADMIN';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
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
                    {isLocked && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded font-black">
                        Admin
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Perfil Ativo:</span>
              <span className="font-black text-emerald-400">
                {userRole === 'ADMIN'
                  ? 'Administrador'
                  : userRole === 'SELLER'
                  ? 'Vendedor'
                  : 'Técnico'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {userRole === 'ADMIN'
                ? 'Acesso total a margens de lucro, preços de custo, fornecedores e financeiro.'
                : 'Preço de custo, fornecedores e relatórios financeiros ocultos por segurança.'}
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
              services={servicesList}
              userRole={userRole}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'SUPPLIERS' && (
            <SuppliersModule
              suppliers={suppliers}
              userRole={userRole}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'FINANCIAL' && (
            <FinancialModule
              userRole={userRole}
              users={users}
              sales={sales}
              onRefresh={fetchData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
