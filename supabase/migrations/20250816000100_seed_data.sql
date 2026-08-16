-- ==============================================================================
-- DUAL SYSTEM - Gestão de Assistência Técnica de Celulares e Eletrônicos
-- Migration 003: Dados Iniciais (Seed Data)
-- ==============================================================================

-- 1. Marcas Populares
INSERT INTO public.brands (id, name, icon, is_active) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Apple', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Samsung', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Motorola', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'Xiaomi', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000005', 'Realme', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000006', 'Asus', 'Smartphone', TRUE),
    ('00000000-0000-0000-0000-000000000007', 'LG', 'Smartphone', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 2. Modelos de Aparelhos
INSERT INTO public.phone_models (brand_id, name, model_number, device_type, is_active) VALUES
    -- Apple
    ('00000000-0000-0000-0000-000000000001', 'iPhone 15 Pro Max', 'A3106', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 15 Pro', 'A3102', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 15', 'A3090', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 14 Pro Max', 'A2894', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 14', 'A2882', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 13 Pro Max', 'A2643', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 13', 'A2633', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 12', 'A2403', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone 11', 'A2221', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000001', 'iPhone XR', 'A2105', 'SMARTPHONE', TRUE),
    -- Samsung
    ('00000000-0000-0000-0000-000000000002', 'Galaxy S24 Ultra', 'SM-S928B', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy S23 5G', 'SM-S911B', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy S22 Ultra 5G', 'SM-S908E', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy S21 5G', 'SM-G991B', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy A54 5G', 'SM-A546E', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy A34 5G', 'SM-A346M', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy A14', 'SM-A145M', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000002', 'Galaxy Z Flip 5', 'SM-F731B', 'SMARTPHONE', TRUE),
    -- Motorola
    ('00000000-0000-0000-0000-000000000003', 'Moto G60', 'XT2135-1', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Moto G84 5G', 'XT2347-1', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Moto G54 5G', 'XT2343-1', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Edge 40 Neo', 'XT2307-1', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000003', 'Edge 30 Fusion', 'XT2243-1', 'SMARTPHONE', TRUE),
    -- Xiaomi
    ('00000000-0000-0000-0000-000000000004', 'Redmi Note 13 Pro 5G', '2312DRA50G', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'Redmi Note 12', '23021RAAEG', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'Redmi Note 11', '2201117TG', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'Poco X5 Pro 5G', '22101320G', 'SMARTPHONE', TRUE),
    ('00000000-0000-0000-0000-000000000004', 'Poco X3 Pro', 'M2102J20SG', 'SMARTPHONE', TRUE)
ON CONFLICT (brand_id, name) DO NOTHING;

-- 3. Categorias de Produtos
INSERT INTO public.product_categories (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000010', 'Telas & Displays', 'Telas frontais, módulos touch screen e displays OLED/LCD/Incell'),
    ('00000000-0000-0000-0000-000000000011', 'Baterias', 'Baterias originais e premium de alta capacidade'),
    ('00000000-0000-0000-0000-000000000012', 'Conectores & Placas de Carga', 'Subplacas, conectores Type-C, Lightning e Micro-USB'),
    ('00000000-0000-0000-0000-000000000013', 'Acessórios & Películas', 'Películas 3D/Cerâmica, capas anti-impacto, carregadores e cabos'),
    ('00000000-0000-0000-0000-000000000014', 'Câmeras & Lentes', 'Módulos de câmera traseira, frontal e vidros de lente')
ON CONFLICT (name) DO NOTHING;

-- 4. Serviços de Reparo Mais Comuns
INSERT INTO public.services (id, name, description, standard_price, category, warranty_days, estimated_minutes, is_active) VALUES
    ('00000000-0000-0000-0000-000000000020', 'Troca de Tela / Display Frontal', 'Substituição completa do módulo display frontal com calibração de touch', 120.00, 'TELA', 90, 45, TRUE),
    ('00000000-0000-0000-0000-000000000021', 'Troca de Bateria', 'Substituição de bateria estufada ou com baixa saúde', 80.00, 'BATERIA', 90, 30, TRUE),
    ('00000000-0000-0000-0000-000000000022', 'Troca de Conector de Carga / Subplaca', 'Reparo no conector de carregamento que não carrega ou tem mau contato', 90.00, 'CONECTOR', 90, 40, TRUE),
    ('00000000-0000-0000-0000-000000000023', 'Análise Avançada e Reparo de Placa Mãe (Microeletrônica)', 'Diagnóstico em microscópio, reballing, troca de PMIC, tristar ou curto na linha principal', 250.00, 'PLACA', 90, 180, TRUE),
    ('00000000-0000-0000-0000-000000000024', 'Desoxidação / Banho Químico em Ultrassom', 'Limpeza química especializada para celulares que caíram na água', 150.00, 'DESOXIDACAO', 30, 90, TRUE),
    ('00000000-0000-0000-0000-000000000025', 'Restauração de Software / Reset / Atualização', 'Reparo de loop infinito, reinstalação de sistema e recuperação de firmware', 80.00, 'SOFTWARE', 30, 60, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. Fornecedores de Demonstração
INSERT INTO public.suppliers (id, name, trade_name, document, phone, email, contact_person, notes, is_active) VALUES
    ('00000000-0000-0000-0000-000000000030', 'MegaPeças Distribuidora de Eletrônicos LTDA', 'MegaPeças Mobile', '12.345.678/0001-90', '(11) 97777-1111', 'vendas@megapecas.com.br', 'Roberto', 'Fornecedor principal de telas Incell e OLED com garantia de 6 meses', TRUE),
    ('00000000-0000-0000-0000-000000000031', 'Global Parts Brasil Importação e Comércio', 'Global Parts', '98.765.432/0001-10', '(11) 98888-2222', 'contato@globalparts.com.br', 'Fernanda', 'Especialista em baterias homologadas e conectores de carga', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Produtos de Exemplo
INSERT INTO public.products (id, category_id, name, sku, barcode, category, unit, cost_price, sale_price, min_stock, current_stock, supplier_id, is_active) VALUES
    ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000010', 'Tela Frontal iPhone 13 Incell Premium', 'TEL-IP13-INC', '7891000001', 'PEÇA', 'UN', 130.00, 320.00, 3, 8, '00000000-0000-0000-0000-000000000030', TRUE),
    ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000010', 'Tela Frontal iPhone 11 Incell JK', 'TEL-IP11-JK', '7891000002', 'PEÇA', 'UN', 85.00, 220.00, 4, 12, '00000000-0000-0000-0000-000000000030', TRUE),
    ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000010', 'Display Frontal Samsung Galaxy A54 5G OLED com Aro', 'TEL-A54-OLED', '7891000003', 'PEÇA', 'UN', 160.00, 380.00, 2, 5, '00000000-0000-0000-0000-000000000030', TRUE),
    ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000011', 'Bateria iPhone 11 Alta Capacidade 3110mAh com Fita', 'BAT-IP11-3110', '7891000004', 'PEÇA', 'UN', 55.00, 180.00, 5, 14, '00000000-0000-0000-0000-000000000031', TRUE),
    ('00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000012', 'Subplaca Conector de Carga Moto G60 Type-C com CI Carga Rápida', 'SUB-G60-FAST', '7891000005', 'PEÇA', 'UN', 22.00, 95.00, 3, 9, '00000000-0000-0000-0000-000000000031', TRUE),
    ('00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000013', 'Película de Vidro 3D Privacidade Universal iPhone 13/14', 'PEL-3D-PRIV-IP13', '7891000006', 'ACESSÓRIO', 'UN', 4.50, 35.00, 10, 25, '00000000-0000-0000-0000-000000000030', TRUE),
    ('00000000-0000-0000-0000-000000000046', '00000000-0000-0000-0000-000000000013', 'Carregador Rápido 20W USB-C Homologado Anatel', 'CAR-20W-USBC', '7891000007', 'ACESSÓRIO', 'UN', 18.00, 65.00, 5, 18, '00000000-0000-0000-0000-000000000031', TRUE)
ON CONFLICT (id) DO NOTHING;
