import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Smartphone,
  Calendar,
  User,
  Package,
  Layers,
  ArrowUpDown,
  Cpu,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Eye,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  ServiceOrder,
  ServiceOrderStatus,
  STATUS_CONFIG,
  Client,
  Brand,
  DeviceModel,
  Service,
  Product,
  User as UserType,
} from '../../types';
import { formatCurrencyBR, formatDateTimeBR, formatDateBR, formatTimeBR } from '../../lib/formatters';

interface ServicesModuleProps {
  orders: ServiceOrder[];
  services: Service[];
  clients?: Client[];
  brands?: Brand[];
  models?: DeviceModel[];
  productsList?: Product[];
  users?: UserType[];
  userRole: string;
  onRefresh: () => void;
  onOpenNewOS?: () => void;
}

export const ServicesModule: React.FC<ServicesModuleProps> = ({
  orders = [],
  services = [],
  clients = [],
  brands = [],
  models = [],
  productsList = [],
  users = [],
  userRole,
  onRefresh,
  onOpenNewOS,
}) => {
  // Active Sub-tab inside Services Module
  const [activeTab, setActiveTab] = useState<'BENCH_OS_LIST' | 'SERVICES_CATALOG'>('BENCH_OS_LIST');

  // Filters & Search for OS List
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'OLDEST_FIRST' | 'NEWEST_FIRST'>('OLDEST_FIRST'); // Default: Oldest / 1st registered at top

  // Modals for OS interactions
  const [selectedOrderForView, setSelectedOrderForView] = useState<ServiceOrder | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<ServiceOrder | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ServiceOrder | null>(null);

  // Status Change State
  const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Form for Catalog of Services
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvDescription, setSrvDescription] = useState('');
  const [srvDefaultPrice, setSrvDefaultPrice] = useState('');
  const [srvCategory, setSrvCategory] = useState('Mão de Obra');
  const [srvWarrantyDays, setSrvWarrantyDays] = useState('90');
  const [isSubmittingSrv, setIsSubmittingSrv] = useState(false);

  // Filter & Sort OS List
  // USER REQUIREMENT: "sendo no topo da lista o serviço que foi cadastrado primeiro"
  const sortedAndFilteredOrders = useMemo(() => {
    return orders
      .filter((os) => {
        // Status filter
        if (statusFilter !== 'ALL' && os.status !== statusFilter) return false;

        // Search term
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const matchesOSNumber = os.order_number?.toString().includes(term);
        const matchesClient = os.client_name?.toLowerCase().includes(term);
        const matchesPhone = os.client_phone?.toLowerCase().includes(term);
        const matchesDevice = (
          `${os.brand_name || ''} ${os.model_name || ''} ${os.imei_1 || ''}`
        ).toLowerCase().includes(term);
        const matchesDefect = (
          `${os.reported_defect || ''} ${os.technical_diagnosis || ''}`
        ).toLowerCase().includes(term);
        const matchesTech = os.technician_name?.toLowerCase().includes(term);

        return matchesOSNumber || matchesClient || matchesPhone || matchesDevice || matchesDefect || matchesTech;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at || a.entry_date || 0).getTime();
        const timeB = new Date(b.created_at || b.entry_date || 0).getTime();

        if (sortOrder === 'OLDEST_FIRST') {
          // 1º CADASTRADO NO TOPO (First registered at top / chronological FIFO)
          if (timeA !== timeB) return timeA - timeB;
          return (a.order_number || 0) - (b.order_number || 0);
        } else {
          // Newest first
          if (timeA !== timeB) return timeB - timeA;
          return (b.order_number || 0) - (a.order_number || 0);
        }
      });
  }, [orders, statusFilter, searchTerm, sortOrder]);

  // Catalog filtered services
  const filteredCatalogServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [services, searchTerm]);

  // Counts for quick chips
  const counts = useMemo(() => {
    const map = {
      ALL: orders.length,
      OPEN: orders.filter((o) => o.status === 'OPEN').length,
      ANALYSIS_BOARD: orders.filter((o) => o.status === 'ANALYSIS_BOARD').length,
      WAITING_PARTS: orders.filter((o) => o.status === 'WAITING_PARTS').length,
      IN_PROGRESS: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      FINISHED_READY: orders.filter((o) => o.status === 'FINISHED_READY').length,
      WAITING_PICKUP: orders.filter((o) => o.status === 'WAITING_PICKUP').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    };
    return map;
  }, [orders]);

  // Handle open status modal
  const handleOpenStatusModal = (os: ServiceOrder) => {
    setSelectedOrderForStatus(os);
    setNewStatus(os.status);
    setTechnicalDiagnosis(os.technical_diagnosis || '');
    setStatusNote('');
  };

  // Update Status in backend
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/service-orders/${selectedOrderForStatus.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          technical_diagnosis: technicalDiagnosis,
          notes: statusNote.trim() || `Status atualizado para ${STATUS_CONFIG[newStatus]?.label || newStatus}`,
        }),
      });

      if (res.ok) {
        setSelectedOrderForStatus(null);
        if (selectedOrderForView && selectedOrderForView.id === selectedOrderForStatus.id) {
          setSelectedOrderForView((prev) => (prev ? { ...prev, status: newStatus, technical_diagnosis: technicalDiagnosis } : null));
        }
        onRefresh();
      }
    } catch (err) {
      console.error('Falha ao atualizar status da OS:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // WhatsApp Link
  const generateWhatsAppLink = (os: ServiceOrder) => {
    const cleanPhone = (os.client_phone || '').replace(/\D/g, '');
    if (!cleanPhone) return '#';
    const statusLabel = STATUS_CONFIG[os.status]?.label || os.status;
    const msg = encodeURIComponent(
      `Olá ${os.client_name}! Aqui é da Assistência Técnica DUAL CELL.\n\nSua Ordem de Serviço *#${os.order_number}* referente ao aparelho *${os.brand_name || ''} ${os.model_name || ''}* está com status: *${statusLabel}*.\n\nTotal: ${formatCurrencyBR(os.total_amount || 0)}.\nQualquer dúvida estamos à disposição na bancada!`
    );
    return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;
  };

  // Handle Create Service Catalog
  const handleCreateServiceCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim() || !srvDefaultPrice) return;

    setIsSubmittingSrv(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: srvName,
          description: srvDescription || undefined,
          default_price: parseFloat(srvDefaultPrice),
          category: srvCategory,
          warranty_days: parseInt(srvWarrantyDays) || 90,
        }),
      });

      if (res.ok) {
        setSrvName('');
        setSrvDescription('');
        setSrvDefaultPrice('');
        setIsCatalogModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSrv(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`Deseja excluir o serviço "${name}"?`)) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Serviços de Bancada & Laboratório
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Fila cronológica de ordens de serviço (OS cadastradas primeiro no topo) e tabela de mão de obra
            </p>
          </div>
        </div>

        {/* Action Button: Abrir Nova OS */}
        <div className="flex items-center gap-2">
          {onOpenNewOS && (
            <button
              id="btn-open-new-os"
              onClick={onOpenNewOS}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Abrir Nova OS</span>
            </button>
          )}

          <button
            onClick={() => setIsCatalogModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Layers className="w-4 h-4 text-purple-500" />
            <span>+ Cadastrar Mão de Obra</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Fila de Bancada (OS) vs Catálogo de Serviços */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 gap-4">
        <div className="flex items-center gap-2">
          <button
            id="tab-bench-os-list"
            onClick={() => setActiveTab('BENCH_OS_LIST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'BENCH_OS_LIST'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Fila de Ordens de Serviço (OS)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'BENCH_OS_LIST' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {orders.filter((o) => o.status !== 'DELIVERED').length} na bancada
            </span>
          </button>

          <button
            id="tab-services-catalog"
            onClick={() => setActiveTab('SERVICES_CATALOG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SERVICES_CATALOG'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tabela de Mão de Obra</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'SERVICES_CATALOG' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {services.length} serviços
            </span>
          </button>
        </div>

        {/* Sorting badge for Bench OS List */}
        {activeTab === 'BENCH_OS_LIST' && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Ordenação:
            </span>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === 'OLDEST_FIRST' ? 'NEWEST_FIRST' : 'OLDEST_FIRST'))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                sortOrder === 'OLDEST_FIRST'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              title="Clique para alternar entre primeiras cadastradas e mais recentes"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>
                {sortOrder === 'OLDEST_FIRST'
                  ? '📌 1º Cadastrado no Topo (Fila FIFO)'
                  : '🕒 Mais Recentes Primeiro'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: BENCH SERVICE ORDERS LIST */}
      {activeTab === 'BENCH_OS_LIST' && (
        <div className="space-y-4">
          {/* Status Filter Badges */}
          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Todas as OS ({counts.ALL})
              </button>

              <button
                onClick={() => setStatusFilter('OPEN')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'OPEN'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Abertas ({counts.OPEN})
              </button>

              <button
                onClick={() => setStatusFilter('ANALYSIS_BOARD')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'ANALYSIS_BOARD'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Análise de Placa ({counts.ANALYSIS_BOARD})
              </button>

              <button
                onClick={() => setStatusFilter('WAITING_PARTS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'WAITING_PARTS'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Aguardando Peças ({counts.WAITING_PARTS})
              </button>

              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Em Manutenção ({counts.IN_PROGRESS})
              </button>

              <button
                onClick={() => setStatusFilter('FINISHED_READY')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'FINISHED_READY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pronto / Testado ({counts.FINISHED_READY})
              </button>

              <button
                onClick={() => setStatusFilter('WAITING_PICKUP')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  statusFilter === 'WAITING_PICKUP'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Aguardando Retirada ({counts.WAITING_PICKUP})
              </button>
            </div>
          </div>

          {/* Search bar & Quick Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por OS #, cliente, modelo, defeito ou técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{sortedAndFilteredOrders.length} ordens de serviço listadas</span>
              {sortOrder === 'OLDEST_FIRST' && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-lg text-[10px]">
                  Fila FIFO ativa
                </span>
              )}
            </div>
          </div>

          {/* OS Table List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fila / OS #</th>
                    <th className="py-3 px-4">Data & Hora Entrada</th>
                    <th className="py-3 px-4">Equipamento</th>
                    <th className="py-3 px-4">Cliente & Contato</th>
                    <th className="py-3 px-4">Defeito Reclamado / Laudo</th>
                    <th className="py-3 px-4">Status da Bancada</th>
                    <th className="py-3 px-4">Técnico Resp.</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4 text-right">Opção de Abrir OS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {sortedAndFilteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 space-y-3">
                        <Wrench className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                          Nenhuma Ordem de Serviço encontrada para os filtros atuais.
                        </p>
                        {onOpenNewOS && (
                          <button
                            onClick={onOpenNewOS}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-500 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            + Abrir Nova Ordem de Serviço
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredOrders.map((os, index) => {
                      const statusCfg = STATUS_CONFIG[os.status] || STATUS_CONFIG.OPEN;
                      const isDelivered = os.status === 'DELIVERED';
                      const isReady = os.status === 'FINISHED_READY' || os.status === 'WAITING_PICKUP';

                      return (
                        <tr
                          key={os.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group"
                        >
                          {/* Fila & OS Number */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                {index + 1}º
                              </span>
                              <div>
                                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-xs block">
                                  #{os.order_number}
                                </span>
                                {os.is_motherboard_analysis && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                    <Cpu className="w-2.5 h-2.5" /> Placa
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Data & Hora Entrada (Chronological) */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{formatDateBR(os.created_at || os.entry_date)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{formatTimeBR(os.created_at || os.entry_date)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Equipamento */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <span>
                                  {os.brand_name} {os.model_name}
                                </span>
                                {os.imei_1 && (
                                  <span className="block text-[10px] font-normal text-slate-400">
                                    IMEI: {os.imei_1}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Cliente */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {os.client_name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500">{os.client_phone}</span>
                              {os.client_phone && (
                                <a
                                  href={generateWhatsAppLink(os)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-500 hover:text-emerald-600 p-0.5 rounded"
                                  title="Enviar mensagem WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Defeito */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                              {os.reported_defect || 'Defeito não informado'}
                            </p>
                            {os.technical_diagnosis && (
                              <p className="text-[10px] text-purple-600 dark:text-purple-400 line-clamp-1 mt-0.5">
                                Laudo: {os.technical_diagnosis}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleOpenStatusModal(os)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all hover:scale-105 ${statusCfg.color}`}
                              title="Clique para alterar status da OS"
                            >
                              <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor}`} />
                              <span>{statusCfg.label}</span>
                            </button>
                          </td>

                          {/* Técnico */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                            {os.technician_name ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {os.technician_name}
                              </span>
                            ) : (
                              <span className="text-amber-500 font-bold text-[11px]">
                                Aguardando Técnico
                              </span>
                            )}
                          </td>

                          {/* Valor Total */}
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            {formatCurrencyBR(os.total_amount || 0)}
                          </td>

                          {/* Ações: Opção de Abrir OS */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botão Principal: ABRIR OS */}
                              <button
                                id={`btn-open-os-${os.order_number}`}
                                onClick={() => setSelectedOrderForView(os)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                                title="Abrir Ordem de Serviço completa"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Abrir OS</span>
                              </button>

                              {/* Imprimir OS */}
                              <button
                                onClick={() => setSelectedOrderForPrint(os)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Imprimir Ordem de Serviço"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SERVICES / LABOR CATALOG */}
      {activeTab === 'SERVICES_CATALOG' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar serviço por nome, categoria ou procedimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>

            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              + Novo Serviço de Bancada
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                        {srv.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {srv.name}
                      </h3>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrencyBR(srv.default_price)}
                    </span>
                  </div>

                  {srv.description && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {srv.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-3.5 h-3.5" /> {srv.warranty_days} dias de garantia
                  </span>

                  <button
                    onClick={() => handleDeleteService(srv.id, srv.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: VISUALIZAR / ABRIR ORDEM DE SERVIÇO COMPLETA */}
      {selectedOrderForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight">
                      Ordem de Serviço #{selectedOrderForView.order_number}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        STATUS_CONFIG[selectedOrderForView.status]?.color || 'bg-slate-700 text-white'
                      }`}
                    >
                      {STATUS_CONFIG[selectedOrderForView.status]?.label || selectedOrderForView.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Cadastrado em {formatDateTimeBR(selectedOrderForView.created_at || selectedOrderForView.entry_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedOrderForPrint(selectedOrderForView);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForView(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Informações de Data, Hora e Atendimento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Data de Entrada:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{formatDateBR(selectedOrderForView.created_at || selectedOrderForView.entry_date)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Horário de Abertura:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mt-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>{formatTimeBR(selectedOrderForView.created_at || selectedOrderForView.entry_date)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Técnico Responsável:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mt-1">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="truncate">{selectedOrderForView.technician_name || 'Aguardando Técnico'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Vendedor / Atendente:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mt-1">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{selectedOrderForView.seller_name || 'Loja Principal'}</span>
                  </div>
                </div>
              </div>

              {/* Cliente & Equipamento Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Dados do Cliente
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedOrderForView.client_name}
                  </p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Telefone:</span>{' '}
                      {selectedOrderForView.client_phone}
                      {selectedOrderForView.client_phone && (
                        <a
                          href={generateWhatsAppLink(selectedOrderForView)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:underline inline-flex items-center gap-0.5 ml-1"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </p>
                    {selectedOrderForView.client_document && (
                      <p>
                        <span className="font-semibold text-slate-500">CPF/CNPJ:</span>{' '}
                        {selectedOrderForView.client_document}
                      </p>
                    )}
                  </div>
                </div>

                {/* Equipamento */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                    Aparelho em Bancada
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    {selectedOrderForView.brand_name} {selectedOrderForView.model_name}
                  </p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    {selectedOrderForView.imei_1 && (
                      <p>
                        <span className="font-semibold text-slate-500">IMEI:</span>{' '}
                        {selectedOrderForView.imei_1}
                      </p>
                    )}
                    {selectedOrderForView.device_password && (
                      <p className="text-rose-600 dark:text-rose-400 font-bold">
                        <span className="font-semibold text-slate-500">Senha do Aparelho:</span>{' '}
                        {selectedOrderForView.device_password}
                      </p>
                    )}
                    {selectedOrderForView.physical_state && (
                      <p>
                        <span className="font-semibold text-slate-500">Estado Físico:</span>{' '}
                        {selectedOrderForView.physical_state}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Defeito e Laudo Técnico */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    Defeito Relatado pelo Cliente
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedOrderForView.reported_defect || 'Nenhum defeito detalhado'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                    Diagnóstico & Laudo Técnico da Bancada
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-medium bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedOrderForView.technical_diagnosis ||
                      'Aguardando conclusão de testes técnicos no laboratório.'}
                  </p>
                </div>
              </div>

              {/* Serviços e Peças Adicionados */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                  Itens & Serviços na Ordem
                </span>

                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Item / Serviço</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {selectedOrderForView.services && selectedOrderForView.services.length > 0 ? (
                        selectedOrderForView.services.map((s, idx) => (
                          <tr key={`srv-${idx}`}>
                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {s.service_name}
                            </td>
                            <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                              MÃO DE OBRA
                            </td>
                            <td className="py-2 px-3">{s.quantity || 1}</td>
                            <td className="py-2 px-3 text-right font-bold">
                              {formatCurrencyBR((s.price || 0) * (s.quantity || 1))}
                            </td>
                          </tr>
                        ))
                      ) : null}

                      {selectedOrderForView.parts && selectedOrderForView.parts.length > 0 ? (
                        selectedOrderForView.parts.map((p, idx) => (
                          <tr key={`prt-${idx}`}>
                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                              {p.product_name}
                            </td>
                            <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              PEÇA / COMPONENTE
                            </td>
                            <td className="py-2 px-3">{p.quantity || 1}</td>
                            <td className="py-2 px-3 text-right font-bold">
                              {formatCurrencyBR((p.price || 0) * (p.quantity || 1))}
                            </td>
                          </tr>
                        ))
                      ) : null}

                      {(!selectedOrderForView.services || selectedOrderForView.services.length === 0) &&
                        (!selectedOrderForView.parts || selectedOrderForView.parts.length === 0) && (
                          <tr>
                            <td colSpan={4} className="py-3 px-3 text-center text-slate-400">
                              Nenhum serviço ou peça lançado nesta OS ainda.
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>

                {/* Totais */}
                <div className="flex justify-end pt-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-w-48 space-y-1 text-right">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Total Serviços:</span>
                      <span>{formatCurrencyBR(selectedOrderForView.total_services || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Total Peças:</span>
                      <span>{formatCurrencyBR(selectedOrderForView.total_parts || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Valor Total:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {formatCurrencyBR(selectedOrderForView.total_amount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => handleOpenStatusModal(selectedOrderForView)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar Status da Bancada</span>
              </button>

              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ALTERAR STATUS DA OS NA BANCADA */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Atualizar Status — OS #{selectedOrderForStatus.order_number}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrderForStatus.brand_name} {selectedOrderForStatus.model_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForStatus(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Novo Status da Bancada *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="OPEN">Aberta (Aguardando Triagem)</option>
                  <option value="ANALYSIS_BOARD">🔬 Foi para Análise de Placa</option>
                  <option value="WAITING_PARTS">📦 Aguardando Peças</option>
                  <option value="IN_PROGRESS">🔧 Em Manutenção / Execução</option>
                  <option value="FINISHED_READY">✅ Pronto (Testado na Bancada)</option>
                  <option value="WAITING_PICKUP">📱 Aguardando Retirada</option>
                  <option value="DELIVERED">🎉 Entregue ao Cliente</option>
                  <option value="CANCELLED">❌ Cancelado / Recusado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnóstico / Laudo Técnico
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Identificado curto na linha VDD_MAIN. Reballing do CI de carga realizado..."
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações para o Histórico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Teste de consumo na fonte regulável OK..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Salvando...' : 'Confirmar Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPRIMIR ORDEM DE SERVIÇO */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto print:m-0 print:shadow-none print:w-full border border-slate-300">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  Comprovante de Ordem de Serviço #{selectedOrderForPrint.order_number}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Content */}
            <div className="p-8 text-xs space-y-4">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <h1 className="text-xl font-black">DUAL SYSTEM ASSISTÊNCIA TÉCNICA</h1>
                  <p className="text-[11px] text-slate-600">Manutenção Especializada em Smartphones & Placas</p>
                  <p className="text-[10px] text-slate-500">Contato: (11) 98765-4321 | Av. Paulista, 1000</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-indigo-600 block">
                    OS #{selectedOrderForPrint.order_number}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Entrada: {formatDateTimeBR(selectedOrderForPrint.created_at || selectedOrderForPrint.entry_date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Cliente:</span>
                  <p className="font-bold text-slate-900">{selectedOrderForPrint.client_name}</p>
                  <p className="text-slate-600">Tel: {selectedOrderForPrint.client_phone}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Aparelho:</span>
                  <p className="font-bold text-slate-900">
                    {selectedOrderForPrint.brand_name} {selectedOrderForPrint.model_name}
                  </p>
                  {selectedOrderForPrint.imei_1 && (
                    <p className="text-slate-600">IMEI: {selectedOrderForPrint.imei_1}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 text-[10px] uppercase block">
                  Defeito Declarado & Observações:
                </span>
                <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedOrderForPrint.reported_defect || 'Não informado'}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="p-2">Item / Descrição</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrderForPrint.services?.map((s, i) => (
                      <tr key={i}>
                        <td className="p-2">{s.service_name} (Serviço)</td>
                        <td className="p-2 text-right">{formatCurrencyBR(s.price * (s.quantity || 1))}</td>
                      </tr>
                    ))}
                    {selectedOrderForPrint.parts?.map((p, i) => (
                      <tr key={i}>
                        <td className="p-2">{p.product_name} (Peça)</td>
                        <td className="p-2 text-right">{formatCurrencyBR(p.price * (p.quantity || 1))}</td>
                      </tr>
                    ))}
                    <tr className="font-black bg-slate-50">
                      <td className="p-2 text-right">TOTAL GERAL:</td>
                      <td className="p-2 text-right text-indigo-600">
                        {formatCurrencyBR(selectedOrderForPrint.total_amount || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-8 border-t border-slate-300 flex justify-between text-center text-[10px] text-slate-500">
                <div className="w-48 border-t border-slate-400 pt-1">
                  Assinatura do Cliente
                </div>
                <div className="w-48 border-t border-slate-400 pt-1">
                  Técnico Responsável
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CRIAR NOVO SERVIÇO NO CATÁLOGO */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Cadastrar Mão de Obra de Bancada
              </h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceCatalog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Serviço / Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de Conector de Carga Tipo C"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição dos Procedimentos
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Dessoldagem, limpeza com fluxo especial e ressoldagem..."
                  value={srvDescription}
                  onChange={(e) => setSrvDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preço Padrão (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="120.00"
                    value={srvDefaultPrice}
                    onChange={(e) => setSrvDefaultPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Garantia (Dias)
                  </label>
                  <input
                    type="number"
                    value={srvWarrantyDays}
                    onChange={(e) => setSrvWarrantyDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Soldagem / Hardware / Placa"
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSrv}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmittingSrv ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
