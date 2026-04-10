"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, MessageCircle } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

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
  product: Product;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "maquina-hielo":  "🧊",
  "refrigeracion":  "❄️",
  "cocina":         "🍳",
  "bebidas":        "🥤",
  "panaderia":      "🍞",
  "lavanderia":     "🫧",
  "default":        "📦",
};

function getCategoryEmoji(cat: string) {
  return CATEGORY_EMOJI[cat] ?? CATEGORY_EMOJI["default"];
}

export default function ProductCard({ product }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.id === String(product.id));
  const qty = cartItem?.qty ?? 0;
  const emoji = getCategoryEmoji(product.category);

  const hasDiscount = product.oldPrice > product.price && product.oldPrice > 0;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const isConsult = product.price === 0;

  function handleAdd() {
    addItem({ id: String(product.id), name: product.name, price: product.price, emoji });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <article className={`pcard${added ? " pcard--pop" : ""}`}>

      {/* ── IMAGE / EMOJI AREA ── */}
      <div className="pcard__media">
        <span className="pcard__emoji">{emoji}</span>

        {/* Wishlist */}
        <button
          className={`pcard__wish${wishlisted ? " pcard__wish--active" : ""}`}
          onClick={() => setWishlisted((v) => !v)}
          aria-label={wishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={17} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Badges */}
        {hasDiscount && (
          <span className="pcard__badge pcard__badge--sale">-{discountPct}%</span>
        )}
        {isConsult && (
          <span className="pcard__badge pcard__badge--consult">Consultar</span>
        )}
        {qty > 0 && (
          <span className="pcard__badge pcard__badge--qty">{qty}</span>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="pcard__body">
        <p className="pcard__cat">{product.category.replace(/-/g, " ")}</p>
        <h3 className="pcard__name">{product.name}</h3>

        {/* Stars (decorative — no rating field in JSON) */}
        <div className="pcard__stars" aria-hidden="true">
          {[1,2,3,4,5].map((i) => (
            <Star key={i} size={13} className={i <= 4 ? "star--on" : "star--off"} fill={i <= 4 ? "currentColor" : "none"} />
          ))}
          <span className="pcard__reviews">4.0</span>
        </div>

        {product.description && (
          <p className="pcard__desc">{product.description}</p>
        )}

        {/* Price */}
        <div className="pcard__prices">
          {isConsult ? (
            <span className="pcard__price pcard__price--consult">Precio a consultar</span>
          ) : (
            <>
              <span className="pcard__price">S/ {product.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="pcard__old">S/ {product.oldPrice.toFixed(2)}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="pcard__actions">
        {qty === 0 ? (
          <button
            className={`pcard__btn${isConsult ? " pcard__btn--consult" : ""}`}
            onClick={handleAdd}
          >
            {isConsult ? (
              <><MessageCircle size={17} /> Agregar para consultar</>
            ) : (
              <><ShoppingCart size={17} /> Agregar al carrito</>
            )}
          </button>
        ) : (
          <div className="pcard__qty-row">
            <button
              className="pcard__qty-btn"
              onClick={() => qty === 1 ? removeItem(String(product.id)) : updateQty(String(product.id), qty - 1)}
              aria-label="Reducir"
            >−</button>
            <span className="pcard__qty-val">{qty} en carrito</span>
            <button
              className="pcard__qty-btn"
              onClick={() => updateQty(String(product.id), qty + 1)}
              aria-label="Aumentar"
            >+</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pcard {
          --accent:       #e05c2a;
          --accent-light: #fff1ec;
          --accent-hover: #c44d20;
          --consult:      #25d366;
          --consult-hover:#1da851;
          --text:         #1a1a1a;
          --muted:        #888;
          --border:       #ede8e1;
          --bg:           #ffffff;
          --radius:       18px;

          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: box-shadow 0.22s, transform 0.22s;
        }

        .pcard:hover {
          box-shadow: 0 10px 32px rgba(0,0,0,0.13);
          transform: translateY(-4px);
        }

        .pcard--pop { animation: pop 0.32s cubic-bezier(.36,.07,.19,.97); }
        @keyframes pop {
          0%  { transform: scale(1); }
          40% { transform: scale(1.05); }
          70% { transform: scale(0.97); }
          100%{ transform: scale(1); }
        }

        /* MEDIA */
        .pcard__media {
          position: relative;
          background: #faf7f3;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          flex-shrink: 0;
        }

        .pcard__emoji {
          font-size: 3.5rem;
          user-select: none;
          transition: transform 0.3s;
        }

        .pcard:hover .pcard__emoji { transform: scale(1.15) rotate(-4deg); }

        /* Wishlist btn */
        .pcard__wish {
          position: absolute;
          top: 10px; right: 10px;
          width: 34px; height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--muted);
          transition: color 0.15s, transform 0.15s, background 0.15s;
        }

        .pcard__wish:hover          { transform: scale(1.15); background: #fff; }
        .pcard__wish--active        { color: #ef4444; }

        /* Badges */
        .pcard__badge {
          position: absolute;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 99px;
          padding: 3px 9px;
          border: 2px solid #fff;
        }

        .pcard__badge--sale    { top: 10px; left: 10px; background: #ef4444; color: #fff; }
        .pcard__badge--consult { top: 10px; left: 10px; background: #25d366; color: #fff; }
        .pcard__badge--qty     { bottom: 8px; right: 10px; background: var(--accent); color: #fff; animation: badgeIn 0.2s ease; }

        @keyframes badgeIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* BODY */
        .pcard__body {
          padding: 1rem 1rem 0.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .pcard__cat {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0;
        }

        .pcard__name {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pcard__stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #fbbf24;
        }

        :global(.star--off) { color: #d1d5db; }

        .pcard__reviews {
          font-size: 0.72rem;
          color: var(--muted);
          margin-left: 4px;
        }

        .pcard__desc {
          font-size: 0.76rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pcard__prices {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 2px;
        }

        .pcard__price {
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--accent);
        }

        .pcard__price--consult {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--muted);
        }

        .pcard__old {
          font-size: 0.8rem;
          color: var(--muted);
          text-decoration: line-through;
        }

        /* ACTIONS */
        .pcard__actions {
          padding: 0.75rem 1rem 1rem;
        }

        .pcard__btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.65rem 1rem;
          border-radius: 12px;
          border: none;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          background: var(--accent);
          color: #fff;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }

        .pcard__btn:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 14px rgba(224,92,42,0.35);
          transform: translateY(-1px);
        }

        .pcard__btn:active { transform: scale(0.97); }

        .pcard__btn--consult          { background: var(--consult); }
        .pcard__btn--consult:hover    { background: var(--consult-hover); box-shadow: 0 4px 14px rgba(37,211,102,0.35); }

        .pcard__qty-row {
          display: flex;
          align-items: center;
          background: var(--accent-light);
          border-radius: 12px;
          overflow: hidden;
        }

        .pcard__qty-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          font-size: 1.2rem;
          font-weight: 700;
          width: 40px; height: 40px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
          flex-shrink: 0;
        }

        .pcard__qty-btn:hover { background: #fbd5c5; }

        .pcard__qty-val {
          flex: 1;
          text-align: center;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
        }
      `}</style>
    </article>
  );
}