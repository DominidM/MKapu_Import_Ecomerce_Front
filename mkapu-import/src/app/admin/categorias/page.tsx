"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";

type Categoria = {
  id: number;
  name: string;
  slug: string;
  activo: boolean;
};

const initialForm = { name: "", slug: "", activo: true };

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#444",
  marginBottom: "0.4rem",
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const ITEMS_PER_PAGE = 10;

export default function AdminCategoriasPage() {
  const [rows, setRows] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "confirm" | "alert";
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", variant: "confirm", onConfirm: () => {} });

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categorias").select("*").order("id");
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setModal({ open: true, title: "Confirmar", message: "¿Guardar estos cambios?", variant: "confirm", onConfirm: async () => {
      setModal((m) => ({ ...m, open: false }));
      if (!form.name.trim()) { setModal({ open: true, title: "Error", message: "Nombre requerido", variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; }
      if (!form.slug.trim()) { setModal({ open: true, title: "Error", message: "Slug requerido", variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        activo: form.activo,
      };

      const { error } = editId
        ? await supabase.from("categorias").update(payload).eq("id", editId)
        : await supabase.from("categorias").insert(payload);

      if (error) { setModal({ open: true, title: "Error", message: error.message, variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; }
      cancelForm();
      await load();
      setSuccessMsg(editId ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
      setTimeout(() => setSuccessMsg(""), 3000);
    } });
    return;
  }

  function onEdit(c: Categoria) {
    setEditId(c.id);
    setForm({
      name: c.name ?? "",
      slug: c.slug ?? "",
      activo: c.activo ?? true,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    setModal({ open: true, title: "Confirmar", message: "¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.", variant: "confirm", onConfirm: async () => {
      setModal((m) => ({ ...m, open: false }));
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) { setModal({ open: true, title: "Error", message: error.message, variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; }
      load();
    } });
    return;
  }

  async function toggleActivo(c: Categoria) {
    await supabase
      .from("categorias")
      .update({ activo: !c.activo })
      .eq("id", c.id);

    load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
  }

  function onFocusInput(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  const filtered = rows.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {successMsg && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: "#16a34a", color: "#fff", padding: "0.75rem 1.25rem",
          borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", gap: "8px",
        }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((m) => ({ ...m, open: false }))}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          gap: "1rem",
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
            Categorías
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            {rows.length} categoría{rows.length !== 1 ? "s" : ""} registrada
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) cancelForm();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f5a623",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.65rem 1.1rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#d4891a")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f5a623")}
        >
          {showForm ? "✕ Cancelar" : "+ Nueva categoría"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            borderTop: "3px solid #f5a623",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.25rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            {editId ? "Editar categoría" : "Nueva categoría"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  style={inp}
                  placeholder="Ej: Electrónica"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({ ...form, name, slug: toSlug(name) });
                  }}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>

              <div>
                <label style={lbl}>
                  Slug{" "}
                  <span
                    style={{
                      color: "#bbb",
                      textTransform: "none",
                      fontWeight: 400,
                    }}
                  >
                    (auto-generado)
                  </span>
                </label>
                <input
                  style={{ ...inp, background: "#fafafa" }}
                  placeholder="electronica"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: toSlug(e.target.value) })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>Estado</label>
                <select
                  style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            {form.slug && (
              <div style={{ marginBottom: "1.25rem", wordBreak: "break-all" }}>
                <span style={{ fontSize: "0.78rem", color: "#aaa" }}>
                  Vista previa URL:{" "}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#f5a623",
                    fontWeight: 600,
                  }}
                >
                  /categoria/<strong>{form.slug}</strong>
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#d4891a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f5a623")
                }
              >
                {editId ? "Guardar cambios" : "Crear categoría"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <input
              style={{ ...inp, maxWidth: 380 }}
              placeholder="Buscar por nombre o slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
            />
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#aaa",
              }}
            >
              Cargando categorías...
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 640,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#fafafa",
                        borderBottom: "1px solid #e8e8e8",
                      }}
                    >
                      {["Nombre", "Slug", "Estado", "Acciones"].map((h) => (
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
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            color: "#aaa",
                          }}
                        >
                          {search ? "Sin resultados" : "No hay categorías aún"}
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((c, i) => (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom:
                              i < paginatedData.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              fontSize: "0.9rem",
                              minWidth: 180,
                            }}
                          >
                            {c.name}
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              minWidth: 180,
                            }}
                          >
                            <span
                              style={{
                                background: "#f5f5f5",
                                color: "#888",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontFamily: "monospace",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.slug}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              minWidth: 130,
                            }}
                          >
                            <button
                              onClick={() => toggleActivo(c)}
                              title="Click para cambiar estado"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 12px",
                                borderRadius: "999px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                background: c.activo
                                  ? "rgba(34,197,94,0.1)"
                                  : "rgba(239,68,68,0.1)",
                                color: c.activo ? "#16a34a" : "#dc2626",
                                transition: "opacity 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.8")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                            >
                              {c.activo ? "Activo" : "Inactivo"}
                            </button>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              minWidth: 180,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <button
                                onClick={() => onEdit(c)}
                                title="Editar categoría"
                                aria-label={`Editar categoría ${c.name}`}
                                style={{
                                  background: "rgba(245,166,35,0.1)",
                                  color: "#f5a623",
                                  border: "1px solid rgba(245,166,35,0.18)",
                                  padding: "7px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s, transform 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(245,166,35,0.18)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(245,166,35,0.1)";
                                }}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => onDelete(c.id)}
                                title="Eliminar categoría"
                                aria-label={`Eliminar categoría ${c.name}`}
                                style={{
                                  background: "rgba(220,53,69,0.08)",
                                  color: "#dc3545",
                                  border: "1px solid rgba(220,53,69,0.2)",
                                  padding: "7px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s, transform 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(220,53,69,0.14)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(220,53,69,0.08)";
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e8e8e8",
                  background: "#fafafa",
                  fontSize: "0.8rem",
                  color: "#aaa",
                }}
              >
                {filtered.length} de {rows.length} categoría
                {rows.length !== 1 ? "s" : ""}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}