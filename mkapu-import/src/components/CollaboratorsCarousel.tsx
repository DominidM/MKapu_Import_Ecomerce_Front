"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getColaboradores, Colaborador } from "@/lib/queries";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  Play,
  ImageIcon,
  Film,
} from "lucide-react";

type MediaItem = {
  id: number;
  url: string;
  tipo: string;
  titulo: string | null;
  orden: number;
};

const SCROLL_THRESHOLD = 5;

// ── MODAL ──────────────────────────────────────────────────────────────────
function MediaModal({
  colaborador,
  media,
  onClose,
}: {
  colaborador: Colaborador & { media?: MediaItem[] };
  media: MediaItem[];
  onClose: () => void;
}) {
  const imagenes = media.filter((m) => m.tipo === "imagen");
  const videos = media.filter((m) => m.tipo === "video");
  const [tab, setTab] = useState<"fotos" | "videos">(
    imagenes.length > 0 ? "fotos" : "videos",
  );
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, activeIdx, tab]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const items = tab === "fotos" ? imagenes : videos;
  function prev() {
    setActiveIdx((i) => (i === 0 ? items.length - 1 : i - 1));
  }
  function next() {
    setActiveIdx((i) => (i === items.length - 1 ? 0 : i + 1));
  }
  function switchTab(t: "fotos" | "videos") {
    setTab(t);
    setActiveIdx(0);
  }

  function getYoutubeId(url: string) {
    const m = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/,
    );
    return m?.[1] ?? null;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "1.1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0ebe4",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {colaborador.logo_url && (
              <div
                style={{
                  position: "relative",
                  width: 42,
                  height: 42,
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #f0ebe4",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={colaborador.logo_url}
                  alt={colaborador.name}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.65rem",
                  color: "#f5a623",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Colaborador
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  color: "#1a1a1a",
                }}
              >
                {colaborador.name}
              </h3>
            </div>
          </div>

          {/* Tabs en el header si hay ambos tipos */}
          {imagenes.length > 0 && videos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                background: "#f5f0ea",
                borderRadius: "12px",
                padding: "4px",
              }}
            >
              <button
                onClick={() => switchTab("fotos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "9px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: tab === "fotos" ? "#f5a623" : "transparent",
                  color: tab === "fotos" ? "#fff" : "#888",
                  transition: "all 0.18s",
                }}
              >
                <ImageIcon size={14} />
                Fotos{" "}
                <span
                  style={{
                    background:
                      tab === "fotos" ? "rgba(255,255,255,0.3)" : "#e0d8d0",
                    color: tab === "fotos" ? "#fff" : "#999",
                    borderRadius: "99px",
                    padding: "1px 7px",
                    fontSize: "0.7rem",
                  }}
                >
                  {imagenes.length}
                </span>
              </button>
              <button
                onClick={() => switchTab("videos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "9px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: tab === "videos" ? "#f5a623" : "transparent",
                  color: tab === "videos" ? "#fff" : "#888",
                  transition: "all 0.18s",
                }}
              >
                <Film size={14} />
                Videos{" "}
                <span
                  style={{
                    background:
                      tab === "videos" ? "rgba(255,255,255,0.3)" : "#e0d8d0",
                    color: tab === "videos" ? "#fff" : "#999",
                    borderRadius: "99px",
                    padding: "1px 7px",
                    fontSize: "0.7rem",
                  }}
                >
                  {videos.length}
                </span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              background: "#f5f0ea",
              border: "none",
              borderRadius: "10px",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#666",
              transition: "background 0.15s",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Contenido ── */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
            background: "#fafaf9",
          }}
        >
          {/* FOTOS */}
          {tab === "fotos" && (
            <div>
              {/* Imagen principal con flechas */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#111",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                >
                  <Image
                    src={items[activeIdx]?.url ?? ""}
                    alt={items[activeIdx]?.titulo ?? ""}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="900px"
                  />
                </div>

                {/* Flechas */}
                {items.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      style={{
                        position: "absolute",
                        left: -20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "none",
                        background: "#fff",
                        color: "#1a1a1a",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 2,
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-50%) scale(1.1)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 6px 20px rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-50%) scale(1)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.15)";
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={next}
                      style={{
                        position: "absolute",
                        right: -20,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "none",
                        background: "#fff",
                        color: "#1a1a1a",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 2,
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-50%) scale(1.1)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 6px 20px rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-50%) scale(1)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.15)";
                      }}
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* Dots */}
              {items.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    marginTop: "16px",
                  }}
                >
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: i === activeIdx ? 24 : 8,
                        height: 8,
                        borderRadius: "99px",
                        border: "none",
                        background: i === activeIdx ? "#f5a623" : "#d9d0c7",
                        cursor: "pointer",
                        padding: 0,
                        transition: "width 0.2s, background 0.2s",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnails */}
              {items.length > 1 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  {items.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: `2.5px solid ${i === activeIdx ? "#f5a623" : "transparent"}`,
                        padding: 0,
                        cursor: "pointer",
                        position: "relative",
                        background: "#eee",
                        transition: "border-color 0.15s",
                        boxShadow:
                          i === activeIdx
                            ? "0 0 0 3px rgba(245,166,35,0.2)"
                            : "none",
                      }}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="90px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {items[activeIdx]?.titulo && (
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: "0.85rem",
                    color: "#888",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  {items[activeIdx].titulo}
                </p>
              )}
            </div>
          )}

          {/* VIDEOS */}
          {tab === "videos" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {videos.map((v) => {
                const ytId = getYoutubeId(v.url);
                return (
                  <div
                    key={v.id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid #f0ebe4",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  >
                    {v.titulo && (
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f5f0ea",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Film size={15} color="#f5a623" />
                        <span
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "#1a1a1a",
                          }}
                        >
                          {v.titulo}
                        </span>
                      </div>
                    )}
                    <div style={{ padding: "0" }}>
                      {ytId ? (
                        <div
                          style={{
                            position: "relative",
                            maxHeight: "480px",
                            aspectRatio: "16/9",
                          }}
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={v.url}
                          controls
                          style={{
                            width: "100%",
                            maxHeight: "480px",
                            display: "block",
                            background: "#000",
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CARD ───────────────────────────────────────────────────────────────────
function ColabCard({
  colaborador,
  onOpen,
}: {
  colaborador: Colaborador & { media?: MediaItem[] };
  onOpen: () => void;
}) {
  const media = colaborador.media ?? [];
  const nFotos = media.filter((m) => m.tipo === "imagen").length;
  const nVideos = media.filter((m) => m.tipo === "video").length;
  const hasMedia = nFotos > 0 || nVideos > 0;

  const cardContent = (
    <>
      {/* Logo a color, sin grayscale */}
      <div
        style={{
          width: "100%",
          height: "175px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 26px",
        }}
      >
        {colaborador.logo_url ? (
          <img
            src={colaborador.logo_url}
            alt={colaborador.name}
            style={{
              maxHeight: "100px",
              maxWidth: "180px",
              objectFit: "contain",
              transition: "transform 0.2s",
            }}
            className="collab-logo"
          />
        ) : (
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#1a1a1a",
              textAlign: "center",
            }}
          >
            {colaborador.name}
          </span>
        )}
      </div>

      {/* Nombre siempre visible */}
      <div
        style={{
          borderTop: "1px solid #f0ebe4",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: hasMedia ? "space-between" : "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#666",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: hasMedia ? "80px" : "140px",
          }}
        >
          {colaborador.name}
        </span>

        {/* Badges + botón si tiene media */}
        {hasMedia && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            {nFotos > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  background: "#f0ebe4",
                  color: "#666",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  borderRadius: "99px",
                  padding: "2px 6px",
                }}
              >
                <ImageIcon size={8} /> {nFotos}
              </span>
            )}
            {nVideos > 0 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  background: "#fff3d6",
                  color: "#c47a00",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  borderRadius: "99px",
                  padding: "2px 6px",
                }}
              >
                <Film size={8} /> {nVideos}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botón explícito "Ver galería" */}
      {hasMedia && (
        <div
          style={{
            background: "linear-gradient(135deg, #f5a623, #e05c2a)",
            padding: "7px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <Images size={12} color="#fff" />
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Ver galería
          </span>
        </div>
      )}
    </>
  );

  return (
    <div
      className="collab-item"
      onClick={hasMedia ? onOpen : undefined}
      style={{
        cursor: hasMedia ? "pointer" : "default",
        minWidth: "160px",
        height: "auto",
        padding: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {colaborador.url && !hasMedia ? (
        <a
          href={colaborador.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            flexDirection: "column",
            textDecoration: "none",
            flex: 1,
          }}
        >
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </div>
  );
}

// ── CAROUSEL ───────────────────────────────────────────────────────────────
export default function CollaboratorsCarousel() {
  const [colaboradores, setColaboradores] = useState<
    (Colaborador & { media?: MediaItem[] })[]
  >([]);
  const [modalCollab, setModalCollab] = useState<
    (Colaborador & { media?: MediaItem[] }) | null
  >(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const colabs = await getColaboradores();
      const withMedia = await Promise.all(
        colabs.map(async (c) => {
          const { data } = await supabase
            .from("colaborador_media")
            .select("*")
            .eq("colaborador_id", c.id)
            .order("orden");
          return { ...c, media: (data as MediaItem[]) ?? [] };
        }),
      );
      setColaboradores(withMedia);
    }
    load();
  }, []);

  const shouldScroll = colaboradores.length > SCROLL_THRESHOLD;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || colaboradores.length === 0 || !shouldScroll) return;
    let pos = 0;
    const speed = 0.4;
    let raf: number;
    const step = () => {
      pos -= speed;
      if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [colaboradores, shouldScroll]);

  if (colaboradores.length === 0) return null;

  const items = shouldScroll
    ? [...colaboradores, ...colaboradores]
    : colaboradores;

  return (
    <>
      <section className="collab-section">
        <div className="collab-header">
          <span className="collab-tag">Colaboraciones</span>
          <h2 className="collab-title">Con quienes hemos trabajado</h2>
        </div>

        <div
          className={`collab-wrapper${shouldScroll ? " collab-wrapper--scroll" : ""}`}
        >
          {shouldScroll && (
            <>
              <div className="collab-fade collab-fade--left" />
              <div className="collab-fade collab-fade--right" />
            </>
          )}
          <div
            className={`collab-track${!shouldScroll ? " collab-track--static" : ""}`}
            ref={trackRef}
          >
            {items.map((c, i) => (
              <ColabCard
                key={`${c.id}-${i}`}
                colaborador={c}
                onOpen={() => {
                  const original = colaboradores.find((x) => x.id === c.id)!;
                  setModalCollab(original);
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          .collab-section {
            padding: 4rem 1.5rem;
            background: #f5f5f5;
            overflow: hidden;
          }
          .collab-header { text-align: center; margin-bottom: 2.5rem; }
          .collab-tag {
            display: inline-block; font-size: 0.7rem; font-weight: 700;
            letter-spacing: 0.1em; text-transform: uppercase;
            color: #f5a623; margin-bottom: 0.5rem;
          }
          .collab-title {
            font-size: clamp(1.4rem, 3vw, 2rem);
            font-weight: 900; color: #1a1a1a; margin: 0;
          }
          .collab-wrapper { overflow: hidden; width: 100%; }
          .collab-wrapper--scroll { position: relative; }
          .collab-fade {
            position: absolute; top: 0; bottom: 0;
            width: 100px; z-index: 2; pointer-events: none;
          }
          .collab-fade--left {
            left: 0;
            background: linear-gradient(to right, #f5f5f5 30%, transparent);
          }
          .collab-fade--right {
            right: 0;
            background: linear-gradient(to left, #f5f5f5 30%, transparent);
          }
          .collab-track {
            display: flex; gap: 2rem;
            width: max-content; will-change: transform;
          }
          .collab-track--static {
            width: 100% !important; justify-content: center;
            flex-wrap: wrap; gap: 1.5rem;
          }
          .collab-item {
            display: flex; align-items: center; justify-content: center;
            min-width: 150px; height: 90px;
            background: #fff; border: 1px solid #e8e8e8;
            border-radius: 12px; padding: 1rem 1.5rem;
            transition: box-shadow 0.2s, border-color 0.2s;
            overflow: hidden;
          }
          .collab-item:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            border-color: #f5a623;
          }
          .collab-hover-label {
            position: absolute; bottom: 0; left: 0; right: 0;
            background: rgba(245,166,35,0.95); color: #fff;
            font-size: 0.68rem; font-weight: 700; text-align: center;
            padding: 5px 0; border-radius: 0 0 10px 10px;
            opacity: 0; transition: opacity 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 4px;
          }
          .collab-item:hover .collab-hover-label { opacity: 1; }
          .collab-link {
            display: flex; align-items: center; justify-content: center;
            width: 100%; height: 100%; text-decoration: none;
          }
          /* REEMPLAZA el .collab-logo anterior por este */
          .collab-logo {
            max-height: 60px;
            max-width: 130px;
            object-fit: contain;
            /* SIN filter grayscale */
            transition: transform 0.2s;
          }
          .collab-item:hover .collab-logo {
            transform: scale(1.05);
          }
          .collab-name { font-size: 0.9rem; font-weight: 700; color: #555; white-space: nowrap; }
          @media (max-width: 640px) {
            .collab-section { padding: 2.5rem 1rem; }
            .collab-item { min-width: 120px; height: 72px; padding: 0.75rem 1rem; }
            .collab-logo { max-height: 40px; max-width: 95px; }
            .collab-fade { width: 60px; }
            .collab-track--static { gap: 1rem; }
          }
        `}</style>
      </section>

      {modalCollab && (
        <MediaModal
          colaborador={modalCollab}
          media={modalCollab.media ?? []}
          onClose={() => setModalCollab(null)}
        />
      )}
    </>
  );
}
