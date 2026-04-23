"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  ImageOff,
  MessageCircle,
  Package,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import type { Producto } from "@/lib/supabase";

interface Props {
  producto: Producto;
}

function calcTier(
  qty: number,
  p: Producto,
): { price: number; tier: "caja" | "mayorista" | "unidad" } {
  const hasCaja = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!) {
    return { price: p.price_caja! / p.unidad_caja!, tier: "caja" };
  }
  if (hasMayorista && qty >= p.unidad_mayorista!) {
    return { price: p.price_mayorista!, tier: "mayorista" };
  }
  return { price: p.price, tier: "unidad" };
}

function calcTotal(qty: number, p: Producto): number {
  if (qty <= 0) return 0;

  const hasCaja = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!) {
    const cajas = Math.floor(qty / p.unidad_caja!);
    const sueltas = qty % p.unidad_caja!;
    const precioSueltas =
      hasMayorista && qty >= p.unidad_mayorista! ? p.price_mayorista! : p.price;

    return cajas * p.price_caja! + sueltas * precioSueltas;
  }

  if (hasMayorista && qty >= p.unidad_mayorista!) {
    return qty * p.price_mayorista!;
  }

  return qty * p.price;
}

function formatPrice(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

export default function ProductoDetailClient({ producto }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find((item) => item.id === String(producto.id));
  const qty = cartItem?.qty ?? 0;
  const hasImage = !!producto.image_url && !imgError;
  const hasCaja = !!producto.price_caja && !!producto.unidad_caja;
  const hasMayorista = !!producto.price_mayorista && !!producto.unidad_mayorista;
  const isConsult = producto.price === 0 && !hasCaja && !hasMayorista;

  const { tier: activeTier } = calcTier(qty, producto);
  const { price: activePriceNext } = calcTier(qty + 1, producto);

  const tierLabel =
    activeTier === "caja"
      ? `Precio caja (x${producto.unidad_caja} und.)`
      : activeTier === "mayorista"
        ? `Precio mayorista (desde ${producto.unidad_mayorista} und.)`
        : "Precio por unidad";

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) {
      removeItem(String(producto.id));
      return;
    }
    updateQty(String(producto.id), newQty);
  }

  function handleAdd() {
    const { price } = calcTier(1, producto);
    const itemTotal = calcTotal(1, producto);

    addItem({
      id: String(producto.id),
      name: producto.name,
      price,
      itemTotal,
      imageUrl: producto.image_url,
      emoji: "\ud83d\udce6",
      product: {
        price: producto.price,
        price_caja: producto.price_caja,
        unidad_caja: producto.unidad_caja,
        price_mayorista: producto.price_mayorista,
        unidad_mayorista: producto.unidad_mayorista,
      },
    });
  }

  const nextTierInfo =
    qty > 0 && activeTier !== "caja" && (hasMayorista || hasCaja)
      ? (() => {
          const nextThreshold =
            activeTier === "unidad" && hasMayorista
              ? producto.unidad_mayorista! - qty
              : hasCaja
                ? producto.unidad_caja! - qty
                : null;
          const nextPrice =
            activeTier === "unidad" && hasMayorista
              ? producto.price_mayorista!
              : hasCaja
                ? producto.price_caja!
                : null;
          const nextName =
            activeTier === "unidad" && hasMayorista ? "mayorista" : "caja";

          if (!nextThreshold || nextThreshold <= 0 || !nextPrice) return null;

          return {
            nextThreshold,
            nextPrice,
            nextName,
          };
        })()
      : null;

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
                {producto.category?.replace(/-/g, " ") || "Sin categoria"}
              </span>
              <button
                className={`detail-fav${wishlisted ? " detail-fav--on" : ""}`}
                onClick={() => setWishlisted((value) => !value)}
                aria-label="Agregar a favoritos"
                type="button"
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="detail-image-stage">
              {hasImage ? (
                <img
                  src={producto.image_url}
                  alt={producto.name}
                  className="detail-image"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="detail-image-empty">
                  <ImageOff size={48} strokeWidth={1.6} />
                  <span>Imagen no disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-main">
          <div className="detail-heading">
            <div className="detail-kicker">Detalle del producto</div>
            <h1 className="detail-title">{producto.name}</h1>
            <p className="detail-summary">
              {producto.description || "Este producto no tiene descripcion por ahora."}
            </p>
          </div>

          <div className="detail-meta">
            {producto.code && (
              <div className="detail-meta-card">
                <span className="detail-meta-label">Codigo</span>
                <strong>{producto.code}</strong>
              </div>
            )}
            <div className="detail-meta-card">
              <span className="detail-meta-label">Categoria</span>
              <strong>{producto.category?.replace(/-/g, " ") || "General"}</strong>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Estado de compra</span>
              <strong>{qty > 0 ? `${qty} en tu carrito` : "Listo para agregar"}</strong>
            </div>
          </div>

          <div className="detail-pricing-panel">
            <div className="detail-section-head">
              <h2>Opciones de precio</h2>
              <span className={`detail-tier-pill detail-tier-pill--${activeTier}`}>
                {tierLabel}
              </span>
            </div>

            <div className="detail-tier-grid">
              <div
                className={`detail-tier-card${
                  activeTier === "unidad" && qty > 0 ? " detail-tier-card--active" : ""
                }`}
              >
                <div className="detail-tier-card__head">
                  <span className="detail-tier-card__icon detail-tier-card__icon--orange">
                    <Tag size={16} />
                  </span>
                  <div>
                    <div className="detail-tier-card__name">Por unidad</div>
                    <div className="detail-tier-card__hint">Compra flexible</div>
                  </div>
                </div>
                <div className="detail-tier-card__price">
                  {isConsult ? "Consultar" : formatPrice(producto.price)}
                </div>
              </div>

              <div
                className={`detail-tier-card detail-tier-card--blue${
                  activeTier === "mayorista" && qty > 0
                    ? " detail-tier-card--active"
                    : ""
                }${!hasMayorista ? " detail-tier-card--disabled" : ""}`}
              >
                <div className="detail-tier-card__head">
                  <span className="detail-tier-card__icon detail-tier-card__icon--blue">
                    <Package size={16} />
                  </span>
                  <div>
                    <div className="detail-tier-card__name">Por mayor</div>
                    <div className="detail-tier-card__hint">
                      {hasMayorista
                        ? `Desde ${producto.unidad_mayorista} und.`
                        : "No disponible"}
                    </div>
                  </div>
                </div>
                <div className="detail-tier-card__price">
                  {hasMayorista ? formatPrice(producto.price_mayorista!) : "--"}
                </div>
              </div>

              <div
                className={`detail-tier-card detail-tier-card--green${
                  activeTier === "caja" && qty > 0 ? " detail-tier-card--active" : ""
                }${!hasCaja ? " detail-tier-card--disabled" : ""}`}
              >
                <div className="detail-tier-card__head">
                  <span className="detail-tier-card__icon detail-tier-card__icon--green">
                    <Package size={16} />
                  </span>
                  <div>
                    <div className="detail-tier-card__name">Caja</div>
                    <div className="detail-tier-card__hint">
                      {hasCaja ? `${producto.unidad_caja} und. por caja` : "No disponible"}
                    </div>
                  </div>
                </div>
                <div className="detail-tier-card__price">
                  {hasCaja ? formatPrice(producto.price_caja!) : "--"}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-purchase-card">
            <div className="detail-section-head">
              <h2>Compra</h2>
              {qty > 0 && <span className="detail-total">Total: {formatPrice(calcTotal(qty, producto))}</span>}
            </div>

            {qty === 0 ? (
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
                    Agregar al carrito - {formatPrice(activePriceNext)}
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
                  <strong className="detail-stepper__qty">{qty} unidades</strong>
                  <span className={`detail-stepper__tier detail-stepper__tier--${activeTier}`}>
                    {tierLabel}
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

            {nextTierInfo && (
              <div className={`detail-next detail-next--${nextTierInfo.nextName}`}>
                Compra {nextTierInfo.nextThreshold} mas y desbloquea el precio{" "}
                <strong>{nextTierInfo.nextName}</strong>:{" "}
                <strong>{formatPrice(nextTierInfo.nextPrice)}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .detail-shell {
          --bg-soft: linear-gradient(180deg, #fffaf3 0%, #ffffff 100%);
          --card: rgba(255, 255, 255, 0.9);
          --line: #eadfce;
          --text: #1f1a17;
          --muted: #72675f;
          --orange: #e05c2a;
          --orange-deep: #c84d1f;
          --orange-soft: #fff2ea;
          --blue: #0c8db0;
          --blue-soft: #e8f8fc;
          --green: #179653;
          --green-soft: #eaf8ef;
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px 16px 56px;
          color: var(--text);
        }

        .detail-topbar {
          margin-bottom: 18px;
        }

        .detail-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid #e6dccf;
          background: rgba(255, 255, 255, 0.86);
          color: #4d5b67;
          font-size: 0.92rem;
          font-weight: 600;
          text-decoration: none;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            color 0.18s ease;
        }

        .detail-back:hover {
          transform: translateY(-1px);
          border-color: #d7c6b0;
          background: #ffffff;
          color: var(--orange);
        }

        .detail-back__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #f6efe7;
          flex-shrink: 0;
        }

        .detail-hero {
          display: grid;
          grid-template-columns: minmax(320px, 520px) minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .detail-visual-rail {
          position: relative;
          align-self: start;
        }

        .detail-visual-card,
        .detail-pricing-panel,
        .detail-purchase-card {
          background: var(--card);
          border: 1px solid rgba(234, 223, 206, 0.9);
          box-shadow: 0 16px 40px rgba(78, 52, 24, 0.08);
          backdrop-filter: blur(10px);
        }

        .detail-visual-card {
          position: sticky;
          top: 98px;
          padding: 18px;
          border-radius: 28px;
          background: var(--bg-soft);
        }

        .detail-visual-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-chip {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .detail-chip--soft {
          background: #fff;
          border: 1px solid #ebdfcf;
          color: #6b625b;
        }

        .detail-fav {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #ebdfcf;
          background: #fff;
          color: #b9a59a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease;
        }

        .detail-fav:hover {
          transform: scale(1.05);
          color: #ef4444;
          border-color: #f2b4b4;
        }

        .detail-fav--on {
          color: #ef4444;
          border-color: #f2b4b4;
        }

        .detail-image-stage {
          aspect-ratio: 1 / 1;
          border-radius: 22px;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, #fff7ef 0%, #f2ece5 55%, #ebe4db 100%);
          border: 1px solid #ece3d7;
        }

        .detail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .detail-image-empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #b4aaa3;
          font-size: 0.95rem;
        }

        .detail-main {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-heading {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-kicker {
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--orange);
        }

        .detail-title {
          font-size: clamp(2rem, 4vw, 3.3rem);
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .detail-summary {
          max-width: 70ch;
          margin: 0;
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.7;
        }

        .detail-meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .detail-meta-card {
          padding: 16px;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #ece3d6;
          box-shadow: 0 10px 24px rgba(59, 41, 17, 0.05);
          min-height: 94px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
        }

        .detail-meta-label {
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #95877d;
          font-weight: 700;
        }

        .detail-meta-card strong {
          font-size: 0.98rem;
          line-height: 1.35;
        }

        .detail-pricing-panel,
        .detail-purchase-card {
          border-radius: 24px;
          padding: 22px;
          background: #fff;
        }

        .detail-section-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-section-head h2 {
          margin: 0;
          font-size: 1.08rem;
        }

        .detail-tier-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .detail-tier-pill--unidad {
          color: var(--orange);
          background: var(--orange-soft);
        }

        .detail-tier-pill--mayorista {
          color: var(--blue);
          background: var(--blue-soft);
        }

        .detail-tier-pill--caja {
          color: var(--green);
          background: var(--green-soft);
        }

        .detail-tier-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .detail-tier-card {
          border-radius: 18px;
          border: 1px solid #ece2d6;
          background: linear-gradient(180deg, #ffffff 0%, #fcfaf7 100%);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          min-height: 164px;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .detail-tier-card--active {
          border-color: #f0b39a;
          box-shadow: 0 14px 26px rgba(224, 92, 42, 0.12);
          transform: translateY(-2px);
        }

        .detail-tier-card--blue.detail-tier-card--active {
          border-color: #9fd9e7;
          box-shadow: 0 14px 26px rgba(12, 141, 176, 0.12);
        }

        .detail-tier-card--green.detail-tier-card--active {
          border-color: #a7dfbd;
          box-shadow: 0 14px 26px rgba(23, 150, 83, 0.12);
        }

        .detail-tier-card--disabled {
          opacity: 0.56;
        }

        .detail-tier-card__head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .detail-tier-card__icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-tier-card__icon--orange {
          background: var(--orange-soft);
          color: var(--orange);
        }

        .detail-tier-card__icon--blue {
          background: var(--blue-soft);
          color: var(--blue);
        }

        .detail-tier-card__icon--green {
          background: var(--green-soft);
          color: var(--green);
        }

        .detail-tier-card__name {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .detail-tier-card__hint {
          font-size: 0.82rem;
          color: #8d8178;
          line-height: 1.35;
        }

        .detail-tier-card__price {
          font-size: 1.38rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .detail-total {
          font-size: 0.92rem;
          color: #4d5b67;
          font-weight: 700;
        }

        .detail-cta {
          width: 100%;
          min-height: 54px;
          border: none;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 18px;
          background: linear-gradient(135deg, var(--orange) 0%, #f07a4c 100%);
          color: #fff;
          font-size: 0.98rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(224, 92, 42, 0.22);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            filter 0.18s ease;
        }

        .detail-cta:hover {
          transform: translateY(-2px);
          filter: saturate(1.05);
          box-shadow: 0 18px 32px rgba(224, 92, 42, 0.28);
        }

        .detail-cta--consult {
          background: linear-gradient(135deg, #25d366 0%, #18b957 100%);
          box-shadow: 0 14px 28px rgba(37, 211, 102, 0.22);
        }

        .detail-stepper {
          display: grid;
          grid-template-columns: 56px 1fr 56px;
          gap: 12px;
          align-items: center;
          padding: 10px;
          border-radius: 18px;
          background: #f8f5f1;
          border: 1px solid #ece2d6;
        }

        .detail-stepper__btn {
          min-height: 56px;
          border: 1px solid #e6dbcf;
          border-radius: 14px;
          background: #fff;
          color: var(--text);
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease;
        }

        .detail-stepper__btn:hover {
          background: var(--orange);
          color: #fff;
          border-color: var(--orange);
        }

        .detail-stepper__body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-align: center;
          min-height: 56px;
        }

        .detail-stepper__qty {
          font-size: 1rem;
        }

        .detail-stepper__tier {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .detail-stepper__tier--unidad {
          color: var(--orange);
        }

        .detail-stepper__tier--mayorista {
          color: var(--blue);
        }

        .detail-stepper__tier--caja {
          color: var(--green);
        }

        .detail-next {
          margin-top: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 0.92rem;
          line-height: 1.5;
          border: 1px solid #f2d7c8;
          background: #fff5ef;
          color: #6f432d;
        }

        .detail-next--mayorista {
          border-color: #cfeef6;
          background: #f1fbfe;
          color: #0f6177;
        }

        .detail-next--caja {
          border-color: #cfead7;
          background: #f1fbf4;
          color: #1d6942;
        }

        @media (max-width: 1080px) {
          .detail-hero {
            grid-template-columns: 1fr;
          }

          .detail-visual-rail {
            position: static;
          }

          .detail-visual-card {
            position: static;
            top: auto;
          }

          .detail-tier-grid,
          .detail-meta {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 720px) {
          .detail-shell {
            padding: 18px 14px 42px;
          }

          .detail-title {
            font-size: 1.9rem;
          }

          .detail-meta,
          .detail-tier-grid {
            grid-template-columns: 1fr;
          }

          .detail-pricing-panel,
          .detail-purchase-card,
          .detail-visual-card {
            border-radius: 22px;
          }

          .detail-section-head {
            flex-direction: column;
            align-items: stretch;
          }

          .detail-tier-pill {
            width: fit-content;
          }
        }

        @media (max-width: 520px) {
          .detail-stepper {
            grid-template-columns: 48px 1fr 48px;
          }

          .detail-stepper__btn {
            min-height: 48px;
          }

          .detail-back {
            font-size: 0.86rem;
          }
        }
      `}</style>
    </div>
  );
}
