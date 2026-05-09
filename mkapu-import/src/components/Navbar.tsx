"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./cartDrawer";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheckIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

type Categoria =
  | string
  | {
      id: number;
      name: string;
      activo?: boolean;
    };

interface NavbarProps {
  categories?: Categoria[];
}

function getCategoryKey(cat: Categoria) {
  return typeof cat === "string" ? cat : cat.id;
}

function getCategoryName(cat: Categoria) {
  return typeof cat === "string" ? cat : cat.name;
}

function getCategoryHref(cat: Categoria) {
  if (typeof cat === "string") {
    return `/productos?cat=${encodeURIComponent(cat)}`;
  }
  return `/productos?cat=${cat.id}`;
}

export default function Navbar({ categories = [] }: NavbarProps) {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [cats, setCats] = useState<Categoria[]>(categories);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCats(categories);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data: Categoria[]) => setCats(data))
      .catch(() => setCats([]));
  }, [categories]);

  useEffect(() => {
    let mounted = true;

    async function checkAuthAndRole() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!mounted) return;

      if (!user) {
        setIsLogged(false);
        setIsAdmin(false);
        setAuthChecked(true);
        return;
      }

      setIsLogged(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setIsAdmin(profile?.role === "admin");
      setAuthChecked(true);
    }

    checkAuthAndRole();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndRole();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/productos?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setMobileOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
  }

  function openMega() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }

  function closeMega() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 180);
  }

  return (
    <>
      <div className="nb">
        <div className="nb__inner">
          <Link
            href="/"
            className="nb__logo"
            onClick={() => setMobileOpen(false)}
          >
            <span className="nb__logo-t">mkapu</span>
            <span className="nb__logo-s">import</span>
          </Link>

          <div
            className="nb__cat-trigger"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              type="button"
              className={`nb__cat-btn${megaOpen ? " nb__cat-btn--open" : ""}`}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Menú
              <svg
                className="nb__chevron"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {megaOpen && (
              <div
                className="nb__mega"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <div className="nb__mega-grid">
                  <Link
                    href="/productos"
                    className="nb__mega-all"
                    onClick={() => setMegaOpen(false)}
                  >
                    <span>🛍️</span> Catálogo
                  </Link>

                  {cats.map((cat) => (
                    <Link
                      key={getCategoryKey(cat)}
                      href={getCategoryHref(cat)}
                      className="nb__mega-item"
                      onClick={() => setMegaOpen(false)}
                    >
                      {getCategoryName(cat)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="nb__search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nb__search-input"
            />
            <button type="submit" className="nb__search-btn" aria-label="Buscar">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          <div className="nb__right">
            <div className="nb__socials">
              <a
                href="https://www.instagram.com/mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/mkapu.peru/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__social"
                aria-label="TikTok"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                </svg>
              </a>
            </div>

            <button
              className="nb__cart"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              type="button"
            >
              <ShoppingCartIcon className="h-4 w-4 shrink-0" />
              <span className="nb__cart-label">Carrito</span>
              {count > 0 && <span className="nb__badge">{count}</span>}
            </button>

            {authChecked && isLogged && isAdmin && (
              <>
                <Link
                  href="/admin/productos"
                  className="nb__admin-btn nb__admin-btn--panel"
                >
                  <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                  PANEL
                </Link>

                <button
                  type="button"
                  className="nb__admin-btn nb__admin-btn--salir"
                  onClick={handleLogout}
                >
                  SALIR
                </button>
              </>
            )}

            {authChecked && !(isLogged && isAdmin) && (
              <button
                className="nb__lock-btn"
                onClick={() => router.push("/admin/login")}
                title="Acceso admin"
                aria-label="Panel de administrador"
                type="button"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block", flexShrink: 0 }}
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
              </button>
            )}

            <button
              className="nb__burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
              type="button"
            >
              {mobileOpen ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="nb__mobile">
            <form className="nb__mobile-search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nb__mobile-input"
                autoFocus
              />
              <button type="submit" className="nb__search-btn" aria-label="Buscar">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <div className="nb__mobile-section">
              <p className="nb__mobile-label">Páginas</p>

              <div className="nb__mobile-pages">
                <Link
                  href="/productos"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  Nuestros productos
                </Link>

                <Link
                  href="/blog"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>

                <Link
                  href="/quienes-somos"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  Quiénes Somos
                </Link>

                <Link
                  href="/contacto"
                  className="nb__mobile-page"
                  onClick={() => setMobileOpen(false)}
                >
                  Contacto
                </Link>
              </div>
            </div>

            <div className="nb__mobile-socials">
              {!isLogged && (
                <Link
                  href="/admin/login"
                  className="nb__mobile-social"
                  onClick={() => setMobileOpen(false)}
                >
                  Ingresar Admin
                </Link>
              )}

              {isLogged && isAdmin && (
                <>
                  <Link
                    href="/admin/productos"
                    className="nb__mobile-social"
                    onClick={() => setMobileOpen(false)}
                  >
                    Panel Admin
                  </Link>

                  <button
                    type="button"
                    className="nb__mobile-social nb__mobile-logout"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </>
              )}

              <a
                href="https://www.instagram.com/mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                Instagram
              </a>

              <a
                href="https://www.facebook.com/mkapu.peru/?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                Facebook
              </a>

              <a
                href="https://www.tiktok.com/@mkapu.import"
                target="_blank"
                rel="noopener noreferrer"
                className="nb__mobile-social"
              >
                TikTok
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="nb__subnav">
        <div className="nb__subnav-inner">
          <Link href="/blog" className="nb__subnav-link">
            <span className="nb__subnav-text">Blog</span>
          </Link>

          <Link href="/quienes-somos" className="nb__subnav-link">
            <span className="nb__subnav-text">Quiénes Somos</span>
          </Link>

          <Link href="/contacto" className="nb__subnav-link">
            <span className="nb__subnav-text">Contacto</span>
          </Link>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}