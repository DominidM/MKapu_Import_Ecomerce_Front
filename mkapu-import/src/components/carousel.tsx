"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/productCard";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number;
  featured: boolean;
}

interface Props {
  products: Product[];
  title?: string;
}

export default function Carousel({ products, title = "Destacados" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const CARD_WIDTH = 220;
  const total = products.length;

  const handleScroll = useCallback(() => {
    if (!trackRef.current) return;
    const idx = Math.round(trackRef.current.scrollLeft / CARD_WIDTH);
    setActiveIdx(Math.min(idx, total - 1));
  }, [total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function scrollTo(idx: number) {
    trackRef.current?.scrollTo({ left: idx * CARD_WIDTH, behavior: "smooth" });
    setActiveIdx(idx);
  }

  function prev() { scrollTo(Math.max(activeIdx - 1, 0)); }
  function next() { scrollTo(Math.min(activeIdx + 1, total - 1)); }

  function onMouseDown(e: React.MouseEvent) {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft - (x - startX) * 1.2;
  }

  function onMouseUp() { setIsDragging(false); }

  return (
    <section className="carousel">
      <div className="carousel__header">
        <h2 className="carousel__title">{title}</h2>
        <div className="carousel__nav">
          <button className="carousel__arrow" onClick={prev} disabled={activeIdx === 0} aria-label="Anterior">‹</button>
          <button className="carousel__arrow" onClick={next} disabled={activeIdx >= total - 1} aria-label="Siguiente">›</button>
        </div>
      </div>

      <div
        className={`carousel__track${isDragging ? " carousel__track--dragging" : ""}`}
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {products.map((p) => (
          <div className="carousel__slide" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="carousel__dots" role="tablist">
        {products.map((_, i) => (
          <button
            key={i}
            className={`carousel__dot${i === activeIdx ? " carousel__dot--active" : ""}`}
            onClick={() => scrollTo(i)}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`Producto ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .carousel { --accent: #e05c2a; width: 100%; }

        .carousel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0 0.25rem;
        }

        .carousel__title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        .carousel__nav { display: flex; gap: 6px; }

        .carousel__arrow {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1.5px solid #e0d8d0;
          background: #fff;
          color: #1a1a1a;
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
          padding-bottom: 1px;
        }

        .carousel__arrow:hover:not(:disabled) {
          background: #fff1ec;
          border-color: var(--accent);
          color: var(--accent);
          transform: scale(1.08);
        }

        .carousel__arrow:disabled { opacity: 0.35; cursor: default; }

        .carousel__track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 6px 4px 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          cursor: grab;
          user-select: none;
        }

        .carousel__track::-webkit-scrollbar { display: none; }
        .carousel__track--dragging { cursor: grabbing; scroll-snap-type: none; }

        .carousel__slide {
          scroll-snap-align: start;
          flex: 0 0 200px;
        }

        .carousel__dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 4px;
        }

        .carousel__dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          border: none;
          background: #d9d3cc;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s, width 0.2s;
        }

        .carousel__dot--active {
          background: var(--accent);
          width: 20px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}