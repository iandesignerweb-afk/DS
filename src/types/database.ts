export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'ADMIN' | 'SELLER';

export type ServiceOrderStatus =
  | 'PENDING_EVALUATION'
  | 'BUDGET_READY'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'FINISHED_READY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type ServiceOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PIX'
  | 'TRANSFER'
  | 'BOLETO'
  | 'OTHER';

export type CashMovementType =
  | 'SUPPLY'
  | 'BLEED'
  | 'SALE_IN'
  | 'OS_IN'
  | 'EXPENSE_OUT';

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: UserRole;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: UserRole;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: UserRole;
          description?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          role_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          document: string | null;
          phone: string;
          secondary_phone: string | null;
          email: string | null;
          address: string | null;
          number: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          document?: string | null;
          phone: string;
          secondary_phone?: string | null;
          email?: string | null;
          address?: string | null;
          number?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          document?: string | null;
          phone?: string;
          secondary_phone?: string | null;
          email?: string | null;
          address?: string | null;
          number?: string | null;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      phone_models: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          model_number: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name: string;
          model_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name?: string;
          model_number?: string | null;
          created_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          trade_name: string | null;
          document: string | null;
          phone: string | null;
          email: string | null;
          contact_person: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trade_name?: string | null;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_person?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          trade_name?: string | null;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_person?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          brand_id: string | null;
          phone_model_id: string | null;
          supplier_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          cost_price: number;
          sale_price: number;
          min_stock: number;
          current_stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          brand_id?: string | null;
          phone_model_id?: string | null;
          supplier_id?: string | null;
          name: string;
          sku?: string | null;
          barcode?: string | null;
          cost_price?: number;
          sale_price: number;
          min_stock?: number;
          current_stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          brand_id?: string | null;
          phone_model_id?: string | null;
          supplier_id?: string | null;
          name?: string;
          sku?: string | null;
          barcode?: string | null;
          cost_price?: number;
          sale_price?: number;
          min_stock?: number;
          current_stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          standard_price: number;
          estimated_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          standard_price: number;
          estimated_minutes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          standard_price?: number;
          estimated_minutes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sellers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          commission_rate_percentage: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          commission_rate_percentage?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          commission_rate_percentage?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_orders: {
        Row: {
          id: string;
          order_number: number;
          client_id: string;
          brand_id: string | null;
          phone_model_id: string | null;
          device_name: string | null;
          imei: string | null;
          serial_number: string | null;
          device_password: string | null;
          device_color: string | null;
          device_condition_notes: string | null;
          accessories_left: string | null;
          reported_defect: string;
          technical_diagnosis: string | null;
          status: ServiceOrderStatus;
          priority: ServiceOrderPriority;
          total_services: number;
          total_products: number;
          discount: number;
          total_amount: number;
          seller_id: string | null;
          technician_id: string | null;
          entry_date: string;
          delivery_forecast: string | null;
          completion_date: string | null;
          delivered_date: string | null;
          warranty_terms: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          client_id: string;
          brand_id?: string | null;
          phone_model_id?: string | null;
          device_name?: string | null;
          imei?: string | null;
          serial_number?: string | null;
          device_password?: string | null;
          device_color?: string | null;
          device_condition_notes?: string | null;
          accessories_left?: string | null;
          reported_defect: string;
          technical_diagnosis?: string | null;
          status?: ServiceOrderStatus;
          priority?: ServiceOrderPriority;
          total_services?: number;
          total_products?: number;
          discount?: number;
          total_amount?: number;
          seller_id?: string | null;
          technician_id?: string | null;
          entry_date?: string;
          delivery_forecast?: string | null;
          completion_date?: string | null;
          delivered_date?: string | null;
          warranty_terms?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          client_id?: string;
          brand_id?: string | null;
          phone_model_id?: string | null;
          device_name?: string | null;
          imei?: string | null;
          serial_number?: string | null;
          device_password?: string | null;
          device_color?: string | null;
          device_condition_notes?: string | null;
          accessories_left?: string | null;
          reported_defect?: string;
          technical_diagnosis?: string | null;
          status?: ServiceOrderStatus;
          priority?: ServiceOrderPriority;
          total_services?: number;
          total_products?: number;
          discount?: number;
          total_amount?: number;
          seller_id?: string | null;
          technician_id?: string | null;
          entry_date?: string;
          delivery_forecast?: string | null;
          completion_date?: string | null;
          delivered_date?: string | null;
          warranty_terms?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_order_items: {
        Row: {
          id: string;
          service_order_id: string;
          item_type: 'SERVICE' | 'PRODUCT';
          service_id: string | null;
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          cost_price: number;
          total_price: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          item_type: 'SERVICE' | 'PRODUCT';
          service_id?: string | null;
          product_id?: string | null;
          description: string;
          quantity?: number;
          unit_price: number;
          cost_price?: number;
          total_price: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_order_id?: string;
          item_type?: 'SERVICE' | 'PRODUCT';
          service_id?: string | null;
          product_id?: string | null;
          description?: string;
          quantity?: number;
          unit_price?: number;
          cost_price?: number;
          total_price?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      service_order_history: {
        Row: {
          id: string;
          service_order_id: string;
          previous_status: string | null;
          new_status: string;
          notes: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_order_id: string;
          previous_status?: string | null;
          new_status: string;
          notes?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_order_id?: string;
          previous_status?: string | null;
          new_status?: string;
          notes?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          quantity_on_hand: number;
          quantity_reserved: number;
          quantity_available: number;
          shelf_location: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          shelf_location?: string | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          shelf_location?: string | null;
          last_updated?: string;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type: string;
          quantity: number;
          unit_cost: number | null;
          reference_id: string | null;
          reference_type: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          movement_type: string;
          quantity: number;
          unit_cost?: number | null;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          movement_type?: string;
          quantity?: number;
          unit_cost?: number | null;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_number: number;
          client_id: string | null;
          seller_id: string | null;
          subtotal: number;
          discount: number;
          total_amount: number;
          payment_status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_number?: number;
          client_id?: string | null;
          seller_id?: string | null;
          subtotal?: number;
          discount?: number;
          total_amount?: number;
          payment_status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_number?: number;
          client_id?: string | null;
          seller_id?: string | null;
          subtotal?: number;
          discount?: number;
          total_amount?: number;
          payment_status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          cost_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
          cost_price?: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          cost_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          seller_id: string;
          sale_id: string | null;
          service_order_id: string | null;
          base_amount: number;
          commission_percentage: number;
          calculated_amount: number;
          status: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          sale_id?: string | null;
          service_order_id?: string | null;
          base_amount: number;
          commission_percentage: number;
          calculated_amount: number;
          status?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          sale_id?: string | null;
          service_order_id?: string | null;
          base_amount?: number;
          commission_percentage?: number;
          calculated_amount?: number;
          status?: string;
          paid_at?: string | null;
          created_at?: string;
        };
      };
      cash_registers: {
        Row: {
          id: string;
          name: string;
          opened_by: string;
          closed_by: string | null;
          initial_balance: number;
          current_balance: number;
          final_balance: number | null;
          status: 'OPEN' | 'CLOSED';
          opened_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string;
          opened_by: string;
          closed_by?: string | null;
          initial_balance?: number;
          current_balance?: number;
          final_balance?: number | null;
          status?: 'OPEN' | 'CLOSED';
          opened_at?: string;
          closed_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          opened_by?: string;
          closed_by?: string | null;
          initial_balance?: number;
          current_balance?: number;
          final_balance?: number | null;
          status?: 'OPEN' | 'CLOSED';
          opened_at?: string;
          closed_at?: string | null;
        };
      };
      cash_movements: {
        Row: {
          id: string;
          cash_register_id: string;
          movement_type: CashMovementType;
          amount: number;
          description: string;
          payment_method: string;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cash_register_id: string;
          movement_type: CashMovementType;
          amount: number;
          description: string;
          payment_method?: string;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cash_register_id?: string;
          movement_type?: CashMovementType;
          amount?: number;
          description?: string;
          payment_method?: string;
          performed_by?: string | null;
          created_at?: string;
        };
      };
      accounts_receivable: {
        Row: {
          id: string;
          client_id: string | null;
          sale_id: string | null;
          service_order_id: string | null;
          description: string;
          amount: number;
          due_date: string;
          status: string;
          paid_amount: number;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          sale_id?: string | null;
          service_order_id?: string | null;
          description: string;
          amount: number;
          due_date: string;
          status?: string;
          paid_amount?: number;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          sale_id?: string | null;
          service_order_id?: string | null;
          description?: string;
          amount?: number;
          due_date?: string;
          status?: string;
          paid_amount?: number;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts_payable: {
        Row: {
          id: string;
          supplier_id: string | null;
          description: string;
          category: string;
          amount: number;
          due_date: string;
          status: string;
          paid_amount: number;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          description: string;
          category?: string;
          amount: number;
          due_date: string;
          status?: string;
          paid_amount?: number;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string | null;
          description?: string;
          category?: string;
          amount?: number;
          due_date?: string;
          status?: string;
          paid_amount?: number;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          payment_method: PaymentMethod;
          amount: number;
          cash_register_id: string | null;
          cash_movement_id: string | null;
          sale_id: string | null;
          service_order_id: string | null;
          accounts_receivable_id: string | null;
          accounts_payable_id: string | null;
          transaction_reference: string | null;
          installments_count: number;
          processed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_method: PaymentMethod;
          amount: number;
          cash_register_id?: string | null;
          cash_movement_id?: string | null;
          sale_id?: string | null;
          service_order_id?: string | null;
          accounts_receivable_id?: string | null;
          accounts_payable_id?: string | null;
          transaction_reference?: string | null;
          installments_count?: number;
          processed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_method?: PaymentMethod;
          amount?: number;
          cash_register_id?: string | null;
          cash_movement_id?: string | null;
          sale_id?: string | null;
          service_order_id?: string | null;
          accounts_receivable_id?: string | null;
          accounts_payable_id?: string | null;
          transaction_reference?: string | null;
          installments_count?: number;
          processed_by?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      v_products_seller: {
        Row: {
          id: string;
          category_id: string | null;
          brand_id: string | null;
          phone_model_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          sale_price: number;
          current_stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_authenticated_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}
