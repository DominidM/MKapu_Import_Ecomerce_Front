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
      <div style={{
        width: "100%", aspectRatio: "4/3", borderRadius: "20px",
        background: "#f2ece5", border: "1px solid #ece3d7",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "12px", color: "#b4aaa3",
      }}>
        <ImageOff size={48} />
        <span style={{ fontSize: "0.85rem" }}>Sin imágenes</span>
      </div>
    );
  }

  const hasMultiple = imagenes.length > 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        position: "relative", width: "100%", aspectRatio: "4/3",
        borderRadius: "20px", overflow: "hidden",
        background: "linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%)",
        border: "1px solid #ece3d7",
      }}>
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
              onClick={() => setActiveIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1))}
              aria-label="Anterior"
              style={{
                position: "absolute", left: "16px", top: "50%",
                transform: "translateY(-50%)", width: "44px", height: "44px",
                borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.95)", color: "#1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 2,
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setActiveIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1))}
              aria-label="Siguiente"
              style={{
                position: "absolute", right: "16px", top: "50%",
                transform: "translateY(-50%)", width: "44px", height: "44px",
                borderRadius: "50%", border: "none",
                background: "rgba(255,255,255,0.95)", color: "#1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 2,
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
          gap: "10px", marginTop: "12px",
        }}>
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              style={{
                aspectRatio: "1/1", borderRadius: "10px", overflow: "hidden",
                border: `2px solid ${i === activeIdx ? "#f5a623" : "#e8dfd3"}`,
                background: "#f9f6f2", cursor: "pointer", padding: 0,
                position: "relative", transition: "border-color 0.2s",
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
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", width: "100%", minHeight: "280px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#1a1a1a", overflow: "hidden",
      }}>
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
          zIndex: 1,
        }} />
        <div style={{
          position: "relative", zIndex: 2, textAlign: "center",
          padding: "3.5rem 1.5rem 3rem", maxWidth: "680px",
        }}>
          <p style={{
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#f5a623", marginBottom: "0.75rem",
          }}>
            Sobre nosotros
          </p>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900,
            color: "#fff", letterSpacing: "-0.02em", marginBottom: "1rem",
          }}>
            {heroTitulo}
          </h1>
          <p style={{
            fontSize: "1rem", color: "rgba(255,255,255,0.75)",
            margin: "0 auto", lineHeight: 1.6,
          }}>
            {heroSub}
          </p>
        </div>
      </section>

      {/* ── SECCIONES ZIGZAG ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px 100px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
          {secciones.map((seccion, index) => {
            const isReverse = index % 2 !== 0;
            return (
              <section
                key={seccion.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "60px",
                  alignItems: "start",
                }}
              >
                {/* Texto */}
                <div style={{
                  order: isReverse ? 2 : 1,
                  display: "flex", flexDirection: "column",
                  gap: "16px", paddingTop: "8px",
                }}>
                  {seccion.titulo && (
                    <h2 style={{
                      fontSize: "clamp(1.6rem, 2.5vw, 2.3rem)",
                      fontWeight: 800, margin: 0, color: "#1f1a17", lineHeight: 1.2,
                    }}>
                      {seccion.titulo}
                    </h2>
                  )}
                  {seccion.descripcion && (
                    <div
                      style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#72675f" }}
                      dangerouslySetInnerHTML={{ __html: seccion.descripcion }}
                    />
                  )}
                </div>

                {/* Imagen */}
                <div style={{ order: isReverse ? 1 : 2, width: "100%" }}>
                  <SeccionCarousel imagenes={seccion.imagenes} />
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .qs-section > div {
            order: unset !important;
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}