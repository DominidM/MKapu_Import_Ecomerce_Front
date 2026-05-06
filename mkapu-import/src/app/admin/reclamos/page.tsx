"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, ChevronLeft } from "lucide-react";

type Reclamacion = {
  id: number;
  ticket: string;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: string;
  descripcion: string;
  estado: string;
  created_at: string;
};

const ESTADOS = {
  pendiente: { label: "Pendiente", bg: "#fff7ed", color: "#c2410c" },
  en_proceso: { label: "En proceso", bg: "#fffbeb", color: "#b45309" },
  resuelto: { label: "Resuelto", bg: "#f0fdf4", color: "#15803d" },
};

function estadoInfo(estado: string) {
  return ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.pendiente;
}

export default function AdminReclamacionesPage() {
  const [rows, setRows] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selected, setSelected] = useState<Reclamacion | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    todos: 0,
    pendiente: 0,
    en_proceso: 0,
    resuelto: 0,
  });

  async function loadStats() {
    const [all, pend, proc, res] = await Promise.all([
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "en_proceso"),
      supabase
        .from("reclamaciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "resuelto"),
    ]);
    setStats({
      todos: all.count || 0,
      pendiente: pend.count || 0,
      en_proceso: proc.count || 0,
      resuelto: res.count || 0,
    });
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado]);

  useEffect(() => {
    loadStats();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reclamaciones")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (filterEstado !== "todos") query = query.eq("estado", filterEstado);
    const from = (currentPage - 1) * itemsPerPage;
    query = query.range(from, from + itemsPerPage - 1);
    const { data, count, error } = await query;
    if (!error) {
      setRows((data as Reclamacion[]) || []);
      setTotalItems(count || 0);
    }
    setLoading(false);
  }, [filterEstado, currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateEstado(id: number, nuevoEstado: string) {
    const { error } = await supabase
      .from("reclamaciones")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    if (!error) {
      load();
      loadStats();
      if (selected?.id === id)
        setSelected((p) => (p ? { ...p, estado: nuevoEstado } : null));
    }
  }

  function onVer(r: Reclamacion) {
    setSelected(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onBack() {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {selected ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "0.65rem 1rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                color: "#555",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <ChevronLeft size={16} /> Volver
            </button>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Detalle de reclamación
              </h1>
              <code
                style={{
                  background: "#fff8e6",
                  color: "#b07800",
                  padding: "2px 10px",
                  borderRadius: "4px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {selected.ticket}
              </code>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderTop: "3px solid #f5a623",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1a1a1a",
                  }}
                >
                  {selected.nombres} {selected.apellidos}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.85rem",
                    color: "#888",
                  }}
                >
                  {selected.email}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                  }}
                >
                  Cambiar estado
                </label>
                <select
                  value={selected.estado}
                  onChange={(e) => updateEstado(selected.id, e.target.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    border: "none",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: estadoInfo(selected.estado).bg,
                    color: estadoInfo(selected.estado).color,
                  }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resuelto</option>
                </select>
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {[
                  { label: "DNI", value: selected.dni },
                  { label: "Teléfono", value: selected.telefono },
                  { label: "Tipo", value: selected.tipo },
                  {
                    label: "Fecha",
                    value: new Date(selected.created_at).toLocaleDateString(
                      "es-PE",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    ),
                  },
                  {
                    label: "Estado actual",
                    value: estadoInfo(selected.estado).label,
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    style={{
                      background: "#f7f7f5",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {f.label}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.875rem",
                        color: "#1a1a1a",
                        fontWeight: 500,
                      }}
                    >
                      {f.value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Descripción
                </p>
                <div
                  style={{
                    background: "#f7f7f5",
                    borderRadius: "8px",
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#333",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selected.descripcion || "Sin descripción"}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              Reclamaciones
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#888",
                margin: "0.25rem 0 0",
              }}
            >
              Gestiona y responde los tickets de clientes
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                key: "todos",
                label: "Total",
                color: "#1a1a1a",
                bg: "#fff",
                border: "1px solid #e8e8e8",
              },
              {
                key: "pendiente",
                label: "Pendientes",
                color: "#c2410c",
                bg: "#fff7ed",
                border: "1px solid #fed7aa",
              },
              {
                key: "en_proceso",
                label: "En proceso",
                color: "#b45309",
                bg: "#fffbeb",
                border: "1px solid #fde68a",
              },
              {
                key: "resuelto",
                label: "Resueltos",
                color: "#15803d",
                bg: "#f0fdf4",
                border: "1px solid #bbf7d0",
              },
            ].map((s) => (
              <div
                key={s.key}
                style={{
                  background: s.bg,
                  border: s.border,
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: s.color,
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1,
                  }}
                >
                  {stats[s.key as keyof typeof stats]}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "todos", label: "Todas" },
              { value: "pendiente", label: "Pendientes" },
              { value: "en_proceso", label: "En proceso" },
              { value: "resuelto", label: "Resueltas" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterEstado(f.value)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "20px",
                  border:
                    filterEstado === f.value ? "none" : "1px solid #e0e0e0",
                  background: filterEstado === f.value ? "#f5a623" : "#fff",
                  color: filterEstado === f.value ? "#fff" : "#666",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div
                style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}
              >
                Cargando...
              </div>
            ) : rows.length === 0 ? (
              <div
                style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}
              >
                No hay reclamaciones con este filtro
              </div>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#fafafa",
                        borderBottom: "1px solid #e8e8e8",
                      }}
                    >
                      {[
                        "Ticket",
                        "Cliente",
                        "Email",
                        "Tipo",
                        "Estado",
                        "Fecha",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
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
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const es = estadoInfo(r.estado);
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom:
                              i < rows.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fafafa")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#fff")
                          }
                          onClick={() => onVer(r)}
                        >
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <code
                              style={{
                                background: "#fff8e6",
                                color: "#b07800",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                              }}
                            >
                              {r.ticket}
                            </code>
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              fontSize: "0.9rem",
                            }}
                          >
                            {r.nombres} {r.apellidos}
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              color: "#666",
                              fontSize: "0.875rem",
                            }}
                          >
                            {r.email}
                          </td>
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                padding: "2px 10px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: "#f0f0f0",
                                color: "#555",
                              }}
                            >
                              {r.tipo}
                            </span>
                          </td>
                          <td
                            style={{ padding: "0.9rem 1rem" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={r.estado || "pendiente"}
                              onChange={(e) =>
                                updateEstado(r.id, e.target.value)
                              }
                              style={{
                                padding: "5px 12px",
                                borderRadius: "20px",
                                border: "none",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                background: es.bg,
                                color: es.color,
                              }}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En proceso</option>
                              <option value="resuelto">Resuelto</option>
                            </select>
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              color: "#aaa",
                              fontSize: "0.8rem",
                            }}
                          >
                            {new Date(r.created_at).toLocaleDateString(
                              "es-PE",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td
                            style={{ padding: "0.9rem 1rem" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onVer(r)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                background: "rgba(0,123,255,0.07)",
                                color: "#007bff",
                                border: "1px solid rgba(0,123,255,0.2)",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(0,123,255,0.15)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(0,123,255,0.07)")
                              }
                            >
                              <Eye size={12} /> Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderTop: "1px solid #e8e8e8",
                    background: "#fafafa",
                    fontSize: "0.875rem",
                    color: "#888",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <span>
                    Mostrando {totalItems === 0 ? 0 : startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, totalItems)} de{" "}
                    {totalItems}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        background: "#fff",
                        color: "#666",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.4 : 1,
                      }}
                    >
                      ← Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "6px 10px",
                            border:
                              currentPage === page
                                ? "2px solid #f5a623"
                                : "1px solid #e0e0e0",
                            borderRadius: "6px",
                            background:
                              currentPage === page ? "#fff8e6" : "#fff",
                            color: currentPage === page ? "#f5a623" : "#666",
                            fontSize: "0.8rem",
                            fontWeight: currentPage === page ? 700 : 600,
                            cursor: "pointer",
                          }}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        background: "#fff",
                        color: "#666",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                        opacity: currentPage === totalPages ? 0.4 : 1,
                      }}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
