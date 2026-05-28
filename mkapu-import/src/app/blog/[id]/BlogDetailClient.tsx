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

    </div>
  );
}