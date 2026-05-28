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
    </main>
  );
}
