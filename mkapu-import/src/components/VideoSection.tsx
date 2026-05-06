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

      <style>{`
        .vs-section {
          padding: 4rem 1.5rem;
          background: #0d0d0d;
        }
        .vs-inner {
          max-width: 1040px;
          margin: 0 auto;
        }
        .vs-head {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .vs-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.5rem;
        }
        .vs-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #fff;
          margin: 0;
        }

        /* Layout: player limitado + lista lateral */
        .vs-layout {
          display: grid;
          grid-template-columns: minmax(0, 680px) 280px;
          gap: 1.5rem;
          align-items: start;
          justify-content: center;
        }

        /* Player */
        .vs-player {
          background: #111;
          border-radius: 12px;
          overflow: hidden;
        }
        .vs-iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border: none;
          display: block;
        }

        /* Lista de videos */
        .vs-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 480px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #333 transparent;
        }
        .vs-item {
          display: flex;
          gap: 0.75rem;
          background: #111;
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 0.6rem;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .vs-item:hover {
          background: #1a1a1a;
        }
        .vs-item--active {
          border-color: #f5a623;
          background: #1a1a1a;
        }
        .vs-item-info {
          flex: 1;
          min-width: 0;
        }
        .vs-item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .vs-item-desc {
          font-size: 0.75rem;
          color: #666;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Thumbnail + badge */
        .vs-thumb {
          width: 90px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .vs-thumb-placeholder {
          font-size: 1.2rem;
          color: #555;
        }
        .vs-badge {
          position: absolute;
          bottom: 3px;
          right: 3px;
          background: rgba(0,0,0,0.75);
          color: #f5a623;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
        }

        /* TikTok: ratio vertical */
        .vs-tiktok-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          background: #111;
          padding: 1rem 0;
        }
        .vs-iframe-tiktok {
          width: 325px;
          height: 580px;
          border: none;
          border-radius: 12px;
        }

        /* Fallback */
        .vs-fallback {
          width: 100%;
          aspect-ratio: 16/9;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vs-fallback-overlay {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }
        .vs-fallback-msg {
          color: #aaa;
          font-size: 0.9rem;
          margin: 0;
        }
        .vs-fallback-btn {
          background: #f5a623;
          color: #000;
          font-weight: 700;
          font-size: 0.875rem;
          padding: 10px 24px;
          border-radius: 8px;
          text-decoration: none;
        }
        .vs-fallback-btn:hover {
          background: #e69510;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .vs-layout {
            grid-template-columns: 1fr;
          }
          .vs-list {
            max-height: 300px;
          }
          .vs-iframe-tiktok {
            width: 100%;
            max-width: 325px;
          }
        }
      `}</style>
    </section>
  );
}