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

      <style>{`
        .page-hero {
          position: relative;
          width: 100%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          overflow: hidden;
        }
        .page-hero__img {
          object-fit: cover;
          object-position: center;
        }
        .page-hero__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.55) 0%,
            rgba(0,0,0,0.65) 100%
          );
          z-index: 1;
        }
        .page-hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 3rem 1.5rem;
          max-width: 700px;
        }
        .page-hero__eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #f5a623;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
        }
        .page-hero__title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.75rem;
          line-height: 1.1;
        }
        .page-hero__sub {
          font-size: 1rem;
          color: rgba(255,255,255,0.75);
          margin: 0;
          line-height: 1.6;
        }
        @media (max-width: 640px) {
          .page-hero { min-height: 220px; }
        }
      `}</style>
    </section>
  );
}