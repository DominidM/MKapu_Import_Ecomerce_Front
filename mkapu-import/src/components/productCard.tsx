"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface Product {
  id: number;
  code: string;
  name: string;
  category: number | null;
  category_name?: string;
  description: string;
  price: number;
  featured: boolean;
  is_new?: boolean;
  low_stock?: boolean;
  image_url?: string;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem, items, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartItem = items.find((i) => i.id === String(product.id));
  const inCart = !!cartItem;
  const hasImage = !!product.image_url && !imgError;
  const isConsult = product.price === 0;

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (inCart) {
      removeItem(String(product.id));
    } else {
      addItem({
        id: String(product.id),
        code: product.code,
        name: product.name,
        price: product.price,
        itemTotal: product.price,
        imageUrl: product.image_url,
        emoji: "📦",
        product: { price: product.price },
      });
    }
  }

  function handleCardClick() {
    router.push(`/productos/${product.id}`);
  }

  return (
    <article className="pcard" onClick={handleCardClick}>
      <div className="pcard__media">
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
          </div>
        )}

        <button
          className={`pcard__heart${inCart ? " pcard__heart--active" : ""}`}
          onClick={handleHeartClick}
          aria-label={inCart ? "Quitar del carrito" : "Agregar al carrito"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={inCart ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {(product.is_new || product.featured || product.low_stock) && (
          <div className="pcard__badges">
            {product.is_new && <span className="pcard__badge pcard__badge--new">Nuevo</span>}
            {product.featured && <span className="pcard__badge pcard__badge--feat">Destacado</span>}
            {product.low_stock && <span className="pcard__badge pcard__badge--low">Últimas unidades</span>}
          </div>
        )}
      </div>

      <div className="pcard__body">
        <p className="pcard__price">
          {isConsult ? "Consultar" : `S/ ${product.price.toFixed(2)}`}
        </p>
        <h3 className="pcard__name">{product.name}</h3>
        <p className="pcard__cat">{product.category_name ?? ""}</p>
      </div>

      <style jsx>{`
        .pcard {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          background: #fff;
          border: none;
          position: relative;
        }
        .pcard__media {
          position: relative;
          background: #f5f5f5;
          aspect-ratio: 1/1;
          overflow: hidden;
        }
        .pcard__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .pcard:hover .pcard__img {
          transform: scale(1.04);
        }
        .pcard__no-img {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bbb;
        }
        .pcard__heart {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1a1a1a;
          transition: transform 0.15s, background 0.15s;
          z-index: 2;
        }
        .pcard__heart:hover {
          transform: scale(1.1);
          background: #f5f5f5;
        }
        .pcard__heart--active {
          color: #e05c2a;
          background: #fff1ec;
        }
        .pcard__badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 2;
        }
        .pcard__badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 3px;
          letter-spacing: 0.04em;
        }
        .pcard__badge--new { background: #f59e0b; color: #fff; }
        .pcard__badge--feat { background: #10b981; color: #fff; }
        .pcard__badge--low { background: #b91c1c; color: #fff; }
        .pcard__body {
          padding: 0.75rem 0.5rem 0.5rem;
        }
        .pcard__price {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 4px;
        }
        .pcard__name {
          font-size: 0.82rem;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0 0 3px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcard__cat {
          font-size: 0.75rem;
          color: #767677;
          margin: 0;
          font-weight: 400;
        }
      `}</style>
    </article>
  );
}