"use client";

import { useEffect, useRef, useState } from "react";
import { getMarcas, Marca } from "@/lib/queries";

const SCROLL_THRESHOLD = 5;

export default function BrandsCarousel() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMarcas().then(setMarcas);
  }, []);

  const shouldScroll = marcas.length > SCROLL_THRESHOLD;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || marcas.length === 0 || !shouldScroll) return;

    let pos = 0;
    const speed = 0.5;
    let raf: number;

    const step = () => {
      pos -= speed;
      if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [marcas, shouldScroll]);

  if (marcas.length === 0) return null;

  const items = shouldScroll ? [...marcas, ...marcas] : marcas;

  return (
    <section className="brands-section">
      <div className="brands-header">
        <span className="brands-tag">Nuestras Marcas</span>
        <h2 className="brands-title">Marcas que distribuimos</h2>
      </div>

      <div
        className={`brands-wrapper ${shouldScroll ? "brands-wrapper--scroll" : ""}`}
      >
        {shouldScroll && (
          <>
            <div className="brands-fade brands-fade--left" />
            <div className="brands-fade brands-fade--right" />
          </>
        )}

        <div
          className={`brands-track ${!shouldScroll ? "brands-track--static" : ""}`}
          ref={trackRef}
        >
          {items.map((m, i) => (
            <div key={`${m.id}-${i}`} className="brands-item">
              {m.logo_url ? (
                <img
                  src={m.logo_url}
                  alt={m.name}
                  className="brands-logo"
                  loading="lazy"
                />
              ) : (
                <span className="brands-name">{m.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .brands-section {
          padding: 4rem 1.5rem;
          background: #fff;
          overflow: hidden;
        }

        .brands-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .brands-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }

        .brands-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #1a1a1a;
          margin: 0;
        }

        .brands-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .brands-wrapper--scroll {
          position: relative;
        }

        .brands-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 2;
          pointer-events: none;
        }

        .brands-fade--left {
          left: 0;
          background: linear-gradient(to right, #fff 30%, transparent);
        }

        .brands-fade--right {
          right: 0;
          background: linear-gradient(to left, #fff 30%, transparent);
        }

        .brands-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          will-change: transform;
          align-items: center;
        }

        .brands-track--static {
          width: 100% !important;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .brands-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 220px;
          height: 120px;
          background: #f9f9f9;
          border: 1px solid #efefef;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }

        .brands-logo {
          width: 170px;
          height: 78px;
          object-fit: contain;
          object-position: center;
          display: block;
          filter: none;
          opacity: 1;
        }

        .brands-name {
          font-size: 1rem;
          font-weight: 700;
          color: #555;
          white-space: nowrap;
          text-align: center;
        }

        @media (max-width: 640px) {
          .brands-section {
            padding: 2.5rem 1rem;
          }

          .brands-item {
            min-width: 140px;
            height: 78px;
            padding: 0.75rem 1rem;
          }

          .brands-logo {
            width: 110px;
            height: 46px;
            object-fit: contain;
            object-position: center;
          }

          .brands-fade {
            width: 60px;
          }

          .brands-track--static {
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
