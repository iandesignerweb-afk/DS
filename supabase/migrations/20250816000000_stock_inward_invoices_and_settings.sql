-- ==============================================================================
-- DUAL SYSTEM - Gestão de Assistência Técnica de Celulares e Eletrônicos
-- Migration 002: Entrada de Estoque por Nota Fiscal / XML e Configurações da Loja
-- ==============================================================================

-- 1. Tabela de Notas Fiscais e Romaneios de Entrada de Estoque
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

-- 2. Tabela de Itens Lançados na Nota Fiscal de Entrada
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

-- 3. Tabela de Configurações da Loja (Store Settings)
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

-- Inserção da configuração padrão única da loja
INSERT INTO public.store_settings (id, store_name, store_subtitle)
VALUES ('00000000-0000-0000-0000-000000000099', 'DUAL SYSTEM - Assistência Técnica', 'Especializada em Celulares, Smartphones e Eletrônicos')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- TRIGGERS E FUNÇÕES
-- ==============================================================================

-- Trigger de updated_at para stock_inward_invoices e store_settings
CREATE TRIGGER update_stock_inward_invoices_modtime
    BEFORE UPDATE ON public.stock_inward_invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_settings_modtime
    BEFORE UPDATE ON public.store_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função e Trigger para incrementar estoque automaticamente ao registrar entrada de item
CREATE OR REPLACE FUNCTION public.process_stock_inward_item()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o produto existir, atualiza estoque e custos
    IF NEW.product_id IS NOT NULL THEN
        UPDATE public.products
        SET current_stock = current_stock + NEW.quantity,
            cost_price = NEW.cost_price,
            sale_price = CASE WHEN NEW.new_selling_price > 0 THEN NEW.new_selling_price ELSE sale_price END,
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = NEW.product_id;

        -- Registra movimentação no histórico de estoque
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

-- ==============================================================================
-- ÍNDICES DE DESEMPENHO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_stock_inward_invoice_number ON public.stock_inward_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_stock_inward_access_key ON public.stock_inward_invoices(access_key);
CREATE INDEX IF NOT EXISTS idx_stock_inward_supplier ON public.stock_inward_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_inward_entry_date ON public.stock_inward_invoices(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_inward_items_invoice ON public.stock_inward_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_inward_items_product ON public.stock_inward_items(product_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.stock_inward_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_inward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Stock Inward Invoices: Leitura para autenticados; Escrita total exclusiva para ADMIN
CREATE POLICY "Stock Inward Invoices read" ON public.stock_inward_invoices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Stock Inward Invoices admin modify" ON public.stock_inward_invoices
    FOR ALL TO authenticated USING (public.is_admin());

-- 2. Stock Inward Items: Leitura para autenticados; Escrita total exclusiva para ADMIN
CREATE POLICY "Stock Inward Items read" ON public.stock_inward_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Stock Inward Items admin modify" ON public.stock_inward_items
    FOR ALL TO authenticated USING (public.is_admin());

-- 3. Store Settings: Leitura para todos autenticados; Escrita exclusiva para ADMIN
CREATE POLICY "Store Settings read" ON public.store_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Store Settings admin modify" ON public.store_settings
    FOR ALL TO authenticated USING (public.is_admin());
