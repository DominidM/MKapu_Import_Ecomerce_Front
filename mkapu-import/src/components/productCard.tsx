"use client";

import { useState } from "react";
import { Heart, ShoppingCart, MessageCircle, ImageOff } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  price: number;           // precio por unidad
  oldPrice?: number;
  pricemCaja?: number;     // precio por caja completa
  unidadcaja?: number;     // unidades por caja
  priceMayorista?: number; // precio por mayor
  unidadMayorista?: number;// mínimo unidades para mayorista
  featured: boolean;
  imageUrl?: string;
}

interface Props {
  product: Product;
}

type PriceTier = "unidad" | "mayorista" | "caja";

export default function ProductCard({ product }: Props) {
  const { addItem, items, updateQty, removeItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded]           = useState(false);
  const [imgError, setImgError]     = useState(false);
  const [tier, setTier]             = useState<PriceTier>("unidad");

  const cartItem = items.find((i) => i.id === String(product.id));
  const qty      = cartItem?.qty ?? 0;
  const hasImage = !!product.imageUrl && !imgError;

  const hasCaja      = !!product.pricemCaja && !!product.unidadcaja;
  const hasMayorista = !!product.priceMayorista && !!product.unidadMayorista;
  const isConsult    = product.price === 0 && !hasCaja && !hasMayorista;

  // precio activo según tier
  const activePrice =
    tier === "caja"       ? (product.pricemCaja ?? product.price) :
    tier === "mayorista"  ? (product.priceMayorista ?? product.price) :
    product.price;

  const activeQtyLabel =
    tier === "caja"      ? `Caja × ${product.unidadcaja} und.` :
    tier === "mayorista" ? `Desde ${product.unidadMayorista} und.` :
    "Por unidad";

  function handleAdd() {
    addItem({
      id:    String(product.id),
      name:  `${product.name}${tier !== "unidad" ? ` (${activeQtyLabel})` : ""}`,
      price: activePrice,
      emoji: "📦",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  }

  return (
    <article className={`pcard${added ? " pcard--pop" : ""}`}>

      {/* ── MEDIA ── */}
      <div className="pcard__media">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="pcard__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="pcard__no-img">
            <ImageOff size={30} strokeWidth={1.5} />
            <span>Sin imagen</span>
          </div>
        )}

        <button
          className={`pcard__wish${wishlisted ? " pcard__wish--active" : ""}`}
          onClick={() => setWishlisted((v) => !v)}
          aria-label={wishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {qty > 0 && <span className="pcard__badge pcard__badge--qty">{qty}</span>}
      </div>

      {/* ── BODY ── */}
      <div className="pcard__body">
        <p className="pcard__cat">{product.category.replace(/-/g, " ")}</p>
        <h3 className="pcard__name">{product.name}</h3>
        {product.description && <p className="pcard__desc">{product.description}</p>}

        {/* ── PRICE TIERS ── */}
        {!isConsult && (
          <div className="pcard__tiers">

            {/* Por unidad */}
            <button
              className={`pcard__tier${tier === "unidad" ? " pcard__tier--active" : ""}`}
              onClick={() => setTier("unidad")}
            >
              <span className="pcard__tier-label">Por unidad</span>
              <span className="pcard__tier-price">
                {product.price > 0 ? `S/ ${product.price.toFixed(2)}` : "Consultar"}
              </span>
            </button>

            {/* Mayorista */}
            {hasMayorista && (
              <button
                className={`pcard__tier${tier === "mayorista" ? " pcard__tier--active" : ""}`}
                onClick={() => setTier("mayorista")}
              >
                <span className="pcard__tier-label">
                  Por mayor
                  <em>desde {product.unidadMayorista} und.</em>
                </span>
                <span className="pcard__tier-price pcard__tier-price--better">
                  S/ {product.priceMayorista!.toFixed(2)}
                </span>
              </button>
            )}

            {/* Caja */}
            {hasCaja && (
              <button
                className={`pcard__tier${tier === "caja" ? " pcard__tier--active" : ""}`}
                onClick={() => setTier("caja")}
              >
                <span className="pcard__tier-label">
                  Caja
                  <em>× {product.unidadcaja} und.</em>
                </span>
                <span className="pcard__tier-price pcard__tier-price--best">
                  S/ {product.pricemCaja!.toFixed(2)}
                </span>
              </button>
            )}
          </div>
        )}

        {isConsult && (
          <p className="pcard__consult-label">Precio a consultar</p>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="pcard__actions">
        {qty === 0 ? (
          <button
            className={`pcard__btn${isConsult ? " pcard__btn--consult" : ""}`}
            onClick={handleAdd}
          >
            {isConsult
              ? <><MessageCircle size={16} /> Agregar para consultar</>
              : <><ShoppingCart size={16} /> Agregar — S/ {activePrice.toFixed(2)}</>
            }
          </button>
        ) : (
          <div className="pcard__qty-row">
            <button
              className="pcard__qty-btn"
              onClick={() => qty === 1 ? removeItem(String(product.id)) : updateQty(String(product.id), qty - 1)}
            >−</button>
            <span className="pcard__qty-val">{qty} en carrito</span>
            <button
              className="pcard__qty-btn"
              onClick={() => updateQty(String(product.id), qty + 1)}
            >+</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pcard {
          --accent: #e05c2a; --accent-light: #fff1ec; --accent-hover: #c44d20;
          --consult: #25d366; --consult-hover: #1da851;
          --text: #1a1a1a; --muted: #888; --border: #ede8e1; --radius: 18px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          display: flex; flex-direction: column;
          overflow: hidden;
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .pcard:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.13); transform: translateY(-4px); }
        .pcard--pop { animation: pop 0.32s cubic-bezier(.36,.07,.19,.97); }
        @keyframes pop { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 70%{transform:scale(0.97)} 100%{transform:scale(1)} }

        /* MEDIA */
        .pcard__media { position:relative; height:180px; flex-shrink:0; background:#f5f2ee; overflow:hidden; }
        .pcard__img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.5s ease; }
        .pcard:hover .pcard__img { transform:scale(1.06); }
        .pcard__no-img { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:#ccc; font-size:0.72rem; }

        .pcard__wish { position:absolute; top:10px; right:10px; width:32px; height:32px; border-radius:50%; border:none; background:rgba(255,255,255,0.92); backdrop-filter:blur(4px); box-shadow:0 2px 8px rgba(0,0,0,0.12); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:color 0.15s,transform 0.15s; z-index:1; }
        .pcard__wish:hover { transform:scale(1.15); }
        .pcard__wish--active { color:#ef4444; }

        .pcard__badge { position:absolute; font-size:0.62rem; font-weight:700; border-radius:99px; padding:3px 8px; border:2px solid #fff; z-index:1; }
        .pcard__badge--qty { bottom:8px; right:10px; background:var(--accent); color:#fff; animation:badgeIn 0.2s ease; }
        @keyframes badgeIn { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }

        /* BODY */
        .pcard__body { padding:0.9rem 0.9rem 0.5rem; flex:1; display:flex; flex-direction:column; gap:0.22rem; }
        .pcard__cat  { font-size:0.63rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin:0; }
        .pcard__name { font-size:0.88rem; font-weight:800; color:var(--text); margin:0; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .pcard__desc { font-size:0.72rem; color:var(--muted); margin:0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        /* PRICE TIERS */
        .pcard__tiers { display:flex; flex-direction:column; gap:5px; margin-top:6px; }

        .pcard__tier {
          display:flex; align-items:center; justify-content:space-between;
          padding:6px 9px; border-radius:9px; border:1.5px solid #ede8e1;
          background:#faf8f5; cursor:pointer; text-align:left;
          transition:border-color 0.15s, background 0.15s;
          gap:6px;
        }
        .pcard__tier:hover { border-color:#e05c2a; background:#fff1ec; }
        .pcard__tier--active { border-color:#e05c2a; background:#fff1ec; }

        .pcard__tier-label {
          display:flex; flex-direction:column; gap:1px;
          font-size:0.72rem; font-weight:600; color:var(--text); line-height:1.2;
        }
        .pcard__tier-label em { font-style:normal; font-size:0.65rem; color:var(--muted); font-weight:400; }

        .pcard__tier-price { font-size:0.85rem; font-weight:900; color:var(--text); white-space:nowrap; }
        .pcard__tier-price--better { color:#0891b2; }
        .pcard__tier-price--best   { color:#16a34a; }

        .pcard__consult-label { font-size:0.8rem; font-weight:600; color:var(--muted); margin-top:6px; }

        /* ACTIONS */
        .pcard__actions { padding:0.65rem 0.9rem 0.9rem; }
        .pcard__btn { width:100%; display:flex; align-items:center; justify-content:center; gap:7px; padding:0.62rem 1rem; border-radius:12px; border:none; font-size:0.83rem; font-weight:700; cursor:pointer; background:var(--accent); color:#fff; transition:background 0.18s,transform 0.12s,box-shadow 0.18s; }
        .pcard__btn:hover { background:var(--accent-hover); box-shadow:0 4px 14px rgba(224,92,42,0.35); transform:translateY(-1px); }
        .pcard__btn:active { transform:scale(0.97); }
        .pcard__btn--consult { background:var(--consult); }
        .pcard__btn--consult:hover { background:var(--consult-hover); }

        .pcard__qty-row { display:flex; align-items:center; background:var(--accent-light); border-radius:12px; overflow:hidden; }
        .pcard__qty-btn { background:transparent; border:none; color:var(--accent); font-size:1.2rem; font-weight:700; width:38px; height:38px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; flex-shrink:0; }
        .pcard__qty-btn:hover { background:#fbd5c5; }
        .pcard__qty-val { flex:1; text-align:center; font-size:0.78rem; font-weight:700; color:var(--text); white-space:nowrap; }
      `}</style>
    </article>
  );
}