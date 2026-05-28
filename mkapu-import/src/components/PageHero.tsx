import Image from "next/image";
import { supabase } from "@/lib/supabase";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

interface Props {
  ruta: string;
  fallbackTitulo?: string;
  fallbackSubtitulo?: string;
}

export default async function PageHero({ ruta, fallbackTitulo = "", fallbackSubtitulo }: Props) {
  const { data } = await supabase
    .from("banners_config")
    .select("titulo, subtitulo, image_url, activo")
    .eq("ruta", ruta)
    .single();

  const banner = data as BannerConfig | null;

  // Si no está activo, usa fallback sin imagen
  const titulo = banner?.titulo || fallbackTitulo;
  const subtitulo = banner?.subtitulo || fallbackSubtitulo || null;
  const imageUrl = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <section className="page-hero">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={titulo}
          fill
          priority
          className="page-hero__img"
          style={{ objectFit: "cover" }}
        />
      )}
      <div className="page-hero__overlay" />
      <div className="page-hero__content">
        <p className="page-hero__eyebrow">ESTAMOS PARA AYUDARTE</p>
        <h1 className="page-hero__title">{titulo}</h1>
        {subtitulo && <p className="page-hero__sub">{subtitulo}</p>}
      </div>
    </section>
  );
}