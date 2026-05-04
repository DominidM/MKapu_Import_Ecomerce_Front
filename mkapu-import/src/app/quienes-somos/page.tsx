import { supabase } from "@/lib/supabase";
import QuienesSomosClient from "./QuienesSomosClient";

export const revalidate = 60;

export default async function QuienesSomosPage() {
  const [{ data: secciones }, { data: bannerData }] = await Promise.all([
    supabase
      .from("quienes_somos_secciones")
      .select("*")
      .eq("activo", true)
      .order("orden"),
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/quienes-somos")
      .single(),
  ]);

  const seccionesWithImages = await Promise.all(
    (secciones || []).map(async (seccion) => {
      const { data: imagenes } = await supabase
        .from("quienes_somos_imagenes")
        .select("*")
        .eq("seccion_id", seccion.id)
        .order("orden");

      return { ...seccion, imagenes: imagenes || [] };
    }),
  );

  return (
    <QuienesSomosClient
      secciones={seccionesWithImages}
      banner={bannerData ?? null}
    />
  );
}
