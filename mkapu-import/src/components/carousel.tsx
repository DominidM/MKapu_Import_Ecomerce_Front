/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/productCard";

interface Product {
  id: number;
  code: string;
  name: string;
  category: number | null;
  description: string;
  price: number;
  oldPrice: number;
  featured: boolean;
  is_new?: boolean;
  low_stock?: boolean;
  agotado?: boolean;
  image_url?: string;
  category_name?: string;
}

interface Props {
  products: Product[];
  title?: string;
  promocionesMap?: Record<number, { tipo_descuento: string; valor_descuento: number }>;
}

const CARD_GAP = 16;

export default function Carousel({ products, title = "Destacados", promocionesMap = {} }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [snapPoints, setSnapPoints] = useState<number[]>([]);

  const total = products.length;

  const calcSnapPoints = useCallback(() => {
    const track = trackRef.current;
    if (!track || total === 0) {
      setSnapPoints([]);
      return;
    }

    const slide = track.querySelector<HTMLElement>(".carousel__slide");
    const cardW = slide?.offsetWidth ?? 260;
    const step = cardW + CARD_GAP;
    const totalW = total * cardW + Math.max(0, total - 1) * CARD_GAP;
    const viewW = track.clientWidth;
    if (totalW <= viewW + 1) {
      setSnapPoints([]);
      return;
    }

    const maxScroll = totalW - viewW;
    const pts: number[] = [];
    for (let p = 0; p < maxScroll; p += step) {
      pts.push(Math.round(p));
    }
    const last = pts[pts.length - 1];
    if (maxScroll - last > step * 0.2) {
      pts.push(Math.round(maxScroll));
    } else {
      pts[pts.length - 1] = Math.round(maxScroll);
    }

    setSnapPoints(pts);
  }, [total]);

  // Recalcular inmediatamente y con retrasos para cuando el DOM termina de pintar
  useEffect(() => {
    calcSnapPoints();
    const t1 = setTimeout(() => calcSnapPoints(), 100);
    const t2 = setTimeout(() => calcSnapPoints(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [calcSnapPoints]);

  // Recalcular cuando los productos cambian (total cambia)
  useEffect(() => {
    if (total === 0) return;
    const t1 = setTimeout(() => calcSnapPoints(), 50);
    const t2 = setTimeout(() => calcSnapPoints(), 300);
    const t3 = setTimeout(() => calcSnapPoints(), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [total, calcSnapPoints]);

  // ResizeObserver para detectar cambios en el tamaño del contenedor
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcSnapPoints());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcSnapPoints]);

  // Ilumina el dot más cercano a nuestra posición actual de scroll
  const handleScroll = useCallback(() => {
    if (!trackRef.current || snapPoints.length === 0) return;
    const currentScroll = trackRef.current.scrollLeft;

    let closestIdx = 0;
    let minDiff = Infinity;

    snapPoints.forEach((pt, i) => {
      const diff = Math.abs(currentScroll - pt);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    setActiveIdx(closestIdx);
  }, [snapPoints]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Mueve el carrusel hacia uno de los puntos exactos calculados
  function scrollTo(idx: number) {
    if (!trackRef.current || snapPoints.length === 0) return;
    const targetPos = snapPoints[idx];
    trackRef.current.scrollTo({ left: targetPos, behavior: "smooth" });
    setActiveIdx(idx);
  }

  const dotCount = snapPoints.length;

  function prev() {
    scrollTo(Math.max(activeIdx - 1, 0));
  }
  function next() {
    scrollTo(Math.min(activeIdx + 1, dotCount - 1));
  }

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

  function onMouseUp() {
    setIsDragging(false);
  }

  return (
    <section className="carousel">
      <div className="carousel__header">
        <h2 className="carousel__title">{title}</h2>
      </div>

      <div className="carousel__wrapper">
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
              <ProductCard product={{ ...p, descuento: promocionesMap[p.id] ?? undefined }} />
            </div>
          ))}
        </div>

        {dotCount > 0 && (
          <>
            <button
              className={`carousel__arrow carousel__arrow--prev${activeIdx === 0 ? " carousel__arrow--hidden" : ""}`}
              onClick={prev}
              disabled={activeIdx === 0}
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              className={`carousel__arrow carousel__arrow--next${dotCount === 0 || activeIdx >= dotCount - 1 ? " carousel__arrow--hidden" : ""}`}
              onClick={next}
              disabled={dotCount === 0 || activeIdx >= dotCount - 1}
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* SOLO renderizar dots si realmente hay más de una página posible */}
      {dotCount > 1 && (
        <div className="carousel__dots" role="tablist">
          {snapPoints.map((_, i) => (
            <button
              key={i}
              className={`carousel__dot${i === activeIdx ? " carousel__dot--active" : ""}`}
              onClick={() => scrollTo(i)}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
