"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Colaborador } from "@/lib/queries";
import { PlusCircle, X, CheckCircle, Loader2, Upload, Pencil, Trash2, Users } from "lucide-react";

const initialForm = { name: "", logo_url: "", activo: true, orden: 0 };

export default function AdminColaboradoresPage() {
  const [rows, setRows]           = useState<Colaborador[]>([]);
  const [form, setForm]           = useState(initialForm);
  const [editId, setEditId]       = useState<number | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [logoName, setLogoName]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function scrollToTop() {
    const c = document.querySelector(".main-content");
    if (c) c.scrollTop = 0;
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("colaboradores").select("*").order("orden", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setLogoName("");
  }

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `colaboradores/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { alert("Error: " + error.message); return null; }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) return alert("Sube un logo para el colaborador");
    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      url: null,
      activo: form.activo,
      orden: form.orden,
    };
    const { error } = editId
      ? await supabase.from("colaboradores").update(payload).eq("id", editId)
      : await supabase.from("colaboradores").insert(payload);
    if (error) return alert(error.message);
    resetForm();
    load();
  }

  function onEdit(c: Colaborador) {
    setEditId(c.id);
    setForm({ name: c.name, logo_url: c.logo_url ?? "", activo: c.activo, orden: c.orden });
    setLogoName(c.logo_url ? "Logo ya subido" : "");
    setShowForm(true);
    setTimeout(() => scrollToTop(), 50);
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar colaborador?")) return;
    await supabase.from("colaboradores").delete().eq("id", id);
    load();
  }

  return (
    <>
      <style>{`
        .ac-input {
          width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0;
          border-radius: 8px; font-size: 0.875rem; background: #fff;
          color: #1a1a1a; outline: none; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ac-input:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
        .ac-label {
          display: block; font-size: 0.72rem; font-weight: 700; color: #999;
          margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .ac-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f5a623; color: #fff; border: none;
          padding: 10px 22px; border-radius: 8px;
          font-weight: 700; font-size: 0.875rem; cursor: pointer;
          transition: background 0.15s;
        }
        .ac-btn-primary:hover { background: #e69510; }
        .ac-btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .ac-btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f0f0f0; color: #555; border: none;
          padding: 10px 18px; border-radius: 8px;
          font-weight: 600; font-size: 0.875rem; cursor: pointer;
          transition: background 0.15s;
        }
        .ac-btn-secondary:hover { background: #e4e4e4; }
        .ac-dropzone {
          width: 100%; border: 2px dashed #e0e0e0; border-radius: 12px;
          padding: 28px 24px; text-align: center; cursor: pointer;
          background: #fafafa; transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ac-dropzone:hover { border-color: #f5a623; background: #fff8ee; }
        .ac-dropzone--success { border-color: #22c55e !important; background: #f0fdf4 !important; }
        .ac-dropzone--uploading { cursor: not-allowed !important; }
        .ac-row { transition: background 0.1s; }
        .ac-row:hover { background: #fafafa !important; }
        .ac-btn-edit {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(0,123,255,0.07); color: #007bff;
          border: 1px solid rgba(0,123,255,0.2); padding: 5px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .ac-btn-edit:hover { background: rgba(0,123,255,0.15); }
        .ac-btn-delete {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(220,53,69,0.07); color: #dc3545;
          border: 1px solid rgba(220,53,69,0.2); padding: 5px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .ac-btn-delete:hover { background: rgba(220,53,69,0.15); }
        .ac-badge {
          display: inline-flex; align-items: center;
          padding: 2px 10px; border-radius: 20px;
          font-size: 0.75rem; font-weight: 700;
        }
        @keyframes ac-spin { to { transform: rotate(360deg); } }
        .ac-spin { animation: ac-spin 0.8s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a" }}>Colaboradores</h1>
            <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#999" }}>
              {rows.length} colaborador{rows.length !== 1 ? "es" : ""} registrado{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="ac-btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>
            {showForm ? <><X size={15} /> Cancelar</> : <><PlusCircle size={15} /> Nuevo colaborador</>}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div style={{
            background: "#fff", border: "1px solid #e8e8e8",
            borderTop: "3px solid #f5a623", borderRadius: 12,
            padding: 24, marginBottom: 28,
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>
              {editId ? "Editar colaborador" : "Nuevo colaborador"}
            </h2>

            <form onSubmit={save}>

              {/* Nombre, Orden, Activo */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr auto", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="ac-label">Nombre *</label>
                  <input className="ac-input" placeholder="Nombre del colaborador"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="ac-label">Orden</label>
                  <input className="ac-input" type="number"
                    value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", color: "#555" }}>
                    <input type="checkbox" checked={form.activo}
                      onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: "#f5a623" }} />
                    Activo
                  </label>
                </div>
              </div>

              {/* Dropzone logo */}
              <div style={{ marginBottom: 20 }}>
                <label className="ac-label">Logo *</label>
                <div
                  className={`ac-dropzone${uploading ? " ac-dropzone--uploading" : form.logo_url ? " ac-dropzone--success" : ""}`}
                  onClick={() => !uploading && fileRef.current?.click()}
                >
                  {uploading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Loader2 size={28} color="#f5a623" className="ac-spin" />
                      <p style={{ margin: 0, fontWeight: 700, color: "#b37400", fontSize: "0.875rem" }}>Subiendo imagen...</p>
                    </div>
                  ) : form.logo_url ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <img src={form.logo_url} alt="preview"
                        style={{ height: 56, objectFit: "contain", borderRadius: 6 }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle size={16} color="#22c55e" />
                        <p style={{ margin: 0, fontWeight: 700, color: "#16a34a", fontSize: "0.875rem" }}>
                          {logoName || "Logo cargado"}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#22c55e" }}>Haz clic para reemplazar</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Upload size={28} color="#ccc" />
                      <p style={{ margin: 0, fontWeight: 700, color: "#666", fontSize: "0.875rem" }}>
                        Haz clic para subir el logo
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#bbb" }}>
                        PNG, JPG, SVG, WEBP · Recomendado fondo transparente
                      </p>
                    </div>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoName(file.name);
                    const url = await uploadLogo(file);
                    if (url) setForm((f) => ({ ...f, logo_url: url }));
                    if (fileRef.current) fileRef.current.value = "";
                  }} />
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="ac-btn-primary" disabled={uploading}>
                  {editId ? <><CheckCircle size={15} /> Guardar cambios</> : <><PlusCircle size={15} /> Crear colaborador</>}
                </button>
                <button type="button" className="ac-btn-secondary" onClick={resetForm}>
                  <X size={15} /> Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        {!showForm && (
          loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "48px 0", color: "#aaa" }}>
              <Loader2 size={20} className="ac-spin" color="#f5a623" />
              <span style={{ fontSize: "0.9rem" }}>Cargando...</span>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                    {["Logo", "Nombre", "Orden", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#ccc" }}>
                          <Users size={32} />
                          <span style={{ fontSize: "0.9rem" }}>No hay colaboradores aún</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.map((c, i) => (
                    <tr key={c.id} className="ac-row"
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>

                      <td style={{ padding: "12px 16px" }}>
                        {c.logo_url
                          ? <img src={c.logo_url} alt={c.name} style={{ height: 40, objectFit: "contain", borderRadius: 6 }} />
                          : <span style={{ color: "#ddd", fontSize: "0.8rem" }}>Sin logo</span>}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>{c.name}</td>
                      <td style={{ padding: "12px 16px", color: "#aaa", fontWeight: 600 }}>{c.orden}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="ac-badge" style={{
                          background: c.activo ? "#e8f7ee" : "#fde8e8",
                          color: c.activo ? "#1a7a3c" : "#a71d2a",
                        }}>
                          {c.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="ac-btn-edit" onClick={() => onEdit(c)}>
                            <Pencil size={12} /> Editar
                          </button>
                          <button className="ac-btn-delete" onClick={() => onDelete(c.id)}>
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}