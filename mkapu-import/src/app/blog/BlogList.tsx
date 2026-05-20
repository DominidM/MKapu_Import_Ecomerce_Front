"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type BlogPost = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  orden: number;
  imagen_principal: string | null;
};

type Props = {
  posts: BlogPost[];
  banner: BannerConfig | null;
};

export default function BlogList({ posts, banner }: Props) {
  const heroTitulo = banner?.titulo || "Nuestro Blog";
  const heroSub =
    banner?.subtitulo ||
    "Mantente al día con nuestras últimas noticias y novedades";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  return (
    <main className="bl-main">
      <section className="bl-hero">
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            className="bl-hero-bg"
          />
        )}
        <div className="bl-hero-overlay" />
        <div className="bl-hero-content">
          <span className="bl-hero-tag">Noticias y novedades</span>
          <h1 className="bl-hero-title">{heroTitulo}</h1>
          <p className="bl-hero-sub">{heroSub}</p>
        </div>
      </section>

      <div className="bl-container">
        {posts.length === 0 ? (
          <div className="bl-empty">No hay publicaciones aún.</div>
        ) : (
          <div className="bl-grid">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="bl-card"
              >
                <div className="bl-card-img">
                  {post.imagen_principal ? (
                    <Image
                      src={post.imagen_principal}
                      alt={post.titulo}
                      fill
                      className="bl-card-img-el"
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                  ) : (
                    <div className="bl-card-img-empty">Sin imagen</div>
                  )}
                </div>

                <div className="bl-card-body">
                  <div className="bl-card-date">
                    <Calendar size={14} />
                    <span>
                      {new Date(post.fecha_publicacion).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <h2 className="bl-card-title">{post.titulo}</h2>

                  <p className="bl-card-desc">{post.descripcion}</p>

                  <div className="bl-card-cta">
                    Leer más <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bl-main {
          background: #f8f7f4;
          min-height: 100vh;
        }

        /* ── HERO ── */
        .bl-hero {
          position: relative;
          width: 100%;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          overflow: hidden;
        }

        .bl-hero-bg {
          object-fit: cover;
          object-position: center;
        }

        .bl-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%);
          z-index: 1;
        }

        .bl-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 1.5rem 3.5rem;
          max-width: 680px;
        }

        .bl-hero-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #f5a623;
          margin-bottom: 0.75rem;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(245,166,35,0.3);
          border-radius: 999px;
          background: rgba(245,166,35,0.08);
        }

        .bl-hero-title {
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 1rem;
          line-height: 1.05;
        }

        .bl-hero-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.7);
          margin: 0 auto;
          line-height: 1.7;
          max-width: 520px;
        }

        /* ── CONTENEDOR ── */
        .bl-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 120px;
        }

        .bl-empty {
          text-align: center;
          padding: 80px 20px;
          font-size: 1rem;
          color: #aaa;
        }

        /* ── GRID ── */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }

        /* ── CARD ── */
        .bl-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #ece3d7;
          box-shadow: 0 10px 30px rgba(78,52,24,0.08);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .bl-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(224,92,42,0.15);
        }

        .bl-card-img {
          aspect-ratio: 16/10;
          overflow: hidden;
          position: relative;
          background: linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%);
        }

        .bl-card-img-el {
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .bl-card:hover .bl-card-img-el {
          transform: scale(1.05);
        }

        .bl-card-img-empty {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4aaa3;
          font-weight: 600;
        }

        .bl-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .bl-card-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #95877d;
          font-weight: 600;
        }

        .bl-card-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.3;
          color: #1f1a17;
        }

        .bl-card-desc {
          font-size: 0.95rem;
          color: #72675f;
          line-height: 1.6;
          margin: 0;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bl-card-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e05c2a;
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: auto;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .bl-container {
            padding: 60px 20px 80px;
          }

          .bl-grid {
            gap: 24px;
          }

          .bl-card-body {
            padding: 20px;
          }

          .bl-card-title {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 520px) {
          .bl-hero {
            min-height: 240px;
          }

          .bl-hero-content {
            padding: 3rem 1.25rem 2.5rem;
          }

          .bl-container {
            padding: 40px 14px 60px;
          }

          .bl-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </main>
  );
}
