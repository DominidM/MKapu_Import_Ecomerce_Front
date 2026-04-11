"use client";
import { useState } from "react";
import Link from "next/link";
import Carousel from "@/components/carousel";
import productsData from "@/data/products.json";

// ── Filtra por categoría ──
function byCategory(cat: string) {
  return (productsData as any[]).filter((p) => p.category === cat);
}

const featured = (productsData as any[]).filter((p) => p.featured);
const hornos = byCategory("horno");
const freidorasAire = byCategory("freidora-aire");
const maquinaHielo = byCategory("maquina-hielo");
const refrigeracion = byCategory("refrigeracion");

// ── ACCORDION HERO DATA ──
const ACCORDION_ITEMS = [
  {
    id: 1,
    title: "Máquinas de Hielo",
    emoji: "🧊",
    desc: "Producción continua 24h",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
    color: "#0ea5e9",
    category: "maquina-hielo",
  },
  {
    id: 2,
    title: "Refrigeración",
    emoji: "❄️",
    desc: "Cámaras y vitrinas frías",
    imageUrl:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&auto=format&fit=crop",
    color: "#6366f1",
    category: "refrigeracion",
  },
  {
    id: 3,
    title: "Cocina Profesional",
    emoji: "🍳",
    desc: "Hornos y equipos de alto rendimiento",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop",
    color: "#e05c2a",
    category: "horno",
  },
  {
    id: 4,
    title: "Bebidas & Cafetería",
    emoji: "🥤",
    desc: "Máquinas de café y jugos",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop",
    color: "#854d0e",
    category: "bebidas",
  },
  {
    id: 5,
    title: "Freidoras de Aire",
    emoji: "💨",
    desc: "Cocina saludable sin aceite",
    imageUrl:
      "https://images.unsplash.com/photo-1648070950042-4e3b55ac6278?w=600&auto=format&fit=crop",
    color: "#16a34a",
    category: "freidora-aire",
  },
];

function HeroAccordion() {
  const [activeIdx, setActiveIdx] = useState(2);
  const active = ACCORDION_ITEMS[activeIdx];

  return (
    <section className="hacc">
      <div className="hacc__inner">
        <div className="hacc__text">
          <span className="hacc__eyebrow">
            Equipos de importación · Lima, Perú
          </span>
          <h1 className="hacc__title">
            Equipos que
            <br />
            <em style={{ color: active.color }}>{active.title}</em>
            <br />
            para tu negocio
          </h1>
          <p className="hacc__desc">
            {active.desc}. Directo del fabricante, con garantía y soporte
            técnico en Lima.
          </p>
          <div className="hacc__cta-row">
            <Link href="/productos" className="hacc__btn hacc__btn--primary">
              Ver catálogo
            </Link>
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="hacc__btn hacc__btn--wsp"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
          <div className="hacc__stats">
            {[
              ["200+", "Productos"],
              ["5★", "Calificación"],
              ["24h", "Despacho Lima"],
            ].map(([n, l]) => (
              <div key={l} className="hacc__stat">
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hacc__accordion" role="list">
          {ACCORDION_ITEMS.map((item, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={item.id}
                className={`hacc__panel${isActive ? " hacc__panel--active" : ""}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                role="listitem"
                aria-label={item.title}
                style={{ "--panel-color": item.color } as React.CSSProperties}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="hacc__panel-img"
                  loading="lazy"
                />
                <div className="hacc__panel-overlay" />
                <span
                  className={`hacc__panel-label${isActive ? " hacc__panel-label--active" : ""}`}
                >
                  {isActive && (
                    <span className="hacc__panel-title">{item.title}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hacc {
          background: #0c0c0c;
          padding: 5rem 1.5rem 4rem;
          overflow: hidden;
        }
        .hacc__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .hacc__eyebrow {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e05c2a;
          background: rgba(224, 92, 42, 0.12);
          border: 1px solid rgba(224, 92, 42, 0.25);
          border-radius: 99px;
          padding: 4px 14px;
          margin-bottom: 1.25rem;
        }
        .hacc__title {
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: #fff;
          margin: 0 0 1.1rem;
        }
        .hacc__title em {
          font-style: normal;
          transition: color 0.4s ease;
        }
        .hacc__desc {
          font-size: 1rem;
          color: #999;
          line-height: 1.65;
          margin: 0 0 2rem;
          max-width: 420px;
        }
        .hacc__cta-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .hacc__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.7rem 1.6rem;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.18s;
        }
        .hacc__btn--primary {
          background: #e05c2a;
          color: #fff;
        }
        .hacc__btn--primary:hover {
          background: #c44d20;
          transform: translateY(-2px);
        }
        .hacc__btn--wsp {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .hacc__btn--wsp:hover {
          background: rgba(255, 255, 255, 0.13);
          transform: translateY(-2px);
        }
        .hacc__stats {
          display: flex;
          gap: 2rem;
        }
        .hacc__stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hacc__stat strong {
          font-size: 1.4rem;
          font-weight: 900;
          color: #fff;
        }
        .hacc__stat span {
          font-size: 0.7rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .hacc__accordion {
          display: flex;
          gap: 10px;
          height: 480px;
          align-items: stretch;
        }
        .hacc__panel {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          flex: 0 0 56px;
          transition: flex 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hacc__panel--active {
          flex: 1 1 0%;
        }
        .hacc__panel-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .hacc__panel:hover .hacc__panel-img {
          transform: scale(1.06);
        }
        .hacc__panel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.1) 60%,
            transparent 100%
          );
        }
        .hacc__panel:not(.hacc__panel--active) .hacc__panel-overlay {
          background: rgba(0, 0, 0, 0.5);
        }
        .hacc__panel-label {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .hacc__panel-label--active {
        }
        .hacc__panel-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
          opacity: 0;
          animation: fadeIn 0.3s 0.2s ease forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hacc__panel--active::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          border: 2px solid var(--panel-color, #e05c2a);
          opacity: 0.6;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .hacc__inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .hacc__accordion {
            height: 320px;
          }
        }
        @media (max-width: 500px) {
          .hacc {
            padding: 4rem 1rem 3rem;
          }
          .hacc__accordion {
            height: 240px;
            gap: 6px;
          }
          .hacc__panel {
            flex: 0 0 38px;
            border-radius: 12px;
          }
          .hacc__stats {
            gap: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}

// ── Componente de sección carrusel reutilizable ──
function CarouselSection({
  tag,
  title,
  subtitle,
  products,
  href,
  dark = false,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  products: any[];
  href: string;
  dark?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className={`csec${dark ? " csec--dark" : ""}`}>
      <div className="csec__inner">
        <div className="csec__head">
          {tag && <span className="csec__tag">{tag}</span>}
          <h2 className="csec__title">{title}</h2>
          {subtitle && <p className="csec__sub">{subtitle}</p>}
        </div>
        <Carousel products={products} title="" />
        <div className="csec__foot">
          <Link href={href} className="csec__link">
            Ver todos →
          </Link>
        </div>
      </div>
      <style jsx>{`
        .csec {
          padding: 4rem 1.5rem;
          background: #faf8f5;
        }
        .csec--dark {
          background: #111;
        }
        .csec__inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .csec__head {
          text-align: center;
          margin-bottom: 2rem;
        }
        .csec__tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e05c2a;
          margin-bottom: 0.5rem;
        }
        .csec__title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
        }
        .csec--dark .csec__title {
          color: #fff;
        }
        .csec__sub {
          font-size: 0.92rem;
          color: #777;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .csec--dark .csec__sub {
          color: #888;
        }
        .csec__foot {
          text-align: center;
          margin-top: 1.5rem;
        }
        .csec__link {
          font-size: 0.88rem;
          font-weight: 700;
          color: #e05c2a;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: border-color 0.15s;
        }
        .csec__link:hover {
          border-color: #e05c2a;
        }
      `}</style>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="home">
      <HeroAccordion />

      {/* Destacados */}
      <CarouselSection
        tag="Más vendidos"
        title="Productos destacados"
        subtitle="Los equipos más solicitados por restaurantes y hoteles de Lima."
        products={
          featured.length > 0 ? featured : (productsData as any[]).slice(0, 10)
        }
        href="/productos"
      />

      {/* Hornos */}
      <CarouselSection
        tag="Categoría"
        title="Hornos"
        subtitle="Hornos eléctricos y a gas para cocinas profesionales."
        products={hornos}
        href="/productos?cat=horno"
        dark
      />

      {/* Freidoras de aire */}
      <CarouselSection
        tag="Tendencia"
        title="Freidoras de Aire"
        subtitle="Cocina saludable sin aceite. Todos nuestros productos con garantía de 60 días."
        products={freidorasAire}
        href="/productos?cat=freidora-aire"
      />

      {/* Máquinas de hielo */}
      <CarouselSection
        tag="Categoría"
        title="Máquinas de Hielo"
        subtitle="Producción continua 24h, potencia industrial, fácil mantenimiento."
        products={maquinaHielo}
        href="/productos?cat=maquina-hielo"
        dark
      />

      {/* Refrigeración */}
      <CarouselSection
        tag="Categoría"
        title="Refrigeración"
        subtitle="Cámaras frías, vitrinas exhibidoras y equipos de conservación."
        products={refrigeracion}
        href="/productos?cat=refrigeracion"
      />

      {/* Por qué elegirnos */}
      <section className="why">
        <div className="why__inner">
          <div className="why__head">
            <span className="why__tag">¿Por qué elegirnos?</span>
            <h2 className="why__title">
              Importación directa, calidad garantizada
            </h2>
          </div>
          <div className="why__grid">
            {[
              {
                icon: "🏭",
                title: "Directo del fabricante",
                desc: "Sin intermediarios. Precios competitivos con calidad de primera.",
              },
              {
                icon: "🔧",
                title: "Soporte técnico local",
                desc: "Equipo en Lima para instalación, mantenimiento y garantía.",
              },
              {
                icon: "🚚",
                title: "Despacho rápido",
                desc: "Entrega en Lima Metropolitana en 24–48 horas hábiles.",
              },
              {
                icon: "💬",
                title: "Asesoría personalizada",
                desc: "Te ayudamos a elegir el equipo ideal para tu negocio.",
              },
            ].map((item) => (
              <div key={item.title} className="why__card">
                <span className="why__icon">{item.icon}</span>
                <h3 className="why__card-title">{item.title}</h3>
                <p className="why__card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="vid">
        <div className="vid__inner">
          <div className="vid__head">
            <span className="vid__tag">Conócenos</span>
            <h2 className="vid__title">Ve nuestros equipos en acción</h2>
            <p className="vid__sub">
              Mira cómo nuestras máquinas funcionan en entornos reales de
              trabajo.
            </p>
          </div>
          <div className="vid__row">
            <video
              className="vid__item"
              src="https://res.cloudinary.com/dxuk9bogw/video/upload/v1775778735/sssstik_M0s7GjQOyM_2026-04-09-18-51-58_t7gim9.mp4"
              controls
              playsInline
              preload="metadata"
            />
            <video
              className="vid__item"
              src="https://res.cloudinary.com/dxuk9bogw/video/upload/v1775778675/sssstik_qTDitLuabJ_2026-04-09-18-50-56_ourt9k.mp4"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .home {
          overflow-x: hidden;
        }

        /* WHY */
        .why {
          padding: 4.5rem 1.5rem;
          background: #fff;
        }
        .why__inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .why__head {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .why__tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e05c2a;
          margin-bottom: 0.6rem;
        }
        .why__title {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #1a1a1a;
          margin: 0;
        }
        .why__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .why__card {
          background: #faf8f5;
          border: 1px solid #ede8e1;
          border-radius: 16px;
          padding: 1.5rem;
          transition:
            box-shadow 0.2s,
            transform 0.2s;
        }
        .why__card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-3px);
        }
        .why__icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }
        .why__card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.4rem;
        }
        .why__card-desc {
          font-size: 0.82rem;
          color: #777;
          line-height: 1.5;
          margin: 0;
        }

        /* VIDEO */
        .vid {
          padding: 4.5rem 1.5rem;
          background: #0f0f0f;
        }
        .vid__inner {
          max-width: 780px;
          margin: 0 auto;
        }
        .vid__head {
          text-align: center;
          margin-bottom: 2rem;
        }
        .vid__tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e05c2a;
          margin-bottom: 0.6rem;
        }
        .vid__title {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 0.5rem;
        }
        .vid__sub {
          font-size: 0.92rem;
          color: #888;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .vid__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .vid__item {
          width: 100%;
          border-radius: 16px;
          display: block;
          background: #000;
          aspect-ratio: 9/16;
          object-fit: cover;
        }

        @media (max-width: 600px) {
          .vid__row {
            grid-template-columns: 1fr;
          }
          .why__grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
