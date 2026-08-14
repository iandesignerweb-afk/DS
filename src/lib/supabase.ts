import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Read client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

// Instantiate Supabase client or safe fallback
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createClient<Database>(
      'https://placeholder-project.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

export interface SupabaseHealthCheckResult {
  isConfigured: boolean;
  canConnect: boolean;
  hasSchema: boolean;
  configuredUrl: string;
  errorMessage?: string;
  tablesFound: string[];
  latencyMs?: number;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  const result: SupabaseHealthCheckResult = {
    isConfigured: isSupabaseConfigured,
    canConnect: false,
    hasSchema: false,
    configuredUrl: supabaseUrl || 'Não configurado',
    tablesFound: [],
  };

  if (!isSupabaseConfigured) {
    result.errorMessage = 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ainda não foram preenchidas no painel de configurações ou .env.';
    return result;
  }

  const startTime = performance.now();

  try {
    // 1. Test basic auth service reachable
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      result.errorMessage = `Erro de autenticação no Supabase: ${authError.message}`;
      return result;
    }

    result.canConnect = true;

    // 2. Test database tables presence
    const foundTables: string[] = [];

    // Check roles
    const { data: rolesData, error: rolesError } = await supabase.from('roles').select('id, name').limit(2);
    if (!rolesError && rolesData) {
      foundTables.push('roles');
    }

    // Check profiles
    const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
    if (!profilesError) {
      foundTables.push('profiles');
    }

    // Check clients
    const { error: clientsError } = await supabase.from('clients').select('id').limit(1);
    if (!clientsError) {
      foundTables.push('clients');
    }

    // Check products
    const { error: productsError } = await supabase.from('products').select('id').limit(1);
    if (!productsError) {
      foundTables.push('products');
    }

    // Check service_orders
    const { error: osError } = await supabase.from('service_orders').select('id').limit(1);
    if (!osError) {
      foundTables.push('service_orders');
    }

    result.tablesFound = foundTables;
    result.hasSchema = foundTables.length > 0;
    result.latencyMs = Math.round(performance.now() - startTime);

    if (!result.hasSchema) {
      result.errorMessage = 'Conexão estabelecida com sucesso, mas o schema inicial SQL ainda não foi executado no Supabase. Execute o script schema.sql no SQL Editor.';
    }

    return result;
  } catch (err: unknown) {
    const error = err as Error;
    result.errorMessage = error.message || 'Falha desconhecida ao conectar ao Supabase';
    result.latencyMs = Math.round(performance.now() - startTime);
    return result;
  }
}
