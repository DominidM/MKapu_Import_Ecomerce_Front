"use client";

import { useState } from "react";

type Banner = {
  id: number;
  titulo: string;
  subtitulo: string;
  descripcion: string | null;
  eyebrow: string | null;
  titulo_completo: string | null;
  image_url: string;
  link_url: string;
  orden: number;
  activo: boolean;
};

const COLORS = ["#0ea5e9", "#6366f1", "#e05c2a", "#854d0e", "#16a34a"];

export default function HeroAccordion({ initialBanners }: { initialBanners: Banner[] }) {
  const [items] = useState<Banner[]>(initialBanners);
  const [activeIdx, setActiveIdx] = useState(Math.min(2, initialBanners.length - 1));

  if (items.length === 0) return (
    <section className="hacc">
      <div style={{ minHeight: "560px" }} />
    </section>
  );

  const active = items[activeIdx];
  const activeColor = COLORS[activeIdx % COLORS.length];

  return (
    <section className="hacc">
      <div className="hacc__inner">
        <div className="hacc__text">
          <span className="hacc__eyebrow">
            {active.eyebrow || "Equipos de importación · Lima, Perú"}
          </span>
          {active.titulo_completo ? (
            <h1 className="hacc__title" dangerouslySetInnerHTML={{ __html: active.titulo_completo }} />
          ) : (
            <h1 className="hacc__title">
              Equipos que
              <br />
              <em style={{ color: activeColor }}>{active.titulo}</em>
              <br />
              para tu negocio
            </h1>
          )}
          <p className="hacc__desc">
            {active.descripcion || `${active.subtitulo}. Directo del fabricante, con garantía y soporte técnico en Lima.`}
          </p>
        </div>

        {/* ── Desktop: acordeón horizontal ── */}
        <div className="hacc__accordion hacc__accordion--desktop" role="list">
          {items.map((item, idx) => {
            const isActive = idx === activeIdx;
            const color = COLORS[idx % COLORS.length];
            return (
              <div
                key={item.id}
                className={`hacc__panel${isActive ? " hacc__panel--active" : ""}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                onTouchStart={() => setActiveIdx(idx)}
                role="listitem"
                aria-label={item.titulo}
                style={{ ["--panel-color" as any]: color }}
              >
                <img
                  src={item.image_url}
                  alt={item.titulo}
                  className="hacc__panel-img"
                  loading="lazy"
                />
                <div className="hacc__panel-overlay" />
                <span className="hacc__panel-label">
                  {isActive && (
                    <span className="hacc__panel-title">{item.titulo}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: tabs + imagen grande ── */}
        <div className="hacc__mobile">
          <div className="hacc__tabs">
            {items.map((item, idx) => (
              <button
                key={item.id}
                className={`hacc__tab${idx === activeIdx ? " hacc__tab--active" : ""}`}
                onClick={() => setActiveIdx(idx)}
                style={{ ["--tab-color" as any]: COLORS[idx % COLORS.length] }}
              >
                {item.titulo}
              </button>
            ))}
          </div>
          <div className="hacc__bigimg-wrap">
            <img
              src={active.image_url}
              alt={active.titulo}
              className="hacc__bigimg"
              fetchPriority="high"
              decoding="async"
              loading="eager"
            />
            <div className="hacc__panel-overlay" />
            <span className="hacc__bigimg-label">{active.titulo}</span>
          </div>
        </div>
      </div>
    </section>
  );
}