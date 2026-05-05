"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/queries";
import {
  Upload,
  CheckCircle,
  Loader2,
  Film,
  Pencil,
  Trash2,
  PlusCircle,
  X,
} from "lucide-react";

const initialForm = {
  title: "",
  descripcion: "",
  video_url: "",
  tipo: "video" as "video" | "vlog",
  activo: true,
};

export default function AdminVideosPage() {
  const [rows, setRows] = useState<Video[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<"" | "video" | "vlog">("");

  const videoFileRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  // ── Scroll al top del contenedor del layout ──────────────────────────────
  function scrollToTop() {
    const container = document.querySelector(".main-content");
    if (container) container.scrollTop = 0;
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  async function uploadVideo(file: File): Promise<string | null> {
    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(
        `El archivo supera los ${MAX_MB}MB. Comprime el video e intenta de nuevo.`,
      );
      return null;
    }
    setUploadingVideo(true);
    setUploadProgress("Subiendo...");
    const ext = file.name.split(".").pop();
    const path = `videos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    setUploadingVideo(false);
    if (error) {
      setUploadProgress("");
      alert("Error al subir: " + error.message);
      return null;
    }
    const url = supabase.storage.from("imagenes").getPublicUrl(path)
      .data.publicUrl;
    setUploadProgress("✓ Video subido correctamente");
    return url;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
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
    setUploadProgress("");
    setSelectedFileName("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Título requerido");
    if (!form.video_url.trim()) return alert("Sube un archivo de video");
    const payload = {
      title: form.title,
      descripcion: form.descripcion || null,
      video_url: form.video_url,
      tipo: form.tipo,
      activo: form.activo,
    };
    const { error } = editId
      ? await supabase.from("videos").update(payload).eq("id", editId)
      : await supabase.from("videos").insert(payload);
    if (error) return alert(error.message);
    resetForm();
    load();
  }

  function onEdit(v: Video) {
    setEditId(v.id);
    setForm({
      title: v.title,
      descripcion: v.descripcion ?? "",
      video_url: v.video_url ?? "",
      tipo: v.tipo,
      activo: v.activo,
    });
    setUploadProgress("");
    setSelectedFileName(v.video_url ? "Video ya subido" : "");
    setShowForm(true);
    // Scroll correcto: al contenedor del layout, no window
    setTimeout(() => scrollToTop(), 50);
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    load();
  }

  const filtered = filterTipo
    ? rows.filter((v) => v.tipo === filterTipo)
    : rows;

  return (
    <>
      <style>{`
        .av-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: #fff;
          color: #1a1a1a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .av-input:focus {
          border-color: #f5a623;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }
        .av-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #999;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .av-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #f5a623;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .av-btn-primary:hover { background: #e69510; }
        .av-btn-primary:disabled { background: #ccc; cursor: not-allowed; }
        .av-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #f0f0f0;
          color: #555;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .av-btn-secondary:hover { background: #e4e4e4; }
        .av-row:hover { background: #fafafa; }
        .av-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,123,255,0.07);
          color: #007bff;
          border: 1px solid rgba(0,123,255,0.2);
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .av-btn-edit:hover { background: rgba(0,123,255,0.15); }
        .av-btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(220,53,69,0.07);
          color: #dc3545;
          border: 1px solid rgba(220,53,69,0.2);
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .av-btn-delete:hover { background: rgba(220,53,69,0.15); }
        .av-dropzone {
          width: 100%;
          border: 2px dashed #e0e0e0;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
          cursor: pointer;
          background: #fafafa;
          transition: border-color 0.2s, background 0.2s;
        }
        .av-dropzone:hover { border-color: #f5a623; background: #fff8ee; }
        .av-dropzone--success { border-color: #22c55e !important; background: #f0fdf4 !important; }
        .av-dropzone--uploading { cursor: not-allowed !important; }
        .av-filter-btn {
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e0e0e0;
          background: #fff;
          color: #666;
          transition: all 0.15s;
        }
        .av-filter-btn:hover { background: #fafafa; }
        .av-filter-btn--active {
          border: 2px solid #f5a623 !important;
          background: #fff8e6;
          color: #f5a623;
          font-weight: 700;
        }
        .av-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 9px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        @keyframes av-spin { to { transform: rotate(360deg); } }
        .av-spin { animation: av-spin 0.8s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
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
              Videos
            </h1>
            <p
              style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#999" }}
            >
              {rows.length} video{rows.length !== 1 ? "s" : ""} registrado
              {rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            className="av-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? (
              <>
                <X size={15} /> Cancelar
              </>
            ) : (
              <>
                <PlusCircle size={15} /> Nuevo video
              </>
            )}
          </button>
        </div>

        {/* Formulario — se muestra ENCIMA de la tabla, oculta visualmente la lista */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderTop: "3px solid #f5a623",
              borderRadius: 12,
              padding: 24,
              marginBottom: 28,
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
              {editId ? "Editar video" : "Nuevo video"}
            </h2>

            <form onSubmit={save}>
              {/* Fila 1: Título, Tipo, Activo */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr auto",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label className="av-label">Título *</label>
                  <input
                    className="av-input"
                    placeholder="Título del video"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="av-label">Tipo</label>
                  <select
                    className="av-input"
                    value={form.tipo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tipo: e.target.value as "video" | "vlog",
                      })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="vlog">Vlog</option>
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: 2,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#555",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={(e) =>
                        setForm({ ...form, activo: e.target.checked })
                      }
                      style={{ width: 16, height: 16, accentColor: "#f5a623" }}
                    />
                    Activo
                  </label>
                </div>
              </div>

              {/* Dropzone */}
              <div style={{ marginBottom: 16 }}>
                <label className="av-label">Archivo de video *</label>
                <div
                  className={`av-dropzone${uploadingVideo ? " av-dropzone--uploading" : form.video_url ? " av-dropzone--success" : ""}`}
                  onClick={() =>
                    !uploadingVideo && videoFileRef.current?.click()
                  }
                >
                  {uploadingVideo ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Loader2 size={28} color="#f5a623" className="av-spin" />
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          color: "#b37400",
                          fontSize: "0.875rem",
                        }}
                      >
                        Subiendo video...
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#aaa",
                        }}
                      >
                        No cierres esta página
                      </p>
                    </div>
                  ) : form.video_url ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CheckCircle size={28} color="#22c55e" />
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          color: "#16a34a",
                          fontSize: "0.875rem",
                        }}
                      >
                        {selectedFileName || "Video cargado"}
                      </p>
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
                        gap: 8,
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
                        Haz clic para seleccionar un video
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#bbb",
                        }}
                      >
                        Formatos: mp4, webm, mov, avi · Máximo 50MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/avi"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSelectedFileName(file.name);
                    const url = await uploadVideo(file);
                    if (url) setForm((f) => ({ ...f, video_url: url }));
                    if (videoFileRef.current) videoFileRef.current.value = "";
                  }}
                />
                {uploadProgress && !uploadingVideo && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "0.78rem",
                      color: "#16a34a",
                      fontWeight: 700,
                    }}
                  >
                    {uploadProgress}
                  </p>
                )}
              </div>

              {/* Preview + Descripción en una sola fila */}
              {form.video_url && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: 16,
                    marginBottom: 16,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <label className="av-label">Preview</label>
                    <video
                      src={form.video_url}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        border: "1px solid #e0e0e0",
                        display: "block",
                      }}
                    />
                  </div>
                  <div>
                    <label className="av-label">Descripción</label>
                    <textarea
                      className="av-input"
                      style={{ minHeight: 90, resize: "vertical" }}
                      placeholder="Descripción breve del video..."
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm({ ...form, descripcion: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Descripción sola si no hay video todavía */}
              {!form.video_url && (
                <div style={{ marginBottom: 16 }}>
                  <label className="av-label">Descripción</label>
                  <textarea
                    className="av-input"
                    style={{ minHeight: 72, resize: "vertical" }}
                    placeholder="Descripción breve del video..."
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Botones */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  className="av-btn-primary"
                  disabled={uploadingVideo}
                >
                  {editId ? (
                    <>
                      <CheckCircle size={15} /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <PlusCircle size={15} /> Crear video
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="av-btn-secondary"
                  onClick={resetForm}
                >
                  <X size={15} /> Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros — solo visibles cuando NO está el formulario abierto */}
        {!showForm && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["", "video", "vlog"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipo(t)}
                className={`av-filter-btn${filterTipo === t ? " av-filter-btn--active" : ""}`}
              >
                {t === "" ? "Todos" : t === "video" ? "Videos" : "Vlogs"}
              </button>
            ))}
          </div>
        )}

        {/* Tabla — solo visible cuando NO está el formulario abierto */}
        {!showForm &&
          (loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "48px 0",
                color: "#aaa",
              }}
            >
              <Loader2 size={20} className="av-spin" color="#f5a623" />
              <span style={{ fontSize: "0.9rem" }}>Cargando...</span>
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
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
                    {["Título", "Tipo", "Estado", "Acciones"].map((h) => (
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
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: "48px", textAlign: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            color: "#ccc",
                          }}
                        >
                          <Film size={32} />
                          <span style={{ fontSize: "0.9rem" }}>
                            No hay videos aún
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((v, i) => (
                      <tr
                        key={v.id}
                        className="av-row"
                        style={{
                          borderBottom:
                            i < filtered.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        {/* Título */}
                        <td style={{ padding: "12px 16px", maxWidth: 320 }}>
                          <span
                            style={{
                              display: "block",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {v.title}
                          </span>
                          {v.descripcion && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.78rem",
                                color: "#aaa",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {v.descripcion}
                            </span>
                          )}
                        </td>

                        {/* Tipo */}
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            className="av-badge"
                            style={{
                              background:
                                v.tipo === "vlog" ? "#f0e8ff" : "#e8f0ff",
                              color: v.tipo === "vlog" ? "#7c3aed" : "#2563eb",
                            }}
                          >
                            {v.tipo}
                          </span>
                        </td>

                        {/* Estado */}
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            className="av-badge"
                            style={{
                              background: v.activo ? "#e8f7ee" : "#fde8e8",
                              color: v.activo ? "#1a7a3c" : "#a71d2a",
                            }}
                          >
                            {v.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="av-btn-edit"
                              onClick={() => onEdit(v)}
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              className="av-btn-delete"
                              onClick={() => onDelete(v.id)}
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </>
  );
}
