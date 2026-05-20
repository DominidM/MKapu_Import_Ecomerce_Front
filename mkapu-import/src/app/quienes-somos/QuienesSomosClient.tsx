"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type QuienesSomosImagen = {
  id: number;
  url_imagen: string;
  orden: number;
};

type QuienesSomosSeccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  imagenes: QuienesSomosImagen[];
};

type Props = {
  secciones: QuienesSomosSeccion[];
  banner: BannerConfig | null;
};

function SeccionCarousel({ imagenes }: { imagenes: QuienesSomosImagen[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "20px",
          background: "#f2ece5",
          border: "1px solid #ece3d7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#b4aaa3",
        }}
      >
        <ImageOff size={48} />
        <span style={{ fontSize: "0.85rem" }}>Sin imágenes</span>
      </div>
    );
  }

  const hasMultiple = imagenes.length > 1;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%)",
          border: "1px solid #ece3d7",
        }}
      >
        <Image
          src={imagenes[activeIdx].url_imagen}
          alt=""
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 900px) 100vw, 50vw"
        />
        {hasMultiple && (
          <>
            <button
              onClick={() =>
                setActiveIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1))
              }
              aria-label="Anterior"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() =>
                setActiveIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1))
              }
              aria-label="Siguiente"
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              style={{
                aspectRatio: "1/1",
                borderRadius: "10px",
                overflow: "hidden",
                border: `2px solid ${i === activeIdx ? "#f5a623" : "#e8dfd3"}`,
                background: "#f9f6f2",
                cursor: "pointer",
                padding: 0,
                position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              <Image
                src={img.url_imagen}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuienesSomosClient({ secciones, banner }: Props) {
  const heroTitulo = banner?.titulo || "Quiénes Somos";
  const heroSub = banner?.subtitulo || "Importación directa desde fabricantes.";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <main className="qs-main">
      {/* ── HERO ── */}
      <section className="qs-hero">
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            className="qs-hero-bg"
          />
        )}
        <div className="qs-hero-overlay" />
        <div className="qs-hero-content">
          <span className="qs-hero-tag">Sobre nosotros</span>
          <h1 className="qs-hero-title">{heroTitulo}</h1>
          <p className="qs-hero-sub">{heroSub}</p>
        </div>
      </section>

      {/* ── SECCIONES ZIGZAG ── */}
      <div className="qs-container">
        {secciones.map((seccion, index) => {
          const isReverse = index % 2 !== 0;
          return (
            <section
              key={seccion.id}
              className={`qs-section${isReverse ? " qs-section--reverse" : ""}`}
            >
              <div className="qs-section-text">
                {seccion.titulo && (
                  <div className="qs-section-title-wrap">
                    <span className="qs-section-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="qs-section-title">{seccion.titulo}</h2>
                  </div>
                )}
                {seccion.descripcion && (
                  <div
                    className="qs-section-desc"
                    dangerouslySetInnerHTML={{ __html: seccion.descripcion }}
                  />
                )}
              </div>

              <div className="qs-section-media">
                <SeccionCarousel imagenes={seccion.imagenes} />
              </div>
            </section>
          );
        })}
      </div>

      <style>{`
        .qs-main {
          background: #f8f7f4;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .qs-hero {
          position: relative;
          width: 100%;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          overflow: hidden;
        }

        .qs-hero-bg {
          object-fit: cover;
          object-position: center;
        }

        .qs-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }

        .qs-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 1.5rem 3.5rem;
          max-width: 680px;
        }

        .qs-hero-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.75rem;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(245,166,35,0.3);
          border-radius: 999px;
          background: rgba(245,166,35,0.08);
        }

        .qs-hero-title {
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 1rem;
          line-height: 1.05;
        }

        .qs-hero-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.7);
          margin: 0 auto;
          line-height: 1.7;
          max-width: 520px;
        }

        /* ── CONTENEDOR ── */
        .qs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 120px;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        /* ── SECCIÓN ── */
        .qs-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          padding: 40px;
          background: #fff;
          border-radius: 28px;
          border: 1px solid #ede8e1;
          box-shadow: 0 8px 32px rgba(78,52,24,0.06);
          transition: box-shadow 0.3s ease;
        }

        .qs-section:hover {
          box-shadow: 0 12px 48px rgba(78,52,24,0.1);
        }

        .qs-section--reverse .qs-section-text {
          order: 2;
        }

        .qs-section--reverse .qs-section-media {
          order: 1;
        }

        .qs-section-text {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .qs-section-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .qs-section-number {
          font-size: 2.5rem;
          font-weight: 900;
          color: #f5a623;
          line-height: 1;
          flex-shrink: 0;
          opacity: 0.6;
          letter-spacing: -0.04em;
          margin-top: 2px;
        }

        .qs-section-title {
          font-size: clamp(1.4rem, 2.2vw, 1.9rem);
          font-weight: 800;
          margin: 0;
          color: #1f1a17;
          line-height: 1.2;
        }

        .qs-section-desc {
          font-size: 1rem;
          line-height: 1.8;
          color: #5c5249;
        }

        .qs-section-desc p {
          margin: 0 0 1rem;
        }

        .qs-section-desc p:last-child {
          margin-bottom: 0;
        }

        .qs-section-media {
          width: 100%;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .qs-container {
            padding: 60px 20px 80px;
            gap: 48px;
          }

          .qs-section {
            gap: 40px;
            padding: 32px;
          }
        }

        @media (max-width: 900px) {
          .qs-section {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 28px;
          }

          .qs-section--reverse .qs-section-text {
            order: unset;
          }

          .qs-section--reverse .qs-section-media {
            order: unset;
          }

          .qs-section-text {
            order: unset !important;
          }

          .qs-section-media {
            order: unset !important;
          }
        }

        @media (max-width: 520px) {
          .qs-container {
            padding: 40px 14px 60px;
            gap: 32px;
          }

          .qs-section {
            padding: 20px;
            gap: 24px;
            border-radius: 20px;
          }

          .qs-section-title-wrap {
            gap: 12px;
          }

          .qs-section-number {
            font-size: 2rem;
          }

          .qs-hero {
            min-height: 240px;
          }

          .qs-hero-content {
            padding: 3rem 1.25rem 2.5rem;
          }
        }
      `}</style>
    </main>
  );
}
