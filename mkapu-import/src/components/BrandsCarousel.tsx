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

  if (marcas.length === 0) return <section style={{ minHeight: "280px" }} />;

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

    </section>
  );
}
