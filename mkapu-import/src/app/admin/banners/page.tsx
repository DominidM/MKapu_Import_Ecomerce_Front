"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type BannerCarousel = {
  id: number;
  titulo: string | null;
  subtitulo: string | null;
  image_url: string;
  link_url: string | null;
  orden: number;
  activo: boolean;
};

type BannerConfig = {
  id: number;
  ruta: string;
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0",
  borderRadius: "8px", fontSize: "0.875rem", background: "#fff",
  color: "#1a1a1a", outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#888",
  marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em",
};

const initialCarousel = { titulo: "", subtitulo: "", image_url: "", link_url: "", orden: 0, activo: true };

export default function AdminBannersPage() {
  const [tab, setTab] = useState<"carousel" | "config">("carousel");

  // Carousel
  const [carousel, setCarousel] = useState<BannerCarousel[]>([]);
  const [formC, setFormC] = useState(initialCarousel);
  const [editCId, setEditCId] = useState<number | null>(null);
  const [showFormC, setShowFormC] = useState(false);
  const [uploadingC, setUploadingC] = useState(false);
  const fileRefC = useRef<HTMLInputElement>(null);

  // Config
  const [configs, setConfigs] = useState<BannerConfig[]>([]);
  const [editConfig, setEditConfig] = useState<BannerConfig | null>(null);
  const [uploadingCfg, setUploadingCfg] = useState(false);
  const fileRefCfg = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [carRes, cfgRes] = await Promise.all([
      supabase.from("banners_carousel").select("*").order("orden", { ascending: true }),
      supabase.from("banners_config").select("*").order("ruta", { ascending: true }),
    ]);
    setCarousel(carRes.data ?? []);
    setConfigs(cfgRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadImage(file: File, folder: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `banners/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("imagenes").upload(path, file, { upsert: true });
    if (error) { alert("Error: " + error.message); return null; }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  // ── CAROUSEL CRUD ──
  async function saveCarousel(e: React.FormEvent) {
    e.preventDefault();
    if (!formC.image_url) return alert("Imagen requerida");
    const payload = {
      titulo: formC.titulo || null, subtitulo: formC.subtitulo || null,
      image_url: formC.image_url, link_url: formC.link_url || null,
      orden: formC.orden, activo: formC.activo,
    };
    const { error } = editCId
      ? await supabase.from("banners_carousel").update(payload).eq("id", editCId)
      : await supabase.from("banners_carousel").insert(payload);
    if (error) return alert(error.message);
    setFormC(initialCarousel); setEditCId(null); setShowFormC(false); load();
  }

  function onEditCarousel(b: BannerCarousel) {
    setEditCId(b.id);
    setFormC({ titulo: b.titulo ?? "", subtitulo: b.subtitulo ?? "", image_url: b.image_url, link_url: b.link_url ?? "", orden: b.orden, activo: b.activo });
    setShowFormC(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDeleteCarousel(id: number) {
    if (!confirm("¿Eliminar banner?")) return;
    await supabase.from("banners_carousel").delete().eq("id", id);
    load();
  }

  // ── CONFIG CRUD ──
  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!editConfig) return;
    const { error } = await supabase.from("banners_config")
      .update({ titulo: editConfig.titulo, subtitulo: editConfig.subtitulo, image_url: editConfig.image_url, activo: editConfig.activo })
      .eq("id", editConfig.id);
    if (error) return alert(error.message);
    setEditConfig(null); load();
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 24px", border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: "0.875rem", borderRadius: "8px 8px 0 0",
    background: active ? "#fff" : "transparent",
    color: active ? "#f5a623" : "#888",
    borderBottom: active ? "2px solid #f5a623" : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <style>{`.fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}.rh:hover{background:#fafafa!important}.be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}.bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}.bp:hover{background:#e69510!important}`}</style>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Banners</h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>Gestiona el carrusel y los banners de cada página</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: "24px" }}>
        <button style={tabStyle(tab === "carousel")} onClick={() => setTab("carousel")}>🖼️ Carrusel</button>
        <button style={tabStyle(tab === "config")} onClick={() => setTab("config")}>📄 Banners de páginas</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Cargando...</div>
      ) : (
        <>
          {/* ── TAB CAROUSEL ── */}
          {tab === "carousel" && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button className="bp" onClick={() => { setShowFormC(!showFormC); if (showFormC) { setEditCId(null); setFormC(initialCarousel); } }}
                  style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                  {showFormC ? "✕ Cancelar" : "+ Nuevo slide"}
                </button>
              </div>

              {showFormC && (
                <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "24px", marginBottom: "24px", borderTop: "3px solid #f5a623" }}>
                  <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700 }}>{editCId ? "Editar slide" : "Nuevo slide"}</h2>
                  <form onSubmit={saveCarousel}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={lbl}>Título</label>
                        <input className="fi" style={inp} value={formC.titulo} onChange={(e) => setFormC({ ...formC, titulo: e.target.value })} />
                      </div>
                      <div>
                        <label style={lbl}>Subtítulo</label>
                        <input className="fi" style={inp} value={formC.subtitulo} onChange={(e) => setFormC({ ...formC, subtitulo: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={lbl}>Link (URL destino)</label>
                        <input className="fi" style={inp} placeholder="https://..." value={formC.link_url} onChange={(e) => setFormC({ ...formC, link_url: e.target.value })} />
                      </div>
                      <div>
                        <label style={lbl}>Orden</label>
                        <input className="fi" style={inp} type="number" value={formC.orden} onChange={(e) => setFormC({ ...formC, orden: Number(e.target.value) })} />
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "9px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#444" }}>
                          <input type="checkbox" checked={formC.activo} onChange={(e) => setFormC({ ...formC, activo: e.target.checked })}
                            style={{ width: 16, height: 16, accentColor: "#f5a623" }} />
                          Activo
                        </label>
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={lbl}>Imagen *</label>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input className="fi" style={{ ...inp, flex: 1 }} placeholder="URL o sube archivo..." value={formC.image_url}
                          onChange={(e) => setFormC({ ...formC, image_url: e.target.value })} />
                        <button type="button" onClick={() => fileRefC.current?.click()}
                          style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "9px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          {uploadingC ? "Subiendo..." : "📁 Subir"}
                        </button>
                        <input ref={fileRefC} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            setUploadingC(true);
                            const url = await uploadImage(file, "carousel");
                            setUploadingC(false);
                            if (url) setFormC((f) => ({ ...f, image_url: url }));
                            if (fileRefC.current) fileRefC.current.value = "";
                          }} />
                      </div>
                      {formC.image_url && (
                        <img src={formC.image_url} alt="preview" style={{ marginTop: "8px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e0e0e0", width: "100%" }} />
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className="bp"
                        style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                        {editCId ? "Guardar cambios" : "Crear slide"}
                      </button>
                      <button type="button" onClick={() => { setShowFormC(false); setEditCId(null); setFormC(initialCarousel); }}
                        style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                      {["Imagen", "Título", "Link", "Orden", "Estado", "Acciones"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carousel.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No hay slides aún</td></tr>
                    ) : carousel.map((b, i) => (
                      <tr key={b.id} className="rh" style={{ borderBottom: i < carousel.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <img src={b.image_url} alt="" style={{ width: 80, height: 48, objectFit: "cover", borderRadius: "6px", border: "1px solid #e0e0e0" }} />
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>{b.titulo ?? <span style={{ color: "#ccc" }}>—</span>}</td>
                        <td style={{ padding: "12px 16px", color: "#888", fontSize: "0.8rem", maxWidth: 160 }}>
                          {b.link_url ? <a href={b.link_url} target="_blank" rel="noreferrer" style={{ color: "#f5a623", textDecoration: "none" }}>{b.link_url}</a> : <span style={{ color: "#ccc" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{b.orden}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: b.activo ? "#e8f7ee" : "#fde8e8", color: b.activo ? "#1a7a3c" : "#a71d2a" }}>
                            {b.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="be" onClick={() => onEditCarousel(b)} style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Editar</button>
                            <button className="bd" onClick={() => onDeleteCarousel(b.id)} style={{ background: "rgba(220,53,69,0.08)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── TAB CONFIG ── */}
          {tab === "config" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {configs.map((cfg) => (
                <div key={cfg.id} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "20px" }}>
                  {editConfig?.id === cfg.id ? (
                    <form onSubmit={saveConfig}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <code style={{ background: "#f5f5f5", padding: "3px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "#666" }}>{cfg.ruta}</code>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "#444", cursor: "pointer" }}>
                          <input type="checkbox" checked={editConfig.activo} onChange={(e) => setEditConfig({ ...editConfig, activo: e.target.checked })}
                            style={{ accentColor: "#f5a623" }} />
                          Activo
                        </label>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div>
                          <label style={lbl}>Título</label>
                          <input className="fi" style={inp} value={editConfig.titulo} onChange={(e) => setEditConfig({ ...editConfig, titulo: e.target.value })} required />
                        </div>
                        <div>
                          <label style={lbl}>Subtítulo</label>
                          <input className="fi" style={inp} value={editConfig.subtitulo ?? ""} onChange={(e) => setEditConfig({ ...editConfig, subtitulo: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={lbl}>Imagen de fondo</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input className="fi" style={{ ...inp, flex: 1 }} placeholder="URL o sube archivo..." value={editConfig.image_url ?? ""}
                            onChange={(e) => setEditConfig({ ...editConfig, image_url: e.target.value })} />
                          <button type="button" onClick={() => fileRefCfg.current?.click()}
                            style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "9px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            {uploadingCfg ? "Subiendo..." : "📁 Subir"}
                          </button>
                          <input ref={fileRefCfg} type="file" accept="image/*" style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              setUploadingCfg(true);
                              const url = await uploadImage(file, "config");
                              setUploadingCfg(false);
                              if (url && editConfig) setEditConfig((c) => c ? { ...c, image_url: url } : c);
                              if (fileRefCfg.current) fileRefCfg.current.value = "";
                            }} />
                        </div>
                        {editConfig.image_url && (
                          <img src={editConfig.image_url} alt="preview" style={{ marginTop: "8px", height: "60px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e0e0e0" }} />
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button type="submit" className="bp"
                          style={{ background: "#f5a623", color: "#fff", border: "none", padding: "9px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                          Guardar
                        </button>
                        <button type="button" onClick={() => setEditConfig(null)}
                          style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "9px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {cfg.image_url && <img src={cfg.image_url} alt="" style={{ width: 64, height: 40, objectFit: "cover", borderRadius: "6px", border: "1px solid #e0e0e0" }} />}
                        <div>
                          <code style={{ background: "#f5f5f5", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", color: "#666", display: "block", marginBottom: "4px" }}>{cfg.ruta}</code>
                          <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.9rem" }}>{cfg.titulo}</span>
                          {cfg.subtitulo && <span style={{ color: "#888", fontSize: "0.8rem", marginLeft: "8px" }}>{cfg.subtitulo}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: cfg.activo ? "#e8f7ee" : "#fde8e8", color: cfg.activo ? "#1a7a3c" : "#a71d2a" }}>
                          {cfg.activo ? "Activo" : "Inactivo"}
                        </span>
                        <button className="be" onClick={() => setEditConfig(cfg)}
                          style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}