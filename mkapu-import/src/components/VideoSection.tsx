"use client";
import { useEffect, useRef, useState } from "react";
import { getVideos, Video } from "@/lib/queries";

// ── Detecta el tipo de fuente ──────────────────────────────────────────────
type VideoSource =
  | { type: "youtube"; id: string }
  | { type: "tiktok"; url: string }
  | { type: "direct"; url: string }
  | { type: "none" };

function detectSource(video: Video): VideoSource {
  if (video.youtube_id?.trim()) {
    return { type: "youtube", id: video.youtube_id.trim() };
  }
  const url = video.video_url?.trim();
  if (!url) return { type: "none" };
  if (url.includes("tiktok.com")) return { type: "tiktok", url };
  return { type: "direct", url };
}

// ── Player universal ───────────────────────────────────────────────────────
function VideoPlayer({ video }: { video: Video }) {
  const [embedError, setEmbedError] = useState(false);
  const source = detectSource(video);

  useEffect(() => { setEmbedError(false); }, [video.id]);

  if (source.type === "none" || embedError) {
    return (
      <div className="vs-fallback">
        <div className="vs-fallback-overlay">
          <p className="vs-fallback-msg">⚠️ No hay video disponible</p>
        </div>
      </div>
    );
  }

  if (source.type === "youtube") {
    return (
      <iframe
        key={source.id}
        src={`https://www.youtube.com/embed/${source.id}?rel=0`}
        title={video.title}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="vs-iframe"
        onError={() => setEmbedError(true)}
      />
    );
  }

  if (source.type === "tiktok") {
    const match = source.url.match(/video\/(\d+)/);
    const tiktokId = match?.[1];

    if (!tiktokId) return (
      <div className="vs-fallback">
        <div className="vs-fallback-overlay">
          <p className="vs-fallback-msg">URL de TikTok no válida</p>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="vs-fallback-btn">
            Ver en TikTok
          </a>
        </div>
      </div>
    );

    return (
      <div className="vs-tiktok-wrapper">
        <iframe
          key={tiktokId}
          src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
          title={video.title}
          allowFullScreen
          allow="encrypted-media"
          className="vs-iframe-tiktok"
          onError={() => setEmbedError(true)}
        />
      </div>
    );
  }

  if (source.type === "direct") {
    return (
      <video
        key={source.url}
        src={source.url}
        controls
        className="vs-iframe"
        onError={() => setEmbedError(true)}
      />
    );
  }

  return null;
}

// ── Componente principal ───────────────────────────────────────────────────
export default function VideoSection({ tipo }: { tipo?: "video" | "vlog" }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    getVideos(tipo).then((data) => {
      setVideos(data);
      if (data.length > 0) setActive(data[0]);
    });
  }, [tipo]);

  if (videos.length === 0) return null;

  return (
    <section className="vs-section">
      <div className="vs-inner">
        <div className="vs-head">
          <span className="vs-tag">{tipo === "vlog" ? "Vlog" : "Videos"}</span>
          <h2 className="vs-title">
            {tipo === "vlog" ? "Nuestro Vlog" : "Videos destacados"}
          </h2>
        </div>

        <div className="vs-layout">
          <div className="vs-player">
            {active && <VideoPlayer video={active} />}
          </div>

          <div className="vs-list">
            {videos.map((v) => {
              const src = detectSource(v);
              const thumbSrc =
                v.thumbnail ||
                (src.type === "youtube"
                  ? `https://img.youtube.com/vi/${src.id}/mqdefault.jpg`
                  : null);

              const badge =
                src.type === "youtube" ? "YT" :
                src.type === "tiktok"  ? "TK" :
                src.type === "direct"  ? "📁" : "";

              return (
                <button
                  key={v.id}
                  onClick={() => setActive(v)}
                  className={`vs-item${active?.id === v.id ? " vs-item--active" : ""}`}
                >
                  <div className="vs-item-info">
                    <p className="vs-item-title">{v.title}</p>
                    {v.descripcion && (
                      <p className="vs-item-desc">{v.descripcion}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}