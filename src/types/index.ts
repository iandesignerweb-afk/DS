export type UserRole = 'ADMIN' | 'SELLER' | 'TECHNICIAN' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  commission_percentage: number;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  notes?: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  icon?: string;
}

export interface DeviceModel {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  type: 'SMARTPHONE' | 'TABLET' | 'SMARTWATCH' | 'OTHER';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  brand_id?: string;
  model_id?: string;
  category: 'PEÇA' | 'ACESSÓRIO' | 'OUTROS';
  cost_price?: number; // Only accessible to ADMIN
  selling_price: number;
  stock_quantity: number;
  min_stock: number;
  supplier_id?: string;
  supplier_name?: string;
  unit: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  default_price: number;
  category: string;
  warranty_days: number;
}

export interface Supplier {
  id: string;
  name: string;
  trade_name?: string;
  document?: string;
  phone: string;
  email?: string;
  contact_person?: string;
  notes?: string;
}

export interface StockInwardItem {
  id: string;
  product_id?: string;
  product_name: string;
  sku?: string;
  barcode?: string;
  category: 'PEÇA' | 'ACESSÓRIO' | 'OUTROS';
  quantity: number;
  cost_price: number;
  current_selling_price?: number;
  new_selling_price: number;
  markup_percentage?: number;
  total_cost: number;
  is_new_product?: boolean;
}

export interface StockInwardInvoice {
  id: string;
  invoice_number: string;
  series?: string;
  access_key?: string;
  issue_date: string;
  entry_date: string;
  supplier_id?: string;
  supplier_name: string;
  supplier_cnpj?: string;
  items: StockInwardItem[];
  total_items: number;
  total_units: number;
  total_cost_amount: number;
  notes?: string;
  payment_status: 'PENDING' | 'PAID';
  due_date?: string;
  create_financial_payable?: boolean;
  registered_by: string;
  created_at: string;
}

export type ServiceOrderStatus =
  | 'OPEN'
  | 'ANALYSIS_BOARD' // "foi para analise de placa"
  | 'WAITING_PARTS'  // "aguardando peças"
  | 'IN_PROGRESS'
  | 'FINISHED_READY' // "pronto"
  | 'WAITING_PICKUP' // "aguardando retirada"
  | 'DELIVERED'
  | 'CANCELLED';     // "cancelado"

export interface ServiceOrderItemService {
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
}

export interface ServiceOrderItemPart {
  product_id: string;
  product_name: string;
  price: number;
  cost_price?: number;
  quantity: number;
}

export interface ServiceOrderHistory {
  id: string;
  date: string;
  status: ServiceOrderStatus;
  note: string;
  user_name: string;
}

export interface ServiceOrder {
  id: string;
  order_number: number;
  entry_date: string;
  delivery_expected_date?: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_document?: string;
  brand_id: string;
  brand_name: string;
  model_id: string;
  model_name: string;
  imei_1?: string;
  imei_2?: string;
  device_password?: string;
  physical_state?: string;
  accessories?: string;
  reported_defect: string;
  technical_diagnosis?: string;
  status: ServiceOrderStatus;
  is_motherboard_analysis: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  technician_id?: string;
  technician_name?: string;
  seller_id?: string;
  seller_name?: string;
  services: ServiceOrderItemService[];
  parts: ServiceOrderItemPart[];
  total_services: number;
  total_parts: number;
  discount: number;
  addition: number;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_method?: string;
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID';
  financial_status?: string;
  history: ServiceOrderHistory[];
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  cost_price?: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  sale_number: number;
  date: string;
  client_id?: string;
  client_name?: string;
  seller_id: string;
  seller_name: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'OUTROS';
  commission_percentage: number;
  commission_amount: number;
  notes?: string;
}

export interface CashMovement {
  id: string;
  type: 'SUPPLY' | 'BLEED' | 'SALE' | 'OS_PAYMENT' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  user_name: string;
}

export interface CashRegister {
  id: string;
  status: 'OPEN' | 'CLOSED';
  initial_amount: number;
  current_balance: number;
  opened_at: string;
  closed_at?: string;
  opened_by: string;
  closed_by?: string;
  movements: CashMovement[];
}

export interface FinancialAccount {
  id: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  description: string;
  category: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  entity_name: string;
  notes?: string;
}

export interface FinancialSummary {
  grossRevenue: number;
  estimatedGrossProfit: number;
  totalCostOfGoods: number;
  totalOSRevenue: number;
  totalOSPaid: number;
  totalOSPending: number;
  totalSalesRevenue: number;
  totalCommissions: number;
  cashBalance: number;
  inventoryCostValue: number;
  inventorySalesValue: number;
  totalPayablePending: number;
  totalReceivablePending: number;
}

export const STATUS_CONFIG: Record<
  ServiceOrderStatus,
  { label: string; bg: string; text: string; border: string; badge: string; iconName: string }
> = {
  OPEN: {
    label: 'Aberta',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800',
    iconName: 'Clock',
  },
  ANALYSIS_BOARD: {
    label: 'Foi p/ Análise de Placa',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-800',
    iconName: 'Cpu',
  },
  WAITING_PARTS: {
    label: 'Aguardando Peças',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/60 dark:text-amber-300 dark:border-amber-800',
    iconName: 'Package',
  },
  IN_PROGRESS: {
    label: 'Em Manutenção',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-800',
    iconName: 'Wrench',
  },
  FINISHED_READY: {
    label: 'Pronto',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-800',
    iconName: 'CheckCircle2',
  },
  WAITING_PICKUP: {
    label: 'Aguardando Retirada',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/60 dark:text-teal-300 dark:border-teal-800',
    iconName: 'Gift',
  },
  DELIVERED: {
    label: 'Entregue / Concluído',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconName: 'CheckCheck',
  },
  CANCELLED: {
    label: 'Cancelado',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/60 dark:text-rose-300 dark:border-rose-800',
    iconName: 'XCircle',
  },
};

export interface StoreSettings {
  store_name: string;
  store_subtitle: string;
  logo_url: string;
  cnpj_cpf: string;
  phone: string;
  whatsapp: string;
  email: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  receipt_footer_msg: string;
  warranty_terms: string;
  default_commission_pct: number;
  auto_print_receipt: boolean;
  paper_size: '80mm' | '58mm' | 'A4';
}

