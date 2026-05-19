"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImageOff,
  MessageCircle,
  ShoppingCart,
  Tag,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import type { Producto } from "@/lib/supabase";

interface Props {
  producto: Producto & { category_name?: string | null };
  sugeridos: any[];
}

type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
};

type ProductoVideo = {
  id: number;
  producto_id: number;
  video_url: string | null;
  titulo: string | null;
  orden: number;
};

function formatPrice(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export default function ProductoDetailClient({ producto, sugeridos }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [videos, setVideos] = useState<ProductoVideo[]>([]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const cartItem = items.find((item) => item.id === String(producto.id));
  const qty = cartItem?.qty ?? 0;
  const isConsult = producto.price === 0;
  const categoryLabel =
    producto.category_name || `Categoría ${producto.category}`;

  useEffect(() => {
    async function loadMedia() {
      const [imgRes, vidRes] = await Promise.all([
        supabase
          .from("producto_imagenes")
          .select("*")
          .eq("producto_id", producto.id)
          .order("orden"),
        supabase
          .from("producto_videos")
          .select("*")
          .eq("producto_id", producto.id)
          .order("orden"),
      ]);

      setImagenes(imgRes.data ?? []);
      setVideos(vidRes.data ?? []);
    }

    loadMedia();
  }, [producto.id]);

  const allMedia = [
    ...(producto.image_url
      ? [{ type: "main" as const, url: producto.image_url, titulo: null }]
      : []),
    ...imagenes.map((img) => ({
      type: "image" as const,
      url: img.url_imagenes,
      titulo: null,
    })),
    ...videos.map((vid) => ({
      type: "video" as const,
      url: vid.video_url,
      titulo: vid.titulo,
    })),
  ];

  const currentMedia = allMedia[activeMediaIdx];
  const hasMultipleMedia = allMedia.length > 1;
  const totalPrice = qty * producto.price;

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) {
      removeItem(String(producto.id));
      return;
    }
    updateQty(String(producto.id), newQty);
  }
  function handleAdd() {
    addItem({
      id: String(producto.id),
      code: producto.code ?? "",
      name: producto.name,
      price: producto.price,
      itemTotal: producto.price,
      imageUrl: producto.image_url ?? undefined,
      emoji: "📦",
      product: {
        price: producto.price,
      },
    });
  }

  function prevMedia() {
    setActiveMediaIdx((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  }

  function nextMedia() {
    setActiveMediaIdx((i) => (i === allMedia.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="detail-shell">
      <div className="detail-topbar">
        <Link href="/productos" className="detail-back">
          <span className="detail-back__icon" aria-hidden="true">
            <ArrowLeft size={18} />
          </span>
          <span>Volver a productos</span>
        </Link>
      </div>

      <section className="detail-hero">
        <div className="detail-visual-rail">
          <div className="detail-visual-card">
            <div className="detail-visual-toolbar">
              <span className="detail-chip detail-chip--soft">
                {categoryLabel}
              </span>

              {producto.is_new && (
                <span className="detail-badge detail-badge--new">Nuevo</span>
              )}

              {producto.featured && (
                <span className="detail-badge detail-badge--featured">
                  Destacado
                </span>
              )}
            </div>

            <div
              className={`detail-image-stage${currentMedia?.type === "video" ? " detail-image-stage--video" : ""}`}
            >
              {" "}
              {currentMedia && currentMedia.url && !imgError ? (
                currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    className="detail-video"
                    key={currentMedia.url}
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={producto.name}
                    className="detail-image"
                    onError={() => setImgError(true)}
                  />
                )
              ) : (
                <div className="detail-image-empty">
                  <ImageOff size={48} strokeWidth={1.6} />
                  <span>Imagen no disponible</span>
                </div>
              )}
              {hasMultipleMedia && (
                <>
                  <button
                    className="detail-media-arrow detail-media-arrow--left"
                    onClick={prevMedia}
                    aria-label="Anterior"
                    type="button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="detail-media-arrow detail-media-arrow--right"
                    onClick={nextMedia}
                    aria-label="Siguiente"
                    type="button"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleMedia && (
              <div className="detail-thumbs">
                {allMedia.map((media, i) => (
                  <button
                    key={i}
                    className={`detail-thumb${
                      i === activeMediaIdx ? " detail-thumb--active" : ""
                    }`}
                    onClick={() => setActiveMediaIdx(i)}
                    type="button"
                  >
                    {media.type === "video" ? (
                      <div className="detail-thumb-video">
                        <video
                          src={media.url || ""}
                          muted
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="detail-thumb-video-overlay">
                          <Play size={24} color="#fff" />
                        </div>
                      </div>
                    ) : media.url ? (
                      <img src={media.url} alt="" />
                    ) : (
                      <div className="detail-thumb-empty">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-main">
          <div className="detail-heading">
            <div className="detail-kicker">Detalle del producto</div>
            <h1 className="detail-title">{producto.name}</h1>
            <p className="detail-summary">
              {producto.description ||
                "Este producto no tiene descripción por ahora."}
            </p>

            {producto.low_stock && (
              <div className="detail-stock-alert">
                <div className="detail-stock-alert__icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="detail-stock-alert__body">
                  <strong>¡Últimas unidades disponibles!</strong>
                  <span>Este producto se está agotando. Aprovecha ahora.</span>
                </div>
              </div>
            )}
          </div>

          <div className="detail-meta">
            {producto.code && (
              <div className="detail-meta-card">
                <span className="detail-meta-label">Código</span>
                <strong>{producto.code}</strong>
              </div>
            )}

            <div className="detail-meta-card">
              <span className="detail-meta-label">Categoría</span>
              <strong>{categoryLabel}</strong>
            </div>

            <div className="detail-meta-card">
              <span className="detail-meta-label">Estado de compra</span>
              <strong>
                {qty > 0 ? `${qty} en tu carrito` : "Listo para agregar"}
              </strong>
            </div>
          </div>

          <div className="detail-pricing-panel">
            <div className="detail-section-head">
              <h2>Precio</h2>
            </div>

            <div className="detail-price-single">
              <div className="detail-price-label">
                <Tag size={16} />
                Precio por unidad
              </div>
              <div className="detail-price-value">
                {isConsult ? "Consultar" : formatPrice(producto.price)}
              </div>
            </div>
          </div>

          <div className="detail-purchase-card">
            <div className="detail-section-head">
              <h2>Compra</h2>
              {qty > 0 && (
                <span className="detail-total">
                  Total: {formatPrice(totalPrice)}
                </span>
              )}
            </div>

            {qty === 0 ? (
              <button
                className={`detail-cta${
                  isConsult ? " detail-cta--consult" : ""
                }`}
                onClick={handleAdd}
                type="button"
              >
                {isConsult ? (
                  <>
                    <MessageCircle size={18} />
                    Agregar para consultar
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Agregar al carrito - {formatPrice(producto.price)}
                  </>
                )}
              </button>
            ) : (
              <div className="detail-stepper">
                <button
                  className="detail-stepper__btn"
                  onClick={() => handleUpdateQty(qty - 1)}
                  aria-label="Disminuir cantidad"
                  type="button"
                >
                  -
                </button>

                <div className="detail-stepper__body">
                  <strong className="detail-stepper__qty">
                    {qty} unidades
                  </strong>
                  <span className="detail-stepper__tier">
                    {formatPrice(producto.price)} c/u
                  </span>
                </div>

                <button
                  className="detail-stepper__btn"
                  onClick={() => handleUpdateQty(qty + 1)}
                  aria-label="Aumentar cantidad"
                  type="button"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {sugeridos.length > 0 && (
        <section className="detail-sugeridos">
          <h2 className="detail-sugeridos__title">
            También te puede interesar
          </h2>
          <div className="detail-sugeridos__scroll">
            {sugeridos.map((p) => (
              <a
                key={p.id}
                href={`/productos/${p.id}`}
                className="detail-sug-card"
              >
                <div className="detail-sug-img">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="detail-sug-noimg">Sin imagen</div>
                  )}
                </div>
                <div className="detail-sug-body">
                  <p className="detail-sug-price">
                    {p.price === 0 ? "Consultar" : `S/ ${p.price.toFixed(2)}`}
                  </p>
                  <p className="detail-sug-name">{p.name}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
