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
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          overflow: "hidden",
        }}
      >
        {heroImg && (
          <Image
            src={heroImg}
            alt={heroTitulo}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "3.5rem 1.5rem 3rem",
            maxWidth: "680px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#f5a623",
              marginBottom: "0.75rem",
            }}
          >
            Noticias y novedades
          </p>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            {heroTitulo}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.75)",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {heroSub}
          </p>
        </div>
      </section>

      {/* ── GRID ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 20px 100px",
        }}
      >
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>
            No hay publicaciones aún.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "32px",
            }}
          >
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid #ece3d7",
                  boxShadow: "0 10px 30px rgba(78,52,24,0.08)",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-8px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 20px 40px rgba(224,92,42,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 10px 30px rgba(78,52,24,0.08)";
                }}
              >
                {/* Imagen */}
                <div
                  style={{
                    aspectRatio: "16/10",
                    overflow: "hidden",
                    position: "relative",
                    background:
                      "linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%)",
                  }}
                >
                  {post.imagen_principal ? (
                    <Image
                      src={post.imagen_principal}
                      alt={post.titulo}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 380px"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#b4aaa3",
                        fontWeight: 600,
                      }}
                    >
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.85rem",
                      color: "#95877d",
                      fontWeight: 600,
                    }}
                  >
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

                  <h2
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      margin: 0,
                      lineHeight: 1.3,
                      color: "#1f1a17",
                    }}
                  >
                    {post.titulo}
                  </h2>

                  <p
                    style={
                      {
                        fontSize: "0.95rem",
                        color: "#72675f",
                        lineHeight: 1.6,
                        margin: 0,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      } as React.CSSProperties
                    }
                  >
                    {post.descripcion}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#e05c2a",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      marginTop: "auto",
                    }}
                  >
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
