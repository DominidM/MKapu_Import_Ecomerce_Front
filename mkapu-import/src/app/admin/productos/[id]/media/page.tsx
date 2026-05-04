"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Video,
} from "lucide-react";

type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
};
type ProductoVideo = {
  id: number;
  producto_id: number;
  video_url: string | null;
  titulo: string | null;
  orden: number;
};
type Producto = {
  id: number;
  name: string;
  code: string;
  image_url: string | null;
};
type Tab = "imagenes" | "videos";

export default function ProductoMediaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const productoId = Number(id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [tab, setTab] = useState<Tab>("imagenes");
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [videos, setVideos] = useState<ProductoVideo[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [videoTitulo, setVideoTitulo] = useState("");
  const [loading, setLoading] = useState(true);
  const [vidError, setVidError] = useState<string | null>(null);
  const [vidSuccess, setVidSuccess] = useState(false);

  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    setLoading(true);
    const [prodRes, imgRes, vidRes] = await Promise.all([
      supabase
        .from("productos")
        .select("id,name,code,image_url")
        .eq("id", productoId)
        .single(),
      supabase
        .from("producto_imagenes")
        .select("*")
        .eq("producto_id", productoId)
        .order("orden"),
      supabase
        .from("producto_videos")
        .select("*")
        .eq("producto_id", productoId)
        .order("orden"),
    ]);
    if (prodRes.data) setProducto(prodRes.data);
    setImagenes(imgRes.data ?? []);
    setVideos(vidRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [productoId]);

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    let orden = imagenes.length;
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `productos/gallery/${productoId}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("imagenes")
        .upload(path, file, { upsert: true });
      if (error) continue;
      const url = supabase.storage.from("imagenes").getPublicUrl(path)
        .data.publicUrl;
      await supabase
        .from("producto_imagenes")
        .insert({ producto_id: productoId, url_imagenes: url, orden });
      orden++;
    }
    setUploadingImg(false);
    if (imgRef.current) imgRef.current.value = "";
    loadAll();
  }

  async function deleteImagen(imgId: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("producto_imagenes").delete().eq("id", imgId);
    loadAll();
  }

  async function setMainImage(url: string) {
    await supabase
      .from("productos")
      .update({ image_url: url })
      .eq("id", productoId);
    loadAll();
  }

  async function moverImagen(index: number, dir: "arriba" | "abajo") {
    const arr = [...imagenes];
    const target = dir === "arriba" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    await Promise.all(
      arr.map((img, i) =>
        supabase
          .from("producto_imagenes")
          .update({ orden: i })
          .eq("id", img.id),
      ),
    );
    loadAll();
  }

  async function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVidError(null);
    setVidSuccess(false);

    if (file.size > 100 * 1024 * 1024) {
      setVidError(
        `El video pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 100 MB.`,
      );
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    setUploadingVid(true);
    const ext = file.name.split(".").pop();
    const path = `productos/videos/${productoId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploadingVid(false);
      setVidError("Error al subir el archivo: " + uploadError.message);
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    const url = supabase.storage.from("imagenes").getPublicUrl(path)
      .data.publicUrl;

    const { error: insertError } = await supabase
      .from("producto_videos")
      .insert({
        producto_id: productoId,
        video_url: url,
        titulo: videoTitulo || null,
        orden: videos.length,
      });

    setUploadingVid(false);

    if (insertError) {
      setVidError("Video subido pero error al guardar: " + insertError.message);
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    setVideoTitulo("");
    setVidSuccess(true);
    setTimeout(() => setVidSuccess(false), 3000);
    if (vidRef.current) vidRef.current.value = "";
    loadAll();
  }

  async function deleteVideo(vidId: number) {
    if (!confirm("¿Eliminar video?")) return;
    await supabase.from("producto_videos").delete().eq("id", vidId);
    loadAll();
  }

  async function moverVideo(index: number, dir: "arriba" | "abajo") {
    const arr = [...videos];
    const target = dir === "arriba" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    await Promise.all(
      arr.map((v, i) =>
        supabase.from("producto_videos").update({ orden: i }).eq("id", v.id),
      ),
    );
    loadAll();
  }

  const ordenBtnStyle = (disabled: boolean) =>
    ({
      border: "1px solid #e0e0e0",
      borderRadius: 5,
      background: disabled ? "#f9f9f9" : "#fff",
      color: disabled ? "#ddd" : "#888",
      cursor: disabled ? "not-allowed" : "pointer",
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      padding: 0,
    }) as React.CSSProperties;

  return (
    <>
      <style>{`
        .pm-inp{width:100%;padding:9px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:.875rem;background:#fff;color:#1a1a1a;outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s}
        .pm-inp:focus{border-color:#f5a623;box-shadow:0 0 0 3px rgba(245,166,35,.12)}
        .pm-lbl{display:block;font-size:.7rem;font-weight:700;color:#aaa;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
        .pm-btn{display:inline-flex;align-items:center;gap:7px;border:none;border-radius:8px;font-weight:700;font-size:.875rem;cursor:pointer;padding:10px 20px;transition:background .15s,opacity .15s;text-decoration:none}
        .pm-btn--primary{background:#f5a623;color:#fff}
        .pm-btn--primary:hover{background:#e69510}
        .pm-btn--primary:disabled{background:#ccc;cursor:not-allowed}
        .pm-btn--ghost{background:transparent;color:#888;border:1px solid #e0e0e0}
        .pm-btn--ghost:hover{background:#f5f5f5}
        .pm-btn--danger{background:rgba(220,53,69,.07);color:#dc3545;border:1px solid rgba(220,53,69,.2)}
        .pm-btn--danger:hover{background:rgba(220,53,69,.15)}
        .pm-btn--sm{padding:6px 12px;font-size:.8rem;border-radius:6px}
        .pm-tab{padding:10px 20px;font-size:.875rem;font-weight:700;cursor:pointer;border:none;background:transparent;color:#888;border-bottom:3px solid transparent;transition:color .15s,border-color .15s}
        .pm-tab--active{color:#f5a623;border-bottom-color:#f5a623}
        .pm-tab:hover:not(.pm-tab--active){color:#555}
        .pm-img-card{position:relative;border-radius:10px;overflow:hidden;border:2px solid #e0e0e0;background:#f9f9f9;transition:border-color .15s}
        .pm-img-card--main{border-color:#f5a623}
        .pm-img-card:hover .pm-img-actions{opacity:1}
        .pm-img-actions{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;gap:8px;opacity:0;transition:opacity .2s}
        .pm-vid-row{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e8e8e8;border-radius:10px;padding:12px 14px}
        .pm-dropzone{border:2px dashed #e0e0e0;border-radius:12px;padding:40px 24px;text-align:center;cursor:pointer;background:#fafafa;transition:border-color .2s,background .2s}
        .pm-dropzone:hover{border-color:#f5a623;background:#fff8ee}
        .pm-main-badge{position:absolute;top:6px;left:6px;background:#f5a623;color:#fff;font-size:.65rem;font-weight:800;padding:2px 7px;border-radius:4px}
        .pm-orden-badge{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.5);color:#fff;font-size:.65rem;font-weight:800;padding:2px 7px;border-radius:4px}
        .pm-img-order{display:flex;flex-direction:column;gap:2px;padding:6px 8px;border-top:1px solid #e8e8e8;background:#fff;align-items:center}
        .pm-progress{width:100%;height:6px;background:#f0f0f0;border-radius:99px;overflow:hidden;margin-top:12px}
        .pm-progress-bar{height:100%;background:#f5a623;border-radius:99px;animation:pm-progress 1.5s ease-in-out infinite}
        @keyframes pm-progress{0%{width:0%;margin-left:0}50%{width:70%;margin-left:15%}100%{width:0%;margin-left:100%}}
        .pm-alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:8px;font-size:.85rem;font-weight:600;margin-bottom:16px}
        .pm-alert--error{background:#fde8e8;color:#a71d2a;border:1px solid rgba(167,29,42,.2)}
        .pm-alert--success{background:#e8f7ee;color:#1a7a3c;border:1px solid rgba(26,122,60,.2)}
        @keyframes pm-spin{to{transform:rotate(360deg)}}
        .pm-spin{animation:pm-spin .8s linear infinite}
        @keyframes pm-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .pm-fadein{animation:pm-fadein .2s ease}
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <button
            className="pm-btn pm-btn--ghost pm-btn--sm"
            onClick={() => router.back()}
          >
            <ArrowLeft size={15} />
            Volver
          </button>
          <div>
            {loading ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Loader2
                  size={16}
                  className="pm-spin"
                  style={{ color: "#f5a623" }}
                />
                <span style={{ color: "#aaa", fontSize: ".875rem" }}>
                  Cargando...
                </span>
              </div>
            ) : (
              <>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "#1a1a1a",
                  }}
                >
                  Galería &amp; Videos
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: ".875rem",
                    color: "#aaa",
                  }}
                >
                  <code
                    style={{
                      background: "#f0f0f0",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontSize: ".78rem",
                      color: "#555",
                    }}
                  >
                    {producto?.code}
                  </code>
                  &nbsp;{producto?.name}
                </p>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            borderBottom: "1px solid #e8e8e8",
            marginBottom: 24,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            className={`pm-tab${tab === "imagenes" ? " pm-tab--active" : ""}`}
            onClick={() => setTab("imagenes")}
          >
            <ImageIcon
              size={14}
              style={{ display: "inline", marginRight: 6 }}
            />
            Imágenes ({imagenes.length})
          </button>
          <button
            className={`pm-tab${tab === "videos" ? " pm-tab--active" : ""}`}
            onClick={() => setTab("videos")}
          >
            <Video size={14} style={{ display: "inline", marginRight: 6 }} />
            Videos ({videos.length})
          </button>
        </div>

        {/* ── TAB IMÁGENES ── */}
        {tab === "imagenes" && (
          <div className="pm-fadein">
            <div
              className="pm-dropzone"
              onClick={() => imgRef.current?.click()}
              style={{ marginBottom: 24 }}
            >
              {uploadingImg ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Loader2
                    size={28}
                    className="pm-spin"
                    style={{ color: "#f5a623" }}
                  />
                  <p style={{ margin: 0, fontWeight: 700, color: "#b37400" }}>
                    Subiendo imágenes...
                  </p>
                  <div className="pm-progress">
                    <div className="pm-progress-bar" />
                  </div>
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
                  <Upload size={28} style={{ color: "#ccc" }} />
                  <p style={{ margin: 0, fontWeight: 700, color: "#666" }}>
                    Haz clic o arrastra imágenes aquí
                  </p>
                  <p style={{ margin: 0, fontSize: ".75rem", color: "#bbb" }}>
                    PNG, JPG, WEBP · Múltiples archivos
                  </p>
                </div>
              )}
              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImgUpload}
              />
            </div>

            {producto?.image_url && (
              <div
                style={{
                  marginBottom: 20,
                  padding: 14,
                  background: "#fff8e6",
                  border: "1px solid #f5a62333",
                  borderRadius: 10,
                }}
              >
                <p className="pm-lbl" style={{ marginBottom: 10 }}>
                  Imagen principal actual
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={producto.image_url}
                    alt="principal"
                    style={{
                      height: 64,
                      width: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "2px solid #f5a623",
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: ".8rem",
                      color: "#888",
                      flex: 1,
                      wordBreak: "break-all",
                    }}
                  >
                    {producto.image_url}
                  </p>
                </div>
              </div>
            )}

            {imagenes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#ccc",
                }}
              >
                <ImageIcon size={36} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: ".9rem" }}>
                  Sin imágenes en la galería todavía
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 12,
                }}
              >
                {imagenes.map((img, i) => {
                  const isMain = img.url_imagenes === producto?.image_url;
                  return (
                    <div
                      key={img.id}
                      className={`pm-img-card${isMain ? " pm-img-card--main" : ""}`}
                    >
                      {isMain && (
                        <span className="pm-main-badge">✓ Principal</span>
                      )}
                      <span className="pm-orden-badge">#{i + 1}</span>
                      <img
                        src={img.url_imagenes}
                        alt=""
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div className="pm-img-actions">
                        {!isMain && (
                          <button
                            className="pm-btn pm-btn--sm"
                            style={{
                              background: "#f5a623",
                              color: "#fff",
                              border: "none",
                              fontSize: ".72rem",
                            }}
                            onClick={() => setMainImage(img.url_imagenes)}
                          >
                            ★ Principal
                          </button>
                        )}
                        <button
                          className="pm-btn pm-btn--sm pm-btn--danger"
                          onClick={() => deleteImagen(img.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="pm-img-order">
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            disabled={i === 0}
                            onClick={() => moverImagen(i, "arriba")}
                            style={ordenBtnStyle(i === 0)}
                            title="Mover arriba"
                          >
                            ▲
                          </button>
                          <button
                            disabled={i === imagenes.length - 1}
                            onClick={() => moverImagen(i, "abajo")}
                            style={ordenBtnStyle(i === imagenes.length - 1)}
                            title="Mover abajo"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB VIDEOS ── */}
        {tab === "videos" && (
          <div className="pm-fadein">
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                borderTop: "3px solid #6366f1",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Subir nuevo video
              </h3>

              {vidError && (
                <div className="pm-alert pm-alert--error">❌ {vidError}</div>
              )}
              {vidSuccess && (
                <div className="pm-alert pm-alert--success">
                  ✅ Video subido y guardado correctamente.
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <div>
                  <label className="pm-lbl">Título del video (opcional)</label>
                  <input
                    className="pm-inp"
                    placeholder="Ej: Demostración del producto"
                    value={videoTitulo}
                    onChange={(e) => setVideoTitulo(e.target.value)}
                  />
                </div>
                <button
                  className="pm-btn pm-btn--primary"
                  disabled={uploadingVid}
                  onClick={() => {
                    setVidError(null);
                    vidRef.current?.click();
                  }}
                >
                  {uploadingVid ? (
                    <>
                      <Loader2 size={15} className="pm-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Subir video
                    </>
                  )}
                </button>
                <input
                  ref={vidRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleVidUpload}
                />
              </div>

              {uploadingVid && (
                <div className="pm-progress" style={{ marginTop: 12 }}>
                  <div className="pm-progress-bar" />
                </div>
              )}

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: ".75rem",
                  color: "#aaa",
                }}
              >
                Formatos: MP4, MOV, AVI, WEBM · Máximo 100 MB
              </p>
            </div>

            {videos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#ccc",
                }}
              >
                <Video size={36} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: ".9rem" }}>
                  Sin videos para este producto
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {videos.map((v, i) => (
                  <div key={v.id} className="pm-vid-row">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        disabled={i === 0}
                        onClick={() => moverVideo(i, "arriba")}
                        style={ordenBtnStyle(i === 0)}
                        title="Subir"
                      >
                        ▲
                      </button>
                      <button
                        disabled={i === videos.length - 1}
                        onClick={() => moverVideo(i, "abajo")}
                        style={ordenBtnStyle(i === videos.length - 1)}
                        title="Bajar"
                      >
                        ▼
                      </button>
                    </div>

                    <video
                      src={v.video_url ?? ""}
                      controls
                      style={{
                        width: 120,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "#000",
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontWeight: 700,
                          fontSize: ".875rem",
                          color: "#1a1a1a",
                        }}
                      >
                        {v.titulo || (
                          <span style={{ color: "#ccc", fontWeight: 400 }}>
                            Sin título
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: ".75rem",
                          color: "#aaa",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {v.video_url}
                      </p>
                    </div>

                    <button
                      className="pm-btn pm-btn--sm pm-btn--danger"
                      onClick={() => deleteVideo(v.id)}
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
