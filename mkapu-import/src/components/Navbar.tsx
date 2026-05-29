"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./cartDrawer";
import { useCart } from "@/app/context/CartContext";
import { useEmpresa } from "@/context/EmpresaContext";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheckIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type Categoria =
  | string
  | {
      id: number;
      name: string;
      activo?: boolean;
    };

type SearchSuggestion = {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
  category_name?: string | null;
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
  const { empresa, loaded: logoLoaded } = useEmpresa();

  const logoUrl = empresa?.logo || "";
  const socialUrls = {
    instagram: empresa?.instagram_url || null,
    facebook: empresa?.facebook_url || null,
    tiktok: empresa?.tiktok_url || null,
  };

  const [cats, setCats] = useState<Categoria[]>(categories);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ FIX: useEffect que faltaba para verificar auth desde localStorage
  useEffect(() => {
    const adminId = localStorage.getItem("admin_id");
    const adminNombre = localStorage.getItem("admin_nombre");

    if (adminId && adminNombre) {
      setIsLogged(true);
      setIsAdmin(true);
    } else {
      setIsLogged(false);
      setIsAdmin(false);
    }

    // Marca que ya se verificó — esto desbloquea el render del candado/panel
    setAuthChecked(true);
  }, []);

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
    function handleClickOutside(e: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setSuggestOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);

    const term = search.trim();

    if (term.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      setLoadingSuggest(false);
      return;
    }

    setLoadingSuggest(true);
    setSuggestOpen(true); // ✅ Abrir panel inmediatamente para mostrar "Buscando..."

    suggestTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, name, image_url, price, categorias(name)")
        .eq("activo", true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .order("featured", { ascending: false })
        .limit(6);

      const mapped: SearchSuggestion[] = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        image_url: p.image_url ?? null,
        price: p.price,
        category_name: p.categorias?.name ?? null,
      }));

      setSuggestions(mapped);
      setSuggestOpen(true);
      setLoadingSuggest(false);
    }, 250);

    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    setSuggestOpen(false);
    router.push(`/productos?q=${encodeURIComponent(search.trim())}`);
    setMobileOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_nombre");
    setIsLogged(false);
    setIsAdmin(false);
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

  function handleSuggestionClick(item: SearchSuggestion) {
    setSearch("");
    setSuggestions([]);
    setSuggestOpen(false);
    setMobileOpen(false);
    router.push(`/productos/${item.id}`);
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
            <span className={`nb__logo-placeholder${!logoLoaded ? " nb__logo-placeholder--loading" : ""}${logoUrl ? "" : " nb__logo-placeholder--empty"}`}>
              {logoUrl && (
                <img src={logoUrl} alt="MKapu Import" className="nb__logo-img" fetchPriority="high" loading="eager" />
              )}
            </span>
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

          {/* ✅ Buscador desktop */}
          <div className="nb__search-wrap" ref={searchBoxRef}>
            <form className="nb__search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim().length >= 2) setSuggestOpen(true);
                }}
                className="nb__search-input"
                role="combobox"
                aria-expanded={suggestOpen}
                aria-autocomplete="list"
                aria-controls="navbar-search-suggestions"
              />
              <button
                type="submit"
                className="nb__search-btn"
                aria-label="Buscar"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </form>

            {suggestOpen && (search.trim().length >= 2 || loadingSuggest) && (
              <div
                className="nb__suggest"
                id="navbar-search-suggestions"
                role="listbox"
              >
                {loadingSuggest ? (
                  <div className="nb__suggest-state">Buscando productos...</div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="nb__suggest-item"
                        onClick={() => handleSuggestionClick(item)}
                        role="option"
                      >
                        <div className="nb__suggest-thumb">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} />
                          ) : (
                            <div className="nb__suggest-thumb-empty">📦</div>
                          )}
                        </div>
                        <div className="nb__suggest-text">
                          <span className="nb__suggest-name">{item.name}</span>
                          <span className="nb__suggest-meta">
                            {item.category_name ?? "Sin categoría"} ·{" "}
                            {item.price > 0
                              ? `S/ ${item.price.toFixed(2)}`
                              : "Consultar"}
                          </span>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      className="nb__suggest-all"
                      onClick={handleSearch as any}
                    >
                      Ver resultados para &quot;{search.trim()}&quot;
                    </button>
                  </>
                ) : (
                  <div className="nb__suggest-state">
                    No encontramos coincidencias para &quot;{search.trim()}
                    &quot;
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="nb__right">
            <div className="nb__socials">
              {socialUrls.instagram && (
                <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="nb__social" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>
              )}
              {socialUrls.facebook && (
                <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="nb__social" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {socialUrls.tiktok && (
                <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="nb__social" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
                  </svg>
                </a>
              )}
            </div>

            <button
              className="nb__cart"
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              type="button"
            >
              <span className="nb__cart-icon-wrap">
                <ShoppingCartIcon className="nb__cart-icon" />
                {count > 0 && <span className="nb__badge">{count}</span>}
              </span>
              <span className="nb__cart-label">Carrito</span>
            </button>

            {/* ✅ FIX: authChecked garantiza que solo renderiza después de leer localStorage */}
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

            {/* ✅ FIX: El candado ahora sí aparece cuando no hay sesión activa */}
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
            <div className="nb__mobile-search-wrap">
              <form className="nb__mobile-search" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="nb__mobile-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="nb__search-btn"
                  aria-label="Buscar"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              </form>

              {suggestOpen && (search.trim().length >= 2 || loadingSuggest) && (
                <div className="nb__suggest nb__suggest--mobile">
                  {loadingSuggest ? (
                    <div className="nb__suggest-state">
                      Buscando productos...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <>
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="nb__suggest-item"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          <div className="nb__suggest-thumb">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} />
                            ) : (
                              <div className="nb__suggest-thumb-empty">📦</div>
                            )}
                          </div>
                          <div className="nb__suggest-text">
                            <span className="nb__suggest-name">
                              {item.name}
                            </span>
                            <span className="nb__suggest-meta">
                              {item.category_name ?? "Sin categoría"} ·{" "}
                              {item.price > 0
                                ? `S/ ${item.price.toFixed(2)}`
                                : "Consultar"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="nb__suggest-state">
                      No encontramos coincidencias para &quot;{search.trim()}
                      &quot;
                    </div>
                  )}
                </div>
              )}
            </div>

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

              {socialUrls.instagram && (
                <a href={socialUrls.instagram} target="_blank" rel="noopener noreferrer" className="nb__mobile-social">Instagram</a>
              )}
              {socialUrls.facebook && (
                <a href={socialUrls.facebook} target="_blank" rel="noopener noreferrer" className="nb__mobile-social">Facebook</a>
              )}
              {socialUrls.tiktok && (
                <a href={socialUrls.tiktok} target="_blank" rel="noopener noreferrer" className="nb__mobile-social">TikTok</a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="nb__subnav">
        <div className="nb__subnav-inner">
          <Link href="/" className="nb__subnav-link">
            <span className="nb__subnav-text">Home</span>
          </Link>
          <Link href="/productos" className="nb__subnav-link">
            <span className="nb__subnav-text">Catálogo</span>
          </Link>
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
