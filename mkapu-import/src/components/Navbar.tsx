"use client";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "./cartDrawer";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-title">mkapu</span>
          <span className="navbar__logo-sub">import</span>
        </Link>

        <nav className="navbar__nav">
          <Link href="/" className="navbar__link">
            Inicio
          </Link>
          <Link href="/productos" className="navbar__link">
            Productos
          </Link>
          <Link href="/blog" className="navbar__link">
            Blog
          </Link>
        </nav>

        <button
          className="navbar__cart-btn"
          onClick={() => setOpen(true)}
          aria-label={`Carrito — ${count} productos`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Carrito
          {count > 0 && <span className="navbar__badge">{count}</span>}
        </button>
      </header>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
