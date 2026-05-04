"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  ImageOff,
} from "lucide-react";

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  fecha_publicacion: string;
};

type BlogImagen = {
  id: number;
  url_imagen: string;
  orden: number;
};

type BlogVideo = {
  id: number;
  video_url: string;
  titulo: string | null;
  orden: number;
};

type Props = {
  post: BlogPost;
  imagenes: BlogImagen[];
  videos: BlogVideo[];
};

export default function BlogDetailClient({ post, imagenes, videos }: Props) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const allMedia = [
    ...imagenes.map((img) => ({
      type: "image" as const,
      url: img.url_imagen,
      titulo: null,
    })),
    ...videos.map((vid) => ({
      type: "video" as const,
      url: vid.video_url,
      titulo: vid.titulo,
    })),
  ];

  const currentMedia = allMedia[activeMediaIdx];
  const hasMultipleMedia = allMedia.length > 1;

  function prevMedia() {
    setActiveMediaIdx((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  }

  function nextMedia() {
    setActiveMediaIdx((i) => (i === allMedia.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="blog-detail">
      <div className="blog-detail-topbar">
        <Link href="/blog" className="blog-detail-back">
          <ArrowLeft size={18} />
          <span>Volver al blog</span>
        </Link>
      </div>

      <article className="blog-detail-article">
        <header className="blog-detail-header">
          <div className="blog-detail-date">
            <Calendar size={16} />
            <span>
              {new Date(post.fecha_publicacion).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h1 className="blog-detail-title">{post.titulo}</h1>
          <p className="blog-detail-description">{post.descripcion}</p>
        </header>

        {allMedia.length > 0 && (
          <div className="blog-detail-media-container">
            <div className="blog-detail-media-stage">
              {currentMedia && currentMedia.url ? (
                currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.url}
                    controls
                    className="blog-detail-video"
                    key={currentMedia.url}
                  />
                ) : (
                  <img
                    src={currentMedia.url}
                    alt={post.titulo}
                    className="blog-detail-image"
                  />
                )
              ) : (
                <div className="blog-detail-media-empty">
                  <ImageOff size={48} />
                  <span>Medio no disponible</span>
                </div>
              )}

              {hasMultipleMedia && (
                <>
                  <button
                    className="blog-detail-arrow blog-detail-arrow--left"
                    onClick={prevMedia}
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="blog-detail-arrow blog-detail-arrow--right"
                    onClick={nextMedia}
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleMedia && (
              <div className="blog-detail-thumbs">
                {allMedia.map((media, i) => (
                  <button
                    key={i}
                    className={`blog-detail-thumb${i === activeMediaIdx ? " blog-detail-thumb--active" : ""}`}
                    onClick={() => setActiveMediaIdx(i)}
                  >
                    {media.type === "video" ? (
                      <div className="blog-detail-thumb-video">
                        <video
                          src={media.url || ""}
                          muted
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div className="blog-detail-thumb-video-overlay">
                          <Play size={20} color="#fff" />
                        </div>
                      </div>
                    ) : media.url ? (
                      <img src={media.url} alt="" />
                    ) : (
                      <div className="blog-detail-thumb-empty">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: post.contenido }}
        />
      </article>

      <style jsx>{`
        .blog-detail {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        .blog-detail-topbar {
          margin-bottom: 32px;
        }

        .blog-detail-back {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid #e6dccf;
          background: #fff;
          color: #4d5b67;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .blog-detail-back:hover {
          border-color: #e05c2a;
          color: #e05c2a;
          transform: translateX(-4px);
        }

        .blog-detail-article {
          background: #fff;
          border-radius: 24px;
          padding: 48px;
          border: 1px solid #ece3d7;
          box-shadow: 0 20px 50px rgba(78, 52, 24, 0.08);
        }

        .blog-detail-header {
          margin-bottom: 40px;
        }

        .blog-detail-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #95877d;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .blog-detail-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 20px 0;
          color: #1f1a17;
        }

        .blog-detail-description {
          font-size: 1.15rem;
          color: #72675f;
          line-height: 1.7;
          margin: 0;
        }

        .blog-detail-media-container {
          margin: 40px 0;
        }

        .blog-detail-media-stage {
          position: relative;
          aspect-ratio: 16 / 10;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%);
          border: 1px solid #ece3d7;
        }

        .blog-detail-image,
        .blog-detail-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .blog-detail-media-empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #b4aaa3;
        }

        .blog-detail-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: all 0.2s ease;
        }

        .blog-detail-arrow:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.1);
        }

        .blog-detail-arrow--left {
          left: 16px;
        }

        .blog-detail-arrow--right {
          right: 16px;
        }

        .blog-detail-thumbs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .blog-detail-thumb {
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e8dfd3;
          background: #f9f6f2;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .blog-detail-thumb:hover {
          transform: scale(1.05);
          border-color: #d7c6b0;
        }

        .blog-detail-thumb--active {
          border-color: #e05c2a;
        }

        .blog-detail-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .blog-detail-thumb-video {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .blog-detail-thumb-video video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-detail-thumb-video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }

        .blog-detail-thumb-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4aaa3;
        }

        .blog-detail-content {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #1f1a17;
        }

        .blog-detail-content :global(h2) {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 40px 0 16px 0;
          color: #1f1a17;
        }

        .blog-detail-content :global(h3) {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 32px 0 12px 0;
          color: #1f1a17;
        }

        .blog-detail-content :global(p) {
          margin: 16px 0;
        }

        .blog-detail-content :global(ul),
        .blog-detail-content :global(ol) {
          margin: 16px 0;
          padding-left: 24px;
        }

        .blog-detail-content :global(li) {
          margin: 8px 0;
        }

        @media (max-width: 768px) {
          .blog-detail-article {
            padding: 32px 24px;
          }

          .blog-detail-thumbs {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}