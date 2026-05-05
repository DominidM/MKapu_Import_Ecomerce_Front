import { createClient } from "@supabase/supabase-js";

export interface Producto {
  id: number;
  code: string;
  name: string;
  category: number;
  category_name?: string;
  description?: string;
  price: number;
  price_caja?: number;
  unidad_caja?: number;
  price_mayorista?: number;
  unidad_mayorista?: number;
  featured?: boolean;
  image_url?: string;
  activo?: boolean;
  created_at?: string;
  is_new?: boolean;
  low_stock?: boolean;
}

export type Categoria = {
  id: number;
  name: string;
  slug: string;
  activo?: boolean;
};

export type Reclamacion = {
  id?: number;
  ticket?: string;
  nombres: string;
  apellidos: string;
  dni?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tipo: string;
  fecha_consumo?: string;
  producto?: string;
  monto?: number;
  descripcion: string;
  pedido?: string;
  created_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. "
    //"Agrégalas en el dashboard de Cloudflare Workers > Settings > Variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);