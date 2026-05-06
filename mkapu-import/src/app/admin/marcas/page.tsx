"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Marca } from "@/lib/queries";
import {
  PlusCircle,
  X,
  CheckCircle,
  Upload,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";

const initialForm = { name: "", logo_url: "", activo: true, orden: 0 };

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

export default function AdminMarcasPage() {
  const [rows, setRows] = useState<Marca[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [logoName, setLogoName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("marcas")
      .select("*")
      .order("orden", { ascending: true });

    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setLogoName("");
  }

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `marcas/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) return alert("Sube un logo para la marca");

    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      activo: form.activo,
      orden: form.orden,
    };

    const { error } = editId
      ? await supabase.from("marcas").update(payload).eq("id", editId)
      : await supabase.from("marcas").insert(payload);

    if (error) return alert(error.message);

    resetForm();
    await load();
  }

  function onEdit(m: Marca) {
    setEditId(m.id);
    setForm({
      name: m.name,
      logo_url: m.logo_url ?? "",
      activo: m.activo,
      orden: m.orden,
    });
    setLogoName(m.logo_url ? "Logo ya subido" : "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar marca?")) return;
    await supabase.from("marcas").delete().eq("id", id);
    await load();
  }

  async function persistOrder(list: Marca[]) {
    setSavingOrder(true);

    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setRows(reordered);

    await Promise.all(
      reordered.map((item) =>
        supabase.from("marcas").update({ orden: item.orden }).eq("id", item.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...rows];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === rows.length - 1) return;
    const copy = [...rows];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
  }

  function onFocusInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
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
            Marcas
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            {rows.length} marca{rows.length !== 1 ? "s" : ""} registrada
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
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
          }}
        >
          {showForm ? (
            <>
              <X size={15} /> Cancelar
            </>
          ) : (
            <>
              <PlusCircle size={15} /> Nueva marca
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderTop: "3px solid #f5a623",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.75rem",
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
            {editId ? "Editar marca" : "Nueva marca"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr auto",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Nombre *</label>
                <input
                  style={inp}
                  placeholder="Nombre de la marca"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>

              <div>
                <label style={lbl}>Orden</label>
                <input
                  style={inp}
                  type="number"
                  value={form.orden}
                  onChange={(e) =>
                    setForm({ ...form, orden: Number(e.target.value) })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: "0.7rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#444",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) =>
                      setForm({ ...form, activo: e.target.checked })
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#f5a623",
                      cursor: "pointer",
                    }}
                  />
                  Activo
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Logo *</label>

              <div
                onClick={() => !uploading && fileRef.current?.click()}
                style={{
                  border: form.logo_url
                    ? "2px dashed #22c55e"
                    : "2px dashed #e0e0e0",
                  borderRadius: "12px",
                  padding: "1.75rem 1.5rem",
                  textAlign: "center",
                  cursor: uploading ? "not-allowed" : "pointer",
                  background: form.logo_url ? "#f0fdf4" : "#fafafa",
                  transition: "all 0.2s",
                }}
              >
                {uploading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        border: "3px solid #f5a623",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: "#b37400",
                        fontSize: "0.875rem",
                      }}
                    >
                      Subiendo imagen...
                    </p>
                  </div>
                ) : form.logo_url ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <img
                      src={form.logo_url}
                      alt="preview"
                      style={{
                        height: 56,
                        objectFit: "contain",
                        borderRadius: "6px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle size={16} color="#22c55e" />
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          color: "#16a34a",
                          fontSize: "0.875rem",
                        }}
                      >
                        {logoName || "Logo cargado"}
                      </p>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "#22c55e",
                      }}
                    >
                      Haz clic para reemplazar
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Upload size={28} color="#ccc" />
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        color: "#666",
                        fontSize: "0.875rem",
                      }}
                    >
                      Haz clic para subir el logo
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "#bbb",
                      }}
                    >
                      PNG, JPG, SVG, WEBP · Recomendado fondo transparente
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLogoName(file.name);
                  const url = await uploadLogo(file);
                  if (url) setForm((f) => ({ ...f, logo_url: url }));
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  background: uploading ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                {editId ? (
                  <>
                    <CheckCircle size={15} /> Guardar cambios
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} /> Crear marca
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
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
                <X size={15} /> Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm &&
        (loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#aaa",
            }}
          >
            Cargando marcas...
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
            {savingOrder && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fff8e6",
                  color: "#b07800",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                Guardando orden...
              </div>
            )}

            {rows.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  color: "#ccc",
                }}
              >
                <Tag size={32} />
                <span style={{ fontSize: "0.9rem" }}>No hay marcas aún</span>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    {["Logo", "Nombre", "Orden", "Estado", "Acciones"].map(
                      (h) => (
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
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((m, i) => (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom:
                          i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                        background: "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          width: 120,
                        }}
                      >
                        <div
                          style={{
                            width: 90,
                            height: 52,
                            borderRadius: "8px",
                            border: "1px solid #e8e8e8",
                            background: "#fafafa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {m.logo_url ? (
                            <img
                              src={m.logo_url}
                              alt={m.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                color: "#ddd",
                                fontSize: "0.75rem",
                              }}
                            >
                              Sin logo
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {m.name}
                      </td>

                      <td
                        style={{
                          padding: "12px 16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              minWidth: 24,
                              textAlign: "center",
                              fontWeight: 700,
                              color: "#666",
                              fontSize: "0.9rem",
                            }}
                          >
                            {m.orden}
                          </span>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => moveUp(i)}
                              disabled={i === 0 || savingOrder}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                cursor:
                                  i === 0 || savingOrder
                                    ? "not-allowed"
                                    : "pointer",
                                opacity: i === 0 || savingOrder ? 0.45 : 1,
                                fontWeight: 700,
                                color: "#666",
                              }}
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={() => moveDown(i)}
                              disabled={i === rows.length - 1 || savingOrder}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                cursor:
                                  i === rows.length - 1 || savingOrder
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  i === rows.length - 1 || savingOrder
                                    ? 0.45
                                    : 1,
                                fontWeight: 700,
                                color: "#666",
                              }}
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: m.activo ? "#e8f7ee" : "#fde8e8",
                            color: m.activo ? "#1a7a3c" : "#a71d2a",
                          }}
                        >
                          {m.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => onEdit(m)}
                            title="Editar"
                            style={{
                              background: "rgba(245,166,35,0.1)",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px",
                              cursor: "pointer",
                              color: "#f5a623",
                              display: "flex",
                            }}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => onDelete(m.id)}
                            title="Eliminar"
                            style={{
                              background: "rgba(220,38,38,0.08)",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px",
                              cursor: "pointer",
                              color: "#dc2626",
                              display: "flex",
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
