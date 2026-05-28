"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Toast from "@/components/Toast";
import {
  Package,
  AlertCircle,
  Home,
  LogOut,
  Menu,
  Tag,
  Users,
  Video,
  Image,
  FileText,
  FolderTree,
  Info,
  LayoutDashboard,
  Percent,
  Building2,
  X,
} from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isLogin = pathname.includes("login");

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (isLogin) {
        setLoading(false);
        return;
      }

      const adminId = localStorage.getItem("admin_id");

      if (!adminId) {
        if (isMounted) router.push("/admin/login");
        return;
      }

      const { data: empleado } = await supabase
        .from("empleados")
        .select("id, activo")
        .eq("id", Number(adminId))
        .single();

      if (!isMounted) return;

      if (!empleado || !empleado.activo) {
        localStorage.removeItem("admin_id");
        localStorage.removeItem("admin_nombre");
        router.push("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setLoading(false);
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, isLogin]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  
  if (isLogin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f0f0f",
          fontSize: "1rem",
          color: "#f5a623",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
          Cargando...
        </span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const menuItems = [
    { name: "Productos", icon: Package, href: "/admin/productos" },
    { name: "Promociones", icon: Percent, href: "/admin/promociones" },
    { name: "Marcas", icon: Tag, href: "/admin/marcas" },
    { name: "Colaboradores", icon: Users, href: "/admin/colaboradores" },
    { name: "Videos", icon: Video, href: "/admin/videos" },
    { name: "Reclamaciones", icon: AlertCircle, href: "/admin/reclamos" },
    { name: "Empleados", icon: Users, href: "/admin/empleados" },
    { name: "Banners", icon: Image, href: "/admin/banners" },
    { name: "Blog", icon: FileText, href: "/admin/blog" },
    { name: "Categorías", icon: FolderTree, href: "/admin/categorias" },
    { name: "Sobre Nosotros", icon: Info, href: "/admin/sobre-nosotros" },
    { name: "Secciones Home", icon: LayoutDashboard, href: "/admin/home" },
  ];

  function logout() {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_nombre");
    router.push("/admin/login");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .admin-layout { display: flex; height: 100vh; overflow: hidden; background: #0f0f0f; }
        aside::-webkit-scrollbar { display: none; }
        .main-content::-webkit-scrollbar { display: none; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 10px 12px; color: #666; text-decoration: none; transition: all 0.2s; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; font-size: 0.9rem; }
        .nav-link:hover { background: rgba(245,166,35,0.08); color: #f5a623; border-left-color: rgba(245,166,35,0.4); }
        .nav-link.active { background: rgba(245,166,35,0.12); color: #f5a623; border-left-color: #f5a623; }
        .btn-store { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 9px 12px; background: rgba(0,123,255,0.15); color: #4da3ff; border: 1px solid rgba(0,123,255,0.3); border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .btn-store:hover { background: rgba(0,123,255,0.25); border-color: rgba(0,123,255,0.5); }
        .btn-logout { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 9px 12px; background: rgba(220,53,69,0.12); color: #ff6b7a; border: 1px solid rgba(220,53,69,0.25); border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
        .btn-logout:hover { background: rgba(220,53,69,0.22); border-color: rgba(220,53,69,0.45); }
        .menu-toggle:hover { background: rgba(245,166,35,0.1); border-radius: 8px; }
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 998; }
        @media (max-width: 900px) {
          .admin-content { padding: 16px !important; }
          .admin-topbar { padding: 0 12px !important; }
        }
      `}</style>

      <div className="admin-layout">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          style={{
            width: isMobile ? (sidebarOpen ? "280px" : "0px") : (sidebarOpen ? "240px" : "64px"),
            background: "#141414",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.25s ease",
            overflow: "hidden",
            borderRight: isMobile && !sidebarOpen ? "none" : "1px solid #222",
            flexShrink: 0,
            position: isMobile ? "fixed" : "static",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: isMobile ? "20px 16px 18px" : (sidebarOpen ? "20px 16px 18px" : "20px 0 18px"),
              textAlign: "center",
              fontWeight: 800,
              fontSize: isMobile || sidebarOpen ? "1rem" : "0.75rem",
              color: "#f5a623",
              borderBottom: isMobile || sidebarOpen ? "1px solid #222" : "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              display: isMobile || sidebarOpen ? "block" : "block",
              visibility: isMobile || sidebarOpen ? "visible" : "hidden",
            }}
          >
            {isMobile || sidebarOpen ? "Panel Admin" : "PA"}
          </div>

          {/* Close button on mobile */}
          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={18} />
            </button>
          )}

          {/* Nav */}
          <nav
            style={{
              flex: 1,
              padding: isMobile || sidebarOpen ? "12px 8px" : "12px 4px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              opacity: isMobile || sidebarOpen ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "active" : ""}`}
                  title={!sidebarOpen && !isMobile ? item.name : undefined}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {(sidebarOpen || isMobile) && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer buttons */}
          <div
            style={{
              padding: isMobile || sidebarOpen ? "12px 8px 16px" : "12px 4px 16px",
              borderTop: isMobile || sidebarOpen ? "1px solid #222" : "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              opacity: isMobile || sidebarOpen ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            <Link
              href="/admin/empresa"
              className={`nav-link ${pathname === "/admin/empresa" ? "active" : ""}`}
              title={!sidebarOpen && !isMobile ? "Configuración de empresa" : undefined}
              style={{ borderRadius: "8px", borderLeft: "none" }}
            >
              <Building2 size={18} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && "Configuración de empresa"}
            </Link>
            <Link
              href="/"
              className="btn-store"
              title={!sidebarOpen && !isMobile ? "Ir a tienda" : undefined}
            >
              <Home size={16} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && "Ir a tienda"}
            </Link>
            <button
              onClick={logout}
              className="btn-logout"
              title={!sidebarOpen && !isMobile ? "Salir" : undefined}
            >
              <LogOut size={16} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && "Salir"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#f7f7f5",
            marginLeft: isMobile ? 0 : undefined,
          }}
        >
          {/* Topbar */}
          <div
            className="admin-topbar"
            style={{
              background: "#fff",
              padding: "0 20px",
              height: "56px",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#333",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              <Menu size={20} />
            </button>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#1a1a1a",
                letterSpacing: "0.01em",
              }}
            >
              Panel de Administración
            </span>
            <Link
              href="/admin/empresa"
              title="Configurar empresa"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                color: pathname === "/admin/empresa" ? "#f5a623" : "#999",
                background: pathname === "/admin/empresa" ? "rgba(245,166,35,0.1)" : "transparent",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (pathname !== "/admin/empresa") {
                  e.currentTarget.style.background = "rgba(245,166,35,0.08)";
                  e.currentTarget.style.color = "#f5a623";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/admin/empresa") {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#999";
                }
              }}
            >
              <Building2 size={20} />
            </Link>
          </div>

          {/* Content */}
          <div
            className="main-content admin-content"
            style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}
          >
            {children}
          </div>
        </main>
      </div>
      <Toast />
    </>
  );
}
