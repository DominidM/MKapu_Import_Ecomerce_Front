"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Categoria = { id: number; name: string; slug: string; activo: boolean };
type Seccion = {
  id: number;
  categoria_id: number;
  orden: number;
  activo: boolean;
};

export default function AdminHomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(false);

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

  useEffect(() => {
    load();
  }, []);

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

  async function persistOrder(list: Seccion[]) {
    setSaving(true);
    await Promise.all(
      list.map((s, i) =>
        supabase.from("home_secciones").update({ orden: i }).eq("id", s.id),
      ),
    );
    setSaving(false);
  }

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
  const categoriasVisibles = mostrarTodas ? noAñadidas : noAñadidas.slice(0, 6);

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Secciones del Home
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            Elige qué categorías se muestran en la página principal y define su
            orden.
          </p>
        </div>

        {saving && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#fff8e6",
              color: "#c47d00",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            <Loader2
              size={14}
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            Guardando…
          </div>
        )}
      </div>

      {/* Categorías disponibles */}
      <section
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "#fafafa",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <p
            style={{
              margin: "0 0 0.25rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            Categorías disponibles
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
            Haz clic en una categoría para agregarla al home.
          </p>
        </div>

        {noAñadidas.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "#aaa",
              fontSize: "0.85rem",
            }}
          >
            ✅ Todas las categorías activas ya están en el home.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "10px",
                padding: "1.25rem",
              }}
            >
              {categoriasVisibles.map((cat) => (
                <button
                  key={cat.id}
                  disabled={saving}
                  onClick={() => agregarCategoria(cat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 16px",
                    borderRadius: 999,
                    border: "1.5px solid #e0d8d0",
                    background: "#fff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#444",
                    cursor: saving ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    opacity: saving ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.background = "#fff8ee";
                      e.currentTarget.style.borderColor = "#f5a623";
                      e.currentTarget.style.color = "#c47d00";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e0d8d0";
                    e.currentTarget.style.color = "#444";
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#c47d00",
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>

            {noAñadidas.length > 6 && (
              <div
                style={{
                  padding: "0 1.25rem 1.25rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setMostrarTodas(!mostrarTodas)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                    color: "#666",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.borderColor = "#f5a623";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  {mostrarTodas ? (
                    <>
                      Ver menos <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Ver más ({noAñadidas.length - 6}){" "}
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Tabla de secciones */}
      <section
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "#fafafa",
            borderBottom: "1px solid #e8e8e8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              Secciones en el home
            </span>
            <span style={{ marginLeft: 8, fontSize: "0.78rem", color: "#aaa" }}>
              ({secciones.length})
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "#aaa" }}>
            Arrastra o usa las flechas para reordenar
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#aaa",
            }}
          >
            <Loader2
              size={20}
              style={{ animation: "spin 0.8s linear infinite" }}
              color="#f5a623"
            />
            <span style={{ fontSize: "0.88rem" }}>Cargando secciones…</span>
          </div>
        ) : secciones.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "#aaa",
              fontSize: "0.9rem",
            }}
          >
            Aún no has configurado secciones. Añade una categoría arriba.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#fafafa",
                  borderBottom: "1px solid #e8e8e8",
                }}
              >
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: "50px",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Categoría
                </th>
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: "120px",
                  }}
                >
                  Estado
                </th>
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: "180px",
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {secciones.map((sec, idx) => {
                const cat = catMap[sec.categoria_id];
                return (
                  <tr
                    key={sec.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    style={{
                      borderBottom:
                        idx < secciones.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                      opacity: sec.activo ? 1 : 0.5,
                      cursor: "grab",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <GripVertical size={16} color="#d1d5db" />
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: "#6b7280",
                          }}
                        >
                          {idx + 1}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1a1a1a",
                          fontSize: "0.9rem",
                        }}
                      >
                        {cat?.name ?? "Categoría eliminada"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#aaa",
                          fontFamily: "ui-monospace, monospace",
                          marginTop: 2,
                        }}
                      >
                        /categoria/{cat?.slug}
                      </div>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          background: sec.activo ? "#ecfdf3" : "#fef2f2",
                          color: sec.activo ? "#166534" : "#b91c1c",
                        }}
                      >
                        {sec.activo ? "Visible" : "Oculta"}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => toggleActivo(sec)}
                          title={sec.activo ? "Ocultar" : "Mostrar"}
                          style={{
                            background: "rgba(245,166,35,0.1)",
                            border: "none",
                            borderRadius: 6,
                            padding: 6,
                            cursor: "pointer",
                            color: "#f5a623",
                            display: "flex",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(245,166,35,0.2)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(245,166,35,0.1)")
                          }
                        >
                          {sec.activo ? (
                            <Eye size={15} />
                          ) : (
                            <EyeOff size={15} />
                          )}
                        </button>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            title="Subir"
                            style={{
                              width: 26,
                              height: 18,
                              borderRadius: 4,
                              border: "1px solid #e5e7eb",
                              background: idx === 0 ? "#f3f4f6" : "#fff",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              color: "#666",
                              opacity: idx === 0 ? 0.5 : 1,
                            }}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === secciones.length - 1}
                            title="Bajar"
                            style={{
                              width: 26,
                              height: 18,
                              borderRadius: 4,
                              border: "1px solid #e5e7eb",
                              background:
                                idx === secciones.length - 1
                                  ? "#f3f4f6"
                                  : "#fff",
                              cursor:
                                idx === secciones.length - 1
                                  ? "not-allowed"
                                  : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              color: "#666",
                              opacity: idx === secciones.length - 1 ? 0.5 : 1,
                            }}
                          >
                            ↓
                          </button>
                        </div>

                        <button
                          onClick={() => eliminar(sec)}
                          title="Eliminar"
                          style={{
                            background: "rgba(220,38,38,0.08)",
                            border: "none",
                            borderRadius: 6,
                            padding: 6,
                            cursor: "pointer",
                            color: "#dc2626",
                            display: "flex",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(220,38,38,0.18)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(220,38,38,0.08)")
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
