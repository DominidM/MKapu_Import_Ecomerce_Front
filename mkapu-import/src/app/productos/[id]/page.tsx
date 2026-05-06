import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductoDetailClient from "./ProductoDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias (
        id,
        name
      )
    `)
    .eq("id", Number(id))
    .eq("activo", true)
    .single();

  console.log("PRODUCTO RAW:", data);
  console.log("ERROR:", error);

  if (error || !data) {
    notFound();
  }

  const producto = {
    ...data,
    category_name: Array.isArray(data.categorias)
      ? data.categorias[0]?.name ?? null
      : data.categorias?.name ?? null,
  };

  console.log("PRODUCTO MAPEADO:", producto);

  return <ProductoDetailClient producto={producto} />;
}