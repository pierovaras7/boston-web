import { createClient } from '@supabase/supabase-js';

export const configurado = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const cliente = configurado
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export function supabase() {
  if (!cliente) throw new Error('Falta configurar Supabase para el CRM');
  return cliente;
}
