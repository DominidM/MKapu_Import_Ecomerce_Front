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

  function scrollToTop() {
    const container = document.querySelector(".main-content");
    if (container) {
      container.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

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
    if (videoFileRef.current) videoFileRef.current.value = "";
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

  function isImage(url: string | null | undefined) {
    if (!url) return false;
    return /\.(jpe?g|png|gif|webp|avif)$/i.test(url);
  }

  function isVideo(url: string | null | undefined) {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
  }

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
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setTimeout(() => scrollToTop(), 50);
              }
            }}
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

        {showForm && (
          <form
            onSubmit={save}
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              display: "grid",
              gap: 16,
            }}
          >
            <div>
              <label className="av-label">Título</label>
              <input
                className="av-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ingresa el título"
              />
            </div>

            <div>
              <label className="av-label">Descripción</label>
              <textarea
                className="av-input"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Ingresa una descripción"
                rows={4}
                style={{ resize: "vertical" }}
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

            <div>
              <label className="av-label">Subir video</label>

              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setSelectedFileName(file.name);
                  const url = await uploadVideo(file);

                  if (url) {
                    setForm((prev) => ({ ...prev, video_url: url }));
                  }
                }}
              />

              <div
                className={`av-dropzone ${
                  uploadProgress.startsWith("✓") ? "av-dropzone--success" : ""
                } ${uploadingVideo ? "av-dropzone--uploading" : ""}`}
                onClick={() => {
                  if (!uploadingVideo) videoFileRef.current?.click();
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {uploadingVideo ? (
                    <Loader2 size={28} className="av-spin" color="#f5a623" />
                  ) : uploadProgress.startsWith("✓") ? (
                    <CheckCircle size={28} color="#22c55e" />
                  ) : (
                    <Upload size={28} color="#f5a623" />
                  )}

                  <div style={{ fontWeight: 600, color: "#444" }}>
                    {uploadingVideo
                      ? "Subiendo video..."
                      : selectedFileName ||
                        "Haz clic para seleccionar un video"}
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "#999" }}>
                    MP4, WebM, MOV, AVI, MKV - máximo 50MB
                  </div>

                  {uploadProgress && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: uploadProgress.startsWith("✓")
                          ? "#22c55e"
                          : "#999",
                        fontWeight: 600,
                      }}
                    >
                      {uploadProgress}
                    </div>
                  )}
                </div>
              </div>

              {form.video_url && (
                <div style={{ marginTop: 12 }}>
                  <video
                    src={form.video_url}
                    controls
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      borderRadius: 10,
                      border: "1px solid #e8e8e8",
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="activo"
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              <label
                htmlFor="activo"
                style={{ fontSize: "0.9rem", color: "#555" }}
              >
                Activo
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                className="av-btn-primary"
                disabled={uploadingVideo}
              >
                {editId ? (
                  <>
                    <CheckCircle size={15} />
                    Actualizar
                  </>
                ) : (
                  <>
                    <PlusCircle size={15} />
                    Guardar
                  </>
                )}
              </button>

              <button
                type="button"
                className="av-btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {!showForm && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["", "video", "vlog"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipo(t)}
                className={`av-filter-btn${
                  filterTipo === t ? " av-filter-btn--active" : ""
                }`}
              >
                {t === "" ? "Todos" : t === "video" ? "Videos" : "Vlogs"}
              </button>
            ))}
          </div>
        )}

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
                    {["Media", "Título", "Tipo", "Estado", "Acciones"].map(
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
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
                        <td
                          style={{
                            padding: "8px 12px",
                            width: 110,
                          }}
                        >
                          {v.video_url ? (
                            isImage(v.video_url) ? (
                              <img
                                src={v.video_url}
                                alt={v.title}
                                style={{
                                  width: 96,
                                  height: 54,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #e0e0e0",
                                  display: "block",
                                }}
                              />
                            ) : isVideo(v.video_url) ? (
                              <video
                                src={v.video_url}
                                style={{
                                  width: 96,
                                  height: 54,
                                  borderRadius: 8,
                                  border: "1px solid #e0e0e0",
                                  display: "block",
                                }}
                                muted
                                controls={false}
                                playsInline
                              />
                            ) : (
                              <div
                                style={{
                                  width: 96,
                                  height: 54,
                                  borderRadius: 8,
                                  border: "1px solid #e0e0e0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#bbb",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Sin preview
                              </div>
                            )
                          ) : (
                            <div
                              style={{
                                width: 96,
                                height: 54,
                                borderRadius: 8,
                                border: "1px solid #f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ddd",
                              }}
                            >
                              <Film size={20} />
                            </div>
                          )}
                        </td>

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
