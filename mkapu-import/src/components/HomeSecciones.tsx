import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/productCard";

type Producto = {
  id: number;
  code: string;
  name: string;
  category: number;
  description: string;
  price: number;
  featured: boolean;
  image_url: string;
  activo: boolean;
  is_new: boolean;
};

export default async function HomeSecciones() {
  const { data: secciones } = await supabase
    .from("home_secciones")
    .select("orden, categoria_id, categorias(id, name, slug)")
    .eq("activo", true)
    .order("orden");

  if (!secciones?.length) return null;

  const catIds = secciones.map((s) => s.categoria_id);

  const { data: productos } = await supabase
    .from("productos")
    .select("*")
    .in("category", catIds)
    .eq("activo", true)
    .order("name");

  const prodPorCat: Record<number, Producto[]> = {};
  for (const p of productos ?? []) {
    if (!prodPorCat[p.category]) prodPorCat[p.category] = [];
    prodPorCat[p.category].push(p);
  }

  return (
    <>
      {secciones.map((sec) => {
        const cat = sec.categorias as any;
        const prods = prodPorCat[sec.categoria_id] ?? [];
        if (!prods.length) return null;
        return (
          <section key={sec.categoria_id} style={{ padding: "60px 0" }}>
            <div
              style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}
            >
              {/* Header sección */}
              <div style={{ marginBottom: 32, textAlign: "center" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#f5a623",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {cat.name}
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {cat.name}
                </h2>
              </div>

              {/* Grid productos */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 20,
                }}
              >
                {prods.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{ ...p, category_name: cat.name }}
                  />
                ))}
              </div>

              {/* Ver todos */}
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <a
                  href={`/productos?cat=${encodeURIComponent(cat.name)}`}
                  style={{
                    color: "#f5a623",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  Ver todos los {cat.name.toLowerCase()} →
                </a>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
