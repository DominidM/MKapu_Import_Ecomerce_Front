import { Suspense } from "react";
import { getProductos, getCategoriasFromProductos } from "@/lib/queries";
import ProductosClient from "./ProductosClient";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        flexDirection: "column",
        gap: "1rem",
        color: "#888",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #f0ebe4",
          borderTop: "3px solid #f5a623",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>Cargando productos...</p>
    </div>
  );
}

export default async function Page() {
  const [products, categories, { data: bannerData }] = await Promise.all([
    getProductos(),
    getCategoriasFromProductos(),
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/productos")
      .single(),
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <ProductosClient
        initialProducts={products}
        allCats={categories}
        banner={bannerData ?? null}
      />
    </Suspense>
  );
}
