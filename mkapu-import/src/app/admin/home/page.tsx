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

  const añadidos = new Set(secciones.map((s) => s.categoria_id));

  async function agregarCategoria(cat: Categoria) {
    if (añadidos.has(cat.id)) return;
    setSaving(true);
    const maxOrden =
      secciones.length > 0 ? Math.max(...secciones.map((s) => s.orden)) + 1 : 0;
    await supabase
      .from("home_secciones")
      .insert({ categoria_id: cat.id, orden: maxOrden, activo: true });
    await load();
    setSaving(false);
  }

  async function toggleActivo(sec: Seccion) {
    await supabase
      .from("home_secciones")
      .update({ activo: !sec.activo })
      .eq("id", sec.id);
    setSecciones((prev) =>
      prev.map((s) => (s.id === sec.id ? { ...s, activo: !s.activo } : s)),
    );
  }

  async function eliminar(sec: Seccion) {
    if (!confirm("¿Quitar esta sección del home?")) return;
    await supabase.from("home_secciones").delete().eq("id", sec.id);
    setSecciones((prev) => prev.filter((s) => s.id !== sec.id));
  }

  // Persistir orden en BD
  async function persistOrder(list: Seccion[]) {
    setSaving(true);
    await Promise.all(
      list.map((s, i) =>
        supabase.from("home_secciones").update({ orden: i }).eq("id", s.id),
      ),
    );
    setSaving(false);
  }

  // Drag & drop
  function onDragStart(idx: number) {
    setDragIdx(idx);
  }

  async function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordenado = [...secciones];
    const [moved] = reordenado.splice(dragIdx, 1);
    reordenado.splice(targetIdx, 0, moved);
    setSecciones(reordenado);
    setDragIdx(null);
    void persistOrder(reordenado);
  }

  // Flechas ↑ / ↓
  function moveUp(idx: number) {
    if (idx === 0) return;
    const copy = [...secciones];
    const tmp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = tmp;
    setSecciones(copy);
    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === secciones.length - 1) return;
    const copy = [...secciones];
    const tmp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = tmp;
    setSecciones(copy);
    void persistOrder(copy);
  }

  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const noAñadidas = categorias.filter((c) => !añadidos.has(c.id));

  return (
    <div
      style={{
        padding: "24px 20px 40px",
        background: "#f5f5f7",
        minHeight: "100%",
      }}
    >
      <style>{`
        .hs-row { transition: background 0.1s, box-shadow 0.1s; }
        .hs-row:hover { background: #fafafa !important; }
        .hs-row.dragging { opacity: 0.4; }
        .hs-btn-del {
          display:inline-flex;align-items:center;gap:5px;
          background:rgba(220,53,69,0.06);
          color:#dc3545;
          border:1px solid rgba(220,53,69,0.2);
          padding:5px 12px;
          border-radius:999px;
          font-size:0.8rem;
          font-weight:600;
          cursor:pointer;
          transition:background 0.15s,border-color 0.15s;
        }
        .hs-btn-del:hover {
          background:rgba(220,53,69,0.12);
          border-color:rgba(220,53,69,0.3);
        }
        .hs-cat-pill {
          display:inline-flex;align-items:center;gap:7px;
          padding:8px 14px;
          border-radius:999px;
          border:1px solid #e0e0e0;
          background:#fff;
          font-size:0.82rem;
          font-weight:600;
          color:#444;
          cursor:pointer;
          transition:all 0.15s;
        }
        .hs-cat-pill:hover { background:#fff8ee;border-color:#f5a623;color:#c47d00; }
        .hs-cat-pill:disabled { opacity:0.4;cursor:not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header de página */}
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Secciones del Home
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            Elige qué categorías se muestran en la página principal y define su
            orden con las flechas o arrastrando cada bloque.
          </p>
        </div>

        {saving && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#fffbeb",
              color: "#92400e",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            <Loader2
              size={14}
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            Guardando cambios…
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Tarjeta: categorías disponibles */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Categorías disponibles
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.83rem",
                  color: "#6b7280",
                }}
              >
                Haz clic en una categoría para crear una sección en el home.
              </p>
            </div>
          </div>

          {noAñadidas.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              ✅ Todas las categorías activas ya están usadas en el home.
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {noAñadidas.map((cat) => (
                <button
                  key={cat.id}
                  className="hs-cat-pill"
                  disabled={saving}
                  onClick={() => agregarCategoria(cat)}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "999px",
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      color: "#92400e",
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Tarjeta: lista ordenable */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              padding: "14px 20px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Secciones en el home
              </span>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: "0.78rem",
                  color: "#6b7280",
                }}
              >
                ({secciones.length})
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
              Usa las flechas ↑ ↓ o arrastra el handler para cambiar el orden.
            </span>
          </header>

          {loading ? (
            <div
              style={{
                padding: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#9ca3af",
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 0.8s linear infinite" }}
                color="#f59e0b"
              />
              <span style={{ fontSize: "0.88rem" }}>Cargando secciones…</span>
            </div>
          ) : secciones.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "0.9rem",
              }}
            >
              Aún no has configurado secciones para el home. Añade una categoría
              desde el bloque superior.
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
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom:
                      idx < secciones.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    background: "#fff",
                    cursor: "grab",
                    opacity: sec.activo ? 1 : 0.55,
                  }}
                >
                  {/* Handle drag */}
                  <div
                    style={{
                      flexShrink: 0,
                      paddingRight: 4,
                      color: "#d1d5db",
                    }}
                  >
                    <GripVertical size={18} />
                  </div>

                  {/* Orden */}
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "999px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#6b7280",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>

                  {/* Nombre categoría */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat?.name ?? "Categoría eliminada"}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.78rem",
                        color: "#9ca3af",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco",
                      }}
                    >
                      /categoria/{cat?.slug}
                    </p>
                  </div>

                  {/* Estado */}
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      background: sec.activo ? "#ecfdf3" : "#fef2f2",
                      color: sec.activo ? "#166534" : "#b91c1c",
                      flexShrink: 0,
                    }}
                  >
                    {sec.activo ? "Visible" : "Oculta"}
                  </span>

                  {/* Toggle visibilidad */}
                  <button
                    title={sec.activo ? "Ocultar sección" : "Mostrar sección"}
                    onClick={() => toggleActivo(sec)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9ca3af",
                      padding: 4,
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    {sec.activo ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  {/* Flechas ↑ / ↓ */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginRight: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      title="Subir sección"
                      style={{
                        width: 26,
                        height: 20,
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        background:
                          idx === 0 ? "#f3f4f6" : "#ffffff",
                        cursor:
                          idx === 0 ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        color: "#6b7280",
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === secciones.length - 1}
                      title="Bajar sección"
                      style={{
                        width: 26,
                        height: 20,
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        background:
                          idx === secciones.length - 1
                            ? "#f3f4f6"
                            : "#ffffff",
                        cursor:
                          idx === secciones.length - 1
                            ? "default"
                            : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        color: "#6b7280",
                      }}
                    >
                      ↓
                    </button>
                  </div>

                  {/* Eliminar */}
                  <button
                    className="hs-btn-del"
                    onClick={() => eliminar(sec)}
                    style={{ flexShrink: 0 }}
                  >
                    <Trash2 size={12} /> Quitar
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}