-- ==============================================================================
-- DUAL SYSTEM - Gestão de Assistência Técnica de Celulares e Eletrônicos
-- Estrutura Completa e Atualizada do Banco de Dados PostgreSQL (Supabase)
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Perfis de Acesso (Roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'ADMIN', 'SELLER', 'TECHNICIAN', 'CASHIER'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

INSERT INTO public.roles (name, description) VALUES
    ('ADMIN', 'Acesso administrativo irrestrito a todos os módulos, financeiro, custos, fornecedores e configurações'),
    ('SELLER', 'Acesso operacional a clientes, vendas, ordens de serviço, PDV e comissões próprias. Sem acesso a custos e fornecedores'),
    ('TECHNICIAN', 'Acesso a ordens de serviço, diagnósticos técnicos, apontamentos de peças e serviços'),
    ('CASHIER', 'Acesso a frente de caixa, PDV, recebimentos de OS e abertura/fechamento de turno')
ON CONFLICT (name) DO NOTHING;

-- 3. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    commission_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Tabela de Clientes (Clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(30), -- CPF / CNPJ
    phone VARCHAR(30) NOT NULL,
    secondary_phone VARCHAR(30), -- WhatsApp / Secundário
    email VARCHAR(255),
    address VARCHAR(255),
    number VARCHAR(30),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(10),
    zip_code VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Tabela de Marcas (Brands)
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Tabela de Modelos de Celulares / Aparelhos (Phone Models)
CREATE TABLE IF NOT EXISTS public.phone_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(150) NOT NULL,
    model_number VARCHAR(100),
    device_type VARCHAR(50) DEFAULT 'SMARTPHONE' NOT NULL, -- 'SMARTPHONE', 'TABLET', 'SMARTWATCH', 'OTHER'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_brand_model_name UNIQUE (brand_id, name)
);

-- 7. Tabela de Categorias de Produtos (Product Categories)
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. Tabela de Fornecedores (Suppliers) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(30), -- CNPJ / CPF
    phone VARCHAR(30),
    email VARCHAR(255),
    contact_person VARCHAR(100),
    address VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. Tabela de Produtos / Peças (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    phone_model_id UUID REFERENCES public.phone_models(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category VARCHAR(50) DEFAULT 'PEÇA' NOT NULL, -- 'PEÇA', 'ACESSÓRIO', 'OUTROS'
    unit VARCHAR(20) DEFAULT 'UN' NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- RESTRITO A ADMIN
    sale_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    min_stock INTEGER DEFAULT 1 NOT NULL,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 10. Tabela de Serviços (Services)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    standard_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    category VARCHAR(100) DEFAULT 'MANUTENCAO' NOT NULL,
    warranty_days INTEGER DEFAULT 90 NOT NULL,
    estimated_minutes INTEGER DEFAULT 60 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 11. Tabela de Vendedores (Sellers)
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    commission_rate_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 12. Tabela de Ordens de Serviço (Service Orders)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number BIGSERIAL UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    phone_model_id UUID REFERENCES public.phone_models(id) ON DELETE SET NULL,
    device_name VARCHAR(150),
    imei VARCHAR(50),
    imei_2 VARCHAR(50),
    serial_number VARCHAR(100),
    device_password VARCHAR(100),
    device_color VARCHAR(50),
    device_condition_notes TEXT, -- Arranhões, tela trincada, etc
    accessories_left TEXT, -- Capinha, carregador, chip, etc
    reported_defect TEXT NOT NULL,
    technical_diagnosis TEXT,
    is_motherboard_analysis BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,
    -- Status esperados: 'OPEN', 'ANALYSIS_BOARD', 'WAITING_PARTS', 'IN_PROGRESS', 'FINISHED_READY', 'WAITING_PICKUP', 'DELIVERED', 'CANCELLED'
    priority VARCHAR(20) DEFAULT 'NORMAL' NOT NULL, -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    total_services NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_products NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    addition NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    deposit_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    remaining_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PARTIAL', 'PAID'
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entry_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    delivery_forecast TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    warranty_terms TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 13. Tabela de Itens da Ordem de Serviço (Service Order Items)
CREATE TABLE IF NOT EXISTS public.service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'SERVICE', 'PRODUCT'
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
    unit_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- RESTRITO
    total_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 14. Histórico de Mudança de Status da OS (Service Order History)
CREATE TABLE IF NOT EXISTS public.service_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 15. Tabela de Estoque Consolidado (Inventory)
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE NOT NULL,
    quantity_on_hand INTEGER DEFAULT 0 NOT NULL,
    quantity_reserved INTEGER DEFAULT 0 NOT NULL,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    shelf_location VARCHAR(100),
    last_updated TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 16. Tabela de Movimentações de Estoque (Inventory Movements)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    movement_type VARCHAR(30) NOT NULL, -- 'PURCHASE_IN', 'SALE_OUT', 'OS_USE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN_IN'
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(12, 2) DEFAULT 0.00, -- RESTRITO
    reference_id UUID, -- id da venda ou ordem de serviço ou nota fiscal
    reference_type VARCHAR(50), -- 'SALE', 'SERVICE_ORDER', 'STOCK_INWARD_INVOICE', 'MANUAL_ADJUSTMENT'
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 17. Tabela de Vendas / PDV (Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number BIGSERIAL UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'PIX' NOT NULL, -- 'DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'OUTROS'
    payment_status VARCHAR(30) DEFAULT 'COMPLETED' NOT NULL, -- 'PENDING', 'COMPLETED', 'CANCELLED'
    commission_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    commission_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 18. Tabela de Itens da Venda (Sale Items)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- RESTRITO
    total_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 19. Tabela de Comissões (Commissions)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    base_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    commission_percentage NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    calculated_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID', 'CANCELLED'
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 20. Tabela de Caixas / Turnos (Cash Registers)
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) DEFAULT 'Caixa Principal' NOT NULL,
    opened_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    initial_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    final_balance NUMERIC(12, 2),
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL, -- 'OPEN', 'CLOSED'
    opened_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    closed_at TIMESTAMPTZ
);

-- 21. Tabela de Movimentações de Caixa (Cash Movements: Sangria, Suprimento, etc)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE CASCADE NOT NULL,
    movement_type VARCHAR(30) NOT NULL, -- 'SUPPLY', 'BLEED', 'SALE_IN', 'OS_IN', 'EXPENSE_OUT'
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH' NOT NULL, -- 'CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'OTHER'
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 22. Tabela de Contas a Receber (Accounts Receivable)
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'
    paid_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 23. Tabela de Contas a Pagar (Accounts Payable) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'OPERATIONAL' NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'
    paid_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 24. Tabela de Pagamentos Efetuados / Recebidos (Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method VARCHAR(50) NOT NULL, -- 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'TRANSFER', 'BOLETO'
    amount NUMERIC(12, 2) NOT NULL,
    cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
    cash_movement_id UUID REFERENCES public.cash_movements(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    service_order_id UUID REFERENCES public.service_orders(id) ON DELETE SET NULL,
    accounts_receivable_id UUID REFERENCES public.accounts_receivable(id) ON DELETE SET NULL,
    accounts_payable_id UUID REFERENCES public.accounts_payable(id) ON DELETE SET NULL,
    transaction_reference VARCHAR(150),
    installments_count INTEGER DEFAULT 1 NOT NULL,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 25. Tabela de Notas Fiscais e Romaneios de Entrada de Estoque
CREATE TABLE IF NOT EXISTS public.stock_inward_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) NOT NULL,
    series VARCHAR(50),
    access_key VARCHAR(60), -- Chave da NF-e (44 dígitos)
    issue_date DATE NOT NULL,
    entry_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_cnpj VARCHAR(30),
    total_items INTEGER DEFAULT 0 NOT NULL,
    total_units INTEGER DEFAULT 0 NOT NULL,
    total_cost_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    payment_status VARCHAR(30) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID'
    due_date DATE,
    create_financial_payable BOOLEAN DEFAULT TRUE NOT NULL,
    registered_by VARCHAR(255) DEFAULT 'Administrador' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 26. Tabela de Itens da Nota Fiscal de Entrada
CREATE TABLE IF NOT EXISTS public.stock_inward_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.stock_inward_invoices(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    category VARCHAR(50) DEFAULT 'PEÇA' NOT NULL, -- 'PEÇA', 'ACESSÓRIO', 'OUTROS'
    quantity INTEGER NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    current_selling_price NUMERIC(12, 2) DEFAULT 0.00,
    new_selling_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    markup_percentage NUMERIC(6, 2) DEFAULT 0.00,
    total_cost NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    is_new_product BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 27. Tabela de Configurações da Loja (Store Settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) DEFAULT 'DUAL SYSTEM - Assistência Técnica' NOT NULL,
    store_subtitle VARCHAR(255) DEFAULT 'Especializada em Celulares, Smartphones e Eletrônicos',
    logo_url TEXT,
    cnpj_cpf VARCHAR(30) DEFAULT '00.000.000/0001-00',
    phone VARCHAR(30) DEFAULT '(11) 98765-4321',
    whatsapp VARCHAR(30) DEFAULT '(11) 98765-4321',
    email VARCHAR(255) DEFAULT 'contato@dualsystem.com.br',
    address_street VARCHAR(255) DEFAULT 'Av. Principal dos Celulares',
    address_number VARCHAR(30) DEFAULT '1000',
    address_neighborhood VARCHAR(100) DEFAULT 'Centro',
    address_city VARCHAR(100) DEFAULT 'São Paulo',
    address_state VARCHAR(10) DEFAULT 'SP',
    address_zip VARCHAR(20) DEFAULT '01000-000',
    receipt_footer_msg TEXT DEFAULT 'Agradecemos a preferência! Garantia legal de 90 dias conforme CDC.',
    warranty_terms TEXT DEFAULT 'Garantia de 90 dias sobre as peças trocadas e serviços executados. Não cobrimos danos por umidade, choque físico ou lacres violados.',
    default_commission_pct NUMERIC(5, 2) DEFAULT 5.00 NOT NULL,
    auto_print_receipt BOOLEAN DEFAULT TRUE NOT NULL,
    paper_size VARCHAR(20) DEFAULT '80mm' NOT NULL, -- '80mm', '58mm', 'A4'
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 28. Tabela de Logs de Auditoria (Audit Logs) - RESTRITO A ADMIN
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'PRICE_CHANGE'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- TRIGGERS E FUNÇÕES AUXILIARES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role_name VARCHAR;
BEGIN
    SELECT r.name INTO user_role_name
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid();
    
    RETURN (user_role_name = 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_modtime BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_modtime BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sellers_modtime BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_orders_modtime BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_modtime BEFORE UPDATE ON public.accounts_receivable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_payable_modtime BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stock_inward_invoices_modtime BEFORE UPDATE ON public.stock_inward_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_store_settings_modtime BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Incremento automático de estoque ao lançar item de nota fiscal
CREATE OR REPLACE FUNCTION public.process_stock_inward_item()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        UPDATE public.products
        SET current_stock = current_stock + NEW.quantity,
            cost_price = NEW.cost_price,
            sale_price = CASE WHEN NEW.new_selling_price > 0 THEN NEW.new_selling_price ELSE sale_price END,
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.product_id;

        INSERT INTO public.inventory_movements (
            product_id,
            movement_type,
            quantity,
            unit_cost,
            reference_id,
            reference_type,
            notes
        ) VALUES (
            NEW.product_id,
            'PURCHASE_IN',
            NEW.quantity,
            NEW.cost_price,
            NEW.invoice_id,
            'STOCK_INWARD_INVOICE',
            'Entrada por Nota Fiscal / XML: ' || COALESCE(NEW.product_name, '')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_stock_inward_item_inserted ON public.stock_inward_items;
CREATE TRIGGER on_stock_inward_item_inserted
    AFTER INSERT ON public.stock_inward_items
    FOR EACH ROW EXECUTE FUNCTION public.process_stock_inward_item();

-- Trigger para sincronização do usuário auth para profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    is_first_user BOOLEAN;
BEGIN
    SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;
    
    IF is_first_user THEN
        SELECT id INTO default_role_id FROM public.roles WHERE name = 'ADMIN' LIMIT 1;
    ELSE
        SELECT id INTO default_role_id FROM public.roles WHERE name = 'SELLER' LIMIT 1;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role_id, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        default_role_id,
        TRUE
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- VISÃO SEGURA PARA VENDEDORES (Oculta preço de custo e fornecedores)
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_products_seller AS
SELECT 
    p.id,
    p.category_id,
    p.brand_id,
    p.phone_model_id,
    p.name,
    p.sku,
    p.barcode,
    p.category,
    p.unit,
    p.sale_price,
    p.current_stock,
    p.min_stock,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.products p
WHERE p.is_active = TRUE;

-- ==============================================================================
-- ÍNDICES DE DESEMPENHO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_document ON public.clients(document);
CREATE INDEX IF NOT EXISTS idx_phone_models_brand_id ON public.phone_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_client ON public.service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_imei ON public.service_orders(imei);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON public.service_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_seller ON public.commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_register ON public.cash_movements(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due ON public.accounts_receivable(due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due ON public.accounts_payable(due_date);
CREATE INDEX IF NOT EXISTS idx_stock_inward_invoice_number ON public.stock_inward_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_stock_inward_access_key ON public.stock_inward_invoices(access_key);
CREATE INDEX IF NOT EXISTS idx_stock_inward_supplier ON public.stock_inward_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_inward_entry_date ON public.stock_inward_invoices(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_inward_items_invoice ON public.stock_inward_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_inward_items_product ON public.stock_inward_items(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_inward_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_inward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles read authenticated" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roles modify admin" ON public.roles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Profiles read authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Profiles admin full" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Clients read authenticated" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients insert authenticated" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clients update authenticated" ON public.clients FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Clients delete admin" ON public.clients FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Brands read" ON public.brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brands write admin" ON public.brands FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Models read" ON public.phone_models FOR SELECT TO authenticated USING (true);
CREATE POLICY "Models write admin" ON public.phone_models FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Categories read" ON public.product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories write admin" ON public.product_categories FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Suppliers admin only" ON public.suppliers FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Products read authenticated" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Products write admin" ON public.products FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Services read" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Services write admin" ON public.services FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Sellers read authenticated" ON public.sellers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sellers write admin" ON public.sellers FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Service orders read" ON public.service_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service orders insert" ON public.service_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Service orders update" ON public.service_orders FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service orders delete admin" ON public.service_orders FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "OS Items read" ON public.service_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "OS Items insert" ON public.service_order_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "OS Items update" ON public.service_order_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "OS Items delete" ON public.service_order_items FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "OS History read" ON public.service_order_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "OS History insert" ON public.service_order_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Inventory read" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inventory write admin" ON public.inventory FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Movements read" ON public.inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Movements insert auth" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sales read" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sales insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Sales admin" ON public.sales FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Sale Items read" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sale Items insert" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Commissions read own or admin" ON public.commissions FOR SELECT TO authenticated 
USING (
    public.is_admin() OR 
    seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid())
);
CREATE POLICY "Commissions write admin" ON public.commissions FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Cash registers read" ON public.cash_registers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cash registers open/close" ON public.cash_registers FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Cash movements read" ON public.cash_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cash movements insert" ON public.cash_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Accounts receivable read" ON public.accounts_receivable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Accounts receivable write" ON public.accounts_receivable FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Accounts payable admin only" ON public.accounts_payable FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Payments read" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payments insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Stock Inward Invoices read" ON public.stock_inward_invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock Inward Invoices admin modify" ON public.stock_inward_invoices FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Stock Inward Items read" ON public.stock_inward_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stock Inward Items admin modify" ON public.stock_inward_items FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Store Settings read" ON public.store_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Store Settings admin modify" ON public.store_settings FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Audit logs admin only" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Audit logs insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
