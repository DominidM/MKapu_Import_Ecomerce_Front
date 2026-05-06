"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2 } from "lucide-react";

type BannerCarousel = {
  id: number;
  titulo: string | null;
  subtitulo: string | null;
  image_url: string;
  orden: number;
  activo: boolean;
  created_at?: string | null;
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

const initialCarousel = {
  titulo: "",
  subtitulo: "",
  image_url: "",
  orden: 0,
  activo: true,
};

export default function AdminBannersPage() {
  const [tab, setTab] = useState<"carousel" | "config">("carousel");

  const [carousel, setCarousel] = useState<BannerCarousel[]>([]);
  const [formC, setFormC] = useState(initialCarousel);
  const [editCId, setEditCId] = useState<number | null>(null);
  const [showFormC, setShowFormC] = useState(false);
  const [uploadingC, setUploadingC] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const fileRefC = useRef<HTMLInputElement>(null);

  const [configs, setConfigs] = useState<BannerConfig[]>([]);
  const [editConfig, setEditConfig] = useState<BannerConfig | null>(null);
  const [uploadingCfg, setUploadingCfg] = useState(false);
  const fileRefCfg = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [carRes, cfgRes] = await Promise.all([
      supabase
        .from("banners_carousel")
        .select("*")
        .order("orden", { ascending: true }),
      supabase
        .from("banners_config")
        .select("*")
        .order("ruta", { ascending: true }),
    ]);
    setCarousel(carRes.data ?? []);
    setConfigs(cfgRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function uploadImage(
    file: File,
    folder: string,
  ): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `banners/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });

    if (error) {
      alert("Error: " + error.message);
      return null;
    }

    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function persistOrder(list: BannerCarousel[]) {
    setSavingOrder(true);

    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));

    setCarousel(reordered);

    await Promise.all(
      reordered.map((item) =>
        supabase
          .from("banners_carousel")
          .update({ orden: item.orden })
          .eq("id", item.id),
      ),
    );

    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...carousel];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === carousel.length - 1) return;
    const copy = [...carousel];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
  }

  async function saveCarousel(e: React.FormEvent) {
    e.preventDefault();
    if (!formC.image_url) return alert("Imagen requerida");

    const payload = {
      titulo: formC.titulo || null,
      subtitulo: formC.subtitulo || null,
      image_url: formC.image_url,
      orden: formC.orden,
      activo: formC.activo,
    };

    const { error } = editCId
      ? await supabase
          .from("banners_carousel")
          .update(payload)
          .eq("id", editCId)
      : await supabase.from("banners_carousel").insert(payload);

    if (error) return alert(error.message);

    setFormC(initialCarousel);
    setEditCId(null);
    setShowFormC(false);
    await load();
  }

  function onEditCarousel(b: BannerCarousel) {
    setEditCId(b.id);
    setFormC({
      titulo: b.titulo ?? "",
      subtitulo: b.subtitulo ?? "",
      image_url: b.image_url,
      orden: b.orden,
      activo: b.activo,
    });
    setShowFormC(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDeleteCarousel(id: number) {
    if (!confirm("¿Eliminar banner?")) return;
    await supabase.from("banners_carousel").delete().eq("id", id);
    await load();
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!editConfig) return;

    const { error } = await supabase
      .from("banners_config")
      .update({
        titulo: editConfig.titulo,
        subtitulo: editConfig.subtitulo,
        image_url: editConfig.image_url,
        activo: editConfig.activo,
      })
      .eq("id", editConfig.id);

    if (error) return alert(error.message);

    setEditConfig(null);
    await load();
  }

  function onFocusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.65rem 1.5rem",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.875rem",
    borderRadius: "8px 8px 0 0",
    background: active ? "#fff" : "transparent",
    color: active ? "#f5a623" : "#888",
    borderBottom: active ? "2px solid #f5a623" : "2px solid transparent",
    transition: "all 0.15s",
  });

  function formatFecha(fecha?: string | null) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          Banners
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#888",
            margin: "0.25rem 0 0",
          }}
        >
          Gestiona el carrusel y los banners de cada página
        </p>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e8e8e8",
          marginBottom: "1.5rem",
        }}
      >
        <button
          style={tabStyle(tab === "carousel")}
          onClick={() => setTab("carousel")}
        >
          🖼️ Carrusel
        </button>
        <button
          style={tabStyle(tab === "config")}
          onClick={() => setTab("config")}
        >
          📄 Banners de páginas
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#aaa",
          }}
        >
          Cargando...
        </div>
      ) : (
        <>
          {tab === "carousel" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
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
                </div>

                <button
                  onClick={() => {
                    setShowFormC(!showFormC);
                    if (showFormC) {
                      setEditCId(null);
                      setFormC(initialCarousel);
                    }
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#d4891a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f5a623")
                  }
                >
                  {showFormC ? "✕ Cancelar" : "+ Nuevo slide"}
                </button>
              </div>

              {showFormC && (
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
                    {editCId ? "Editar slide" : "Nuevo slide"}
                  </h2>

                  <form onSubmit={saveCarousel}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label style={lbl}>Título</label>
                        <input
                          style={inp}
                          value={formC.titulo}
                          onChange={(e) =>
                            setFormC({ ...formC, titulo: e.target.value })
                          }
                          onFocus={onFocusInput}
                          onBlur={onBlurInput}
                        />
                      </div>
                      <div>
                        <label style={lbl}>Subtítulo</label>
                        <input
                          style={inp}
                          value={formC.subtitulo}
                          onChange={(e) =>
                            setFormC({ ...formC, subtitulo: e.target.value })
                          }
                          onFocus={onFocusInput}
                          onBlur={onBlurInput}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label style={lbl}>Orden</label>
                        <input
                          style={inp}
                          type="number"
                          value={formC.orden}
                          onChange={(e) =>
                            setFormC({
                              ...formC,
                              orden: Number(e.target.value),
                            })
                          }
                          onFocus={onFocusInput}
                          onBlur={onBlurInput}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          paddingBottom: "0.7rem",
                        }}
                      >
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
                            checked={formC.activo}
                            onChange={(e) =>
                              setFormC({ ...formC, activo: e.target.checked })
                            }
                            style={{
                              width: 16,
                              height: 16,
                              accentColor: "#f5a623",
                            }}
                          />
                          Activo
                        </label>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={lbl}>Imagen *</label>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          style={{ ...inp, flex: 1 }}
                          placeholder="URL o sube archivo..."
                          value={formC.image_url}
                          onChange={(e) =>
                            setFormC({ ...formC, image_url: e.target.value })
                          }
                          onFocus={onFocusInput}
                          onBlur={onBlurInput}
                        />
                        <button
                          type="button"
                          onClick={() => fileRefC.current?.click()}
                          style={{
                            background: "#f0f0f0",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "0.7rem 0.9rem",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          {uploadingC ? "Subiendo..." : "📁 Subir"}
                        </button>
                        <input
                          ref={fileRefC}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingC(true);
                            const url = await uploadImage(file, "carousel");
                            setUploadingC(false);
                            if (url)
                              setFormC((f) => ({ ...f, image_url: url }));
                            if (fileRefC.current) fileRefC.current.value = "";
                          }}
                        />
                      </div>

                      {formC.image_url && (
                        <img
                          src={formC.image_url}
                          alt="preview"
                          style={{
                            marginTop: "8px",
                            height: "80px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid #e0e0e0",
                            width: "100%",
                          }}
                        />
                      )}
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
                        {editCId ? "Guardar cambios" : "Crear slide"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowFormC(false);
                          setEditCId(null);
                          setFormC(initialCarousel);
                        }}
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

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: "12px",
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
                        "Imagen",
                        "Título",
                        "Fecha / Orden",
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
                    {carousel.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            color: "#aaa",
                          }}
                        >
                          No hay slides aún
                        </td>
                      </tr>
                    ) : (
                      carousel.map((b, i) => (
                        <tr
                          key={b.id}
                          style={{
                            borderBottom:
                              i < carousel.length - 1
                                ? "1px solid #f0f0f0"
                                : "none",
                          }}
                        >
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <img
                              src={b.image_url}
                              alt=""
                              style={{
                                width: 80,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                              }}
                            />
                          </td>

                          <td
                            style={{
                              padding: "0.9rem 1rem",
                              fontWeight: 600,
                              color: "#1a1a1a",
                              fontSize: "0.9rem",
                            }}
                          >
                            {b.titulo ?? (
                              <span style={{ color: "#ccc" }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: "0.9rem 1rem", minWidth: 150 }}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#888",
                                  fontWeight: 500,
                                }}
                              >
                                {formatFecha(b.created_at)}
                              </span>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => moveUp(i)}
                                  disabled={i === 0 || savingOrder}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "6px",
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    cursor:
                                      i === 0 || savingOrder
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: i === 0 || savingOrder ? 0.45 : 1,
                                    fontWeight: 700,
                                    color: "#666",
                                  }}
                                >
                                  ↑
                                </button>

                                <span
                                  style={{
                                    minWidth: 24,
                                    textAlign: "center",
                                    fontWeight: 700,
                                    color: "#666",
                                  }}
                                >
                                  {b.orden}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => moveDown(i)}
                                  disabled={
                                    i === carousel.length - 1 || savingOrder
                                  }
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "6px",
                                    border: "1px solid #e0e0e0",
                                    background: "#fff",
                                    cursor:
                                      i === carousel.length - 1 || savingOrder
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      i === carousel.length - 1 || savingOrder
                                        ? 0.45
                                        : 1,
                                    fontWeight: 700,
                                    color: "#666",
                                  }}
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
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
                                background: b.activo
                                  ? "rgba(34,197,94,0.1)"
                                  : "rgba(239,68,68,0.1)",
                                color: b.activo ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {b.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td style={{ padding: "0.9rem 1rem" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                onClick={() => onEditCarousel(b)}
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
                                onClick={() => onDeleteCarousel(b.id)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "config" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {configs.map((cfg) => (
                <div
                  key={cfg.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e8e8",
                    borderRadius: "12px",
                    padding: "1.25rem",
                  }}
                >
                  {editConfig?.id === cfg.id ? (
                    <form onSubmit={saveConfig}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <code
                          style={{
                            background: "#f5f5f5",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            color: "#666",
                          }}
                        >
                          {cfg.ruta}
                        </code>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.875rem",
                            color: "#444",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editConfig.activo}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                activo: e.target.checked,
                              })
                            }
                            style={{
                              width: 16,
                              height: 16,
                              accentColor: "#f5a623",
                            }}
                          />
                          Activo
                        </label>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <label style={lbl}>Título</label>
                          <input
                            style={inp}
                            value={editConfig.titulo}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                titulo: e.target.value,
                              })
                            }
                            onFocus={onFocusInput}
                            onBlur={onBlurInput}
                            required
                          />
                        </div>
                        <div>
                          <label style={lbl}>Subtítulo</label>
                          <input
                            style={inp}
                            value={editConfig.subtitulo ?? ""}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                subtitulo: e.target.value,
                              })
                            }
                            onFocus={onFocusInput}
                            onBlur={onBlurInput}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label style={lbl}>Imagen de fondo</label>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            style={{ ...inp, flex: 1 }}
                            placeholder="URL o sube archivo..."
                            value={editConfig.image_url ?? ""}
                            onChange={(e) =>
                              setEditConfig({
                                ...editConfig,
                                image_url: e.target.value,
                              })
                            }
                            onFocus={onFocusInput}
                            onBlur={onBlurInput}
                          />
                          <button
                            type="button"
                            onClick={() => fileRefCfg.current?.click()}
                            style={{
                              background: "#f0f0f0",
                              border: "1px solid #e0e0e0",
                              borderRadius: "8px",
                              padding: "0.7rem 0.9rem",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {uploadingCfg ? "Subiendo..." : "📁 Subir"}
                          </button>
                          <input
                            ref={fileRefCfg}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingCfg(true);
                              const url = await uploadImage(file, "config");
                              setUploadingCfg(false);
                              if (url && editConfig) {
                                setEditConfig((c) =>
                                  c ? { ...c, image_url: url } : c,
                                );
                              }
                              if (fileRefCfg.current) {
                                fileRefCfg.current.value = "";
                              }
                            }}
                          />
                        </div>

                        {editConfig.image_url && (
                          <img
                            src={editConfig.image_url}
                            alt="preview"
                            style={{
                              marginTop: "8px",
                              height: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #e0e0e0",
                            }}
                          />
                        )}
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
                          Guardar
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditConfig(null)}
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
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        {cfg.image_url && (
                          <img
                            src={cfg.image_url}
                            alt=""
                            style={{
                              width: 64,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #e0e0e0",
                            }}
                          />
                        )}
                        <div>
                          <code
                            style={{
                              background: "#f5f5f5",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.8rem",
                              color: "#666",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {cfg.ruta}
                          </code>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#1a1a1a",
                              fontSize: "0.9rem",
                            }}
                          >
                            {cfg.titulo}
                          </span>
                          {cfg.subtitulo && (
                            <span
                              style={{
                                color: "#888",
                                fontSize: "0.8rem",
                                marginLeft: "8px",
                              }}
                            >
                              {cfg.subtitulo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            background: cfg.activo
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(239,68,68,0.1)",
                            color: cfg.activo ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {cfg.activo ? "Activo" : "Inactivo"}
                        </span>

                        <button
                          onClick={() => setEditConfig(cfg)}
                          style={{
                            background: "rgba(245,166,35,0.1)",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            color: "#f5a623",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
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
                          <Pencil size={14} />
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
