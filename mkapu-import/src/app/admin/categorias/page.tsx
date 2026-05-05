"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Categoria = {
  id: number;
  name: string;
  slug: string;
  activo: boolean;
};

const initialForm = { name: "", slug: "", activo: true };

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#888",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
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

export default function AdminCategoriasPage() {
  const [rows, setRows] = useState<Categoria[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.slug.trim()) return alert("Slug requerido");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      activo: form.activo,
    };

    const { error } = editId
      ? await supabase.from("categorias").update(payload).eq("id", editId)
      : await supabase.from("categorias").insert(payload);

    if (error) return alert(error.message);
    cancelForm();
    load();
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
    if (
      !confirm(
        "¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.",
      )
    )
      return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
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

  const filtered = rows.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}
        .rh:hover{background:#fafafa!important}
        .be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}
        .bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}
        .bp:hover{background:#e69510!important}
        .tog:hover{opacity:0.8}
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Categorías
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            {rows.length} categoría{rows.length !== 1 ? "s" : ""} registrada
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="bp"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) cancelForm();
          }}
          style={{
            background: "#f5a623",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.875rem",
          }}
        >
          {showForm ? "✕ Cancelar" : "+ Nueva categoría"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "28px",
            borderTop: "3px solid #f5a623",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: "1rem",
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
                gridTemplateColumns: "1fr 1fr 120px",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {/* Nombre */}
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  className="fi"
                  style={inp}
                  placeholder="Ej: Electrónica"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({ ...form, name, slug: toSlug(name) });
                  }}
                  required
                />
              </div>

              {/* Slug */}
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
                  className="fi"
                  style={{ ...inp, background: "#fafafa" }}
                  placeholder="electronica"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: toSlug(e.target.value) })
                  }
                />
              </div>

              {/* Estado */}
              <div>
                <label style={lbl}>Estado</label>
                <select
                  className="fi"
                  style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Preview slug */}
            {form.slug && (
              <div style={{ marginBottom: "20px" }}>
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="bp"
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {editId ? "Guardar cambios" : "Crear categoría"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  background: "#f0f0f0",
                  color: "#555",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador + Tabla — ocultos cuando formulario abierto */}
      {!showForm && (
        <>
          <div style={{ marginBottom: "16px" }}>
            <input
              className="fi"
              style={{ ...inp, maxWidth: 380 }}
              placeholder="Buscar por nombre o slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
              Cargando categorías...
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
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
                    {["Nombre", "Slug", "Estado", "Acciones"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#555",
                          fontSize: "0.75rem",
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
                          padding: "40px",
                          textAlign: "center",
                          color: "#aaa",
                        }}
                      >
                        {search ? "Sin resultados" : "No hay categorías aún"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, i) => (
                      <tr
                        key={c.id}
                        className="rh"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                          background: "#fff",
                        }}
                      >
                        {/* Nombre */}
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {c.name}
                        </td>
                        {/* Slug */}
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              background: "#f5f5f5",
                              color: "#888",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {c.slug}
                          </span>
                        </td>
                        {/* Estado — toggle rápido */}
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            className="tog"
                            onClick={() => toggleActivo(c)}
                            title="Click para cambiar estado"
                            style={{
                              padding: "3px 12px",
                              borderRadius: "20px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              background: c.activo ? "#e8f7ee" : "#fde8e8",
                              color: c.activo ? "#1a7a3c" : "#a71d2a",
                            }}
                          >
                            {c.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        {/* Acciones */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="be"
                              onClick={() => onEdit(c)}
                              style={{
                                background: "rgba(0,123,255,0.08)",
                                color: "#007bff",
                                border: "1px solid rgba(0,123,255,0.2)",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="bd"
                              onClick={() => onDelete(c.id)}
                              style={{
                                background: "rgba(220,53,69,0.08)",
                                color: "#dc3545",
                                border: "1px solid rgba(220,53,69,0.2)",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
