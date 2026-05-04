"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";

export default function NuevoBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",
    fecha_publicacion: new Date().toISOString().split("T")[0],
    orden: 0,
    activo: true,
  });
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);

  async function uploadToCloudinary(
    file: File,
    tipo: "image" | "video"
  ): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    formData.append("resource_type", tipo);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${tipo}/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url || null;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImg(true);
    const urls = await Promise.all(
      files.map((f) => uploadToCloudinary(f, "image"))
    );
    setImagenes((prev) => [
      ...prev,
      ...(urls.filter(Boolean) as string[]),
    ]);
    setUploadingImg(false);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVid(true);
    const urls = await Promise.all(
      files.map((f) => uploadToCloudinary(f, "video"))
    );
    setVideos((prev) => [
      ...prev,
      ...(urls.filter(Boolean) as string[]),
    ]);
    setUploadingVid(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: post, error } = await supabase
      .from("vlog_posts")
      .insert([form])
      .select()
      .single();

    if (error || !post) {
      alert("Error al guardar el post");
      setLoading(false);
      return;
    }

    // Guardar imágenes
    if (imagenes.length > 0) {
      await supabase.from("vlog_imagenes").insert(
        imagenes.map((url, i) => ({
          vlog_post_id: post.id,
          url_imagen: url,
          orden: i + 1,
        }))
      );
    }

    // Guardar videos
    if (videos.length > 0) {
      await supabase.from("vlog_videos").insert(
        videos.map((url, i) => ({
          vlog_post_id: post.id,
          video_url: url,
          orden: i + 1,
        }))
      );
    }

    router.push("/admin/blog");
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <Link href="/admin/blog" className="back-link">
          <ArrowLeft size={18} />
          Volver
        </Link>
        <h1 className="form-title">Nuevo Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group form-group--full">
            <label className="form-label">Título *</label>
            <input
              className="form-input"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título del post"
              required
            />
          </div>

          <div className="form-group form-group--full">
            <label className="form-label">Descripción corta</label>
            <input
              className="form-input"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              placeholder="Breve descripción del post"
            />
          </div>

          <div className="form-group form-group--full">
            <label className="form-label">Contenido</label>
            <textarea
              className="form-textarea"
              value={form.contenido}
              onChange={(e) =>
                setForm({ ...form, contenido: e.target.value })
              }
              placeholder="Escribe el contenido completo aquí..."
              rows={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de publicación</label>
            <input
              className="form-input"
              type="date"
              value={form.fecha_publicacion}
              onChange={(e) =>
                setForm({ ...form, fecha_publicacion: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Orden</label>
            <input
              className="form-input"
              type="number"
              value={form.orden}
              onChange={(e) =>
                setForm({ ...form, orden: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              className="form-input"
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

        {/* Imágenes */}
        <div className="media-section">
          <div className="media-header">
            <h3 className="media-title">Imágenes</h3>
            <label className="btn-upload">
              <Upload size={16} />
              {uploadingImg ? "Subiendo..." : "Subir imágenes"}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                disabled={uploadingImg}
              />
            </label>
          </div>
          {imagenes.length > 0 && (
            <div className="media-grid">
              {imagenes.map((url, i) => (
                <div key={i} className="media-item">
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="media-remove"
                    onClick={() =>
                      setImagenes(imagenes.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="media-section">
          <div className="media-header">
            <h3 className="media-title">Videos</h3>
            <label className="btn-upload">
              <Upload size={16} />
              {uploadingVid ? "Subiendo..." : "Subir videos"}
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: "none" }}
                disabled={uploadingVid}
              />
            </label>
          </div>
          {videos.length > 0 && (
            <div className="media-grid">
              {videos.map((url, i) => (
                <div key={i} className="media-item">
                  <video src={url} muted preload="metadata" />
                  <button
                    type="button"
                    className="media-remove"
                    onClick={() =>
                      setVideos(videos.filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link href="/admin/blog" className="btn-cancel">
            Cancelar
          </Link>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Post"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form-page { max-width: 900px; }
        .form-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
        .back-link { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; color: #6b7280; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .back-link:hover { border-color: #e05c2a; color: #e05c2a; }
        .form-title { font-size: 2rem; font-weight: 900; margin: 0; color: #1a1a1a; }
        .form-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group--full { grid-column: 1 / -1; }
        .form-label { font-size: 0.88rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-input { padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.95rem; color: #1a1a1a; background: #fafafa; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: #e05c2a; background: #fff; }
        .form-textarea { padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.95rem; color: #1a1a1a; background: #fafafa; outline: none; transition: border-color 0.2s; resize: vertical; font-family: inherit; }
        .form-textarea:focus { border-color: #e05c2a; background: #fff; }
        .media-section { margin-bottom: 28px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
        .media-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .media-title { font-size: 1rem; font-weight: 800; margin: 0; color: #1a1a1a; }
        .btn-upload { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f3f4f6; color: #374151; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid #e5e7eb; }
        .btn-upload:hover { background: #e5e7eb; }
        .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
        .media-item { position: relative; aspect-ratio: 1/1; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; }
        .media-remove { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; background: rgba(220,53,69,0.9); color: #fff; border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 24px; border-top: 1px solid #f3f4f6; }
        .btn-cancel { padding: 12px 24px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; color: #6b7280; font-weight: 600; text-decoration: none; font-size: 0.9rem; }
        .btn-submit { padding: 12px 32px; background: linear-gradient(135deg, #e05c2a 0%, #f59e0b 100%); color: #fff; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(224, 92, 42, 0.3); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}