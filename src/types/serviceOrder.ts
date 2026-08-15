export type ServiceOrderStatusType =
  | 'OPEN'
  | 'WAITING_PARTS'
  | 'IN_PROGRESS'
  | 'ANALYSIS_BOARD'
  | 'FINISHED_READY'
  | 'WAITING_PICKUP'
  | 'CANCELLED';

export type ServiceOrderPriorityType = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type PasswordType = 'PIN' | 'ALPHANUMERIC' | 'PATTERN' | 'NONE';

export type FinancialStatusType = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface OSServiceItem {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OSPartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OSHistoryItem {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  previous_status: string;
  new_status: string;
  notes: string;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  order_number: number;
  entry_date: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_document?: string;
  client_email?: string;
  client_address?: string;
  brand_id?: string;
  brand_name?: string;
  model_id?: string;
  model_name?: string;
  device_name: string;
  device_color?: string;
  imei_1?: string;
  imei_2?: string | null;
  device_password?: string;
  password_type?: PasswordType;
  physical_condition?: string;
  physical_conditions_checklist?: string[];
  accessories?: string;
  accessories_checklist?: string[];
  reported_defect: string;
  technical_diagnosis?: string;
  technician_id?: string;
  technician_name?: string;
  attendant_id?: string;
  attendant_name?: string;
  delivery_forecast?: string | null;
  status: ServiceOrderStatusType;
  priority: ServiceOrderPriorityType;
  is_motherboard_analysis: boolean;
  services_items: OSServiceItem[];
  parts_items: OSPartItem[];
  services_subtotal: number;
  parts_subtotal: number;
  discount_amount: number;
  surcharge_amount: number;
  total_amount: number;
  deposit_amount: number;
  remaining_amount: number;
  payment_method: string;
  financial_status: FinancialStatusType;
  history: OSHistoryItem[];
  created_at: string;
  updated_at: string;
}

export const STATUS_CONFIG: Record<
  ServiceOrderStatusType,
  { label: string; bg: string; text: string; border: string; badge: string; description: string }
> = {
  OPEN: {
    label: 'Aberta',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    description: 'Ordem recém-aberta aguardando triagem ou início do diagnóstico.',
  },
  WAITING_PARTS: {
    label: 'Aguardando Peças',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    description: 'Reparo pausado aguardando chegada de componentes ou peças do fornecedor.',
  },
  IN_PROGRESS: {
    label: 'Em Manutenção',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
    description: 'Aparelho em execução e testes na bancada técnica do especialista.',
  },
  ANALYSIS_BOARD: {
    label: 'Em Análise de Placa',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    description: 'Serviço avançado de microeletrônica, reconstrução de trilhas ou reballing.',
  },
  FINISHED_READY: {
    label: 'Pronto',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
    description: 'Serviço concluído com êxito e testes de bancada 100% aprovados.',
  },
  WAITING_PICKUP: {
    label: 'Aguardando Retirada',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-300 dark:border-teal-700',
    description: 'Cliente avisado. Aparelho pronto na expedição aguardando retirada e quitação.',
  },
  CANCELLED: {
    label: 'Cancelada',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700',
    description: 'Orçamento não aprovado ou serviço cancelado pelo cliente/loja.',
  },
};

export const COMMON_PHYSICAL_CONDITIONS = [
  'Sem Danos Aparentes',
  'Tela Trincada/Quebrada',
  'Tampa Traseira Quebrada',
  'Marcas de Queda / Batidas',
  'Oxidação / Contato com Água',
  'Bateria Estufada',
  'Lente da Câmera Trincada',
  'Carcaça Empenada',
  'Botões Físicos Danificados',
  'Conector USB Frouxo / Danificado',
];

export const COMMON_ACCESSORIES = [
  'Sem Acessórios',
  'Capa de Proteção',
  'Película de Vidro/Cerâmica',
  'Gaveta de Chip SIM',
  'Cartão de Memória MicroSD',
  'Carregador Original',
  'Cabo USB',
  'Caneta/Stylus',
  'Caixa Original',
];
