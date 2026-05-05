"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string | null;
  contenido: string | null;
  fecha_publicacion: string;
  orden: number;
  activo: boolean;
};

type BlogImagen = {
  id: number;
  vlog_post_id: number;
  url_imagen: string;
  orden: number;
};
type BlogVideo = {
  id: number;
  vlog_post_id: number;
  video_url: string;
  orden: number;
};

const initialForm = {
  titulo: "",
  descripcion: "",
  contenido: "",
  fecha_publicacion: new Date().toISOString().split("T")[0],
  orden: 0,
  activo: true,
};

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

export default function AdminBlogPage() {
  const [rows, setRows] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagenes, setImagenes] = useState<BlogImagen[]>([]);
  const [videos, setVideos] = useState<BlogVideo[]>([]);
  const [mediaMap, setMediaMap] = useState<
    Record<number, { imgs: number; vids: number }>
  >({});
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [{ data: posts }, { data: imgs }, { data: vids }] = await Promise.all(
      [
        supabase.from("vlog_posts").select("*").order("orden"),
        supabase.from("vlog_imagenes").select("vlog_post_id"),
        supabase.from("vlog_videos").select("vlog_post_id"),
      ],
    );
    setRows(posts ?? []);

    // Construir mapa de conteos
    const mapa: Record<number, { imgs: number; vids: number }> = {};
    for (const img of imgs ?? []) {
      if (!mapa[img.vlog_post_id])
        mapa[img.vlog_post_id] = { imgs: 0, vids: 0 };
      mapa[img.vlog_post_id].imgs++;
    }
    for (const vid of vids ?? []) {
      if (!mapa[vid.vlog_post_id])
        mapa[vid.vlog_post_id] = { imgs: 0, vids: 0 };
      mapa[vid.vlog_post_id].vids++;
    }
    setMediaMap(mapa);
    setLoading(false);
  }

  async function loadMedia(postId: number) {
    const [{ data: imgs }, { data: vids }] = await Promise.all([
      supabase
        .from("vlog_imagenes")
        .select("*")
        .eq("vlog_post_id", postId)
        .order("orden"),
      supabase
        .from("vlog_videos")
        .select("*")
        .eq("vlog_post_id", postId)
        .order("orden"),
    ]);
    setImagenes(imgs ?? []);
    setVideos(vids ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImagen(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `blog/imagenes/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("Error subiendo imagen: " + error.message);
      return null;
    }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function uploadVideo(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `blog/videos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    if (error) {
      alert("Error subiendo video: " + error.message);
      return null;
    }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    const baseOrden = imagenes.length;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImagen(files[i]);
      if (url)
        await supabase
          .from("vlog_imagenes")
          .insert({
            vlog_post_id: editId,
            url_imagen: url,
            orden: baseOrden + i,
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
    const baseOrden = videos.length;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadVideo(files[i]);
      if (url)
        await supabase
          .from("vlog_videos")
          .insert({
            vlog_post_id: editId,
            video_url: url,
            orden: baseOrden + i,
          });
    }
    await loadMedia(editId);
    setUploadingVid(false);
    if (vidRef.current) vidRef.current.value = "";
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("vlog_imagenes").delete().eq("id", id);
    if (editId) loadMedia(editId);
  }

  async function deleteVideo(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("vlog_videos").delete().eq("id", id);
    if (editId) loadMedia(editId);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return alert("Título requerido");
    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion || null,
      contenido: form.contenido || null,
      fecha_publicacion: form.fecha_publicacion,
      orden: form.orden,
      activo: form.activo,
    };

    if (editId) {
      const { error } = await supabase
        .from("vlog_posts")
        .update(payload)
        .eq("id", editId);
      if (error) return alert(error.message);
      cancelForm();
      load();
    } else {
      // Crear y quedarse en modo edición para subir media de inmediato
      const { data, error } = await supabase
        .from("vlog_posts")
        .insert(payload)
        .select()
        .single();
      if (error) return alert(error.message);
      await load();
      setEditId(data.id);
      setForm({
        titulo: data.titulo ?? "",
        descripcion: data.descripcion ?? "",
        contenido: data.contenido ?? "",
        fecha_publicacion:
          data.fecha_publicacion?.split("T")[0] ??
          new Date().toISOString().split("T")[0],
        orden: data.orden ?? 0,
        activo: data.activo ?? true,
      });
      setImagenes([]);
      setVideos([]);
      setShowForm(true);
    }
  }

  function onEdit(p: BlogPost) {
    setEditId(p.id);
    setForm({
      titulo: p.titulo ?? "",
      descripcion: p.descripcion ?? "",
      contenido: p.contenido ?? "",
      fecha_publicacion:
        p.fecha_publicacion?.split("T")[0] ??
        new Date().toISOString().split("T")[0],
      orden: p.orden ?? 0,
      activo: p.activo ?? true,
    });
    loadMedia(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (
      !confirm(
        "¿Eliminar este post? También se eliminarán sus imágenes y videos.",
      )
    )
      return;
    await supabase.from("vlog_imagenes").delete().eq("vlog_post_id", id);
    await supabase.from("vlog_videos").delete().eq("vlog_post_id", id);
    await supabase.from("vlog_posts").delete().eq("id", id);
    load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
    setImagenes([]);
    setVideos([]);
  }

  const filtered = rows.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}
        .rh:hover{background:#fafafa!important}
        .be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}
        .bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}
        .bp:hover{background:#e69510!important}
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
            Blog
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            {rows.length} publicación{rows.length !== 1 ? "es" : ""} registrada
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
          {showForm ? "✕ Cancelar" : "+ Nuevo post"}
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
            {editId ? "Editar post" : "Nuevo post"}
          </h2>
          <form onSubmit={save}>
            {/* Fila 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={lbl}>Título *</label>
                <input
                  className="fi"
                  style={inp}
                  placeholder="Título del post"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={lbl}>Fecha publicación</label>
                <input
                  className="fi"
                  style={inp}
                  type="date"
                  value={form.fecha_publicacion}
                  onChange={(e) =>
                    setForm({ ...form, fecha_publicacion: e.target.value })
                  }
                />
              </div>
              <div>
                <label style={lbl}>Orden</label>
                <input
                  className="fi"
                  style={inp}
                  type="number"
                  value={form.orden}
                  onChange={(e) =>
                    setForm({ ...form, orden: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>Descripción corta</label>
              <input
                className="fi"
                style={inp}
                placeholder="Breve descripción visible en la lista"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </div>

            {/* Contenido */}
            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>
                Contenido{" "}
                <span
                  style={{
                    color: "#bbb",
                    textTransform: "none",
                    fontWeight: 400,
                  }}
                >
                  (HTML permitido)
                </span>
              </label>
              <textarea
                className="fi"
                style={{ ...inp, minHeight: "140px", resize: "vertical" }}
                placeholder="<p>Escribe el contenido completo aquí...</p>"
                value={form.contenido}
                onChange={(e) =>
                  setForm({ ...form, contenido: e.target.value })
                }
              />
            </div>

            {/* Activo */}
            <div style={{ marginBottom: "20px" }}>
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
                ✅ Activo (visible en el blog)
              </label>
            </div>

            {/* Media */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              {/* Imágenes */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <label style={lbl}>Imágenes</label>
                    {!editId && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#aaa",
                        }}
                      >
                        Disponible después de crear el post
                      </p>
                    )}
                  </div>
                  {editId && (
                    <>
                      <button
                        type="button"
                        onClick={() => imgRef.current?.click()}
                        disabled={uploadingImg}
                        style={{
                          background: "#f0f0f0",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          opacity: uploadingImg ? 0.6 : 1,
                        }}
                      >
                        {uploadingImg ? "⏳ Subiendo..." : "📁 Subir imágenes"}
                      </button>
                      <input
                        ref={imgRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleImgUpload}
                      />
                    </>
                  )}
                </div>
                {editId ? (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {imagenes.map((img) => (
                      <div key={img.id} style={{ position: "relative" }}>
                        <img
                          src={img.url_imagen}
                          alt=""
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => deleteImagen(img.id)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {imagenes.length === 0 && (
                      <span style={{ fontSize: "0.8rem", color: "#bbb" }}>
                        Sin imágenes aún
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        background: "#ececec",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem", opacity: 0.35 }}>
                        🖼️
                      </span>
                    </div>
                    <p
                      style={{ margin: 0, fontSize: "0.82rem", color: "#bbb" }}
                    >
                      Crea el post primero y podrás
                      <br />
                      subir imágenes de inmediato.
                    </p>
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <label style={lbl}>Videos</label>
                    {!editId && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "#aaa",
                        }}
                      >
                        Disponible después de crear el post
                      </p>
                    )}
                  </div>
                  {editId && (
                    <>
                      <button
                        type="button"
                        onClick={() => vidRef.current?.click()}
                        disabled={uploadingVid}
                        style={{
                          background: "#f0f0f0",
                          border: "1px solid #e0e0e0",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          opacity: uploadingVid ? 0.6 : 1,
                        }}
                      >
                        {uploadingVid ? "⏳ Subiendo..." : "🎬 Subir videos"}
                      </button>
                      <input
                        ref={vidRef}
                        type="file"
                        accept="video/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleVidUpload}
                      />
                    </>
                  )}
                </div>
                {editId ? (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {videos.map((vid) => (
                      <div key={vid.id} style={{ position: "relative" }}>
                        <video
                          src={vid.video_url}
                          muted
                          preload="metadata"
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => deleteVideo(vid.id)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "#dc3545",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {videos.length === 0 && (
                      <span style={{ fontSize: "0.8rem", color: "#bbb" }}>
                        Sin videos aún
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        background: "#ececec",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem", opacity: 0.35 }}>
                        🎬
                      </span>
                    </div>
                    <p
                      style={{ margin: 0, fontSize: "0.82rem", color: "#bbb" }}
                    >
                      Crea el post primero y podrás
                      <br />
                      subir videos de inmediato.
                    </p>
                  </div>
                )}
              </div>

              {editId && (
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "0.75rem",
                    color: "#aaa",
                  }}
                >
                  Las imágenes y videos se guardan inmediatamente al subirlos.
                </p>
              )}
            </div>

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
                {editId ? "Guardar cambios" : "Crear post"}
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
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
              Cargando posts...
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
                    {[
                      "Título",
                      "Descripción",
                      "Fecha",
                      "Orden",
                      "Imágenes",
                      "Videos",
                      "Estado",
                      "Acciones",
                    ].map((h) => (
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
                        colSpan={8}
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#aaa",
                        }}
                      >
                        {search ? "Sin resultados" : "No hay posts aún"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, i) => {
                      const media = mediaMap[p.id] ?? { imgs: 0, vids: 0 };
                      return (
                        <tr
                          key={p.id}
                          className="rh"
                          style={{
                            borderBottom:
                              i < filtered.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                            background: "#fff",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px 16px",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              maxWidth: 200,
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {p.titulo}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "#666",
                              maxWidth: 220,
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                              }}
                            >
                              {p.descripcion || (
                                <span style={{ color: "#ccc" }}>—</span>
                              )}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "#666",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {new Date(p.fecha_publicacion).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              color: "#888",
                              textAlign: "center",
                            }}
                          >
                            {p.orden}
                          </td>
                          {/* Columna imágenes */}
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                            }}
                          >
                            {media.imgs > 0 ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  background: "#eef4ff",
                                  color: "#2563eb",
                                }}
                              >
                                🖼️ {media.imgs}
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: "#f5f5f5",
                                  color: "#bbb",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          {/* Columna videos */}
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                            }}
                          >
                            {media.vids > 0 ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                }}
                              >
                                🎬 {media.vids}
                              </span>
                            ) : (
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "20px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: "#f5f5f5",
                                  color: "#bbb",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                background: p.activo ? "#e8f7ee" : "#fde8e8",
                                color: p.activo ? "#1a7a3c" : "#a71d2a",
                              }}
                            >
                              {p.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="be"
                                onClick={() => onEdit(p)}
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
                                onClick={() => onDelete(p.id)}
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
                      );
                    })
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
                {filtered.length} de {rows.length} publicación
                {rows.length !== 1 ? "es" : ""}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
