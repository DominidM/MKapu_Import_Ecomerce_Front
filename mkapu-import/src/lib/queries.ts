import { supabase, Producto, Categoria, Promocion, Empresa } from "./supabase";

// ── TIPOS NUEVOS ───────────────────────────────────────────

export type Marca = {
  id: number;
  name: string;
  logo_url: string | null;
  activo: boolean;
  orden: number;
};

export type Colaborador = {
  id: number;
  name: string;
  logo_url: string | null;
  url: string | null;
  activo: boolean;
  orden: number;
};

export type Video = {
  id: number;
  title: string;
  descripcion: string | null;
  youtube_id: string | null;
  video_url: string | null;
  tipo: "video" | "vlog";
  thumbnail: string | null;
  activo: boolean;
  created_at: string;
};

export type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
  created_at: string;
};

// ── EMPRESA ────────────────────────────────────────────────

export async function getEmpresa(): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from("empresa")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching empresa:", error.message);
    return null;
  }
  return data;
}

export async function updateEmpresa(
  payload: Partial<Empresa>,
): Promise<boolean> {
  const { error } = await supabase
    .from("empresa")
    .update(payload)
    .eq("id", 1);

  if (error) {
    console.error("Error updating empresa:", error.message);
    return false;
  }
  return true;
}

// ── PRODUCTOS ──────────────────────────────────────────────

export async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(name)")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching productos:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    ...p,
    category_name: p.categorias?.name ?? null,
    categorias: undefined,
  }));
}

export async function getProductosByCategoria(
  category: string | number,
): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(name)")
    .eq("category", category)
    .eq("activo", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching productos by category:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    ...p,
    category_name: p.categorias?.name ?? null,
    categorias: undefined,
  }));
}

export async function searchProductos(query: string): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error searching productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductoBySlug(
  slug: string,
): Promise<Producto | null> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching producto by slug:", error.message);
    return null;
  }
  return data;
}

export async function getProductoById(id: number): Promise<Producto | null> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching producto by id:", error.message);
    return null;
  }
  return data;
}

export async function getProductosDestacados(limit = 8): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("featured", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching destacados:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductosNuevos(limit = 10): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("is_new", true)
    .eq("activo", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching nuevos productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductoImagenes(
  productoId: number,
): Promise<ProductoImagen[]> {
  const { data, error } = await supabase
    .from("producto_imagenes")
    .select("*")
    .eq("producto_id", productoId)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching imagenes del producto:", error.message);
    return [];
  }
  return data ?? [];
}

// ── CATEGORÍAS ─────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categorias:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoriasFromProductos(): Promise<string[]> {
  try {
    const { data: productos, error: prodError } = await supabase
      .from("productos")
      .select("category");

    if (prodError) {
      console.error(
        "Error fetching productos for categories:",
        prodError.message,
      );
      return [];
    }

    const { data: categorias, error: catError } = await supabase
      .from("categorias")
      .select("id, name");

    if (catError) {
      console.error("Error fetching categorias:", catError.message);
      return [];
    }

    const catMap = new Map(
      (categorias ?? []).map((c: any) => [String(c.id), c.name]),
    );

    const uniqueCatIds = Array.from(
      new Set(
        (productos ?? [])
          .map((p: any) => p.category)
          .filter((c): c is string | number => Boolean(c)),
      ),
    );

    return uniqueCatIds
      .map((id) => catMap.get(String(id)))
      .filter((name): name is string => Boolean(name))
      .sort();
  } catch (err) {
    console.error("Error in getCategoriasFromProductos:", err);
    return [];
  }
}

// ── MARCAS ─────────────────────────────────────────────────

export async function getMarcas(): Promise<Marca[]> {
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching marcas:", error.message);
    return [];
  }
  return data ?? [];
}

// ── VIDEOS ─────────────────────────────────────────────────

export async function getVideos(tipo?: "video" | "vlog"): Promise<Video[]> {
  let query = supabase
    .from("videos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching videos:", error.message);
    return [];
  }
  return data ?? [];
}

export type ColaboradorWithMedia = Colaborador & {
  colaborador_media: {
    id: number;
    url: string;
    tipo: "imagen" | "video";
    orden: number;
    titulo: string | null;
  }[];
};

export async function getColaboradoresWithMedia(): Promise<
  ColaboradorWithMedia[]
> {
  const { data, error } = await supabase
    .from("colaboradores")
    .select(
      `
      *,
      colaborador_media (
        id,
        url,
        tipo,
        orden,
        titulo
      )
    `,
    )
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching colaboradores with media:", error.message);
    return [];
  }

  return (data ?? []).map((c: any) => ({
    ...c,
    colaborador_media: (c.colaborador_media ?? []).sort(
      (a: any, b: any) => a.orden - b.orden,
    ),
  }));
}

// ── BANNERS ────────────────────────────────────────────────

export type Banner = {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string | null;
  eyebrow: string | null;
  titulo_completo: string | null;
  image_url: string;
  link_url: string;
  orden: number;
  activo: boolean;
};

// ── PROMOCIONES ────────────────────────────────────────────

export async function getPromociones(): Promise<Promocion[]> {
  const { data, error } = await supabase
    .from("promociones")
    .select("*, productos(name)")
    .eq("activo", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching promociones:", error.message);
    return [];
  }

  return (data ?? []).map((p: any) => ({
    ...p,
    producto_nombre: p.productos?.name ?? null,
    productos: undefined,
  }));
}

export async function getPromocionByProducto(
  productoId: number,
): Promise<Promocion | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promociones")
    .select("*")
    .eq("producto_id", productoId)
    .eq("activo", true)
    .or(`fecha_inicio.is.null,fecha_inicio.lte.${now}`)
    .or(`fecha_fin.is.null,fecha_fin.gte.${now}`)
    .maybeSingle();

  if (error) {
    console.error("Error fetching promocion for product:", error.message);
    return null;
  }

  return data;
}

export async function getPromocionesActivasMap(): Promise<
  Record<number, { tipo_descuento: string; valor_descuento: number }>
> {
  const promos = await getPromociones();
  const map: Record<number, any> = {};

  for (const p of promos) {
    if (p.activo) {
      map[p.producto_id] = {
        tipo_descuento: p.tipo_descuento,
        valor_descuento: p.valor_descuento,
      };
    }
  }

  return map;
}

export function calcularPrecioConDescuento(
  precioOriginal: number,
  promocion: Promocion | null,
): { precioFinal: number; descuentoTexto: string } | null {
  if (!promocion || !promocion.activo) return null;

  let descuento = 0;
  if (promocion.tipo_descuento === "porcentaje") {
    descuento = (precioOriginal * promocion.valor_descuento) / 100;
  } else {
    descuento = promocion.valor_descuento;
  }

  const precioFinal = Math.max(0, precioOriginal - descuento);
  const descuentoTexto =
    promocion.tipo_descuento === "porcentaje"
      ? `${promocion.valor_descuento}% OFF`
      : `S/ ${promocion.valor_descuento.toFixed(2)} OFF`;

  return { precioFinal, descuentoTexto };
}

export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("banners_carousel")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching banners:", error.message);
    return [];
  }
  return data ?? [];
}