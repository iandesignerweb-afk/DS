import { ServiceOrderStatus, ServiceOrderPriority, UserRole } from './database';

export interface DashboardKPIs {
  // OS Indicadores
  open_os_count: number;
  waiting_parts_count: number;
  waiting_pickup_count: number;
  ready_os_count: number;
  board_analysis_count: number;
  cancelled_os_count: number;

  // Financeiro & Vendas (Com controle de permissão)
  sales_today_total: number | null;
  sales_today_count: number;
  sales_month_total: number | null;
  sales_month_count: number;
  accounts_receivable_total: number | null;
  accounts_payable_total: number | null;

  // Estoque & Clientes
  low_stock_count: number;
  total_products_count: number;
  total_clients_count: number;

  // Permissões ativas no momento da consulta
  role: UserRole;
  isFinancialRestricted: boolean;
  last_updated: string;
}

export interface RecentServiceOrderItem {
  id: string;
  order_number: number;
  client_id?: string;
  client_name: string;
  client_phone: string;
  device_name: string;
  brand: string;
  reported_defect: string;
  technical_diagnosis?: string | null;
  status: ServiceOrderStatus | 'ANALYSIS_BOARD';
  priority: ServiceOrderPriority;
  total_amount: number;
  entry_date: string;
  delivery_forecast?: string | null;
  technician_name?: string | null;
  is_motherboard_analysis?: boolean;
}

export interface LowStockProductItem {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  current_stock: number;
  min_stock: number;
  deficit: number;
  sale_price: number;
  cost_price: number | null; // null if not ADMIN
  category_name: string;
  brand_name?: string | null;
  status_urgency: 'CRITICAL' | 'WARNING';
}

export interface SalesChartDataPoint {
  date: string;
  formatted_date: string;
  sales_revenue: number;
  os_revenue: number;
  total_revenue: number;
  sales_count: number;
  os_completed_count: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  color: string;
  percentage: number;
}

export interface ClientOption {
  id: string;
  name: string;
  phone: string;
  document: string | null;
  email: string | null;
  city: string | null;
}

export interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  sale_price: number;
  cost_price?: number | null;
  current_stock: number;
  min_stock: number;
  category_name?: string;
}

export interface CreateServiceOrderInput {
  client_name: string;
  client_phone: string;
  client_document?: string;
  brand: string;
  device_name: string;
  imei?: string;
  reported_defect: string;
  is_motherboard_analysis?: boolean;
  priority: ServiceOrderPriority;
  delivery_forecast?: string;
  estimated_price?: number;
  notes?: string;
}

export interface CreateClientInput {
  name: string;
  phone: string;
  document?: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  sale_price: number;
  cost_price?: number;
  current_stock: number;
  min_stock: number;
}

export interface CreateSaleInput {
  client_id?: string;
  client_name: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
  discount: number;
  payment_method: string;
  notes?: string;
}
