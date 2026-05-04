"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

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
};

function SeccionCarousel({ imagenes }: { imagenes: QuienesSomosImagen[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (imagenes.length === 0) {
    return (
      <div className="carousel-empty">
        <ImageOff size={48} />
        <span>Sin imágenes</span>
      </div>
    );
  }

  const hasMultiple = imagenes.length > 1;

  function prev() {
    setActiveIdx((i) => (i === 0 ? imagenes.length - 1 : i - 1));
  }

  function next() {
    setActiveIdx((i) => (i === imagenes.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="carousel-container">
      <div className="carousel-stage">
        <img
          src={imagenes[activeIdx].url_imagen}
          alt=""
          className="carousel-image"
        />

        {hasMultiple && (
          <>
            <button
              className="carousel-arrow carousel-arrow--left"
              onClick={prev}
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="carousel-arrow carousel-arrow--right"
              onClick={next}
              aria-label="Siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="carousel-thumbs">
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              className={`carousel-thumb${i === activeIdx ? " carousel-thumb--active" : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <img src={img.url_imagen} alt="" />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .carousel-container {
          width: 100%;
        }

        .carousel-stage {
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%);
          border: 1px solid #ece3d7;
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .carousel-empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #b4aaa3;
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: all 0.2s ease;
        }

        .carousel-arrow:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-arrow--left {
          left: 16px;
        }

        .carousel-arrow--right {
          right: 16px;
        }

        .carousel-thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .carousel-thumb {
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #e8dfd3;
          background: #f9f6f2;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .carousel-thumb:hover {
          transform: scale(1.05);
          border-color: #d7c6b0;
        }

        .carousel-thumb--active {
          border-color: #e05c2a;
        }

        .carousel-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
    </div>
  );
}

export default function QuienesSomosClient({ secciones }: Props) {
  return (
    <div className="quienes-somos">
      <header className="quienes-somos-header">
        <h1 className="quienes-somos-title">Quiénes Somos</h1>
      </header>

      <div className="quienes-somos-sections">
        {secciones.map((seccion, index) => (
          <section
            key={seccion.id}
            className={`quienes-somos-section ${index % 2 === 0 ? "quienes-somos-section--normal" : "quienes-somos-section--reverse"}`}
          >
            <div className="quienes-somos-section-media">
              <SeccionCarousel imagenes={seccion.imagenes} />
            </div>

            <div className="quienes-somos-section-content">
              {seccion.titulo && (
                <h2 className="quienes-somos-section-title">
                  {seccion.titulo}
                </h2>
              )}
              {seccion.descripcion && (
                <div
                  className="quienes-somos-section-text"
                  dangerouslySetInnerHTML={{ __html: seccion.descripcion }}
                />
              )}
            </div>
          </section>
        ))}
      </div>

      <style jsx>{`
        .quienes-somos {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px 100px;
        }

        .quienes-somos-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .quienes-somos-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #e05c2a 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .quienes-somos-sections {
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .quienes-somos-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .quienes-somos-section--reverse {
          direction: rtl;
        }

        .quienes-somos-section--reverse > * {
          direction: ltr;
        }

        .quienes-somos-section-media {
          width: 100%;
        }

        .quienes-somos-section-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .quienes-somos-section-title {
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 800;
          margin: 0;
          color: #1f1a17;
        }

        .quienes-somos-section-text {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #72675f;
        }

        .quienes-somos-section-text :global(p) {
          margin: 16px 0;
        }

        .quienes-somos-section-text :global(strong) {
          color: #1f1a17;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .quienes-somos-section {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .quienes-somos-section--reverse {
            direction: ltr;
          }

          .quienes-somos-sections {
            gap: 60px;
          }
        }
      `}</style>
    </div>
  );
}