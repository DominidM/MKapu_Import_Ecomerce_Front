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
  agotado?: boolean;
  image_url?: string;
  descuento?: { tipo_descuento: string; valor_descuento: number };
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem, items, removeItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cartItem = items.find((i) => i.id === String(product.id));
  const isAgotado = product.agotado === true;
  const inCart = !!cartItem;
  const hasImage = !!product.image_url && !imgError;
  const isConsult = product.price === 0;

  const descuento = product.descuento;
  let precioFinal = product.price;
  let descuentoTexto = "";
  if (descuento && !isAgotado) {
    if (descuento.tipo_descuento === "porcentaje") {
      precioFinal = product.price * (1 - descuento.valor_descuento / 100);
      descuentoTexto = `${descuento.valor_descuento}% OFF`;
    } else {
      precioFinal = Math.max(0, product.price - descuento.valor_descuento);
      descuentoTexto = `-S/${descuento.valor_descuento.toFixed(2)}`;
    }
  }
  const tieneDescuento = !!descuento && precioFinal < product.price;

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isAgotado) return;
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

  // Badge base compartido
  const badgeBase: React.CSSProperties = {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "3px 8px",
    borderRadius: "3px",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    color: "#fff",
    lineHeight: 1.4,
  };

  const topTags = [
    product.is_new && {
      key: "new",
      label: "Nuevo",
      style: { ...badgeBase, background: "#f59e0b" },
    },
    product.low_stock &&
      !isAgotado && {
        key: "low",
        label: "Últimas unidades",
        style: { ...badgeBase, background: "#b91c1c" },
      },
    isAgotado && {
      key: "agotado",
      label: "Agotado",
      style: { ...badgeBase, background: "#1a1a1a" },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    style: React.CSSProperties;
  }[];

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "none",
        position: "relative",
      }}
    >
      {/* ── Imagen ── */}
      <div
        style={{
          position: "relative",
          background: "#f5f5f5",
          aspectRatio: "1/1",
          overflow: "hidden",
        }}
      >
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#bbb",
            }}
          >
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Corazón */}
        <button
          onClick={handleHeartClick}
          disabled={isAgotado}
          aria-label={inCart ? "Quitar del carrito" : "Agregar al carrito"}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: inCart ? "#fff1ec" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isAgotado ? "not-allowed" : "pointer",
            color: inCart ? "#e05c2a" : "#1a1a1a",
            opacity: isAgotado ? 0.3 : 1,
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={inCart ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* ✅ Tags arriba-izquierda — fila horizontal, se envuelven si no caben */}
        {topTags.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              // Deja espacio para el corazón (36px botón + 10px right + 6px gap = 52px)
              maxWidth: "calc(100% - 62px)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "4px",
              zIndex: 2,
            }}
          >
            {topTags.map(({ key, label, style }) => (
              <span key={key} style={style}>
                {label}
              </span>
            ))}
          </div>
        )}

        {/* ✅ Badge promoción — abajo izquierda, más visible */}
        {tieneDescuento && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              zIndex: 2,
            }}
          >
            <span
              style={{
                ...badgeBase,
                background: "#dc2626",
                fontSize: "0.75rem",
                padding: "4px 10px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(220,38,38,0.5)",
                letterSpacing: "0.06em",
              }}
            >
              {descuentoTexto}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "0.75rem 0.5rem 0.5rem" }}>
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 4px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {isConsult ? (
            "Consultar"
          ) : tieneDescuento ? (
            <>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#999",
                  textDecoration: "line-through",
                  fontWeight: 500,
                }}
              >
                S/ {product.price.toFixed(2)}
              </span>
              <span style={{ color: "#dc2626" }}>
                S/ {precioFinal.toFixed(2)}
              </span>
            </>
          ) : (
            `S/ ${product.price.toFixed(2)}`
          )}
        </p>

        <h3
          style={{
            fontSize: "0.82rem",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: "0 0 3px",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontSize: "0.75rem",
            color: "#767677",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {product.category_name ?? ""}
        </p>
      </div>
    </article>
  );

  function handleCardClick() {
    router.push(`/productos/${product.id}`);
  }
}
