"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Colaborador } from "@/lib/queries";
import { PlusCircle, X, CheckCircle, Loader2, Upload, Pencil, Trash2, Users, Image, Video } from "lucide-react";

type ColabMedia = {
  id: number;
  colaborador_id: number;
  url: string;
  tipo: "imagen" | "video";
  orden: number;
  titulo: string | null;
};

const initialForm = { name: "", logo_url: "", activo: true, orden: 0 };

export default function AdminColaboradoresPage() {
  const [rows, setRows]               = useState<Colaborador[]>([]);
  const [form, setForm]               = useState(initialForm);
  const [editId, setEditId]           = useState<number | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [logoName, setLogoName]       = useState("");
  const [media, setMedia]             = useState<ColabMedia[]>([]);
  const [mediaMap, setMediaMap]       = useState<Record<number, { imgs: number; vids: number }>>({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const fileRef   = useRef<HTMLInputElement>(null);
  const imgRef    = useRef<HTMLInputElement>(null);
  const vidRef    = useRef<HTMLInputElement>(null);

  function scrollToTop() {
    const c = document.querySelector(".main-content");
    if (c) c.scrollTop = 0;
  }

  async function load() {
    setLoading(true);
    const [{ data: colabs }, { data: allMedia }] = await Promise.all([
      supabase.from("colaboradores").select("*").order("orden", { ascending: true }),
      supabase.from("colaborador_media").select("colaborador_id, tipo"),
    ]);
    setRows(colabs ?? []);
    const mapa: Record<number, { imgs: number; vids: number }> = {};
    for (const m of allMedia ?? []) {
      if (!mapa[m.colaborador_id]) mapa[m.colaborador_id] = { imgs: 0, vids: 0 };
      if (m.tipo === "imagen") mapa[m.colaborador_id].imgs++;
      else mapa[m.colaborador_id].vids++;
    }
    setMediaMap(mapa);
    setLoading(false);
  }

  async function loadMedia(id: number) {
    const { data } = await supabase
      .from("colaborador_media").select("*")
      .eq("colaborador_id", id).order("orden");
    setMedia(data ?? []);
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setLogoName("");
    setMedia([]);
  }

  async function uploadFile(file: File, tipo: "imagen" | "video"): Promise<string | null> {
    const ext  = file.name.split(".").pop();
    const folder = tipo === "imagen" ? "colaboradores/imagenes" : "colaboradores/videos";
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file, { upsert: true });
    if (error) { alert("Error: " + error.message); return null; }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function uploadLogo(file: File): Promise<string | null> {
    setUploading(true);
    const url = await uploadFile(file, "imagen");
    setUploading(false);
    return url;
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    const baseOrden = media.filter((m) => m.tipo === "imagen").length;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], "imagen");
      if (url) await supabase.from("colaborador_media").insert({
        colaborador_id: editId, url, tipo: "imagen", orden: baseOrden + i,
      });
    }
    await loadMedia(editId);
    setUploadingImg(false);
    if (imgRef.current) imgRef.current.value = "";
  }

  async function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingVid(true);
    const baseOrden = media.filter((m) => m.tipo === "video").length;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], "video");
      if (url) await supabase.from("colaborador_media").insert({
        colaborador_id: editId, url, tipo: "video", orden: baseOrden + i,
      });
    }
    await loadMedia(editId);
    setUploadingVid(false);
    if (vidRef.current) vidRef.current.value = "";
  }

  async function deleteMedia(id: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await supabase.from("colaborador_media").delete().eq("id", id);
    if (editId) loadMedia(editId);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Nombre requerido");
    if (!form.logo_url.trim()) return alert("Sube un logo para el colaborador");
    const payload = { name: form.name, logo_url: form.logo_url, url: null, activo: form.activo, orden: form.orden };

    if (editId) {
      const { error } = await supabase.from("colaboradores").update(payload).eq("id", editId);
      if (error) return alert(error.message);
      resetForm(); load();
    } else {
      const { data, error } = await supabase.from("colaboradores").insert(payload).select().single();
      if (error) return alert(error.message);
      // Se queda en formulario para poder subir media
      setEditId(data.id);
      setForm({ name: data.name, logo_url: data.logo_url ?? "", activo: data.activo, orden: data.orden });
      setMedia([]);
      await load();
    }
  }

  function onEdit(c: Colaborador) {
    setEditId(c.id);
    setForm({ name: c.name, logo_url: c.logo_url ?? "", activo: c.activo, orden: c.orden });
    setLogoName(c.logo_url ? "Logo ya subido" : "");
    loadMedia(c.id);
    setShowForm(true);
    setTimeout(() => scrollToTop(), 50);
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar colaborador? También se eliminará su media.")) return;
    await supabase.from("colaborador_media").delete().eq("colaborador_id", id);
    await supabase.from("colaboradores").delete().eq("id", id);
    load();
  }

  const imagenes = media.filter((m) => m.tipo === "imagen");
  const videos   = media.filter((m) => m.tipo === "video");

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
        .ac-btn-upload {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0f0f0; color: #555; border: 1px solid #e0e0e0;
          padding: 6px 14px; border-radius: 7px;
          font-weight: 600; font-size: 0.8rem; cursor: pointer;
          transition: background 0.15s;
        }
        .ac-btn-upload:hover { background: #e4e4e4; }
        .ac-btn-upload:disabled { opacity: 0.5; cursor: not-allowed; }
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
        .ac-media-thumb { position: relative; }
        .ac-media-thumb button {
          position: absolute; top: -6px; right: -6px;
          background: #dc3545; color: #fff; border: none;
          border-radius: 50%; width: 20px; height: 20px;
          font-size: 0.65rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
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
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderTop: "3px solid #f5a623", borderRadius: 12, padding: 24, marginBottom: 28 }}>
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

              {/* Logo dropzone */}
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
                      <img src={form.logo_url} alt="preview" style={{ height: 56, objectFit: "contain", borderRadius: 6 }} />
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
                      <p style={{ margin: 0, fontWeight: 700, color: "#666", fontSize: "0.875rem" }}>Haz clic para subir el logo</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#bbb" }}>PNG, JPG, SVG, WEBP · Recomendado fondo transparente</p>
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

              {/* Botones guardar */}
              <div style={{ display: "flex", gap: 10, marginBottom: editId ? 28 : 0 }}>
                <button type="submit" className="ac-btn-primary" disabled={uploading}>
                  {editId ? <><CheckCircle size={15} /> Guardar cambios</> : <><PlusCircle size={15} /> Crear y añadir media</>}
                </button>
                <button type="button" className="ac-btn-secondary" onClick={resetForm}>
                  <X size={15} /> Cancelar
                </button>
              </div>
            </form>

            {/* ── Sección media (solo disponible después de crear) ── */}
            {editId && (
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>

                {/* Imágenes */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Image size={15} color="#888" />
                      <span className="ac-label" style={{ margin: 0 }}>Imágenes del carrusel ({imagenes.length})</span>
                    </div>
                    <button type="button" className="ac-btn-upload"
                      disabled={uploadingImg} onClick={() => imgRef.current?.click()}>
                      {uploadingImg
                        ? <><Loader2 size={13} className="ac-spin" /> Subiendo...</>
                        : <><Upload size={13} /> Subir imágenes</>}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" multiple
                      style={{ display: "none" }} onChange={handleImgUpload} />
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {imagenes.length === 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px dashed #e0e0e0", width: "100%" }}>
                        <Image size={20} color="#ddd" />
                        <span style={{ fontSize: "0.82rem", color: "#bbb" }}>Sin imágenes aún — sube una o más arriba</span>
                      </div>
                    ) : imagenes.map((m) => (
                      <div key={m.id} className="ac-media-thumb">
                        <img src={m.url} alt=""
                          style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0", display: "block" }} />
                        <button type="button" onClick={() => deleteMedia(m.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Video size={15} color="#888" />
                      <span className="ac-label" style={{ margin: 0 }}>Videos del carrusel ({videos.length})</span>
                    </div>
                    <button type="button" className="ac-btn-upload"
                      disabled={uploadingVid} onClick={() => vidRef.current?.click()}>
                      {uploadingVid
                        ? <><Loader2 size={13} className="ac-spin" /> Subiendo...</>
                        : <><Upload size={13} /> Subir videos</>}
                    </button>
                    <input ref={vidRef} type="file" accept="video/*" multiple
                      style={{ display: "none" }} onChange={handleVidUpload} />
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {videos.length === 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px dashed #e0e0e0", width: "100%" }}>
                        <Video size={20} color="#ddd" />
                        <span style={{ fontSize: "0.82rem", color: "#bbb" }}>Sin videos aún — sube uno o más arriba</span>
                      </div>
                    ) : videos.map((m) => (
                      <div key={m.id} className="ac-media-thumb">
                        <video src={m.url} muted preload="metadata"
                          style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e0e0e0", display: "block" }} />
                        <button type="button" onClick={() => deleteMedia(m.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                    {["Logo", "Nombre", "Orden", "Imágenes", "Videos", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#ccc" }}>
                          <Users size={32} />
                          <span style={{ fontSize: "0.9rem" }}>No hay colaboradores aún</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.map((c, i) => {
                    const m = mediaMap[c.id] ?? { imgs: 0, vids: 0 };
                    return (
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
                          {m.imgs > 0
                            ? <span className="ac-badge" style={{ background: "#eef4ff", color: "#2563eb", gap: 5 }}><Image size={11} /> {m.imgs}</span>
                            : <span style={{ color: "#ddd", fontSize: "0.8rem" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {m.vids > 0
                            ? <span className="ac-badge" style={{ background: "#f0fdf4", color: "#16a34a", gap: 5 }}><Video size={11} /> {m.vids}</span>
                            : <span style={{ color: "#ddd", fontSize: "0.8rem" }}>—</span>}
                        </td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  );
}