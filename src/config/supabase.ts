import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Project credentials from environment or active project instance
const defaultUrl = 'https://wcqedhawvsbrbnvhyqrm.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjcWVkaGF3dnNicmJudmh5cXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzYxMzAsImV4cCI6MjEwNDExMjEzMH0.qtDRUE4o9cEoX5OLwjvdDqtf1wToGCWRMUKtCKsmisg';

const supabaseUrl = envUrl || defaultUrl;
const supabaseAnonKey = envAnonKey || defaultAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Lazy initialized client
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!_supabase) {
    try {
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (e) {
      console.error('Error creating Supabase client:', e);
      return null;
    }
  }
  return _supabase;
}

export const supabase = isSupabaseConfigured ? getSupabase() : null;

/**
 * Diagnostic health check to verify Supabase tables and auth
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tables?: { [tableName: string]: boolean };
}> {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase URL o Anon Key no están configuradas en las variables de entorno (.env).',
    };
  }

  const tablesToCheck = ['categories', 'products', 'orders', 'order_items', 'profiles', 'payments', 'deliveries'];
  const tableStatus: { [tableName: string]: boolean } = {};

  try {
    for (const tbl of tablesToCheck) {
      const { error } = await client.from(tbl).select('count', { count: 'exact', head: true });
      tableStatus[tbl] = !error;
    }

    const allTablesValid = Object.values(tableStatus).every(Boolean);
    return {
      connected: true,
      message: allTablesValid
        ? 'Conexión a Supabase establecida y todas las tablas verificadas correctamente.'
        : 'Conectado a Supabase. Algunas tablas requieren ejecutar el script de esquema SQL.',
      tables: tableStatus,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Error al conectar con Supabase: ${err.message || 'Error desconocido'}`,
    };
  }
}
