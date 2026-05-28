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

    </main>
  );
}
