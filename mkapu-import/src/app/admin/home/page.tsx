"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, GripVertical, Eye, EyeOff, Trash2 } from "lucide-react";

type Categoria = { id: number; name: string; slug: string; activo: boolean };
type Seccion   = { id: number; categoria_id: number; orden: number; activo: boolean };

export default function AdminHomePage() {
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [secciones, setSecciones]     = useState<Seccion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [dragIdx, setDragIdx]         = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: cats }, { data: secs }] = await Promise.all([
      supabase.from("categorias").select("*").eq("activo", true).order("name"),
      supabase.from("home_secciones").select("*").order("orden"),
    ]);
    setCategorias(cats ?? []);
    setSecciones(secs ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // IDs de categorías ya añadidas
  const añadidos = new Set(secciones.map((s) => s.categoria_id));

  async function agregarCategoria(cat: Categoria) {
    if (añadidos.has(cat.id)) return;
    setSaving(true);
    const maxOrden = secciones.length > 0 ? Math.max(...secciones.map((s) => s.orden)) + 1 : 0;
    await supabase.from("home_secciones").insert({ categoria_id: cat.id, orden: maxOrden, activo: true });
    await load();
    setSaving(false);
  }

  async function toggleActivo(sec: Seccion) {
    await supabase.from("home_secciones").update({ activo: !sec.activo }).eq("id", sec.id);
    setSecciones((prev) => prev.map((s) => s.id === sec.id ? { ...s, activo: !s.activo } : s));
  }

  async function eliminar(sec: Seccion) {
    await supabase.from("home_secciones").delete().eq("id", sec.id);
    setSecciones((prev) => prev.filter((s) => s.id !== sec.id));
  }

  // Drag & drop para reordenar
  function onDragStart(idx: number) { setDragIdx(idx); }

  async function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordenado = [...secciones];
    const [moved] = reordenado.splice(dragIdx, 1);
    reordenado.splice(targetIdx, 0, moved);
    const actualizados = reordenado.map((s, i) => ({ ...s, orden: i }));
    setSecciones(actualizados);
    setDragIdx(null);
    setSaving(true);
    await Promise.all(
      actualizados.map((s) =>
        supabase.from("home_secciones").update({ orden: s.orden }).eq("id", s.id)
      )
    );
    setSaving(false);
  }

  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const noAñadidas = categorias.filter((c) => !añadidos.has(c.id));

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <style>{`
        .hs-row { transition: background 0.1s; }
        .hs-row:hover { background: #fafafa !important; }
        .hs-row.dragging { opacity: 0.4; }
        .hs-row.dragover { border-top: 2px solid #f5a623 !important; }
        .hs-btn-del { display:inline-flex;align-items:center;gap:5px;background:rgba(220,53,69,0.07);color:#dc3545;border:1px solid rgba(220,53,69,0.2);padding:5px 12px;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer; }
        .hs-btn-del:hover { background:rgba(220,53,69,0.15); }
        .hs-cat-pill { display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:8px;border:1px solid #e0e0e0;background:#fafafa;font-size:0.82rem;font-weight:600;color:#444;cursor:pointer;transition:all 0.15s; }
        .hs-cat-pill:hover { background:#fff8ee;border-color:#f5a623;color:#c47d00; }
        .hs-cat-pill:disabled { opacity:0.4;cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a" }}>Secciones del Home</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#999" }}>
            Selecciona categorías para mostrar en el home y ordénalas arrastrando
          </p>
        </div>
        {saving && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#f5a623", fontSize: "0.82rem", fontWeight: 600 }}>
            <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
            Guardando...
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48, color: "#aaa" }}>
          <Loader2 size={22} style={{ animation: "spin 0.8s linear infinite" }} color="#f5a623" />
        </div>
      ) : (
        <>
          {/* Categorías disponibles para añadir */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <p style={{ margin: "0 0 14px", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Categorías disponibles — haz clic para añadir al home
            </p>
            {noAñadidas.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#bbb" }}>✅ Todas las categorías ya están añadidas</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {noAñadidas.map((cat) => (
                  <button key={cat.id} className="hs-cat-pill"
                    disabled={saving} onClick={() => agregarCategoria(cat)}>
                    + {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lista ordenable de secciones activas */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", background: "#fafafa", borderBottom: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Secciones en el home ({secciones.length})
              </span>
              <span style={{ fontSize: "0.75rem", color: "#bbb" }}>Arrastra para reordenar</span>
            </div>

            {secciones.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#ccc" }}>
                <p style={{ margin: 0 }}>No hay secciones aún — añade una categoría arriba</p>
              </div>
            ) : (
              secciones.map((sec, idx) => {
                const cat = catMap[sec.categoria_id];
                return (
                  <div
                    key={sec.id}
                    className="hs-row"
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 20px",
                      borderBottom: idx < secciones.length - 1 ? "1px solid #f0f0f0" : "none",
                      background: "#fff", cursor: "grab",
                      opacity: sec.activo ? 1 : 0.5,
                    }}
                  >
                    {/* Handle drag */}
                    <GripVertical size={18} color="#ccc" style={{ flexShrink: 0 }} />

                    {/* Orden badge */}
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#aaa", flexShrink: 0 }}>
                      {idx + 1}
                    </span>

                    {/* Nombre categoría */}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.925rem", color: "#1a1a1a" }}>
                        {cat?.name ?? "Categoría eliminada"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#aaa", fontFamily: "monospace" }}>
                        /categoria/{cat?.slug}
                      </p>
                    </div>

                    {/* Estado badge */}
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                      background: sec.activo ? "#e8f7ee" : "#fde8e8",
                      color: sec.activo ? "#1a7a3c" : "#a71d2a",
                    }}>
                      {sec.activo ? "Visible" : "Oculta"}
                    </span>

                    {/* Toggle visibilidad */}
                    <button
                      title={sec.activo ? "Ocultar sección" : "Mostrar sección"}
                      onClick={() => toggleActivo(sec)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4, display: "flex" }}>
                      {sec.activo ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>

                    {/* Eliminar */}
                    <button className="hs-btn-del" onClick={() => eliminar(sec)}>
                      <Trash2 size={12} /> Quitar
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}