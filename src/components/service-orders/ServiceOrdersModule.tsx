import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  MessageSquare,
  Smartphone,
  Calendar,
  User,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Gift,
  XCircle,
  CheckCheck,
  Send,
  X,
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
  ServiceOrderItemService,
  ServiceOrderItemPart,
} from '../../types';
import { formatCurrencyBR, formatDateTimeBR, formatDateBR } from '../../lib/formatters';

interface ServiceOrdersModuleProps {
  orders: ServiceOrder[];
  clients: Client[];
  brands: Brand[];
  models: DeviceModel[];
  servicesList: Service[];
  productsList: Product[];
  users: UserType[];
  userRole: string;
  onRefresh: () => void;
  isCreateModalOpenExternal?: boolean;
  onCloseCreateModalExternal?: () => void;
}

export const ServiceOrdersModule: React.FC<ServiceOrdersModuleProps> = ({
  orders,
  clients,
  brands,
  models,
  servicesList,
  productsList,
  users,
  userRole,
  onRefresh,
  isCreateModalOpenExternal,
  onCloseCreateModalExternal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<ServiceOrder | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<ServiceOrder | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<ServiceOrder | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<ServiceOrder | null>(null);

  // Status Change State
  const [newStatus, setNewStatus] = useState<ServiceOrderStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Payment update State
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // --- FORM STATE FOR NEW SERVICE ORDER ---
  const [clientId, setClientId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [physicalState, setPhysicalState] = useState('');
  const [accessories, setAccessories] = useState('');
  const [reportedDefect, setReportedDefect] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [deliveryExpectedDate, setDeliveryExpectedDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [isMotherboardAnalysis, setIsMotherboardAnalysis] = useState(false);
  const [technicianId, setTechnicianId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [initialStatus, setInitialStatus] = useState<ServiceOrderStatus>('OPEN');

  // Dynamic lists of services & parts inside OS Form
  const [selectedServices, setSelectedServices] = useState<ServiceOrderItemService[]>([]);
  const [selectedParts, setSelectedParts] = useState<ServiceOrderItemPart[]>([]);

  // Financials inside OS Form
  const [discount, setDiscount] = useState<number>(0);
  const [addition, setAddition] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [osPaymentMethod, setOsPaymentMethod] = useState<string>('PIX');

  const [isSubmittingOS, setIsSubmittingOS] = useState(false);

  // Sync external open modal request
  React.useEffect(() => {
    if (isCreateModalOpenExternal) {
      setIsCreateOpen(true);
      if (brands.length > 0) setBrandId(brands[0].id);
    }
  }, [isCreateModalOpenExternal, brands]);

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    if (onCloseCreateModalExternal) onCloseCreateModalExternal();
  };

  // Filtered models based on selected brand in form
  const availableModelsForBrand = useMemo(() => {
    if (!brandId) return [];
    return models.filter((m) => m.brand_id === brandId);
  }, [models, brandId]);

  // When brand changes, update default model
  const handleBrandChange = (newBId: string) => {
    setBrandId(newBId);
    const matching = models.filter((m) => m.brand_id === newBId);
    if (matching.length > 0) {
      setModelId(matching[0].id);
    } else {
      setModelId('');
    }
  };

  // Calculations for form
  const formTotalServices = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  }, [selectedServices]);

  const formTotalParts = useMemo(() => {
    return selectedParts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }, [selectedParts]);

  const formTotalAmount = Math.max(0, formTotalServices + formTotalParts - discount + addition);
  const formRemainingAmount = Math.max(0, formTotalAmount - depositAmount);

  // Add Service Item
  const handleAddServiceToOS = (srv: Service) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.service_id === srv.id);
      if (existing) {
        return prev.map((s) => (s.service_id === srv.id ? { ...s, quantity: s.quantity + 1 } : s));
      }
      return [
        ...prev,
        {
          service_id: srv.id,
          service_name: srv.name,
          price: srv.default_price,
          quantity: 1,
        },
      ];
    });
  };

  // Add Part Item
  const handleAddPartToOS = (prod: Product) => {
    setSelectedParts((prev) => {
      const existing = prev.find((p) => p.product_id === prod.id);
      if (existing) {
        return prev.map((p) => (p.product_id === prod.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [
        ...prev,
        {
          product_id: prod.id,
          product_name: prod.name,
          price: prod.selling_price,
          cost_price: prod.cost_price,
          quantity: 1,
        },
      ];
    });
  };

  // Submit New OS
  const handleCreateServiceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !brandId || !modelId || !reportedDefect.trim()) {
      alert('Por favor preencha Cliente, Marca, Modelo e o Defeito Relatado.');
      return;
    }

    setIsSubmittingOS(true);
    try {
      const clientObj = clients.find((c) => c.id === clientId);
      const brandObj = brands.find((b) => b.id === brandId);
      const modelObj = models.find((m) => m.id === modelId);
      const techObj = users.find((u) => u.id === technicianId);
      const sellerObj = users.find((u) => u.id === sellerId);

      const payload = {
        client_id: clientId,
        client_name: clientObj?.name || 'Cliente',
        client_phone: clientObj?.phone || '',
        client_document: clientObj?.document || '',
        brand_id: brandId,
        brand_name: brandObj?.name || '',
        model_id: modelId,
        model_name: modelObj?.name || '',
        imei_1: imei1 || undefined,
        imei_2: imei2 || undefined,
        device_password: devicePassword || undefined,
        physical_state: physicalState || undefined,
        accessories: accessories || undefined,
        reported_defect: reportedDefect,
        technical_diagnosis: technicalDiagnosis || undefined,
        status: isMotherboardAnalysis ? 'ANALYSIS_BOARD' : initialStatus,
        is_motherboard_analysis: isMotherboardAnalysis,
        priority: priority,
        technician_id: technicianId || undefined,
        technician_name: techObj?.name || undefined,
        seller_id: sellerId || undefined,
        seller_name: sellerObj?.name || undefined,
        delivery_expected_date: deliveryExpectedDate || undefined,
        services: selectedServices,
        parts: selectedParts,
        discount: Number(discount) || 0,
        addition: Number(addition) || 0,
        deposit_amount: Number(depositAmount) || 0,
        payment_method: depositAmount > 0 ? osPaymentMethod : undefined,
      };

      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Reset form
        setClientId('');
        setImei1('');
        setImei2('');
        setDevicePassword('');
        setPhysicalState('');
        setAccessories('');
        setReportedDefect('');
        setTechnicalDiagnosis('');
        setSelectedServices([]);
        setSelectedParts([]);
        setDiscount(0);
        setAddition(0);
        setDepositAmount(0);
        handleCloseCreate();
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOS(false);
    }
  };

  // Submit Status Change
  const handleUpdateStatus = async () => {
    if (!selectedOrderForStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/service-orders/${selectedOrderForStatus.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status alterado para ${STATUS_CONFIG[newStatus].label}`,
          user_name: users.find((u) => u.role === userRole)?.name || 'Atendente',
        }),
      });

      if (res.ok) {
        setSelectedOrderForStatus(null);
        setStatusNote('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Payment Settlement
  const handleUpdatePayment = async () => {
    if (!selectedOrderForPayment) return;
    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Informe um valor de pagamento válido.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await fetch(`/api/service-orders/${selectedOrderForPayment.id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          amount: amountNum,
          payment_method: paymentMethod,
        }),
      });

      if (res.ok) {
        setSelectedOrderForPayment(null);
        setPaymentAmount('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((os) => {
      const matchSearch =
        os.order_number.toString().includes(searchTerm) ||
        os.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (os.imei_1 && os.imei_1.includes(searchTerm));

      const matchStatus = statusFilter === 'ALL' || os.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || os.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter]);

  // Counts by status
  const countsByStatus = useMemo(() => {
    const map: Record<string, number> = {
      ALL: orders.length,
      OPEN: 0,
      ANALYSIS_BOARD: 0,
      WAITING_PARTS: 0,
      IN_PROGRESS: 0,
      FINISHED_READY: 0,
      WAITING_PICKUP: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    orders.forEach((os) => {
      if (map[os.status] !== undefined) map[os.status]++;
    });
    return map;
  }, [orders]);

  // WhatsApp Message Generator
  const generateWhatsAppLink = (os: ServiceOrder) => {
    const cleanPhone = os.client_phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${os.client_name}! Aqui é da DUAL CELL Assistência Técnica.\n\nSua Ordem de Serviço *#${os.order_number}* do aparelho *${os.brand_name} ${os.model_name}* está atualmente com status: *${STATUS_CONFIG[os.status].label}*.\n\nValor Total: ${formatCurrencyBR(os.total_amount)}\nQualquer dúvida estamos à disposição!`
    );
    return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msg}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Gestão de Ordens de Serviço (OS)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Controle completo de bancada: Análise de placa, peças, diagnósticos e entrega
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (brands.length > 0 && !brandId) setBrandId(brands[0].id);
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Nova Ordem de Serviço
          </button>
        </div>
      </div>

      {/* Status Filter Tabs (Barra de Status com destaques solicitados) */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Todas ({countsByStatus.ALL})
          </button>

          {/* Foi p/ Análise de Placa */}
          <button
            onClick={() => setStatusFilter('ANALYSIS_BOARD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'ANALYSIS_BOARD'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Análise de Placa ({countsByStatus.ANALYSIS_BOARD})</span>
          </button>

          {/* Aguardando Peças */}
          <button
            onClick={() => setStatusFilter('WAITING_PARTS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'WAITING_PARTS'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Aguardando Peças ({countsByStatus.WAITING_PARTS})</span>
          </button>

          {/* Em Manutenção */}
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Em Manutenção ({countsByStatus.IN_PROGRESS})</span>
          </button>

          {/* Pronto */}
          <button
            onClick={() => setStatusFilter('FINISHED_READY')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'FINISHED_READY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pronto ({countsByStatus.FINISHED_READY})</span>
          </button>

          {/* Aguardando Retirada */}
          <button
            onClick={() => setStatusFilter('WAITING_PICKUP')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'WAITING_PICKUP'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Aguardando Retirada ({countsByStatus.WAITING_PICKUP})</span>
          </button>

          {/* Aberta */}
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'OPEN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Abertas ({countsByStatus.OPEN})</span>
          </button>

          {/* Cancelado */}
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all ${
              statusFilter === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Canceladas ({countsByStatus.CANCELLED})</span>
          </button>
        </div>
      </div>

      {/* Search & Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nº OS, cliente, modelo, IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <option value="ALL">Todas Prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">🚨 Urgente</option>
          </select>
        </div>
      </div>

      {/* OS Table View */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">OS #</th>
                <th className="py-3 px-4">Cliente & Contato</th>
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Defeito Relatado</th>
                <th className="py-3 px-4">Status da Bancada</th>
                <th className="py-3 px-4">Total / Pagamento</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((os) => {
                  const statusObj = STATUS_CONFIG[os.status] || STATUS_CONFIG.OPEN;
                  return (
                    <tr
                      key={os.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      {/* OS Number & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                          #{os.order_number}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateTimeBR(os.entry_date)}
                        </div>
                        {os.priority === 'URGENT' && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-[9px] font-black rounded">
                            URGENTE
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {os.client_name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {os.client_phone}
                        </span>
                      </td>

                      {/* Device: Brand + Model */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>
                            {os.brand_name} {os.model_name}
                          </span>
                        </div>
                        {os.imei_1 && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            IMEI: {os.imei_1}
                          </span>
                        )}
                      </td>

                      {/* Defect */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                          {os.reported_defect}
                        </p>
                        {os.technician_name && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                            Técnico: {os.technician_name}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setSelectedOrderForStatus(os);
                            setNewStatus(os.status);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 ${statusObj.badge}`}
                          title="Clique para mudar status"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{statusObj.label}</span>
                        </button>
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 dark:text-white text-xs block">
                          {formatCurrencyBR(os.total_amount)}
                        </span>
                        {os.payment_status === 'PAID' ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Quitado
                          </span>
                        ) : os.payment_status === 'PARTIAL' ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                            Restam {formatCurrencyBR(os.remaining_amount)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                            Pendente ({formatCurrencyBR(os.total_amount)})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp message */}
                          <a
                            href={generateWhatsAppLink(os)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title="Enviar WhatsApp com status da OS"
                          >
                            <Send className="w-4 h-4" />
                          </a>

                          {/* Print receipt */}
                          <button
                            onClick={() => setSelectedOrderForPrint(os)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Imprimir OS / Termo"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setSelectedOrderForView(os)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                            title="Visualizar OS Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Payment settle button */}
                          {os.payment_status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedOrderForPayment(os);
                                setPaymentAmount(os.remaining_amount.toString());
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Lançar Pagamento"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                    Nenhuma Ordem de Serviço encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE SERVICE ORDER MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-indigo-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-black">Abertura de Nova Ordem de Serviço</h3>
                  <p className="text-[11px] text-indigo-100">
                    Fluxo: Cliente → Marca → Modelo → Defeito & Diagnóstico → Serviços & Peças
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseCreate}
                className="p-1.5 rounded-lg hover:bg-indigo-700 text-indigo-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleCreateServiceOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION 1: CLIENT & DEVICE CASCADING SELECTORS */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> 1. Cliente & Dispositivo (Marca / Modelo)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Client */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cliente *
                    </label>
                    <select
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Selecione o Cliente...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Marca do Celular *
                    </label>
                    <select
                      required
                      value={brandId}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Selecione a Marca...</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selector (Cascading) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Modelo do Aparelho *
                    </label>
                    <select
                      required
                      disabled={!brandId}
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {brandId ? 'Selecione o Modelo...' : 'Selecione uma Marca antes'}
                      </option>
                      {availableModelsForBrand.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Device technical details */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      IMEI 1
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 354892019482910"
                      value={imei1}
                      onChange={(e) => setImei1(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      IMEI 2
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 354892019482911"
                      value={imei2}
                      onChange={(e) => setImei2(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Senha / Padrão
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1234 / Desenho 'L'"
                      value={devicePassword}
                      onChange={(e) => setDevicePassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Acessórios Deixados
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Capinha, gaveta SIM, Carregador"
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estado Físico do Aparelho (Avarias, marcas, trincados pré-existentes)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vidro traseiro trincado, aro levemente amassado no canto superior direito..."
                    value={physicalState}
                    onChange={(e) => setPhysicalState(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: DEFECT & DIAGNOSIS */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> 2. Defeito Relatado & Direcionamento
                  </h4>

                  {/* Motherboard switch highlight */}
                  <label className="flex items-center gap-2 cursor-pointer bg-purple-100 dark:bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
                    <input
                      type="checkbox"
                      checked={isMotherboardAnalysis}
                      onChange={(e) => setIsMotherboardAnalysis(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-black text-purple-800 dark:text-purple-300 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> Enviar Direto p/ Análise de Placa
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Problema / Defeito Relatado pelo Cliente *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Ex: Aparelho caiu na água e não liga mais. Não dá sinal de carga..."
                      value={reportedDefect}
                      onChange={(e) => setReportedDefect(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Diagnóstico Técnico Preliminar (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Curto na linha primária VDD_MAIN. Necessário banho químico e reballing do PMIC..."
                      value={technicalDiagnosis}
                      onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">🚨 Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Previsão de Entrega
                    </label>
                    <input
                      type="date"
                      value={deliveryExpectedDate}
                      onChange={(e) => setDeliveryExpectedDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Técnico Responsável
                    </label>
                    <select
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="">Selecione Técnico...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atendente / Vendedor
                    </label>
                    <select
                      value={sellerId}
                      onChange={(e) => setSellerId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="">Selecione Atendente...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SERVICES & PARTS PICKER */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> 3. Serviços de Mão de Obra & Peças / Produtos
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Services Selection Box */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-700">
                      <span>Adicionar Serviços</span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                        Total Serviços: {formatCurrencyBR(formTotalServices)}
                      </span>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {servicesList.slice(0, 5).map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleAddServiceToOS(srv)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-[10px] font-bold rounded-lg whitespace-nowrap text-slate-700 dark:text-slate-300"
                        >
                          + {srv.name} ({formatCurrencyBR(srv.default_price)})
                        </button>
                      ))}
                    </div>

                    {/* Added Services List */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedServices.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs"
                        >
                          <span className="font-semibold">{item.service_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{formatCurrencyBR(item.price)}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedServices((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parts Selection Box */}
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-700">
                      <span>Adicionar Peças / Telas</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        Total Peças: {formatCurrencyBR(formTotalParts)}
                      </span>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {productsList.slice(0, 5).map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleAddPartToOS(prod)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-[10px] font-bold rounded-lg whitespace-nowrap text-slate-700 dark:text-slate-300"
                        >
                          + {prod.name} ({formatCurrencyBR(prod.selling_price)})
                        </button>
                      ))}
                    </div>

                    {/* Added Parts List */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedParts.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs"
                        >
                          <span className="font-semibold">{item.product_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{formatCurrencyBR(item.price)}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedParts((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: FINANCIAL SUMMARY & DOWN PAYMENT */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> 4. Valores, Descontos & Sinal de Entrada
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0,00"
                      value={discount || ''}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Acréscimo (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0,00"
                      value={addition || ''}
                      onChange={(e) => setAddition(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      Sinal / Entrada (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0,00"
                      value={depositAmount || ''}
                      onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-black text-emerald-700 dark:text-emerald-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Forma de Entrada
                    </label>
                    <select
                      value={osPaymentMethod}
                      onChange={(e) => setOsPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none"
                    >
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO_CREDITO">Cartão Crédito</option>
                      <option value="CARTAO_DEBITO">Cartão Débito</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Banner */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Fórmula: Serviços ({formatCurrencyBR(formTotalServices)}) + Peças (
                      {formatCurrencyBR(formTotalParts)}) - Desconto ({formatCurrencyBR(discount)}) +
                      Acréscimo ({formatCurrencyBR(addition)})
                    </p>
                    <p className="font-bold text-indigo-900 dark:text-indigo-200">
                      Entrada: {formatCurrencyBR(depositAmount)} • Restante a Pagar na Retirada:{' '}
                      <span className="text-rose-600 dark:text-rose-400 font-black">
                        {formatCurrencyBR(formRemainingAmount)}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">
                      Total da OS
                    </span>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {formatCurrencyBR(formTotalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOS}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
                >
                  {isSubmittingOS ? 'Gravando OS...' : 'Criar Ordem de Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STATUS CHANGE MODAL --- */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Alterar Status - OS #{selectedOrderForStatus.order_number}
              </h3>
              <button
                onClick={() => setSelectedOrderForStatus(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selecione o Novo Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceOrderStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="OPEN">Aberta</option>
                  <option value="ANALYSIS_BOARD">🔬 Foi para Análise de Placa</option>
                  <option value="WAITING_PARTS">📦 Aguardando Peças</option>
                  <option value="IN_PROGRESS">🔧 Em Manutenção</option>
                  <option value="FINISHED_READY">✅ Pronto (Aguardando Retirada)</option>
                  <option value="WAITING_PICKUP">🎁 Aguardando Retirada do Cliente</option>
                  <option value="DELIVERED">🚀 Entregue ao Cliente</option>
                  <option value="CANCELLED">❌ Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observação do Histórico
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Placa desoxidada com sucesso, aguardando tela chegar do fornecedor..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={handleUpdateStatus}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Salvando...' : 'Atualizar Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYMENT SETTLEMENT MODAL --- */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Receber Pagamento - OS #{selectedOrderForPayment.order_number}
              </h3>
              <button
                onClick={() => setSelectedOrderForPayment(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-bold">{selectedOrderForPayment.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Total da OS:</span>
                <span className="font-bold">{formatCurrencyBR(selectedOrderForPayment.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Já Pago (Entrada):</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrencyBR(selectedOrderForPayment.deposit_amount)}
                </span>
              </div>
              <div className="flex justify-between font-black text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Saldo Devedor:</span>
                <span>{formatCurrencyBR(selectedOrderForPayment.remaining_amount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor a Receber Agora (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão Débito</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={handleUpdatePayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Registrando...' : 'Confirmar Pagamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW 360° OS DETAIL MODAL --- */}
      {selectedOrderForView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 w-full max-w-3xl max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black">
                    Ordem de Serviço #{selectedOrderForView.order_number} - {selectedOrderForView.brand_name}{' '}
                    {selectedOrderForView.model_name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aberta em {formatDateTimeBR(selectedOrderForView.entry_date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-500">Status Atual:</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      STATUS_CONFIG[selectedOrderForView.status]?.badge
                    }`}
                  >
                    {STATUS_CONFIG[selectedOrderForView.status]?.label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Prioridade:</span>
                  <span className="ml-2 font-black">{selectedOrderForView.priority}</span>
                </div>
              </div>

              {/* Client & Device Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] text-indigo-600">
                    Dados do Cliente
                  </h4>
                  <p className="font-bold">{selectedOrderForView.client_name}</p>
                  <p className="text-slate-500">Telefone: {selectedOrderForView.client_phone}</p>
                  {selectedOrderForView.client_document && (
                    <p className="text-slate-500">CPF/Doc: {selectedOrderForView.client_document}</p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] text-indigo-600">
                    Dispositivo
                  </h4>
                  <p className="font-bold">
                    {selectedOrderForView.brand_name} {selectedOrderForView.model_name}
                  </p>
                  <p className="text-slate-500">
                    IMEI 1: {selectedOrderForView.imei_1 || 'Não informado'}
                  </p>
                  <p className="text-slate-500">
                    Senha: {selectedOrderForView.device_password || 'Sem senha'}
                  </p>
                  {selectedOrderForView.accessories && (
                    <p className="text-slate-500">Acessórios: {selectedOrderForView.accessories}</p>
                  )}
                </div>
              </div>

              {/* Defect & Diagnosis */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Problema Relatado:</span>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    {selectedOrderForView.reported_defect}
                  </p>
                </div>
                {selectedOrderForView.technical_diagnosis && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Diagnóstico Técnico:
                    </span>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                      {selectedOrderForView.technical_diagnosis}
                    </p>
                  </div>
                )}
              </div>

              {/* Services & Parts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300">Serviços Executados</h5>
                  {selectedOrderForView.services.map((s, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span>
                        {s.quantity}x {s.service_name}
                      </span>
                      <span className="font-bold">{formatCurrencyBR(s.price * s.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300">Peças Utilizadas</h5>
                  {selectedOrderForView.parts.map((p, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span>
                        {p.quantity}x {p.product_name}
                      </span>
                      <span className="font-bold">{formatCurrencyBR(p.price * p.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Timeline */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                <h4 className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                  Histórico de Auditoria & Modificações
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrderForView.history.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {STATUS_CONFIG[hist.status]?.label}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300">{hist.note}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDateTimeBR(hist.date)} ({hist.user_name})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRINT OS RECEIPT / TERMO DE RECEBIMENTO --- */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-600">Visualização de Impressão da OS</h3>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-6 border border-slate-300 rounded-xl space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight">DUAL CELL ASSISTÊNCIA TÉCNICA</h2>
                  <p className="text-[11px] text-slate-500">
                    Especializada em Smartphones, Tablets e Microeletrônica de Placas
                  </p>
                  <p className="text-[11px] text-slate-500">Telefone / WhatsApp: (11) 99999-8888</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-indigo-700">
                    OS Nº #{selectedOrderForPrint.order_number}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Entrada: {formatDateTimeBR(selectedOrderForPrint.entry_date)}
                  </p>
                </div>
              </div>

              {/* Client & Device info */}
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <h4 className="font-bold text-[11px] uppercase text-slate-500 mb-1">Cliente</h4>
                  <p className="font-bold text-sm">{selectedOrderForPrint.client_name}</p>
                  <p>Telefone: {selectedOrderForPrint.client_phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[11px] uppercase text-slate-500 mb-1">Aparelho</h4>
                  <p className="font-bold text-sm">
                    {selectedOrderForPrint.brand_name} {selectedOrderForPrint.model_name}
                  </p>
                  <p>IMEI: {selectedOrderForPrint.imei_1 || 'Não informado'}</p>
                  <p>Senha/Padrão: {selectedOrderForPrint.device_password || 'Sem senha'}</p>
                </div>
              </div>

              {/* Defect */}
              <div className="border-b pb-3 space-y-1">
                <h4 className="font-bold text-[11px] uppercase text-slate-500">Problema Relatado</h4>
                <p>{selectedOrderForPrint.reported_defect}</p>
                {selectedOrderForPrint.physical_state && (
                  <p className="text-[11px] text-slate-600">
                    <strong>Estado Físico:</strong> {selectedOrderForPrint.physical_state}
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div className="border-b pb-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-500 font-bold">
                      <th className="py-1">Item / Descrição</th>
                      <th className="py-1 text-center">Qtd</th>
                      <th className="py-1 text-right">Valor Unit.</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderForPrint.services.map((s, idx) => (
                      <tr key={`s-${idx}`}>
                        <td className="py-1">Serviço: {s.service_name}</td>
                        <td className="py-1 text-center">{s.quantity}</td>
                        <td className="py-1 text-right">{formatCurrencyBR(s.price)}</td>
                        <td className="py-1 text-right font-bold">
                          {formatCurrencyBR(s.price * s.quantity)}
                        </td>
                      </tr>
                    ))}
                    {selectedOrderForPrint.parts.map((p, idx) => (
                      <tr key={`p-${idx}`}>
                        <td className="py-1">Peça: {p.product_name}</td>
                        <td className="py-1 text-center">{p.quantity}</td>
                        <td className="py-1 text-right">{formatCurrencyBR(p.price)}</td>
                        <td className="py-1 text-right font-bold">
                          {formatCurrencyBR(p.price * p.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-between items-end pt-1">
                <div className="text-[10px] text-slate-500 max-w-xs leading-tight">
                  Termo de garantia: 90 dias para peças e serviços conforme CDC. Aparelhos não retirados em
                  até 90 dias poderão ser descartados conforme termos de serviço.
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs">
                    Entrada / Sinal:{' '}
                    <strong>{formatCurrencyBR(selectedOrderForPrint.deposit_amount)}</strong>
                  </p>
                  <p className="text-sm font-black text-indigo-700">
                    TOTAL DA OS: {formatCurrencyBR(selectedOrderForPrint.total_amount)}
                  </p>
                  <p className="text-xs font-bold text-rose-600">
                    Restante na Entrega: {formatCurrencyBR(selectedOrderForPrint.remaining_amount)}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-600">
                <div className="border-t border-slate-400 pt-1">Assinatura do Técnico / Atendente</div>
                <div className="border-t border-slate-400 pt-1">Assinatura do Cliente</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
