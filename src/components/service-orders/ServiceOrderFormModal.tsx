import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Smartphone,
  Wrench,
  Package,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Lock,
  CheckSquare,
  Square,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ServiceOrder,
  ServiceOrderStatusType,
  ServiceOrderPriorityType,
  OSServiceItem,
  OSPartItem,
  STATUS_CONFIG,
  COMMON_PHYSICAL_CONDITIONS,
  COMMON_ACCESSORIES,
} from '../../types/serviceOrder';
import { formatCurrencyBR } from '../../lib/formatters';

interface ServiceOrderFormModalProps {
  orderToEdit?: ServiceOrder | null;
  onClose: () => void;
  onSaved: (savedOrder: ServiceOrder) => void;
}

export const ServiceOrderFormModal: React.FC<ServiceOrderFormModalProps> = ({
  orderToEdit,
  onClose,
  onSaved,
}) => {
  // Step tracker (1: Cliente & Equipamento, 2: Diagnóstico & Checklists, 3: Serviços, Peças & Financeiro)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Auto OS Number
  const [orderNumber, setOrderNumber] = useState<number>(orderToEdit?.order_number || 1000);

  // Lists from DB
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Step 1: CLIENTE → MARCA → MODELO
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(orderToEdit?.client_id || '');
  const [clientName, setClientName] = useState(orderToEdit?.client_name || '');
  const [clientPhone, setClientPhone] = useState(orderToEdit?.client_phone || '');
  const [clientDocument, setClientDocument] = useState(orderToEdit?.client_document || '');
  const [clientEmail, setClientEmail] = useState(orderToEdit?.client_email || '');
  const [clientAddress, setClientAddress] = useState(orderToEdit?.client_address || '');

  const [selectedBrandId, setSelectedBrandId] = useState(orderToEdit?.brand_id || '');
  const [brandName, setBrandName] = useState(orderToEdit?.brand_name || '');
  const [selectedModelId, setSelectedModelId] = useState(orderToEdit?.model_id || '');
  const [modelName, setModelName] = useState(orderToEdit?.model_name || '');
  const [customDeviceName, setCustomDeviceName] = useState(orderToEdit?.device_name || '');
  const [deviceColor, setDeviceColor] = useState(orderToEdit?.device_color || '');

  // Step 2: Device Specs & Checklists
  const [imei1, setImei1] = useState(orderToEdit?.imei_1 || '');
  const [imei2, setImei2] = useState(orderToEdit?.imei_2 || '');
  const [devicePassword, setDevicePassword] = useState(orderToEdit?.device_password || '');
  const [passwordType, setPasswordType] = useState(orderToEdit?.password_type || 'PIN');

  const [physicalCondition, setPhysicalCondition] = useState(orderToEdit?.physical_condition || '');
  const [selectedPhysicalConditions, setSelectedPhysicalConditions] = useState<string[]>(
    orderToEdit?.physical_conditions_checklist || []
  );

  const [accessories, setAccessories] = useState(orderToEdit?.accessories || '');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(
    orderToEdit?.accessories_checklist || []
  );

  const [reportedDefect, setReportedDefect] = useState(orderToEdit?.reported_defect || '');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(orderToEdit?.technical_diagnosis || '');
  const [status, setStatus] = useState<ServiceOrderStatusType>(orderToEdit?.status || 'OPEN');
  const [priority, setPriority] = useState<ServiceOrderPriorityType>(orderToEdit?.priority || 'NORMAL');
  const [isMotherboardAnalysis, setIsMotherboardAnalysis] = useState<boolean>(
    orderToEdit?.is_motherboard_analysis || false
  );

  const [technicianName, setTechnicianName] = useState(orderToEdit?.technician_name || 'Mariana Santos');
  const [attendantName, setAttendantName] = useState(orderToEdit?.attendant_name || 'Carlos Silva');
  const [deliveryForecast, setDeliveryForecast] = useState<string>(
    orderToEdit?.delivery_forecast
      ? orderToEdit.delivery_forecast.slice(0, 16)
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Step 3: Services & Parts
  const [servicesItems, setServicesItems] = useState<OSServiceItem[]>(
    orderToEdit?.services_items || []
  );
  const [partsItems, setPartsItems] = useState<OSPartItem[]>(
    orderToEdit?.parts_items || []
  );

  // Service helper inputs
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(150);

  // Part helper inputs
  const [selectedPartProduct, setSelectedPartProduct] = useState<string>('');
  const [newPartQty, setNewPartQty] = useState<number>(1);
  const [newPartPrice, setNewPartPrice] = useState<number>(0);

  // Financials
  const [discountAmount, setDiscountAmount] = useState<number>(orderToEdit?.discount_amount || 0);
  const [surchargeAmount, setSurchargeAmount] = useState<number>(orderToEdit?.surcharge_amount || 0);
  const [depositAmount, setDepositAmount] = useState<number>(orderToEdit?.deposit_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string>(orderToEdit?.payment_method || 'PIX');
  const [notes, setNotes] = useState<string>('');

  // Status/Error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Auxiliary Data
  useEffect(() => {
    // 1. Next OS Number
    if (!orderToEdit) {
      fetch('/api/service-orders/next-number')
        .then((r) => r.json())
        .then((data) => {
          if (data.next_number) setOrderNumber(data.next_number);
        })
        .catch(console.error);
    }

    // 2. Clients
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => {
        if (data.clients) setClientsList(data.clients);
      })
      .catch(console.error);

    // 3. Brands
    fetch('/api/brands')
      .then((r) => r.json())
      .then((data) => {
        if (data.brands) setBrandsList(data.brands);
      })
      .catch(console.error);

    // 4. Products for parts
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setAvailableProducts(data.products);
      })
      .catch(console.error);
  }, [orderToEdit]);

  // When brand changes, load models
  useEffect(() => {
    if (selectedBrandId) {
      fetch(`/api/phone-models?brand_id=${selectedBrandId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.phoneModels) setModelsList(data.phoneModels);
        })
        .catch(console.error);
    } else {
      setModelsList([]);
    }
  }, [selectedBrandId]);

  // Handle Client Selection
  const handleSelectClient = (c: any) => {
    setSelectedClientId(c.id);
    setClientName(c.name);
    setClientPhone(c.phone || '');
    setClientDocument(c.document || '');
    setClientEmail(c.email || '');
    setClientAddress(c.address ? `${c.address}, ${c.number || 'S/N'}` : '');
  };

  // Handle Brand Selection
  const handleSelectBrand = (brand: any) => {
    setSelectedBrandId(brand.id);
    setBrandName(brand.name);
    setSelectedModelId('');
    setModelName('');
  };

  // Handle Model Selection
  const handleSelectModel = (model: any) => {
    setSelectedModelId(model.id);
    setModelName(model.name);
  };

  // Toggle Physical condition checklist
  const togglePhysicalCondition = (item: string) => {
    setSelectedPhysicalConditions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Toggle Accessories checklist
  const toggleAccessory = (item: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Add Service Item
  const handleAddServiceItem = () => {
    if (!newServiceName.trim()) return;
    const subtotal = newServicePrice;
    setServicesItems((prev) => [
      ...prev,
      {
        id: `srv_${Date.now()}_${Math.random()}`,
        service_id: '',
        service_name: newServiceName.trim(),
        quantity: 1,
        unit_price: newServicePrice,
        subtotal,
      },
    ]);
    setNewServiceName('');
    setNewServicePrice(150);
  };

  const handleRemoveServiceItem = (index: number) => {
    setServicesItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Part Item from Inventory
  const handleAddPartItem = () => {
    const product = availableProducts.find((p) => p.id === selectedPartProduct);
    if (!product) return;

    const qty = Math.max(1, newPartQty);
    const price = newPartPrice > 0 ? newPartPrice : (product.sale_price || product.base_price || 100);
    const subtotal = qty * price;

    setPartsItems((prev) => [
      ...prev,
      {
        id: `prt_${Date.now()}_${Math.random()}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: qty,
        unit_price: price,
        subtotal,
      },
    ]);

    setSelectedPartProduct('');
    setNewPartQty(1);
    setNewPartPrice(0);
  };

  const handleRemovePartItem = (index: number) => {
    setPartsItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Financial Calculations: SERVIÇOS + PEÇAS - DESCONTO + ACRÉSCIMO = TOTAL
  const servicesSubtotal = servicesItems.reduce((acc, s) => acc + s.subtotal, 0);
  const partsSubtotal = partsItems.reduce((acc, p) => acc + p.subtotal, 0);
  const totalAmount = Math.max(0, servicesSubtotal + partsSubtotal - Number(discountAmount || 0) + Number(surchargeAmount || 0));
  const remainingAmount = Math.max(0, totalAmount - Number(depositAmount || 0));

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor, informe o nome do cliente.');
      setCurrentStep(1);
      return;
    }
    if (!reportedDefect.trim()) {
      setErrorMessage('Por favor, descreva o problema/defeito relatado.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const resolvedDeviceName = customDeviceName.trim()
      ? customDeviceName.trim()
      : `${brandName} ${modelName}`.trim() || 'Smartphone / Dispositivo';

    const payload = {
      client_id: selectedClientId,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_document: clientDocument.trim(),
      client_email: clientEmail.trim(),
      client_address: clientAddress.trim(),
      brand_id: selectedBrandId,
      brand_name: brandName,
      model_id: selectedModelId,
      model_name: modelName,
      device_name: resolvedDeviceName,
      device_color: deviceColor,
      imei_1: imei1,
      imei_2: imei2 || null,
      device_password: devicePassword || 'Sem senha',
      password_type: passwordType,
      physical_condition: physicalCondition,
      physical_conditions_checklist: selectedPhysicalConditions,
      accessories: accessories,
      accessories_checklist: selectedAccessories,
      reported_defect: reportedDefect,
      technical_diagnosis: technicalDiagnosis,
      technician_name: technicianName,
      attendant_name: attendantName,
      delivery_forecast: deliveryForecast ? new Date(deliveryForecast).toISOString() : null,
      status,
      priority,
      is_motherboard_analysis: isMotherboardAnalysis,
      services_items: servicesItems,
      parts_items: partsItems,
      discount_amount: Number(discountAmount) || 0,
      surcharge_amount: Number(surchargeAmount) || 0,
      deposit_amount: Number(depositAmount) || 0,
      payment_method: paymentMethod,
      notes: notes.trim(),
    };

    try {
      const url = orderToEdit
        ? `/api/service-orders/${orderToEdit.id}`
        : '/api/service-orders';
      const method = orderToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar a Ordem de Serviço.');
      }

      onSaved(data.serviceOrder);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar OS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {orderToEdit ? `Editar OS #${orderToEdit.order_number}` : 'Nova Ordem de Serviço'}
                </h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded">
                  OS #{orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fluxo Obrigatório: <span className="font-semibold text-indigo-600 dark:text-indigo-400">CLIENTE → MARCA → MODELO</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Wizard Header */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-850 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              currentStep === 1
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>1. Cliente & Aparelho</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              currentStep === 2
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>2. Defeito & Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`py-3 px-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              currentStep === 3
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>3. Serviços, Peças & Total</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: CLIENTE → MARCA → MODELO ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* 1. SELEÇÃO DO CLIENTE */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    Etapa 1: Selecionar ou Cadastrar Cliente *
                  </h4>
                  {selectedClientId && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Cliente Vinculado
                    </span>
                  )}
                </div>

                {/* Quick Client Search / Picker */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Pesquisar cliente existente por nome ou telefone..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {clientSearch.trim() && (
                    <div className="absolute z-10 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                      {clientsList
                        .filter(
                          (c) =>
                            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                            (c.phone && c.phone.includes(clientSearch))
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              handleSelectClient(c);
                              setClientSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-b border-slate-100 dark:border-slate-700/50 flex justify-between"
                          >
                            <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                            <span className="text-slate-500 dark:text-slate-400">{c.phone}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Client Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(11) 98888-7777"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CPF / CNPJ
                    </label>
                    <input
                      type="text"
                      value={clientDocument}
                      onChange={(e) => setClientDocument(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      E-mail do Cliente
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="cliente@email.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SELEÇÃO DA MARCA */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Etapa 2: Selecionar Marca *
                  </h4>
                  {brandName && (
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Marca Selecionada: {brandName}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {brandsList.map((b) => {
                    const isSelected = selectedBrandId === b.id || brandName === b.name;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBrand(b)}
                        className={`p-2.5 text-xs font-bold rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. SELEÇÃO DO MODELO */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Etapa 3: Selecionar Modelo *
                  </h4>
                  {modelName && (
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Modelo: {modelName}
                    </span>
                  )}
                </div>

                {modelsList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                    {modelsList.map((m) => {
                      const isSelected = selectedModelId === m.id || modelName === m.name;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectModel(m)}
                          className={`p-2 text-xs font-medium rounded-lg border text-left transition-all truncate ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {selectedBrandId
                      ? 'Nenhum modelo cadastrado para esta marca. Você pode digitar abaixo.'
                      : 'Selecione uma marca acima para carregar os modelos.'}
                  </p>
                )}

                {/* Custom device model input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ou digite o Modelo / Aparelho manualmente
                    </label>
                    <input
                      type="text"
                      value={customDeviceName}
                      onChange={(e) => setCustomDeviceName(e.target.value)}
                      placeholder="Ex: iPhone 14 Pro Max 256GB"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cor do Aparelho
                    </label>
                    <input
                      type="text"
                      value={deviceColor}
                      onChange={(e) => setDeviceColor(e.target.value)}
                      placeholder="Ex: Grafite / Preto Espacial"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DEFEITO, SENHA, IMEIs & CHECKLISTS ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* IMEIs e Senhas */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  IMEI & Senha de Desbloqueio
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      IMEI 1
                    </label>
                    <input
                      type="text"
                      value={imei1}
                      onChange={(e) => setImei1(e.target.value)}
                      placeholder="358923091823901"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      IMEI 2 (Opcional / e-SIM)
                    </label>
                    <input
                      type="text"
                      value={imei2}
                      onChange={(e) => setImei2(e.target.value)}
                      placeholder="358923091823902"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Senha / Padrão / PIN
                    </label>
                    <input
                      type="text"
                      value={devicePassword}
                      onChange={(e) => setDevicePassword(e.target.value)}
                      placeholder="Ex: 123456 ou Padrão em L"
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Defeito Relatado e Diagnóstico */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
                    Problema Relatado pelo Cliente *
                  </label>
                  <textarea
                    rows={2}
                    value={reportedDefect}
                    onChange={(e) => setReportedDefect(e.target.value)}
                    placeholder="Ex: Aparelho caiu no chão, tela apagou completamente e não carrega na tomada..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Laudo Técnico Inicial / Observações de Entrada
                  </label>
                  <textarea
                    rows={2}
                    value={technicalDiagnosis}
                    onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                    placeholder="Ex: Aparelho apresenta consumo de 0.04A na fonte de bancada. Sem sinal de vídeo."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Checklists: Estado Físico */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Checklist de Estado Físico & Avarias
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {COMMON_PHYSICAL_CONDITIONS.map((cond) => {
                    const isChecked = selectedPhysicalConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => togglePhysicalCondition(cond)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left border transition-all ${
                          isChecked
                            ? 'bg-amber-100/70 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checklists: Acessórios */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Checklist de Acessórios Deixados
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {COMMON_ACCESSORIES.map((acc) => {
                    const isChecked = selectedAccessories.includes(acc);
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => toggleAccessory(acc)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left border transition-all ${
                          isChecked
                            ? 'bg-indigo-100/70 border-indigo-300 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-700 dark:text-indigo-200 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">{acc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status, Prioridade e Equipe */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Inicial *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ServiceOrderStatusType)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="OPEN">Aberta</option>
                    <option value="WAITING_PARTS">Aguardando Peças</option>
                    <option value="IN_PROGRESS">Em Manutenção</option>
                    <option value="ANALYSIS_BOARD">Em Análise de Placa</option>
                    <option value="FINISHED_READY">Pronto</option>
                    <option value="WAITING_PICKUP">Aguardando Retirada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ServiceOrderPriorityType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Técnico Responsável
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Previsão de Entrega
                  </label>
                  <input
                    type="datetime-local"
                    value={deliveryForecast}
                    onChange={(e) => setDeliveryForecast(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SERVIÇOS, PEÇAS, PAGAMENTO E TOTAIS ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* SERVIÇOS */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Serviços de Mão de Obra
                  </h4>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Subtotal: {formatCurrencyBR(servicesSubtotal)}
                  </span>
                </div>

                {/* Form to add service */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Descrição do serviço (ex: Troca de tela, Banho químico...)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(Number(e.target.value))}
                      placeholder="Valor (R$)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddServiceItem}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Serviço
                  </button>
                </div>

                {/* Services Table */}
                {servicesItems.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mt-2">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="py-2 px-3">Serviço</th>
                          <th className="py-2 px-3 text-right">Valor</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                          <th className="py-2 px-3 text-center w-10">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-850">
                        {servicesItems.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{item.service_name}</td>
                            <td className="py-2 px-3 text-right">{formatCurrencyBR(item.unit_price)}</td>
                            <td className="py-2 px-3 text-right font-bold">{formatCurrencyBR(item.subtotal)}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PEÇAS & COMPONENTES DO ESTOQUE */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Peças & Componentes (Estoque)
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Subtotal: {formatCurrencyBR(partsSubtotal)}
                  </span>
                </div>

                {/* Form to add part */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedPartProduct}
                      onChange={(e) => {
                        setSelectedPartProduct(e.target.value);
                        const prod = availableProducts.find((p) => p.id === e.target.value);
                        if (prod) {
                          setNewPartPrice(prod.sale_price || prod.base_price || 100);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">Selecione a peça do estoque...</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Estoque: {p.current_stock}) — {formatCurrencyBR(p.sale_price || p.base_price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={newPartQty}
                      onChange={(e) => setNewPartQty(Number(e.target.value))}
                      placeholder="Qtd"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPartPrice}
                      onChange={(e) => setNewPartPrice(Number(e.target.value))}
                      placeholder="Valor Unit. (R$)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPartItem}
                    className="flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Peça
                  </button>
                </div>

                {/* Parts Table */}
                {partsItems.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mt-2">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="py-2 px-3">Peça / Componente</th>
                          <th className="py-2 px-3 text-center">Qtd</th>
                          <th className="py-2 px-3 text-right">Valor Unit.</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                          <th className="py-2 px-3 text-center w-10">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-850">
                        {partsItems.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                              {item.product_name}
                              {item.product_sku && <span className="text-slate-400 text-[10px]"> ({item.product_sku})</span>}
                            </td>
                            <td className="py-2 px-3 text-center">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">{formatCurrencyBR(item.unit_price)}</td>
                            <td className="py-2 px-3 text-right font-bold">{formatCurrencyBR(item.subtotal)}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePartItem(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* FECHAMENTO FINANCEIRO: CÁLCULO & PAGAMENTO */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Cálculo Final & Pagamento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Acréscimo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={surchargeAmount}
                      onChange={(e) => setSurchargeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Entrada / Sinal (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="PIX">PIX</option>
                      <option value="CASH">Dinheiro em Espécie</option>
                      <option value="CREDIT_CARD">Cartão de Crédito</option>
                      <option value="DEBIT_CARD">Cartão de Débito</option>
                      <option value="BOLETO">Boleto</option>
                    </select>
                  </div>
                </div>

                {/* Fórmula Visual */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-semibold uppercase">Fórmula de Cálculo</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300">
                      SERVIÇOS ({formatCurrencyBR(servicesSubtotal)}) + PEÇAS ({formatCurrencyBR(partsSubtotal)}) - DESC ({formatCurrencyBR(discountAmount)}) + ACRÉSC ({formatCurrencyBR(surchargeAmount)})
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">TOTAL DA OS</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {formatCurrencyBR(totalAmount)}
                      </span>
                    </div>
                    <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4">
                      <span className="text-[11px] text-slate-500 block">RESTANTE A PAGAR</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrencyBR(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ← Voltar Etapa
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !clientName.trim()) {
                      setErrorMessage('Por favor, informe o nome do cliente antes de prosseguir.');
                      return;
                    }
                    setErrorMessage(null);
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                >
                  Próxima Etapa →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Salvando OS...' : orderToEdit ? 'Atualizar Ordem de Serviço' : 'Salvar e Gerar OS'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
