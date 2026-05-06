"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, MessageCircle, ImageOff } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number;
  code: string;
  name: string;
  category: number;
  category_name?: string;
  description: string;
  price: number;
  old_price?: number;
  price_caja?: number;
  unidad_caja?: number;
  price_mayorista?: number;
  unidad_mayorista?: number;
  featured: boolean;
  is_new?: boolean;
  low_stock?: boolean; // ← nuevo campo
  image_url?: string;
}

interface Props {
  product: Product;
}

function calcTier(
  qty: number,
  p: Product,
): { price: number; tier: "caja" | "mayorista" | "unidad" } {
  const hasCaja = !!p.price_caja && !!p.unidad_caja;
  const hasMayorista = !!p.price_mayorista && !!p.unidad_mayorista;

  if (hasCaja && qty >= p.unidad_caja!)
    return { price: p.price_caja! / p.unidad_caja!, tier: "caja" };
  if (hasMayorista && qty >= p.unidad_mayorista!)
    return { price: p.price_mayorista!, tier: "mayorista" };
  return { price: p.price, tier: "unidad" };
}

function calcTotal(qty: number, p: Product): number {
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

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem, items, updateQty, removeItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find((i) => i.id === String(product.id));
  const qty = cartItem?.qty ?? 0;
  const hasImage = !!product.image_url && !imgError;

  const hasCaja = !!product.price_caja && !!product.unidad_caja;
  const hasMayorista = !!product.price_mayorista && !!product.unidad_mayorista;
  const isConsult = product.price === 0 && !hasCaja && !hasMayorista;

  const { price: activePriceCart, tier: activeTier } = calcTier(qty, product);
  const { price: activePriceNext } = calcTier(qty + 1, product);

  function handleUpdateQty(newQty: number) {
    if (newQty <= 0) {
      removeItem(String(product.id));
      return;
    }
    updateQty(String(product.id), newQty);
  }

  function handleAdd() {
    const { price } = calcTier(1, product);
    const itemTotal = calcTotal(1, product);
    addItem({
      id: String(product.id),
      name: product.name,
      price,
      itemTotal,
      imageUrl: product.image_url,
      emoji: "📦",
      product: {
        price: product.price,
        price_caja: product.price_caja,
        unidad_caja: product.unidad_caja,
        price_mayorista: product.price_mayorista,
        unidad_mayorista: product.unidad_mayorista,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  function handleCardClick() {
    router.push(`/productos/${product.id}`);
  }

  return (
    <article className={`pcard${added ? " pcard--pop" : ""}`}>
      <div
        className="pcard__media"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="pcard__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="pcard__no-img">
            <ImageOff size={28} strokeWidth={1.5} />
            <span>Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        {product.is_new && (
          <span className="pcard__badge pcard__badge--new">Nuevo</span>
        )}
        {product.featured && (
          <span className="pcard__badge pcard__badge--featured">Destacado</span>
        )}
        {product.low_stock && (
          <span className="pcard__badge pcard__badge--low">
            Últimas unidades
          </span>
        )}

        {qty > 0 && (
          <span className={`pcard__qty-badge pcard__qty-badge--${activeTier}`}>
            {qty}
          </span>
        )}
      </div>

      <div
        className="pcard__body"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <p className="pcard__cat">
          {product.category_name ?? product.category}
        </p>
        <h3 className="pcard__name">{product.name}</h3>
        <p className="pcard__desc">{product.description || "\u00a0"}</p>
      </div>

      <div
        className="pcard__price"
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        <span className="pcard__price-label">Precio por unidad</span>
        <span className="pcard__price-value">
          {isConsult ? "Consultar" : `S/ ${product.price.toFixed(2)}`}
        </span>
      </div>

      <div className="pcard__actions">
        {qty === 0 ? (
          <button
            className={`pcard__btn${isConsult ? " pcard__btn--wsp" : ""}`}
            onClick={handleAdd}
          >
            {isConsult ? (
              <>
                <MessageCircle size={15} /> Agregar para consultar
              </>
            ) : (
              <>
                <ShoppingCart size={15} /> Agregar — S/{" "}
                {activePriceNext.toFixed(2)}
              </>
            )}
          </button>
        ) : (
          <div className="pcard__stepper">
            <button
              className="pcard__step"
              onClick={() => handleUpdateQty(qty - 1)}
            >
              −
            </button>
            <div className="pcard__step-info">
              <span className="pcard__step-qty">{qty} und.</span>
              <span className="pcard__step-tier">
                S/ {activePriceCart.toFixed(2)} c/u
              </span>
            </div>
            <button
              className="pcard__step"
              onClick={() => handleUpdateQty(qty + 1)}
            >
              +
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pcard {
          --accent: #e05c2a;
          --accent-h: #c44d20;
          --accent-bg: #fff1ec;
          --wsp: #25d366;
          --wsp-h: #1da851;
          --text: #1a1a1a;
          --muted: #999;
          --border: #ede8e1;

          display: grid;
          grid-template-rows: 170px auto 56px 52px;
          height: 100%;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          transition:
            box-shadow 0.22s,
            transform 0.22s;
          position: relative;
        }
        .pcard:hover {
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.13);
          transform: translateY(-4px);
        }
        .pcard--pop {
          animation: pop 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.06);
          }
          70% {
            transform: scale(0.97);
          }
          100% {
            transform: scale(1);
          }
        }

        .pcard__media {
          position: relative;
          background: #f5f2ee;
          overflow: hidden;
        }
        .pcard__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s;
        }
        .pcard:hover .pcard__img {
          transform: scale(1.06);
        }
        .pcard__no-img {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #ccc;
          font-size: 0.7rem;
        }

        .pcard__badge {
          position: absolute;
          left: 9px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          padding: 3px 9px;
          border-radius: 6px;
          text-transform: uppercase;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .pcard__badge--new {
          top: 9px;
          background: #f59e0b;
          color: #fff;
        }
        .pcard__badge--featured {
          top: 34px;
          background: #10b981;
          color: #fff;
        }
        .pcard__badge--low {
          top: 59px;
          background: #b91c1c;
          color: #fff;
        }

        .pcard__qty-badge {
          position: absolute;
          bottom: 7px;
          right: 9px;
          font-size: 0.6rem;
          font-weight: 800;
          border-radius: 99px;
          padding: 2px 7px;
          border: 2px solid #fff;
          z-index: 1;
          animation: bdg 0.2s ease;
          background: var(--accent);
          color: #fff;
        }
        @keyframes bdg {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .pcard__body {
          padding: 0.75rem 0.85rem 0.4rem;
          overflow: hidden;
        }
        .pcard__cat {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 3px;
        }
        .pcard__name {
          font-size: 0.86rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 4px;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcard__desc {
          font-size: 0.71rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pcard__price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.85rem;
          height: 56px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: #fafaf9;
        }
        .pcard__price-label {
          font-size: 0.71rem;
          font-weight: 600;
          color: var(--text);
        }
        .pcard__price-value {
          font-size: 0.92rem;
          font-weight: 900;
          color: var(--accent);
        }

        .pcard__actions {
          padding: 7px 0.85rem;
          display: flex;
          align-items: center;
        }
        .pcard__btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 38px;
          border-radius: 10px;
          border: none;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          background: var(--accent);
          color: #fff;
          transition:
            background 0.15s,
            transform 0.12s,
            box-shadow 0.15s;
        }
        .pcard__btn:hover {
          background: var(--accent-h);
          box-shadow: 0 4px 12px rgba(224, 92, 42, 0.35);
          transform: translateY(-1px);
        }
        .pcard__btn:active {
          transform: scale(0.97);
        }
        .pcard__btn--wsp {
          background: var(--wsp);
        }
        .pcard__btn--wsp:hover {
          background: var(--wsp-h);
        }

        .pcard__stepper {
          width: 100%;
          display: flex;
          align-items: center;
          background: var(--accent-bg);
          border-radius: 10px;
          overflow: hidden;
          height: 38px;
        }
        .pcard__step {
          background: transparent;
          border: none;
          color: var(--accent);
          font-size: 1.3rem;
          font-weight: 700;
          width: 36px;
          height: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .pcard__step:hover {
          background: #fbd5c5;
        }
        .pcard__step-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }
        .pcard__step-qty {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
        }
        .pcard__step-tier {
          font-size: 0.58rem;
          font-weight: 600;
          line-height: 1;
          color: var(--accent);
        }
      `}</style>
    </article>
  );
}
