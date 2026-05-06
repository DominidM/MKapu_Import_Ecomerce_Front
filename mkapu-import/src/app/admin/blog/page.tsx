"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, Image as ImageIcon, Video } from "lucide-react";

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
  activo: true,
};

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
  const [savingOrder, setSavingOrder] = useState(false);
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

  async function persistOrder(list: BlogPost[]) {
    setSavingOrder(true);

    const reordered = list.map((p, i) => ({
      ...p,
      orden: i + 1,
    }));

    setRows(reordered);

    await Promise.all(
      reordered.map((p) =>
        supabase.from("vlog_posts").update({ orden: p.orden }).eq("id", p.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;

    const copy = [...rows];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;

    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === rows.length - 1) return;

    const copy = [...rows];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;

    void persistOrder(copy);
  }

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
        await supabase.from("vlog_imagenes").insert({
          vlog_post_id: editId,
          url_imagen: url,
          orden: baseOrden + i,
        });
    }
    await loadMedia(editId);
    await load();
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
        await supabase.from("vlog_videos").insert({
          vlog_post_id: editId,
          video_url: url,
          orden: baseOrden + i,
        });
    }
    await loadMedia(editId);
    await load();
    setUploadingVid(false);
    if (vidRef.current) vidRef.current.value = "";
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("vlog_imagenes").delete().eq("id", id);
    if (editId) await loadMedia(editId);
    await load();
  }

  async function deleteVideo(id: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("vlog_videos").delete().eq("id", id);
    if (editId) await loadMedia(editId);
    await load();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return alert("Título requerido");

    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion || null,
      contenido: form.contenido || null,
      fecha_publicacion: new Date().toISOString().split("T")[0],
      orden: rows.length + 1,
      activo: form.activo,
    };

    if (editId) {
      const { error } = await supabase
        .from("vlog_posts")
        .update({
          titulo: payload.titulo,
          descripcion: payload.descripcion,
          contenido: payload.contenido,
          activo: payload.activo,
        })
        .eq("id", editId);

      if (error) return alert(error.message);
      cancelForm();
      await load();
    } else {
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
    await load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
    setImagenes([]);
    setVideos([]);
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

  const filtered = rows.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()),
  );

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
            Blog
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            {rows.length} publicación{rows.length !== 1 ? "es" : ""} registrada
            {rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {savingOrder && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "#c47d00",
                background: "#fff8e6",
                padding: "6px 10px",
                borderRadius: "999px",
                fontWeight: 600,
              }}
            >
              Guardando orden...
            </span>
          )}

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
            {showForm ? "✕ Cancelar" : "+ Nuevo post"}
          </button>
        </div>
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
            {editId ? "Editar post" : "Nuevo post"}
          </h2>

          <form onSubmit={save}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Título *</label>
              <input
                style={inp}
                placeholder="Título del post"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={lbl}>Descripción corta</label>
              <input
                style={inp}
                placeholder="Breve descripción visible en la lista"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
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
                style={{ ...inp, minHeight: "140px", resize: "vertical" }}
                placeholder="<p>Escribe el contenido completo aquí...</p>"
                value={form.contenido}
                onChange={(e) =>
                  setForm({ ...form, contenido: e.target.value })
                }
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
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

            <div
              style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                    gap: "1rem",
                    flexWrap: "wrap",
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
                          padding: "8px 14px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          opacity: uploadingImg ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ImageIcon size={14} />
                        {uploadingImg ? "Subiendo..." : "Subir imágenes"}
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
                            width: 80,
                            height: 80,
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
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#bbb",
                          padding: "8px 0",
                        }}
                      >
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
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: "#ececec",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ImageIcon size={32} color="#ccc" />
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        color: "#bbb",
                      }}
                    >
                      Crea el post primero y podrás
                      <br />
                      subir imágenes de inmediato.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                    gap: "1rem",
                    flexWrap: "wrap",
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
                          padding: "8px 14px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          opacity: uploadingVid ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Video size={14} />
                        {uploadingVid ? "Subiendo..." : "Subir videos"}
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
                            width: 80,
                            height: 80,
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
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#bbb",
                          padding: "8px 0",
                        }}
                      >
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
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: "#ececec",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Video size={32} color="#ccc" />
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        color: "#bbb",
                      }}
                    >
                      Crea el post primero y podrás
                      <br />
                      subir videos de inmediato.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
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
                {editId ? "Guardar cambios" : "Crear post"}
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
              placeholder="Buscar por título..."
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
              Cargando posts...
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                      "Mover",
                      "Imágenes",
                      "Videos",
                      "Estado",
                      "Acciones",
                    ].map((h) => (
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
                        colSpan={9}
                        style={{
                          padding: "3rem",
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
                          style={{
                            borderBottom:
                              i < filtered.length - 1
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
                              padding: "0.9rem 1rem",
                              color: "#555",
                              fontSize: "0.875rem",
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
                              padding: "0.9rem 1rem",
                              color: "#666",
                              fontSize: "0.85rem",
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
                              padding: "0.9rem 1rem",
                              color: "#aaa",
                              fontSize: "0.8rem",
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          >
                            {p.orden}
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                alignItems: "center",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => moveUp(i)}
                                disabled={i === 0 || savingOrder}
                                title="Subir"
                                style={{
                                  width: 26,
                                  height: 18,
                                  borderRadius: 4,
                                  border: "1px solid #e5e7eb",
                                  background: i === 0 ? "#f3f4f6" : "#fff",
                                  cursor:
                                    i === 0 || savingOrder
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.65rem",
                                  color: "#666",
                                  opacity: i === 0 || savingOrder ? 0.5 : 1,
                                }}
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                onClick={() => moveDown(i)}
                                disabled={i === rows.length - 1 || savingOrder}
                                title="Bajar"
                                style={{
                                  width: 26,
                                  height: 18,
                                  borderRadius: 4,
                                  border: "1px solid #e5e7eb",
                                  background:
                                    i === rows.length - 1 ? "#f3f4f6" : "#fff",
                                  cursor:
                                    i === rows.length - 1 || savingOrder
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.65rem",
                                  color: "#666",
                                  opacity:
                                    i === rows.length - 1 || savingOrder
                                      ? 0.5
                                      : 1,
                                }}
                              >
                                ↓
                              </button>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
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
                                  borderRadius: "999px",
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
                                  borderRadius: "999px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: "#f5f5f5",
                                  color: "#bbb",
                                }}
                              >
                                Sin imágenes
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
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
                                  borderRadius: "999px",
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
                                  borderRadius: "999px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: "#f5f5f5",
                                  color: "#bbb",
                                }}
                              >
                                Sin videos
                              </span>
                            )}
                          </td>

                          <td style={{ padding: "0.9rem 1rem" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                background: p.activo
                                  ? "rgba(34,197,94,0.1)"
                                  : "rgba(239,68,68,0.1)",
                                color: p.activo ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {p.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td style={{ padding: "0.9rem 1rem" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => onEdit(p)}
                                title="Editar"
                                style={{
                                  background: "rgba(245,166,35,0.1)",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px",
                                  cursor: "pointer",
                                  color: "#f5a623",
                                  display: "flex",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(245,166,35,0.2)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(245,166,35,0.1)")
                                }
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                onClick={() => onDelete(p.id)}
                                title="Eliminar"
                                style={{
                                  background: "rgba(220,38,38,0.08)",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "6px",
                                  cursor: "pointer",
                                  color: "#dc2626",
                                  display: "flex",
                                  transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(220,38,38,0.18)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(220,38,38,0.08)")
                                }
                              >
                                <Trash2 size={15} />
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
