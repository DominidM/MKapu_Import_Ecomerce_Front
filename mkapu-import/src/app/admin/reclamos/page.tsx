"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Eye, ChevronLeft, AlertCircle } from "lucide-react";

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
  pendiente: { label: "Pendiente", bg: "#fde8e8", color: "#a71d2a" },
  en_proceso: { label: "En proceso", bg: "#fff8e6", color: "#7a5000" },
  resuelto: { label: "Resuelto", bg: "#e8f7ee", color: "#1a7a3c" },
};

function estadoInfo(estado: string) {
  return ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.pendiente;
}

export default function AdminReclamacionesPage() {
  const [rows, setRows] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selected, setSelected] = useState<Reclamacion | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Stats
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

  function scrollToTop() {
    const c = document.querySelector(".main-content");
    if (c) c.scrollTop = 0;
  }

  function onVer(r: Reclamacion) {
    setSelected(r);
    setTimeout(() => scrollToTop(), 50);
  }

  function onBack() {
    setSelected(null);
    setTimeout(() => scrollToTop(), 50);
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <>
      <style>{`
        .rc-badge {
          display: inline-flex; align-items: center;
          padding: 2px 10px; border-radius: 20px;
          font-size: 0.75rem; font-weight: 700;
        }
        .rc-select {
          padding: 5px 10px; border-radius: 20px; border: none;
          font-size: 0.78rem; font-weight: 700; cursor: pointer; outline: none;
          transition: opacity 0.15s;
        }
        .rc-select:hover { opacity: 0.85; }
        .rc-filter-btn {
          padding: 7px 16px; border-radius: 20px; border: 1px solid #e0e0e0;
          background: #fff; color: #666; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .rc-filter-btn:hover { border-color: #f5a623; color: #f5a623; }
        .rc-filter-btn--active { background: #f5a623 !important; border-color: #f5a623 !important; color: #fff !important; }
        .rc-row { transition: background 0.1s; }
        .rc-row:hover { background: #fafafa !important; cursor: pointer; }
        .rc-btn-ver {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(0,123,255,0.07); color: #007bff;
          border: 1px solid rgba(0,123,255,0.2); padding: 5px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .rc-btn-ver:hover { background: rgba(0,123,255,0.15); }
        .rc-btn-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0f0f0; color: #555; border: none;
          padding: 8px 16px; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .rc-btn-back:hover { background: #e4e4e4; }
        .rc-page-btn {
          padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 6px;
          background: #fff; color: #666; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .rc-page-btn:hover { border-color: #f5a623; color: #f5a623; }
        .rc-page-btn--active { border: 2px solid #f5a623 !important; background: #fff8e6 !important; color: #f5a623 !important; font-weight: 700 !important; }
        .rc-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .rc-field { background: #f7f7f5; border-radius: 8px; padding: 10px 14px; }
        .rc-field-label { margin: 0; font-size: 0.7rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; }
        .rc-field-value { margin: 3px 0 0; font-size: 0.875rem; color: #1a1a1a; font-weight: 500; }
        @keyframes rc-spin { to { transform: rotate(360deg); } }
        .rc-spin { animation: rc-spin 0.8s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* ── VISTA DETALLE ─────────────────────────────────────────────── */}
        {selected ? (
          <div>
            {/* Header detalle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <button className="rc-btn-back" onClick={onBack}>
                <ChevronLeft size={16} /> Volver
              </button>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 800,
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
                    borderRadius: 4,
                    fontSize: "0.82rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  {selected.ticket}
                </code>
              </div>
            </div>

            {/* Card detalle */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderTop: "3px solid #f5a623",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Nombre + estado */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 800,
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
                    gap: 6,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Cambiar estado
                  </p>
                  <select
                    className="rc-select"
                    value={selected.estado}
                    onChange={(e) => updateEstado(selected.id, e.target.value)}
                    style={{
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

              {/* Campos en grid */}
              <div style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginBottom: 16,
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
                        { day: "2-digit", month: "long", year: "numeric" },
                      ),
                    },
                    {
                      label: "Estado actual",
                      value: estadoInfo(selected.estado).label,
                    },
                  ].map((f) => (
                    <div key={f.label} className="rc-field">
                      <p className="rc-field-label">{f.label}</p>
                      <p className="rc-field-value">{f.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Descripción */}
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Descripción
                  </p>
                  <div
                    style={{
                      background: "#f7f7f5",
                      borderRadius: 8,
                      padding: 16,
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
          </div>
        ) : (
          /* ── VISTA LISTA ──────────────────────────────────────────────── */
          <>
            {/* Header lista */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "#1a1a1a",
                  }}
                >
                  Reclamaciones
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.875rem",
                    color: "#999",
                  }}
                >
                  Gestiona y responde los tickets de clientes
                </p>
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                {
                  key: "todos",
                  label: "Total",
                  color: "#1a1a1a",
                  bg: "#ffffff",
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
                    borderRadius: 10,
                    padding: "16px 18px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: s.color,
                      opacity: 0.65,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
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

            {/* Filtros */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { value: "todos", label: "Todas" },
                { value: "pendiente", label: "Pendientes" },
                { value: "en_proceso", label: "En proceso" },
                { value: "resuelto", label: "Resueltas" },
              ].map((f) => (
                <button
                  key={f.value}
                  className={`rc-filter-btn${filterEstado === f.value ? " rc-filter-btn--active" : ""}`}
                  onClick={() => setFilterEstado(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "48px",
                    color: "#aaa",
                  }}
                >
                  <Loader2 size={20} className="rc-spin" color="#f5a623" />
                  <span style={{ fontSize: "0.9rem" }}>Cargando...</span>
                </div>
              ) : rows.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "48px",
                    color: "#ccc",
                  }}
                >
                  <AlertCircle size={32} />
                  <span style={{ fontSize: "0.9rem" }}>
                    No hay reclamaciones con este filtro
                  </span>
                </div>
              ) : (
                <>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                    }}
                  >
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
                              padding: "12px 16px",
                              textAlign: "left",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "#aaa",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              whiteSpace: "nowrap",
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
                            className="rc-row"
                            style={{
                              borderBottom:
                                i < rows.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                              background: "#fff",
                            }}
                            onClick={() => onVer(r)}
                          >
                            <td style={{ padding: "12px 16px" }}>
                              <code
                                style={{
                                  background: "#fff8e6",
                                  color: "#b07800",
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontSize: "0.78rem",
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                }}
                              >
                                {r.ticket}
                              </code>
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                fontWeight: 600,
                                color: "#1a1a1a",
                              }}
                            >
                              {r.nombres} {r.apellidos}
                            </td>
                            <td style={{ padding: "12px 16px", color: "#666" }}>
                              {r.email}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span
                                className="rc-badge"
                                style={{ background: "#f0f0f0", color: "#555" }}
                              >
                                {r.tipo}
                              </span>
                            </td>
                            <td
                              style={{ padding: "12px 16px" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <select
                                className="rc-select"
                                value={r.estado || "pendiente"}
                                onChange={(e) =>
                                  updateEstado(r.id, e.target.value)
                                }
                                style={{ background: es.bg, color: es.color }}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En proceso</option>
                                <option value="resuelto">Resuelto</option>
                              </select>
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#aaa",
                                fontSize: "0.8rem",
                                whiteSpace: "nowrap",
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
                              style={{ padding: "12px 16px" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="rc-btn-ver"
                                onClick={() => onVer(r)}
                              >
                                <Eye size={12} /> Ver
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Paginador */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderTop: "1px solid #e8e8e8",
                      background: "#fafafa",
                      fontSize: "0.875rem",
                      color: "#888",
                      flexWrap: "wrap",
                      gap: 12,
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
                        gap: 6,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="rc-page-btn"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        ← Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            className={`rc-page-btn${currentPage === page ? " rc-page-btn--active" : ""}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ),
                      )}
                      <button
                        className="rc-page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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
    </>
  );
}
