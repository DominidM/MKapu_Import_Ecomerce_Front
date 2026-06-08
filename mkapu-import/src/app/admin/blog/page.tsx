"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Pencil,
  Trash2,
  ImagePlus,
  VideoIcon,
  ImageOff,
  VideoOff,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import Pagination from "@/components/Pagination";

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

const ITEMS_PER_PAGE = 10;

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
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "confirm",
    onConfirm: () => {},
  });
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function persistOrder(list: BlogPost[]) {
    setSavingOrder(true);
    const reordered = list.map((p, i) => ({ ...p, orden: i + 1 }));
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
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    void persistOrder(copy);
  }

  function moveDown(idx: number) {
    if (idx === rows.length - 1) return;
    const copy = [...rows];
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    void persistOrder(copy);
  }

  async function uploadImagen(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "blog/imagenes");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      setModal({ open: true, title: "Error", message: "Error subiendo imagen", variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) });
      return null;
    }
    const data = await res.json();
    return data.url;
  }

  async function uploadVideo(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "blog/videos");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      setModal({ open: true, title: "Error", message: "Error subiendo video", variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) });
      return null;
    }
    const data = await res.json();
    return data.url;
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
        await supabase
          .from("vlog_videos")
          .insert({
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
    setModal({ open: true, title: "Eliminar", message: "¿Eliminar imagen?", variant: "confirm", onConfirm: async () => { setModal((m) => ({ ...m, open: false })); await supabase.from("vlog_imagenes").delete().eq("id", id); if (editId) await loadMedia(editId); await load(); } });
    return;
  }

  async function deleteVideo(id: number) {
    setModal({ open: true, title: "Eliminar", message: "¿Eliminar video?", variant: "confirm", onConfirm: async () => { setModal((m) => ({ ...m, open: false })); await supabase.from("vlog_videos").delete().eq("id", id); if (editId) await loadMedia(editId); await load(); } });
    return;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setModal({ open: true, title: "Confirmar", message: "¿Guardar estos cambios?", variant: "confirm", onConfirm: async () => { setModal((m) => ({ ...m, open: false })); if (!form.titulo.trim()) { setModal({ open: true, title: "Error", message: "Título requerido", variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; } const payload = { titulo: form.titulo.trim(), descripcion: form.descripcion || null, contenido: form.contenido || null, fecha_publicacion: new Date().toISOString().split("T")[0], orden: rows.length + 1, activo: form.activo, }; if (editId) { const { error } = await supabase .from("vlog_posts") .update({ titulo: payload.titulo, descripcion: payload.descripcion, contenido: payload.contenido, activo: payload.activo, }) .eq("id", editId); if (error) { setModal({ open: true, title: "Error", message: error.message, variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; } cancelForm(); await load(); setSuccessMsg("Post guardado correctamente"); setTimeout(() => setSuccessMsg(""), 3000); } else { const { data, error } = await supabase .from("vlog_posts") .insert(payload) .select() .single(); if (error) { setModal({ open: true, title: "Error", message: error.message, variant: "alert", onConfirm: () => setModal((m) => ({ ...m, open: false })) }); return; } await load(); setSuccessMsg("Post guardado correctamente"); setTimeout(() => setSuccessMsg(""), 3000); setEditId(data.id); setForm({ titulo: data.titulo ?? "", descripcion: data.descripcion ?? "", contenido: data.contenido ?? "", activo: data.activo ?? true, }); setImagenes([]); setVideos([]); setShowForm(true); } } });
    return;
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
    setModal({ open: true, title: "Eliminar", message: "¿Eliminar este post? También se eliminarán sus imágenes y videos.", variant: "confirm", onConfirm: async () => { setModal((m) => ({ ...m, open: false })); await supabase.from("vlog_imagenes").delete().eq("vlog_post_id", id); await supabase.from("vlog_videos").delete().eq("vlog_post_id", id); await supabase.from("vlog_posts").delete().eq("id", id); await load(); } });
    return;
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
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {successMsg && (<div style={{position:"fixed",top:"1rem",right:"1rem",zIndex:9999,background:"#16a34a",color:"#fff",padding:"0.75rem 1.25rem",borderRadius:"10px",fontWeight:600,fontSize:"0.875rem",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:"8px"}}><CheckCircle size={16}/> {successMsg}</div>)}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant as "confirm" | "alert"}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((m) => ({ ...m, open: false }))}
      />
      {/* ── Header ── */}
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

      {/* ── Formulario ── */}
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
              <label style={lbl}>Contenido</label>
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
                Activo (visible en el blog)
              </label>
            </div>

            {/* ── Multimedia ── */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              {/* Imágenes */}
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
                          background: "#eef2ff",
                          border: "1px solid #c7d2fe",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          cursor: uploadingImg ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#4f46e5",
                          opacity: uploadingImg ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!uploadingImg)
                            e.currentTarget.style.background = "#e0e7ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#eef2ff";
                        }}
                      >
                        {uploadingImg ? (
                          <>
                            <Loader2
                              size={14}
                              style={{ animation: "spin 1s linear infinite" }}
                            />{" "}
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> Subir imágenes
                          </>
                        )}
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
                            width: 90,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px solid #e0e7ff",
                            boxShadow: "0 2px 8px rgba(99,102,241,0.10)",
                            display: "block",
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
                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
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
                      gap: "12px",
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background:
                          "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                        borderRadius: "12px",
                        border: "1.5px dashed #a5b4fc",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <ImagePlus size={26} color="#818cf8" strokeWidth={1.5} />
                      <span
                        style={{
                          fontSize: "0.58rem",
                          color: "#818cf8",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Fotos
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
                          background: "#f0fdf4",
                          border: "1px solid #86efac",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          cursor: uploadingVid ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#16a34a",
                          opacity: uploadingVid ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!uploadingVid)
                            e.currentTarget.style.background = "#dcfce7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f0fdf4";
                        }}
                      >
                        {uploadingVid ? (
                          <>
                            <Loader2
                              size={14}
                              style={{ animation: "spin 1s linear infinite" }}
                            />{" "}
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> Subir videos
                          </>
                        )}
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
                            width: 90,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px solid #bbf7d0",
                            boxShadow: "0 2px 8px rgba(34,197,94,0.10)",
                            display: "block",
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
                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
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
                      gap: "12px",
                      padding: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background:
                          "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                        borderRadius: "12px",
                        border: "1.5px dashed #86efac",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <VideoIcon size={26} color="#4ade80" strokeWidth={1.5} />
                      <span
                        style={{
                          fontSize: "0.58rem",
                          color: "#4ade80",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Video
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
            </div>

            {/* Acciones */}
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

      {/* ── Listado ── */}
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
              style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}
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
              {/* scroll horizontal en móvil */}
              <div
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch" as unknown as undefined,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 700,
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
                          colSpan={8}
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
                      paginatedData.map((p, i) => {
                        const media = mediaMap[p.id] ?? { imgs: 0, vids: 0 };
                        return (
                          <tr
                            key={p.id}
                            style={{
                              borderBottom:
                                i < paginatedData.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                            }}
                          >
                            {/* Título */}
                            <td
                              style={{
                                padding: "0.9rem 1rem",
                                fontWeight: 600,
                                color: "#1a1a1a",
                                fontSize: "0.9rem",
                                maxWidth: 180,
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

                            {/* Descripción */}
                            <td
                              style={{
                                padding: "0.9rem 1rem",
                                color: "#555",
                                fontSize: "0.875rem",
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
                                {p.descripcion || (
                                  <span style={{ color: "#ccc" }}>—</span>
                                )}
                              </span>
                            </td>

                            {/* Fecha */}
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

                             {/* Orden + Mover (columna fusionada) */}
                             <td
                               style={{
                                 padding: "0.6rem 1rem",
                                 textAlign: "center",
                               }}
                             >
                               <div
                                 style={{
                                   display: "flex",
                                   alignItems: "center",
                                   gap: 6,
                                 }}
                               >
                                 <button
                                   type="button"
                                   onClick={() => moveUp(i)}
                                   disabled={i === 0 || savingOrder}
                                   title="Subir"
                                   style={{
                                     width: 26,
                                     height: 26,
                                     borderRadius: 6,
                                     border: "1px solid #e2e2e2",
                                     background: "#fff",
                                     cursor:
                                       i === 0 || savingOrder
                                         ? "not-allowed"
                                         : "pointer",
                                     opacity: i === 0 || savingOrder ? 0.35 : 1,
                                     fontWeight: 700,
                                     color: "#666",
                                     fontSize: "0.85rem",
                                     display: "flex",
                                     alignItems: "center",
                                     justifyContent: "center",
                                     transition: "background 0.15s",
                                   }}
                                 >
                                   ↑
                                 </button>
                                 <span
                                   style={{
                                     minWidth: 20,
                                     textAlign: "center",
                                     fontWeight: 700,
                                     color: "#555",
                                     fontSize: "0.85rem",
                                   }}
                                 >
                                   {p.orden}
                                 </span>
                                 <button
                                   type="button"
                                   onClick={() => moveDown(i)}
                                   disabled={
                                     i === rows.length - 1 || savingOrder
                                   }
                                   title="Bajar"
                                   style={{
                                     width: 26,
                                     height: 26,
                                     borderRadius: 6,
                                     border: "1px solid #e2e2e2",
                                     background: "#fff",
                                     cursor:
                                       i === rows.length - 1 || savingOrder
                                         ? "not-allowed"
                                         : "pointer",
                                     opacity:
                                       i === rows.length - 1 || savingOrder
                                         ? 0.35
                                         : 1,
                                     fontWeight: 700,
                                     color: "#666",
                                     fontSize: "0.85rem",
                                     display: "flex",
                                     alignItems: "center",
                                     justifyContent: "center",
                                     transition: "background 0.15s",
                                   }}
                                 >
                                   ↓
                                 </button>
                               </div>
                             </td>

                            {/* Imágenes badge */}
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
                                    gap: "5px",
                                    padding: "3px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    background: "#eef2ff",
                                    color: "#4f46e5",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <ImagePlus size={12} strokeWidth={2} />{" "}
                                  {media.imgs}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    background: "#f5f5f5",
                                    color: "#ccc",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <ImageOff size={12} strokeWidth={1.5} /> Sin
                                  fotos
                                </span>
                              )}
                            </td>

                            {/* Videos badge */}
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
                                    gap: "5px",
                                    padding: "3px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    background: "#f0fdf4",
                                    color: "#16a34a",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <VideoIcon size={12} strokeWidth={2} />{" "}
                                  {media.vids}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "3px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    background: "#f5f5f5",
                                    color: "#ccc",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <VideoOff size={12} strokeWidth={1.5} /> Sin
                                  videos
                                </span>
                              )}
                            </td>

                            {/* Estado */}
                            <td style={{ padding: "0.9rem 1rem" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "3px 10px",
                                  borderRadius: "999px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  background: p.activo
                                    ? "rgba(34,197,94,0.1)"
                                    : "rgba(239,68,68,0.1)",
                                  color: p.activo ? "#16a34a" : "#dc2626",
                                }}
                              >
                                {p.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>

                            {/* Acciones */}
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
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                label="Mostrando"
              />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
