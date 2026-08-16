import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// --- Interfaces & Types ---
export type UserRole = 'ADMIN' | 'SELLER' | 'TECHNICIAN' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  commission_percentage: number; // e.g. 5%
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  document?: string; // CPF/CNPJ
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
  cost_price: number; // Hidden from non-admins
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
  document?: string; // CNPJ
  phone: string;
  email?: string;
  contact_person?: string;
  notes?: string;
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
  entity_name: string; // Supplier or Client
  notes?: string;
}

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

// --- In-Memory Initial Seed Database ---

let storeSettings: StoreSettings = {
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

const users: User[] = [
  {
    id: 'usr_admin',
    name: 'Carlos Mendes (Admin)',
    email: 'admin@dualcell.com.br',
    role: 'ADMIN',
    commission_percentage: 5.0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'usr_seller_1',
    name: 'Mariana Silva (Vendedora)',
    email: 'mariana@dualcell.com.br',
    role: 'SELLER',
    commission_percentage: 4.0,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'usr_tech_1',
    name: 'Lucas Rocha (Técnico Master)',
    email: 'lucas@dualcell.com.br',
    role: 'TECHNICIAN',
    commission_percentage: 10.0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
];

const brands: Brand[] = [
  { id: 'b_apple', name: 'Apple', icon: 'apple' },
  { id: 'b_samsung', name: 'Samsung', icon: 'smartphone' },
  { id: 'b_xiaomi', name: 'Xiaomi', icon: 'smartphone' },
  { id: 'b_motorola', name: 'Motorola', icon: 'smartphone' },
  { id: 'b_realme', name: 'Realme', icon: 'smartphone' },
  { id: 'b_other', name: 'Outra Marca', icon: 'wrench' },
];

const models: DeviceModel[] = [
  // Apple
  { id: 'm_ip11', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 11', type: 'SMARTPHONE' },
  { id: 'm_ip12', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 12', type: 'SMARTPHONE' },
  { id: 'm_ip12pro', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 12 Pro Max', type: 'SMARTPHONE' },
  { id: 'm_ip13', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 13', type: 'SMARTPHONE' },
  { id: 'm_ip13pro', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 13 Pro', type: 'SMARTPHONE' },
  { id: 'm_ip14', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 14', type: 'SMARTPHONE' },
  { id: 'm_ip14pro', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 14 Pro Max', type: 'SMARTPHONE' },
  { id: 'm_ip15', brand_id: 'b_apple', brand_name: 'Apple', name: 'iPhone 15 Pro', type: 'SMARTPHONE' },
  // Samsung
  { id: 'm_s21', brand_id: 'b_samsung', brand_name: 'Samsung', name: 'Galaxy S21', type: 'SMARTPHONE' },
  { id: 'm_s22', brand_id: 'b_samsung', brand_name: 'Samsung', name: 'Galaxy S22 Ultra', type: 'SMARTPHONE' },
  { id: 'm_s23', brand_id: 'b_samsung', brand_name: 'Samsung', name: 'Galaxy S23', type: 'SMARTPHONE' },
  { id: 'm_a54', brand_id: 'b_samsung', brand_name: 'Samsung', name: 'Galaxy A54 5G', type: 'SMARTPHONE' },
  { id: 'm_a14', brand_id: 'b_samsung', brand_name: 'Samsung', name: 'Galaxy A14', type: 'SMARTPHONE' },
  // Xiaomi
  { id: 'm_rn12', brand_id: 'b_xiaomi', brand_name: 'Xiaomi', name: 'Redmi Note 12', type: 'SMARTPHONE' },
  { id: 'm_rn13', brand_id: 'b_xiaomi', brand_name: 'Xiaomi', name: 'Redmi Note 13 Pro', type: 'SMARTPHONE' },
  { id: 'm_pocox5', brand_id: 'b_xiaomi', brand_name: 'Xiaomi', name: 'Poco X5 Pro 5G', type: 'SMARTPHONE' },
  // Motorola
  { id: 'm_g54', brand_id: 'b_motorola', brand_name: 'Motorola', name: 'Moto G54 5G', type: 'SMARTPHONE' },
  { id: 'm_g84', brand_id: 'b_motorola', brand_name: 'Motorola', name: 'Moto G84', type: 'SMARTPHONE' },
  { id: 'm_edge40', brand_id: 'b_motorola', brand_name: 'Motorola', name: 'Motorola Edge 40', type: 'SMARTPHONE' },
];

const clients: Client[] = [
  {
    id: 'cli_1',
    name: 'Ana Carolina Meireles',
    phone: '(11) 98765-4321',
    email: 'ana.meireles@email.com',
    document: '345.890.123-04',
    address: 'Av. Paulista, 1500, Apto 42',
    city: 'São Paulo - SP',
    notes: 'Cliente preferencial, sempre traz aparelhos da família.',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cli_2',
    name: 'Roberto Souza Duarte',
    phone: '(11) 97123-8899',
    email: 'roberto.duarte@empresa.com.br',
    document: '128.456.789-22',
    address: 'Rua Augusta, 450',
    city: 'São Paulo - SP',
    notes: 'Empresa corporativa (solicita recibo discriminado).',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'cli_3',
    name: 'Juliana Castro',
    phone: '(11) 96455-1122',
    email: 'juliana.castro@gmail.com',
    document: '298.112.443-88',
    address: 'Rua Vergueiro, 890',
    city: 'São Paulo - SP',
    notes: 'Costuma deixar senha padrão em L.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const suppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Mega Peças Telas & Displays SP',
    trade_name: 'MegaTelas Distribuidora',
    document: '18.442.990/0001-45',
    phone: '(11) 3322-1100',
    email: 'comercial@megatelasdist.com.br',
    contact_person: 'Eduardo Peças',
    notes: 'Entrega rápida motoboy no mesmo dia para pedidos até 13h.',
  },
  {
    id: 'sup_2',
    name: 'King Baterias & Componentes Brasil',
    trade_name: 'King Baterias',
    document: '24.110.880/0001-12',
    phone: '(11) 3210-9988',
    email: 'vendas@kingbaterias.com',
    contact_person: 'Fabiana Souza',
    notes: 'Garantia de 6 meses em baterias originais e premium.',
  },
  {
    id: 'sup_3',
    name: 'TechCell Acessórios e Películas',
    trade_name: 'TechCell Brasil',
    document: '31.554.210/0001-90',
    phone: '(11) 4004-5566',
    email: 'contato@techcellacessorios.com',
    contact_person: 'Marcos Acessórios',
    notes: 'Preço atacado em películas 3D/Privacidade e capas anti-impacto.',
  },
];

const services: Service[] = [
  { id: 'srv_1', name: 'Troca de Tela / Módulo Frontal', default_price: 150.0, category: 'TELAS', warranty_days: 90 },
  { id: 'srv_2', name: 'Troca de Bateria', default_price: 90.0, category: 'BATERIA', warranty_days: 90 },
  { id: 'srv_3', name: 'Reparo em Placa / Microeletrônica', default_price: 280.0, category: 'PLACA', warranty_days: 90 },
  { id: 'srv_4', name: 'Troca de Conector de Carga (Dock/Sub-placa)', default_price: 120.0, category: 'CARGA', warranty_days: 90 },
  { id: 'srv_5', name: 'Desoxidação e Limpeza Química Ultrassônica', default_price: 160.0, category: 'DESOXIDAÇÃO', warranty_days: 30 },
  { id: 'srv_6', name: 'Troca de Tampa Traseira / Vidro', default_price: 140.0, category: 'ESTÉTICA', warranty_days: 90 },
  { id: 'srv_7', name: 'Restauração de Software / Reset / Atualização', default_price: 80.0, category: 'SOFTWARE', warranty_days: 30 },
];

const products: Product[] = [
  // Peças
  {
    id: 'prod_1',
    name: 'Tela Display iPhone 13 Original Nacional',
    sku: 'TEL-IP13-ORIG',
    barcode: '789123456001',
    brand_id: 'b_apple',
    model_id: 'm_ip13',
    category: 'PEÇA',
    cost_price: 320.0,
    selling_price: 680.0,
    stock_quantity: 4,
    min_stock: 2,
    supplier_id: 'sup_1',
    supplier_name: 'Mega Peças Telas & Displays SP',
    unit: 'UN',
  },
  {
    id: 'prod_2',
    name: 'Tela Display iPhone 11 Incell Premium',
    sku: 'TEL-IP11-INC',
    barcode: '789123456002',
    brand_id: 'b_apple',
    model_id: 'm_ip11',
    category: 'PEÇA',
    cost_price: 110.0,
    selling_price: 290.0,
    stock_quantity: 8,
    min_stock: 3,
    supplier_id: 'sup_1',
    supplier_name: 'Mega Peças Telas & Displays SP',
    unit: 'UN',
  },
  {
    id: 'prod_3',
    name: 'Bateria iPhone 12 / 12 Pro Foxconn Saúde 100%',
    sku: 'BAT-IP12-100',
    barcode: '789123456003',
    brand_id: 'b_apple',
    model_id: 'm_ip12',
    category: 'PEÇA',
    cost_price: 75.0,
    selling_price: 220.0,
    stock_quantity: 6,
    min_stock: 2,
    supplier_id: 'sup_2',
    supplier_name: 'King Baterias & Componentes Brasil',
    unit: 'UN',
  },
  {
    id: 'prod_4',
    name: 'Tela Display Galaxy A54 5G Original com Aro',
    sku: 'TEL-SMA54-ARO',
    barcode: '789123456004',
    brand_id: 'b_samsung',
    model_id: 'm_a54',
    category: 'PEÇA',
    cost_price: 210.0,
    selling_price: 460.0,
    stock_quantity: 3,
    min_stock: 1,
    supplier_id: 'sup_1',
    supplier_name: 'Mega Peças Telas & Displays SP',
    unit: 'UN',
  },
  {
    id: 'prod_5',
    name: 'Conector de Carga Placa Sub Galaxy S22',
    sku: 'SUB-SMS22-CHG',
    barcode: '789123456005',
    brand_id: 'b_samsung',
    model_id: 'm_s22',
    category: 'PEÇA',
    cost_price: 35.0,
    selling_price: 140.0,
    stock_quantity: 5,
    min_stock: 2,
    supplier_id: 'sup_1',
    supplier_name: 'Mega Peças Telas & Displays SP',
    unit: 'UN',
  },
  // Acessórios
  {
    id: 'prod_6',
    name: 'Carregador Turbo 20W USB-C Dual Cell Pro',
    sku: 'CHG-20W-USBC',
    barcode: '789123456006',
    category: 'ACESSÓRIO',
    cost_price: 18.0,
    selling_price: 79.9,
    stock_quantity: 25,
    min_stock: 5,
    supplier_id: 'sup_3',
    supplier_name: 'TechCell Acessórios e Películas',
    unit: 'UN',
  },
  {
    id: 'prod_7',
    name: 'Cabo USB-C para Lightning Reforçado 1.2m',
    sku: 'CAB-LGT-USBC',
    barcode: '789123456007',
    category: 'ACESSÓRIO',
    cost_price: 12.0,
    selling_price: 49.9,
    stock_quantity: 30,
    min_stock: 10,
    supplier_id: 'sup_3',
    supplier_name: 'TechCell Acessórios e Películas',
    unit: 'UN',
  },
  {
    id: 'prod_8',
    name: 'Película 3D Cerâmica Fosca Anti-Reflexo',
    sku: 'PEL-3D-CERAMIC',
    barcode: '789123456008',
    category: 'ACESSÓRIO',
    cost_price: 4.5,
    selling_price: 35.0,
    stock_quantity: 50,
    min_stock: 15,
    supplier_id: 'sup_3',
    supplier_name: 'TechCell Acessórios e Películas',
    unit: 'UN',
  },
  {
    id: 'prod_9',
    name: 'Capa Anti-Impacto Militar com Airbag Transparente',
    sku: 'CAP-AIRBAG-MIL',
    barcode: '789123456009',
    category: 'ACESSÓRIO',
    cost_price: 8.0,
    selling_price: 45.0,
    stock_quantity: 40,
    min_stock: 10,
    supplier_id: 'sup_3',
    supplier_name: 'TechCell Acessórios e Películas',
    unit: 'UN',
  },
];

let nextOrderNumber = 1005;
const serviceOrders: ServiceOrder[] = [
  {
    id: 'os_1001',
    order_number: 1001,
    entry_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    delivery_expected_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    client_id: 'cli_1',
    client_name: 'Ana Carolina Meireles',
    client_phone: '(11) 98765-4321',
    client_document: '345.890.123-04',
    brand_id: 'b_apple',
    brand_name: 'Apple',
    model_id: 'm_ip13',
    model_name: 'iPhone 13',
    imei_1: '356987112233445',
    imei_2: '356987112233446',
    device_password: 'PIN: 140922',
    physical_state: 'Marcas de queda no canto superior direito, tela trincada.',
    accessories: 'Apenas aparelho com capinha',
    reported_defect: 'Tela quebrou após queda, sem toque na parte inferior.',
    technical_diagnosis: 'Display danificado, necessidade de troca do módulo frontal original.',
    status: 'IN_PROGRESS',
    is_motherboard_analysis: false,
    priority: 'HIGH',
    technician_id: 'usr_tech_1',
    technician_name: 'Lucas Rocha (Técnico Master)',
    seller_id: 'usr_seller_1',
    seller_name: 'Mariana Silva (Vendedora)',
    services: [
      { service_id: 'srv_1', service_name: 'Troca de Tela / Módulo Frontal', price: 150.0, quantity: 1 },
    ],
    parts: [
      { product_id: 'prod_1', product_name: 'Tela Display iPhone 13 Original Nacional', price: 680.0, cost_price: 320.0, quantity: 1 },
    ],
    total_services: 150.0,
    total_parts: 680.0,
    discount: 30.0,
    addition: 0,
    total_amount: 800.0,
    deposit_amount: 300.0,
    remaining_amount: 500.0,
    payment_method: 'PIX',
    payment_status: 'PARTIAL',
    history: [
      { id: 'h1', date: new Date(Date.now() - 4 * 86400000).toISOString(), status: 'OPEN', note: 'OS Aberta com entrada de R$ 300 no PIX.', user_name: 'Mariana Silva' },
      { id: 'h2', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'IN_PROGRESS', note: 'Iniciado processo de abertura e teste de tela nova.', user_name: 'Lucas Rocha' },
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'os_1002',
    order_number: 1002,
    entry_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    delivery_expected_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    client_id: 'cli_2',
    client_name: 'Roberto Souza Duarte',
    client_phone: '(11) 97123-8899',
    brand_id: 'b_samsung',
    brand_name: 'Samsung',
    model_id: 'm_s22',
    model_name: 'Galaxy S22 Ultra',
    imei_1: '359811223344556',
    device_password: 'Padrão em Z',
    reported_defect: 'Aparelho não liga, aquece muito próximo às câmeras quando colocado no carregador.',
    technical_diagnosis: 'Curto na linha primária VDD_MAIN. Enviado para microscópio e estação de solda.',
    status: 'ANALYSIS_BOARD', // Foi para análise de placa!
    is_motherboard_analysis: true,
    priority: 'URGENT',
    technician_id: 'usr_tech_1',
    technician_name: 'Lucas Rocha (Técnico Master)',
    seller_id: 'usr_seller_1',
    seller_name: 'Mariana Silva (Vendedora)',
    services: [
      { service_id: 'srv_3', service_name: 'Reparo em Placa / Microeletrônica', price: 380.0, quantity: 1 },
    ],
    parts: [],
    total_services: 380.0,
    total_parts: 0,
    discount: 0,
    addition: 0,
    total_amount: 380.0,
    deposit_amount: 0,
    remaining_amount: 380.0,
    payment_status: 'PENDING',
    history: [
      { id: 'h1', date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'OPEN', note: 'OS Aberta com defeito grave na placa.', user_name: 'Mariana Silva' },
      { id: 'h2', date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'ANALYSIS_BOARD', note: 'Encaminhado para bancada de microeletrônica / análise de placa.', user_name: 'Lucas Rocha' },
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'os_1003',
    order_number: 1003,
    entry_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    client_id: 'cli_3',
    client_name: 'Juliana Castro',
    client_phone: '(11) 96455-1122',
    brand_id: 'b_xiaomi',
    brand_name: 'Xiaomi',
    model_id: 'm_pocox5',
    model_name: 'Poco X5 Pro 5G',
    reported_defect: 'Bateria inchou e tampa traseira descolou. Descarrega em 2 horas.',
    technical_diagnosis: 'Bateria estufada com risco. Aguardando chegada do lote novo de baterias da Xiaomi.',
    status: 'WAITING_PARTS', // Aguardando peças!
    is_motherboard_analysis: false,
    priority: 'NORMAL',
    technician_id: 'usr_tech_1',
    technician_name: 'Lucas Rocha (Técnico Master)',
    services: [
      { service_id: 'srv_2', service_name: 'Troca de Bateria', price: 90.0, quantity: 1 },
    ],
    parts: [],
    total_services: 90.0,
    total_parts: 180.0,
    discount: 0,
    addition: 0,
    total_amount: 270.0,
    deposit_amount: 100.0,
    remaining_amount: 170.0,
    payment_status: 'PARTIAL',
    history: [
      { id: 'h1', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'OPEN', note: 'OS Aberta.', user_name: 'Carlos Mendes' },
      { id: 'h2', date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'WAITING_PARTS', note: 'Peça encomendada com o fornecedor King Baterias.', user_name: 'Lucas Rocha' },
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'os_1004',
    order_number: 1004,
    entry_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    client_id: 'cli_1',
    client_name: 'Ana Carolina Meireles',
    client_phone: '(11) 98765-4321',
    brand_id: 'b_apple',
    brand_name: 'Apple',
    model_id: 'm_ip11',
    model_name: 'iPhone 11',
    reported_defect: 'Troca de tela e aplicação de película 3D.',
    technical_diagnosis: 'Serviço concluído com sucesso. Testes de touch, Face ID e brilho 100% aprovados.',
    status: 'WAITING_PICKUP', // Aguardando retirada!
    is_motherboard_analysis: false,
    priority: 'NORMAL',
    technician_id: 'usr_tech_1',
    technician_name: 'Lucas Rocha (Técnico Master)',
    services: [
      { service_id: 'srv_1', service_name: 'Troca de Tela / Módulo Frontal', price: 150.0, quantity: 1 },
    ],
    parts: [
      { product_id: 'prod_2', product_name: 'Tela Display iPhone 11 Incell Premium', price: 290.0, cost_price: 110.0, quantity: 1 },
      { product_id: 'prod_8', product_name: 'Película 3D Cerâmica Fosca Anti-Reflexo', price: 35.0, cost_price: 4.5, quantity: 1 },
    ],
    total_services: 150.0,
    total_parts: 325.0,
    discount: 25.0,
    addition: 0,
    total_amount: 450.0,
    deposit_amount: 200.0,
    remaining_amount: 250.0,
    payment_status: 'PARTIAL',
    history: [
      { id: 'h1', date: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'OPEN', note: 'OS Aberta.', user_name: 'Mariana Silva' },
      { id: 'h2', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'FINISHED_READY', note: 'Aparelho montado e testado. Pronto.', user_name: 'Lucas Rocha' },
      { id: 'h3', date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'WAITING_PICKUP', note: 'Mensagem enviada no WhatsApp avisando que está pronto para retirada.', user_name: 'Mariana Silva' },
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

let nextSaleNumber = 502;
const sales: Sale[] = [
  {
    id: 'sale_501',
    sale_number: 501,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    client_id: 'cli_1',
    client_name: 'Ana Carolina Meireles',
    seller_id: 'usr_seller_1',
    seller_name: 'Mariana Silva (Vendedora)',
    items: [
      { product_id: 'prod_6', product_name: 'Carregador Turbo 20W USB-C Dual Cell Pro', sku: 'CHG-20W-USBC', unit_price: 79.9, cost_price: 18.0, quantity: 1, total: 79.9 },
      { product_id: 'prod_7', product_name: 'Cabo USB-C para Lightning Reforçado 1.2m', sku: 'CAB-LGT-USBC', unit_price: 49.9, cost_price: 12.0, quantity: 1, total: 49.9 },
      { product_id: 'prod_8', product_name: 'Película 3D Cerâmica Fosca Anti-Reflexo', sku: 'PEL-3D-CERAMIC', unit_price: 35.0, cost_price: 4.5, quantity: 1, total: 35.0 },
    ],
    subtotal: 164.8,
    discount: 14.8,
    total: 150.0,
    payment_method: 'PIX',
    commission_percentage: 4.0,
    commission_amount: 6.0,
    notes: 'Venda de balcão no PDV.',
  },
];

let currentCashRegister: CashRegister = {
  id: 'cash_001',
  status: 'OPEN',
  initial_amount: 200.0,
  current_balance: 650.0,
  opened_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
  opened_by: 'Mariana Silva (Vendedora)',
  movements: [
    {
      id: 'mov_1',
      type: 'SUPPLY',
      amount: 200.0,
      description: 'Abertura de Caixa (Fundo de Troco)',
      date: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      user_name: 'Mariana Silva',
    },
    {
      id: 'mov_2',
      type: 'SALE',
      amount: 150.0,
      description: 'Venda PDV #501 (PIX/Dinheiro)',
      date: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      user_name: 'Mariana Silva',
    },
    {
      id: 'mov_3',
      type: 'OS_PAYMENT',
      amount: 300.0,
      description: 'Sinal Ordem de Serviço #1001',
      date: new Date(new Date().setHours(11, 45, 0, 0)).toISOString(),
      user_name: 'Mariana Silva',
    },
  ],
};

const financialAccounts: FinancialAccount[] = [
  // A Pagar
  {
    id: 'fin_p1',
    type: 'PAYABLE',
    description: 'Fatura Fornecedor Telas Express (NF 8892)',
    category: 'FORNECEDOR',
    amount: 1850.0,
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    entity_name: 'Mega Peças Telas & Displays SP',
  },
  {
    id: 'fin_p2',
    type: 'PAYABLE',
    description: 'Aluguel do Ponto Comercial & Condomínio',
    category: 'INFRAESTRUTURA',
    amount: 3200.0,
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    entity_name: 'Imobiliária Central',
  },
  {
    id: 'fin_p3',
    type: 'PAYABLE',
    description: 'Energia Elétrica / Internet Fibra',
    category: 'UTILIDADES',
    amount: 420.0,
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    payment_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    status: 'PAID',
    entity_name: 'Enel SP & Vivo Empresas',
  },
  // A Receber
  {
    id: 'fin_r1',
    type: 'RECEIVABLE',
    description: 'Restante OS #1001 (iPhone 13 - Ana Carolina)',
    category: 'ORDEM_SERVICO',
    amount: 500.0,
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    entity_name: 'Ana Carolina Meireles',
  },
  {
    id: 'fin_r2',
    type: 'RECEIVABLE',
    description: 'Restante OS #1004 (iPhone 11 - Ana Carolina)',
    category: 'ORDEM_SERVICO',
    amount: 250.0,
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    entity_name: 'Ana Carolina Meireles',
  },
  {
    id: 'fin_r3',
    type: 'RECEIVABLE',
    description: 'Manutenção Lote Corporativo 5 aparelhos',
    category: 'EMPRESAS',
    amount: 2200.0,
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'PENDING',
    entity_name: 'Logística SP Ltda',
  },
];

// --- Role & Permissions Helper Middleware ---
function getClientRole(req: Request): UserRole {
  const headerRole = req.headers['x-user-role'] as string;
  if (headerRole === 'ADMIN' || headerRole === 'SELLER' || headerRole === 'TECHNICIAN' || headerRole === 'CASHIER') {
    return headerRole;
  }
  return 'ADMIN'; // Default fallback
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = getClientRole(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acesso Negado. Este recurso é restrito exclusivamente para Administradores (Preço de Custo, Fornecedores e Financeiro).',
      code: 'FORBIDDEN_NON_ADMIN',
    });
  }
  next();
}

function sanitizeProductsForRole(productsList: Product[], role: UserRole) {
  if (role === 'ADMIN') return productsList;
  return productsList.map((p) => {
    const { cost_price, supplier_id, supplier_name, ...safeProduct } = p;
    return safeProduct;
  });
}

function sanitizeProductForRole(product: Product, role: UserRole) {
  if (role === 'ADMIN') return product;
  const { cost_price, supplier_id, supplier_name, ...safeProduct } = product;
  return safeProduct;
}

function sanitizeServiceOrderForRole(os: ServiceOrder, role: UserRole) {
  if (role === 'ADMIN') return os;
  const safeParts = (os.parts || []).map((part) => {
    const { cost_price, ...safePart } = part;
    return safePart;
  });
  return {
    ...os,
    parts: safeParts,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      system: 'DUAL SYSTEM CELL',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Authentication & Users
  app.get('/api/users', (_req, res) => {
    res.json({ users });
  });

  app.get('/api/auth/me', (req, res) => {
    const role = getClientRole(req);
    const user = users.find((u) => u.role === role) || users[0];
    res.json({ user, currentRole: role });
  });

  // 2. Brands & Models
  app.get('/api/brands', (_req, res) => {
    res.json({ brands });
  });

  app.post('/api/brands', (req, res) => {
    const { name, icon } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
    const newBrand: Brand = {
      id: `b_${Date.now()}`,
      name: name.trim(),
      icon: icon || 'smartphone',
    };
    brands.push(newBrand);
    res.status(201).json({ brand: newBrand });
  });

  app.put('/api/brands/:id', (req, res) => {
    const brand = brands.find((b) => b.id === req.params.id);
    if (!brand) return res.status(404).json({ error: 'Marca não encontrada.' });
    const { name, icon } = req.body;
    if (name) brand.name = name.trim();
    if (icon) brand.icon = icon;
    res.json({ brand });
  });

  app.delete('/api/brands/:id', (req, res) => {
    const idx = brands.findIndex((b) => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Marca não encontrada.' });
    brands.splice(idx, 1);
    res.json({ success: true });
  });

  // Models (and alias phone-models)
  const handleGetModels = (req: Request, res: Response) => {
    const { brand_id } = req.query;
    let result = models;
    if (brand_id) {
      result = result.filter((m) => m.brand_id === brand_id);
    }
    res.json({ models: result, phoneModels: result });
  };

  app.get('/api/models', handleGetModels);
  app.get('/api/phone-models', handleGetModels);

  app.post('/api/models', (req, res) => {
    const { brand_id, name, type } = req.body;
    if (!brand_id || !name?.trim()) {
      return res.status(400).json({ error: 'Marca e nome do modelo são obrigatórios.' });
    }
    const brand = brands.find((b) => b.id === brand_id);
    const newModel: DeviceModel = {
      id: `m_${Date.now()}`,
      brand_id,
      brand_name: brand ? brand.name : 'Marca',
      name: name.trim(),
      type: type || 'SMARTPHONE',
    };
    models.push(newModel);
    res.status(201).json({ model: newModel });
  });

  app.put('/api/models/:id', (req, res) => {
    const model = models.find((m) => m.id === req.params.id);
    if (!model) return res.status(404).json({ error: 'Modelo não encontrado.' });
    const { brand_id, name, type } = req.body;
    if (brand_id) {
      model.brand_id = brand_id;
      const b = brands.find((brand) => brand.id === brand_id);
      if (b) model.brand_name = b.name;
    }
    if (name) model.name = name.trim();
    if (type) model.type = type;
    res.json({ model });
  });

  app.delete('/api/models/:id', (req, res) => {
    const idx = models.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Modelo não encontrado.' });
    models.splice(idx, 1);
    res.json({ success: true });
  });

  // 3. Clients
  app.get('/api/clients', (req, res) => {
    const { search } = req.query;
    let list = clients;
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.document && c.document.includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    res.json({ clients: list });
  });

  app.post('/api/clients', (req, res) => {
    const { name, phone, email, document, address, city, notes } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Nome e Telefone são obrigatórios.' });
    }
    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      document: document?.trim(),
      address: address?.trim(),
      city: city?.trim(),
      notes: notes?.trim(),
      created_at: new Date().toISOString(),
    };
    clients.unshift(newClient);
    res.status(201).json({ client: newClient });
  });

  app.put('/api/clients/:id', (req, res) => {
    const client = clients.find((c) => c.id === req.params.id);
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
    const { name, phone, email, document, address, city, notes } = req.body;
    if (name) client.name = name.trim();
    if (phone) client.phone = phone.trim();
    if (email !== undefined) client.email = email?.trim();
    if (document !== undefined) client.document = document?.trim();
    if (address !== undefined) client.address = address?.trim();
    if (city !== undefined) client.city = city?.trim();
    if (notes !== undefined) client.notes = notes?.trim();
    res.json({ client });
  });

  app.delete('/api/clients/:id', (req, res) => {
    const idx = clients.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Cliente não encontrado.' });
    clients.splice(idx, 1);
    res.json({ success: true });
  });

  // 4. Services
  app.get('/api/services', (_req, res) => {
    res.json({ services });
  });

  app.post('/api/services', (req, res) => {
    const { name, default_price, category, description, warranty_days } = req.body;
    if (!name?.trim() || default_price === undefined) {
      return res.status(400).json({ error: 'Nome e Valor padrão são obrigatórios.' });
    }
    const newService: Service = {
      id: `srv_${Date.now()}`,
      name: name.trim(),
      default_price: Number(default_price) || 0,
      category: category?.trim() || 'GERAL',
      description: description?.trim(),
      warranty_days: Number(warranty_days) || 90,
    };
    services.push(newService);
    res.status(201).json({ service: newService });
  });

  app.put('/api/services/:id', (req, res) => {
    const srv = services.find((s) => s.id === req.params.id);
    if (!srv) return res.status(404).json({ error: 'Serviço não encontrado.' });
    const { name, default_price, category, description, warranty_days } = req.body;
    if (name) srv.name = name.trim();
    if (default_price !== undefined) srv.default_price = Number(default_price);
    if (category) srv.category = category.trim();
    if (description !== undefined) srv.description = description?.trim();
    if (warranty_days !== undefined) srv.warranty_days = Number(warranty_days);
    res.json({ service: srv });
  });

  app.delete('/api/services/:id', (req, res) => {
    const idx = services.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Serviço não encontrado.' });
    services.splice(idx, 1);
    res.json({ success: true });
  });

  // 5. Suppliers (ADMIN ONLY)
  app.get('/api/suppliers', requireAdmin, (_req, res) => {
    res.json({ suppliers });
  });

  app.post('/api/suppliers', requireAdmin, (req, res) => {
    const { name, trade_name, document, phone, email, contact_person, notes } = req.body;
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'Razão social/Nome e Telefone são obrigatórios.' });
    }
    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      name: name.trim(),
      trade_name: trade_name?.trim(),
      document: document?.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      contact_person: contact_person?.trim(),
      notes: notes?.trim(),
    };
    suppliers.push(newSupplier);
    res.status(201).json({ supplier: newSupplier });
  });

  app.put('/api/suppliers/:id', requireAdmin, (req, res) => {
    const sup = suppliers.find((s) => s.id === req.params.id);
    if (!sup) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    const { name, trade_name, document, phone, email, contact_person, notes } = req.body;
    if (name) sup.name = name.trim();
    if (trade_name !== undefined) sup.trade_name = trade_name?.trim();
    if (document !== undefined) sup.document = document?.trim();
    if (phone) sup.phone = phone.trim();
    if (email !== undefined) sup.email = email?.trim();
    if (contact_person !== undefined) sup.contact_person = contact_person?.trim();
    if (notes !== undefined) sup.notes = notes?.trim();
    res.json({ supplier: sup });
  });

  app.delete('/api/suppliers/:id', requireAdmin, (req, res) => {
    const idx = suppliers.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
    suppliers.splice(idx, 1);
    res.json({ success: true });
  });

  // 6. Products (With Cost Protection for Non-Admins)
  app.get('/api/products', (req, res) => {
    const role = getClientRole(req);
    const { category, search } = req.query;
    let list = products;
    if (category && category !== 'ALL') {
      list = list.filter((p) => p.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      );
    }
    const safeList = sanitizeProductsForRole(list, role);
    res.json({ products: safeList });
  });

  app.post('/api/products', (req, res) => {
    const role = getClientRole(req);
    const {
      name,
      sku,
      barcode,
      brand_id,
      model_id,
      category,
      cost_price,
      selling_price,
      stock_quantity,
      min_stock,
      supplier_id,
      unit,
    } = req.body;

    if (!name?.trim() || selling_price === undefined) {
      return res.status(400).json({ error: 'Nome do produto e Preço de Venda são obrigatórios.' });
    }

    const supplier = suppliers.find((s) => s.id === supplier_id);

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      sku: sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: barcode?.trim() || '',
      brand_id: brand_id || undefined,
      model_id: model_id || undefined,
      category: category || 'ACESSÓRIO',
      cost_price: Number(cost_price) || 0,
      selling_price: Number(selling_price) || 0,
      stock_quantity: Number(stock_quantity) || 0,
      min_stock: Number(min_stock) || 2,
      supplier_id: supplier_id || undefined,
      supplier_name: supplier ? supplier.name : undefined,
      unit: unit || 'UN',
    };

    products.push(newProduct);
    const safe = sanitizeProductForRole(newProduct, role);
    res.status(201).json({ product: safe });
  });

  app.put('/api/products/:id', (req, res) => {
    const role = getClientRole(req);
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

    const {
      name,
      sku,
      barcode,
      brand_id,
      model_id,
      category,
      cost_price,
      selling_price,
      stock_quantity,
      min_stock,
      supplier_id,
      unit,
    } = req.body;

    if (name) product.name = name.trim();
    if (sku) product.sku = sku.trim();
    if (barcode !== undefined) product.barcode = barcode?.trim();
    if (brand_id !== undefined) product.brand_id = brand_id;
    if (model_id !== undefined) product.model_id = model_id;
    if (category) product.category = category;
    if (role === 'ADMIN' && cost_price !== undefined) product.cost_price = Number(cost_price);
    if (selling_price !== undefined) product.selling_price = Number(selling_price);
    if (stock_quantity !== undefined) product.stock_quantity = Number(stock_quantity);
    if (min_stock !== undefined) product.min_stock = Number(min_stock);
    if (supplier_id !== undefined) {
      product.supplier_id = supplier_id;
      const sup = suppliers.find((s) => s.id === supplier_id);
      product.supplier_name = sup ? sup.name : undefined;
    }
    if (unit) product.unit = unit;

    const safe = sanitizeProductForRole(product, role);
    res.json({ product: safe });
  });

  app.delete('/api/products/:id', (req, res) => {
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Produto não encontrado.' });
    products.splice(idx, 1);
    res.json({ success: true });
  });

  // 7. Service Orders (OS)
  app.get('/api/service-orders', (req, res) => {
    const role = getClientRole(req);
    const { status, search, priority, is_motherboard_analysis } = req.query;

    let list = serviceOrders;

    if (status && status !== 'ALL') {
      list = list.filter((os) => os.status === status);
    }
    if (priority && priority !== 'ALL') {
      list = list.filter((os) => os.priority === priority);
    }
    if (is_motherboard_analysis === 'true') {
      list = list.filter((os) => os.is_motherboard_analysis);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (os) =>
          os.order_number.toString().includes(q) ||
          os.client_name.toLowerCase().includes(q) ||
          os.client_phone.includes(q) ||
          os.model_name.toLowerCase().includes(q) ||
          os.brand_name.toLowerCase().includes(q) ||
          (os.imei_1 && os.imei_1.includes(q)) ||
          os.reported_defect.toLowerCase().includes(q)
      );
    }

    // Sort chronologically (FIFO - 1º cadastrado / mais antigo primeiro, ex: 10/08 antes de 11/08)
    list.sort((a, b) => {
      const timeA = new Date(a.created_at || a.entry_date || 0).getTime();
      const timeB = new Date(b.created_at || b.entry_date || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.order_number || 0) - (b.order_number || 0);
    });

    const safeList = list.map((os) => sanitizeServiceOrderForRole(os, role));

    // Calculate status counts
    const statusCounts = {
      all: serviceOrders.length,
      open: serviceOrders.filter((os) => os.status === 'OPEN').length,
      analysis_board: serviceOrders.filter((os) => os.status === 'ANALYSIS_BOARD').length,
      waiting_parts: serviceOrders.filter((os) => os.status === 'WAITING_PARTS').length,
      in_progress: serviceOrders.filter((os) => os.status === 'IN_PROGRESS').length,
      finished_ready: serviceOrders.filter((os) => os.status === 'FINISHED_READY').length,
      waiting_pickup: serviceOrders.filter((os) => os.status === 'WAITING_PICKUP').length,
      cancelled: serviceOrders.filter((os) => os.status === 'CANCELLED').length,
    };

    res.json({ serviceOrders: safeList, orders: safeList, statusCounts });
  });

  app.get('/api/service-orders/next-number', (_req, res) => {
    res.json({ next_number: nextOrderNumber, nextNumber: nextOrderNumber });
  });

  app.get('/api/service-orders/:id', (req, res) => {
    const role = getClientRole(req);
    const os = serviceOrders.find((o) => o.id === req.params.id);
    if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    const safeOS = sanitizeServiceOrderForRole(os, role);
    res.json({ serviceOrder: safeOS, order: safeOS });
  });

  app.post('/api/service-orders', (req, res) => {
    const role = getClientRole(req);
    const body = req.body || {};
    let {
      client_id,
      client_name,
      client_phone,
      client_document,
      brand_id,
      brand_name,
      model_id,
      model_name,
      imei_1,
      imei_2,
      device_password,
      physical_state,
      accessories,
      reported_defect,
      technical_diagnosis,
      status,
      is_motherboard_analysis,
      priority,
      technician_id,
      seller_id,
      services: osServices,
      services_items,
      parts: osParts,
      parts_items,
      discount,
      discount_amount,
      addition,
      surcharge_amount,
      deposit_amount,
      payment_method,
      delivery_expected_date,
      delivery_forecast,
    } = body;

    // Harmonize Client
    let client = clients.find((c) => c.id === client_id);
    if (!client && client_name?.trim()) {
      client = clients.find((c) => c.name.toLowerCase() === client_name.trim().toLowerCase());
      if (!client) {
        client = {
          id: `cli_${Date.now()}`,
          name: client_name.trim(),
          phone: client_phone?.trim() || '(11) 99999-9999',
          document: client_document?.trim(),
          city: 'São Paulo',
          created_at: new Date().toISOString(),
        };
        clients.unshift(client);
      }
      client_id = client.id;
    } else if (!client && clients.length > 0) {
      client = clients[0];
      client_id = client.id;
    }

    // Harmonize Brand
    let brand = brands.find((b) => b.id === brand_id);
    if (!brand && brand_name?.trim()) {
      brand = brands.find((b) => b.name.toLowerCase() === brand_name.trim().toLowerCase());
    }
    if (!brand && brands.length > 0) {
      brand = brands[0];
      brand_id = brand.id;
    }

    // Harmonize Model
    let model = models.find((m) => m.id === model_id);
    if (!model && model_name?.trim()) {
      model = models.find((m) => m.name.toLowerCase() === model_name.trim().toLowerCase());
    }
    if (!model) {
      const brandModels = brand ? models.filter((m) => m.brand_id === brand.id) : models;
      if (brandModels.length > 0) {
        model = brandModels[0];
        model_id = model.id;
      } else if (models.length > 0) {
        model = models[0];
        model_id = model.id;
      }
    }

    const defect = reported_defect?.trim() || 'Verificação e reparo técnico geral';

    const technician = users.find((u) => u.id === technician_id);
    const seller = users.find((u) => u.id === seller_id);

    const rawServices = osServices || services_items || [];
    const finalServices: ServiceOrderItemService[] = rawServices.map((s: any) => ({
      service_id: s.service_id || s.id || `srv_${Date.now()}`,
      service_name: s.service_name || s.name || 'Serviço de Bancada',
      price: Number(s.price !== undefined ? s.price : s.unit_price) || 0,
      quantity: Number(s.quantity) || 1,
    }));

    const rawParts = osParts || parts_items || [];
    const finalParts: ServiceOrderItemPart[] = rawParts.map((p: any) => {
      const dbProd = products.find((prod) => prod.id === (p.product_id || p.id));
      if (dbProd && dbProd.stock_quantity >= (p.quantity || 1)) {
        dbProd.stock_quantity -= p.quantity || 1;
      }
      return {
        product_id: p.product_id || p.id || `prt_${Date.now()}`,
        product_name: p.product_name || p.name || (dbProd ? dbProd.name : 'Peça'),
        price: Number(p.price !== undefined ? p.price : p.unit_price) || 0,
        cost_price: dbProd ? dbProd.cost_price : 0,
        quantity: Number(p.quantity) || 1,
      };
    });

    const totalServices = finalServices.reduce((acc, s) => acc + s.price * s.quantity, 0);
    const totalParts = finalParts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const numDiscount = Number(discount !== undefined ? discount : discount_amount) || 0;
    const numAddition = Number(addition !== undefined ? addition : surcharge_amount) || 0;
    const totalAmount = Math.max(0, totalServices + totalParts - numDiscount + numAddition);
    const numDeposit = Number(deposit_amount) || 0;
    const remainingAmount = Math.max(0, totalAmount - numDeposit);

    let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (numDeposit >= totalAmount && totalAmount > 0) paymentStatus = 'PAID';
    else if (numDeposit > 0) paymentStatus = 'PARTIAL';

    const orderNum = nextOrderNumber++;
    const now = new Date().toISOString();

    const initialStatus: ServiceOrderStatus = status || (is_motherboard_analysis ? 'ANALYSIS_BOARD' : 'OPEN');

    const newOS: ServiceOrder = {
      id: `os_${orderNum}`,
      order_number: orderNum,
      entry_date: now,
      delivery_expected_date: delivery_expected_date || delivery_forecast || undefined,
      client_id: client?.id || client_id || 'cli_default',
      client_name: client?.name || client_name || 'Cliente',
      client_phone: client?.phone || client_phone || '',
      client_document: client?.document || client_document || undefined,
      brand_id: brand?.id || brand_id || 'brand_default',
      brand_name: brand?.name || brand_name || 'Smartphone',
      model_id: model?.id || model_id || 'model_default',
      model_name: model?.name || model_name || 'Celular / Dispositivo',
      imei_1: imei_1?.trim(),
      imei_2: imei_2?.trim(),
      device_password: device_password?.trim(),
      physical_state: physical_state?.trim(),
      accessories: accessories?.trim(),
      reported_defect: defect,
      technical_diagnosis: technical_diagnosis?.trim(),
      status: initialStatus,
      is_motherboard_analysis: Boolean(is_motherboard_analysis || initialStatus === 'ANALYSIS_BOARD'),
      priority: priority || 'NORMAL',
      technician_id: technician_id || undefined,
      technician_name: technician ? technician.name : undefined,
      seller_id: seller_id || undefined,
      seller_name: seller ? seller.name : undefined,
      services: finalServices,
      parts: finalParts,
      total_services: totalServices,
      total_parts: totalParts,
      discount: numDiscount,
      addition: numAddition,
      total_amount: totalAmount,
      deposit_amount: numDeposit,
      remaining_amount: remainingAmount,
      payment_method: payment_method || (numDeposit > 0 ? 'DINHEIRO' : undefined),
      payment_status: paymentStatus,
      history: [
        {
          id: `h_${Date.now()}`,
          date: now,
          status: initialStatus,
          note: numDeposit > 0 ? `OS Criada com entrada/sinal de R$ ${numDeposit.toFixed(2)}.` : 'OS Criada.',
          user_name: role === 'ADMIN' ? 'Carlos Mendes (Admin)' : 'Mariana Silva (Vendedora)',
        },
      ],
      created_at: now,
      updated_at: now,
    };

    // If deposit was paid, register cash movement
    if (numDeposit > 0) {
      currentCashRegister.current_balance += numDeposit;
      currentCashRegister.movements.unshift({
        id: `mov_${Date.now()}`,
        type: 'OS_PAYMENT',
        amount: numDeposit,
        description: `Sinal OS #${orderNum} - ${newOS.model_name} (${newOS.client_name})`,
        date: now,
        user_name: role === 'ADMIN' ? 'Carlos Mendes' : 'Mariana Silva',
      });
    }

    serviceOrders.unshift(newOS);
    const safeNewOS = sanitizeServiceOrderForRole(newOS, role);
    res.status(201).json({ serviceOrder: safeNewOS, order: safeNewOS });
  });

  app.put('/api/service-orders/:id', (req, res) => {
    const role = getClientRole(req);
    const os = serviceOrders.find((o) => o.id === req.params.id);
    if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });

    const {
      brand_id,
      model_id,
      imei_1,
      imei_2,
      device_password,
      physical_state,
      accessories,
      reported_defect,
      technical_diagnosis,
      status,
      is_motherboard_analysis,
      priority,
      technician_id,
      seller_id,
      services: osServices,
      parts: osParts,
      discount,
      addition,
      delivery_expected_date,
    } = req.body;

    if (brand_id) {
      os.brand_id = brand_id;
      const b = brands.find((brand) => brand.id === brand_id);
      if (b) os.brand_name = b.name;
    }
    if (model_id) {
      os.model_id = model_id;
      const m = models.find((mod) => mod.id === model_id);
      if (m) os.model_name = m.name;
    }
    if (imei_1 !== undefined) os.imei_1 = imei_1;
    if (imei_2 !== undefined) os.imei_2 = imei_2;
    if (device_password !== undefined) os.device_password = device_password;
    if (physical_state !== undefined) os.physical_state = physical_state;
    if (accessories !== undefined) os.accessories = accessories;
    if (reported_defect) os.reported_defect = reported_defect;
    if (technical_diagnosis !== undefined) os.technical_diagnosis = technical_diagnosis;
    if (is_motherboard_analysis !== undefined) os.is_motherboard_analysis = is_motherboard_analysis;
    if (priority) os.priority = priority;
    if (delivery_expected_date !== undefined) os.delivery_expected_date = delivery_expected_date;

    if (technician_id !== undefined) {
      os.technician_id = technician_id;
      const t = users.find((u) => u.id === technician_id);
      os.technician_name = t ? t.name : undefined;
    }
    if (seller_id !== undefined) {
      os.seller_id = seller_id;
      const s = users.find((u) => u.id === seller_id);
      os.seller_name = s ? s.name : undefined;
    }

    if (osServices) {
      os.services = osServices.map((s: any) => ({
        service_id: s.service_id,
        service_name: s.service_name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1,
      }));
      os.total_services = os.services.reduce((acc, s) => acc + s.price * s.quantity, 0);
    }

    if (osParts) {
      os.parts = osParts.map((p: any) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        price: Number(p.price) || 0,
        cost_price: p.cost_price || 0,
        quantity: Number(p.quantity) || 1,
      }));
      os.total_parts = os.parts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    }

    if (discount !== undefined) os.discount = Number(discount);
    if (addition !== undefined) os.addition = Number(addition);

    os.total_amount = Math.max(0, os.total_services + os.total_parts - os.discount + os.addition);
    os.remaining_amount = Math.max(0, os.total_amount - os.deposit_amount);

    if (os.deposit_amount >= os.total_amount && os.total_amount > 0) os.payment_status = 'PAID';
    else if (os.deposit_amount > 0) os.payment_status = 'PARTIAL';
    else os.payment_status = 'PENDING';

    if (status && status !== os.status) {
      const prevStatus = os.status;
      os.status = status;
      os.history.unshift({
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        status,
        note: `Status alterado de ${prevStatus} para ${status}.`,
        user_name: role === 'ADMIN' ? 'Carlos Mendes' : 'Lucas Rocha',
      });
    }

    os.updated_at = new Date().toISOString();
    const safeUpdatedOS = sanitizeServiceOrderForRole(os, role);
    res.json({ serviceOrder: safeUpdatedOS, order: safeUpdatedOS });
  });

  // Change Status Endpoint (Supports both PATCH and POST)
  const handleStatusUpdate = (req: Request, res: Response) => {
    const role = getClientRole(req);
    const os = serviceOrders.find((o) => o.id === req.params.id);
    if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });

    const { status, note, notes, technical_diagnosis, user_name } = req.body;
    if (!status) return res.status(400).json({ error: 'Novo status é obrigatório.' });

    const prevStatus = os.status;
    os.status = status;
    if (status === 'ANALYSIS_BOARD') {
      os.is_motherboard_analysis = true;
    }
    if (technical_diagnosis !== undefined) {
      os.technical_diagnosis = technical_diagnosis;
    }

    const noteText = note || notes || `Status alterado de ${prevStatus} para ${status}.`;
    const author = user_name || (role === 'ADMIN' ? 'Carlos Mendes' : role === 'TECHNICIAN' ? 'Lucas Rocha' : 'Mariana Silva');

    os.history.unshift({
      id: `h_${Date.now()}`,
      date: new Date().toISOString(),
      status,
      note: noteText,
      user_name: author,
    });

    os.updated_at = new Date().toISOString();
    const safeStatusOS = sanitizeServiceOrderForRole(os, role);
    res.json({ serviceOrder: safeStatusOS, order: safeStatusOS });
  };

  app.post('/api/service-orders/:id/status', handleStatusUpdate);
  app.patch('/api/service-orders/:id/status', handleStatusUpdate);

  // Record Payment for OS
  app.post('/api/service-orders/:id/payment', (req, res) => {
    const role = getClientRole(req);
    const os = serviceOrders.find((o) => o.id === req.params.id);
    if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });

    const { amount, payment_method, note } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valor de pagamento inválido.' });
    }

    os.deposit_amount += numAmount;
    os.remaining_amount = Math.max(0, os.total_amount - os.deposit_amount);

    if (os.deposit_amount >= os.total_amount) {
      os.payment_status = 'PAID';
    } else {
      os.payment_status = 'PARTIAL';
    }

    // Register in Cash Register
    currentCashRegister.current_balance += numAmount;
    currentCashRegister.movements.unshift({
      id: `mov_${Date.now()}`,
      type: 'OS_PAYMENT',
      amount: numAmount,
      description: `Pagamento OS #${os.order_number} (${payment_method || 'PIX'}) - ${os.client_name}`,
      date: new Date().toISOString(),
      user_name: role === 'ADMIN' ? 'Carlos Mendes' : 'Mariana Silva',
    });

    os.history.unshift({
      id: `h_${Date.now()}`,
      date: new Date().toISOString(),
      status: os.status,
      note: `Recebimento de R$ ${numAmount.toFixed(2)} (${payment_method || 'PIX'}). ${note || ''}`,
      user_name: role === 'ADMIN' ? 'Carlos Mendes' : 'Mariana Silva',
    });

    os.updated_at = new Date().toISOString();
    res.json({ serviceOrder: sanitizeServiceOrderForRole(os, role) });
  });

  // Cancel OS
  app.delete('/api/service-orders/:id', (req, res) => {
    const role = getClientRole(req);
    const os = serviceOrders.find((o) => o.id === req.params.id);
    if (!os) return res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });

    os.status = 'CANCELLED';
    os.history.unshift({
      id: `h_${Date.now()}`,
      date: new Date().toISOString(),
      status: 'CANCELLED',
      note: 'Ordem de Serviço Cancelada.',
      user_name: role === 'ADMIN' ? 'Carlos Mendes' : 'Mariana Silva',
    });
    os.updated_at = new Date().toISOString();
    res.json({ success: true, serviceOrder: sanitizeServiceOrderForRole(os, role) });
  });

  // 8. PDV / POS (Point of Sale) Endpoints
  app.get('/api/pos/sales', (req, res) => {
    const role = getClientRole(req);
    let list = sales;
    if (role !== 'ADMIN') {
      // Non-admin sees list but without cost_price in items
      list = sales.map((s) => ({
        ...s,
        items: s.items.map(({ cost_price, ...rest }) => rest),
      }));
    }
    res.json({ sales: list });
  });

  app.post('/api/pos/sales', (req, res) => {
    const role = getClientRole(req);
    const { client_id, seller_id, items, discount, payment_method, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'O carrinho está vazio. Adicione produtos para finalizar a venda.' });
    }

    const seller = users.find((u) => u.id === seller_id) || users[1]; // default seller
    const client = clients.find((c) => c.id === client_id);

    const saleItems: SaleItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        // Deduct inventory
        if (prod.stock_quantity >= item.quantity) {
          prod.stock_quantity -= item.quantity;
        }
        const itemSubtotal = prod.selling_price * item.quantity;
        subtotal += itemSubtotal;

        saleItems.push({
          product_id: prod.id,
          product_name: prod.name,
          sku: prod.sku,
          unit_price: prod.selling_price,
          cost_price: prod.cost_price,
          quantity: item.quantity,
          total: itemSubtotal,
        });
      }
    }

    const numDiscount = Number(discount) || 0;
    const total = Math.max(0, subtotal - numDiscount);

    // Calculate commission
    const commissionPercent = seller.commission_percentage || 4.0;
    const commissionAmount = Number(((total * commissionPercent) / 100).toFixed(2));

    // Ensure highest saleNum
    const existingMax = sales.reduce((max, s) => Math.max(max, s.sale_number || 0), 500);
    const saleNum = Math.max(nextSaleNumber, existingMax + 1);
    nextSaleNumber = saleNum + 1;
    const now = new Date().toISOString();

    const newSale: Sale = {
      id: `sale_${Date.now()}_${saleNum}`,
      sale_number: saleNum,
      date: now,
      client_id: client_id || undefined,
      client_name: client ? client.name : 'Cliente Balcão',
      seller_id: seller.id,
      seller_name: seller.name,
      items: saleItems,
      subtotal,
      discount: numDiscount,
      total,
      payment_method: payment_method || 'DINHEIRO',
      commission_percentage: commissionPercent,
      commission_amount: commissionAmount,
      notes: notes?.trim(),
    };

    sales.unshift(newSale);

    // Register in Cash Register
    currentCashRegister.current_balance += total;
    currentCashRegister.movements.unshift({
      id: `mov_${Date.now()}`,
      type: 'SALE',
      amount: total,
      description: `Venda PDV #${saleNum} (${newSale.payment_method}) - Vendedor: ${seller.name}`,
      date: now,
      user_name: seller.name,
    });

    res.status(201).json({ sale: newSale });
  });

  // 9. Cash Register & Movements (Sangria & Suprimento)
  app.get('/api/pos/cash-register', (_req, res) => {
    res.json({ cashRegister: currentCashRegister });
  });

  app.post('/api/pos/cash-register/bleed', (req, res) => {
    // Sangria (Retirada de Dinheiro)
    const { amount, reason } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valor da sangria deve ser maior que zero.' });
    }
    if (numAmount > currentCashRegister.current_balance) {
      return res.status(400).json({ error: 'Valor da sangria excede o saldo atual em caixa.' });
    }

    currentCashRegister.current_balance -= numAmount;
    const movement: CashMovement = {
      id: `mov_${Date.now()}`,
      type: 'BLEED',
      amount: numAmount,
      description: `Sangria: ${reason || 'Retirada para cofre/pagamentos'}`,
      date: new Date().toISOString(),
      user_name: 'Operador de Caixa',
    };
    currentCashRegister.movements.unshift(movement);

    res.json({ cashRegister: currentCashRegister, movement });
  });

  app.post('/api/pos/cash-register/supply', (req, res) => {
    // Suprimento (Aporte / Reforço de Caixa)
    const { amount, reason } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valor do suprimento deve ser maior que zero.' });
    }

    currentCashRegister.current_balance += numAmount;
    const movement: CashMovement = {
      id: `mov_${Date.now()}`,
      type: 'SUPPLY',
      amount: numAmount,
      description: `Suprimento: ${reason || 'Reforço de troco'}`,
      date: new Date().toISOString(),
      user_name: 'Operador de Caixa',
    };
    currentCashRegister.movements.unshift(movement);

    res.json({ cashRegister: currentCashRegister, movement });
  });

  // 10. Financial Management (ADMIN ONLY)
  const handleFinancialDashboard = (_req: Request, res: Response) => {
    // Totals calculations
    const totalOSRevenue = serviceOrders
      .filter((os) => os.status !== 'CANCELLED')
      .reduce((acc, os) => acc + os.total_amount, 0);

    const totalOSPaid = serviceOrders
      .filter((os) => os.status !== 'CANCELLED')
      .reduce((acc, os) => acc + os.deposit_amount, 0);

    const totalOSPending = serviceOrders
      .filter((os) => os.status !== 'CANCELLED')
      .reduce((acc, os) => acc + os.remaining_amount, 0);

    const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalCommissions = sales.reduce((acc, s) => acc + s.commission_amount, 0);

    // Calculate total cost of sold items in sales and parts used in OS
    let totalCostSales = 0;
    for (const sale of sales) {
      for (const item of sale.items) {
        totalCostSales += (item.cost_price || 0) * item.quantity;
      }
    }

    let totalCostOSParts = 0;
    for (const os of serviceOrders) {
      if (os.status !== 'CANCELLED') {
        for (const part of os.parts) {
          totalCostOSParts += (part.cost_price || 0) * part.quantity;
        }
      }
    }

    const grossRevenue = totalOSRevenue + totalSalesRevenue;
    const totalCostOfGoods = totalCostSales + totalCostOSParts;
    const estimatedGrossProfit = grossRevenue - totalCostOfGoods;

    // Inventory value at cost vs at selling
    const inventoryCostValue = products.reduce((acc, p) => acc + p.cost_price * p.stock_quantity, 0);
    const inventorySalesValue = products.reduce((acc, p) => acc + p.selling_price * p.stock_quantity, 0);

    // Accounts Payable & Receivable
    const totalPayablePending = financialAccounts
      .filter((a) => a.type === 'PAYABLE' && a.status === 'PENDING')
      .reduce((acc, a) => acc + a.amount, 0);

    const totalReceivablePending = financialAccounts
      .filter((a) => a.type === 'RECEIVABLE' && a.status === 'PENDING')
      .reduce((acc, a) => acc + a.amount, 0);

    // Commissions per seller
    const commissionBySeller: Record<string, { name: string; salesCount: number; salesTotal: number; commissionTotal: number }> = {};
    for (const sale of sales) {
      if (!commissionBySeller[sale.seller_id]) {
        commissionBySeller[sale.seller_id] = {
          name: sale.seller_name,
          salesCount: 0,
          salesTotal: 0,
          commissionTotal: 0,
        };
      }
      commissionBySeller[sale.seller_id].salesCount += 1;
      commissionBySeller[sale.seller_id].salesTotal += sale.total;
      commissionBySeller[sale.seller_id].commissionTotal += sale.commission_amount;
    }

    res.json({
      summary: {
        grossRevenue,
        estimatedGrossProfit,
        totalCostOfGoods,
        totalOSRevenue,
        totalOSPaid,
        totalOSPending,
        totalSalesRevenue,
        totalCommissions,
        cashBalance: currentCashRegister.current_balance,
        inventoryCostValue,
        inventorySalesValue,
        totalPayablePending,
        totalReceivablePending,
      },
      sellerCommissions: Object.values(commissionBySeller),
      accounts: financialAccounts,
    });
  };

  app.get('/api/financial/dashboard', requireAdmin, handleFinancialDashboard);
  app.get('/api/financial/summary', requireAdmin, handleFinancialDashboard);

  app.get('/api/financial/accounts', requireAdmin, (_req, res) => {
    res.json({ accounts: financialAccounts });
  });

  app.post('/api/financial/accounts', requireAdmin, (req, res) => {
    const { type, description, category, amount, due_date, entity_name, notes } = req.body;
    if (!description?.trim() || !amount || !due_date) {
      return res.status(400).json({ error: 'Descrição, Valor e Data de Vencimento são obrigatórios.' });
    }

    const newAccount: FinancialAccount = {
      id: `fin_${Date.now()}`,
      type: type || 'PAYABLE',
      description: description.trim(),
      category: category || 'OUTROS',
      amount: Number(amount),
      due_date,
      status: 'PENDING',
      entity_name: entity_name?.trim() || 'Geral',
      notes: notes?.trim(),
    };

    financialAccounts.unshift(newAccount);
    res.status(201).json({ account: newAccount });
  });

  app.patch('/api/financial/accounts/:id/status', requireAdmin, (req, res) => {
    const acc = financialAccounts.find((a) => a.id === req.params.id);
    if (!acc) return res.status(404).json({ error: 'Conta não encontrada.' });

    const { status } = req.body;
    if (status === 'PAID') {
      acc.status = 'PAID';
      acc.payment_date = new Date().toISOString().split('T')[0];
    } else {
      acc.status = 'PENDING';
      acc.payment_date = undefined;
    }
    res.json({ account: acc });
  });

  app.put('/api/financial/accounts/:id/pay', requireAdmin, (req, res) => {
    const acc = financialAccounts.find((a) => a.id === req.params.id);
    if (!acc) return res.status(404).json({ error: 'Conta não encontrada.' });

    acc.status = 'PAID';
    acc.payment_date = new Date().toISOString().split('T')[0];
    res.json({ account: acc });
  });

  app.delete('/api/financial/accounts/:id', requireAdmin, (req, res) => {
    const idx = financialAccounts.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Conta não encontrada.' });
    financialAccounts.splice(idx, 1);
    res.json({ success: true });
  });

  // --- Settings & Store Profile Routes ---
  app.get('/api/settings', (_req, res) => {
    res.json({ settings: storeSettings });
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    const body = req.body || {};
    storeSettings = {
      ...storeSettings,
      ...body,
      // Sanitizations
      store_name: body.store_name?.trim() || storeSettings.store_name,
      store_subtitle: body.store_subtitle?.trim() ?? storeSettings.store_subtitle,
      logo_url: body.logo_url ?? storeSettings.logo_url,
      cnpj_cpf: body.cnpj_cpf?.trim() ?? storeSettings.cnpj_cpf,
      phone: body.phone?.trim() ?? storeSettings.phone,
      whatsapp: body.whatsapp?.trim() ?? storeSettings.whatsapp,
      email: body.email?.trim() ?? storeSettings.email,
      address_street: body.address_street?.trim() ?? storeSettings.address_street,
      address_number: body.address_number?.trim() ?? storeSettings.address_number,
      address_neighborhood: body.address_neighborhood?.trim() ?? storeSettings.address_neighborhood,
      address_city: body.address_city?.trim() ?? storeSettings.address_city,
      address_state: body.address_state?.trim() ?? storeSettings.address_state,
      address_zip: body.address_zip?.trim() ?? storeSettings.address_zip,
      receipt_footer_msg: body.receipt_footer_msg?.trim() ?? storeSettings.receipt_footer_msg,
      warranty_terms: body.warranty_terms?.trim() ?? storeSettings.warranty_terms,
      default_commission_pct: Number(body.default_commission_pct) || storeSettings.default_commission_pct,
      auto_print_receipt: typeof body.auto_print_receipt === 'boolean' ? body.auto_print_receipt : storeSettings.auto_print_receipt,
      paper_size: body.paper_size || storeSettings.paper_size,
    };
    res.json({ settings: storeSettings, message: 'Configurações da loja atualizadas com sucesso.' });
  });

  // --- User Account Profile Update ---
  app.patch('/api/users/:id/profile', (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const { name, email, avatar, commission_percentage } = req.body;
    if (name) user.name = name.trim();
    if (email) user.email = email.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (commission_percentage !== undefined && req.headers['x-user-role'] === 'ADMIN') {
      user.commission_percentage = Number(commission_percentage);
    }

    res.json({ user, message: 'Perfil do usuário atualizado com sucesso.' });
  });

  // Strict API 404 handler - prevents HTML index.html fallback for broken /api/ requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
      code: 'API_ENDPOINT_NOT_FOUND',
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DUAL CELL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
