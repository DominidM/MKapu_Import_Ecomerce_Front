"use client";
import { useState } from "react";
import type { ProductoImagen } from "@/lib/queries";

interface Props {
  mainImage?: string;
  imagenes: ProductoImagen[];
  productName: string;
}

export default function ImageGallery({ mainImage, imagenes, productName }: Props) {
  const allImages = [
    ...(mainImage ? [{ id: 0, url_imagenes: mainImage, orden: -1, producto_id: 0, created_at: "" }] : []),
    ...imagenes,
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (allImages.length === 0) return null;

  const active = allImages[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className="ig-wrap">
      <div className="ig-main" onClick={() => setLightbox(true)}>
        <img src={active.url_imagenes} alt={productName} className="ig-main-img" />
        {allImages.length > 1 && (
          <>
            <button className="ig-arrow ig-arrow--left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
            <button className="ig-arrow ig-arrow--right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          </>
        )}
        <span className="ig-zoom">🔍</span>
      </div>

      {allImages.length > 1 && (
        <div className="ig-thumbs">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`ig-thumb${i === activeIndex ? " ig-thumb--active" : ""}`}
            >
              <img src={img.url_imagenes} alt={`${productName} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="ig-lightbox" onClick={() => setLightbox(false)}>
          <button className="ig-lb-close">✕</button>
          <button className="ig-lb-arrow ig-lb-arrow--left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img src={active.url_imagenes} alt={productName} className="ig-lb-img" onClick={(e) => e.stopPropagation()} />
          <button className="ig-lb-arrow ig-lb-arrow--right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </div>
  );
}