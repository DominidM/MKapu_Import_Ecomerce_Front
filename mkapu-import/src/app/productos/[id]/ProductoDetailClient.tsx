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
  Truck,
  Store,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import type { Producto } from "@/lib/supabase";

interface Props {
  producto: Producto & { category_name?: string | null };
  sugeridos: any[];
  promocionesMap: Record<number, { tipo_descuento: string; valor_descuento: number }>;
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

function calcDescuento(
  price: number,
  promo: { tipo_descuento: string; valor_descuento: number } | undefined,
): { precioFinal: number; descuentoTexto: string } | null {
  if (!promo) return null;
  let d = promo.tipo_descuento === "porcentaje"
    ? (price * promo.valor_descuento) / 100
    : promo.valor_descuento;
  const precioFinal = Math.max(0, price - d);
  const descuentoTexto = promo.tipo_descuento === "porcentaje"
    ? `${promo.valor_descuento}% OFF`
    : `S/ ${promo.valor_descuento.toFixed(2)} OFF`;
  return { precioFinal, descuentoTexto };
}

export default function ProductoDetailClient({ producto, sugeridos, promocionesMap }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [videos, setVideos] = useState<ProductoVideo[]>([]);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const cartItem = items.find((item) => item.id === String(producto.id));
  const qty = cartItem?.qty ?? 0;
  const isConsult = producto.price === 0;
  const isAgotado = producto.agotado === true;
  const descuento = calcDescuento(producto.price, promocionesMap[producto.id]);
  const precioFinal = descuento ? descuento.precioFinal : producto.price;
  const tieneDescuento = descuento && precioFinal < producto.price;
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
  const totalPrice = qty * precioFinal;

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) {
      removeItem(String(producto.id));
      return;
    }
    updateQty(String(producto.id), newQty);
  }
  function handleAdd() {
    if (isAgotado) return;
    addItem({
      id: String(producto.id),
      code: producto.code ?? "",
      name: producto.name,
      price: precioFinal,
      itemTotal: precioFinal,
      imageUrl: producto.image_url ?? undefined,
      emoji: "📦",
      product: {
        price: precioFinal,
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

              {isAgotado && (
                <span className="detail-badge detail-badge--agotado">
                  Agotado
                </span>
              )}

              {producto.is_new && !isAgotado && (
                <span className="detail-badge detail-badge--new">Nuevo</span>
              )}

              {producto.featured && !isAgotado && (
                <span className="detail-badge detail-badge--featured">
                  Destacado
                </span>
              )}
            </div>

            <div
              className={`detail-image-stage${currentMedia?.type === "video" ? " detail-image-stage--video" : ""}`}
            >
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
                {isConsult ? (
                  "Consultar"
                ) : tieneDescuento ? (
                  <>
                    <span className="detail-price-old">
                      {formatPrice(producto.price)}
                    </span>
                    <span className="detail-price-final">
                      {formatPrice(precioFinal)}
                    </span>
                    <span className="detail-price-badge">
                      {descuento!.descuentoTexto}
                    </span>
                  </>
                ) : (
                  formatPrice(producto.price)
                )}
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

            {isAgotado ? (
              <div className="detail-agotado-msg">
                <span className="detail-agotado-msg__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </span>
                Producto agotado
              </div>
            ) : qty === 0 ? (
              <button
                className={`detail-cta${isConsult ? " detail-cta--consult" : ""}`}
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
                    Agregar al carrito - {formatPrice(precioFinal)}
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
                    {tieneDescuento ? formatPrice(precioFinal) : formatPrice(producto.price)} c/u
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

          {/* Opciones de entrega */}
          <div className="detail-delivery-options">
            <div className="detail-delivery-item">
              <div className="detail-delivery-icon">
                <Truck size={22} />
              </div>
              <span className="detail-delivery-label">Disponible envío a domicilio</span>
            </div>

            <div className="detail-delivery-item">
              <div className="detail-delivery-icon">
                <Store size={22} />
              </div>
              <span className="detail-delivery-label">Disponible retiro en tienda</span>
            </div>
          </div>
        </div>
      </section>

      {sugeridos.length > 0 && (
        <section className="detail-sugeridos">
          <h2 className="detail-sugeridos__title">
            También te puede interesar
          </h2>
          <div className="detail-sugeridos__scroll">
            {sugeridos.map((p) => {
              const d = calcDescuento(p.price, promocionesMap[p.id]);
              const pf = d ? d.precioFinal : p.price;
              return (
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
                      {p.price === 0 ? "Consultar" : d ? (
                        <>
                          <span className="detail-sug-old">S/ {p.price.toFixed(2)}</span>
                          <span>S/ {pf.toFixed(2)}</span>
                        </>
                      ) : `S/ ${p.price.toFixed(2)}`}
                    </p>
                    <p className="detail-sug-name">{p.name}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}