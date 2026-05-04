"use client";

import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

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
};

export default function BlogList({ posts }: Props) {
  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1 className="blog-title">Nuestro Blog</h1>
        <p className="blog-subtitle">
          Mantente al día con nuestras últimas noticias y novedades
        </p>
      </header>

      <div className="blog-grid">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="blog-card">
            <div className="blog-card-image">
              {post.imagen_principal ? (
                <img src={post.imagen_principal} alt={post.titulo} />
              ) : (
                <div className="blog-card-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>

            <div className="blog-card-content">
              <div className="blog-card-date">
                <Calendar size={14} />
                <span>
                  {new Date(post.fecha_publicacion).toLocaleDateString(
                    "es-ES",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>

              <h2 className="blog-card-title">{post.titulo}</h2>
              <p className="blog-card-description">{post.descripcion}</p>

              <div className="blog-card-link">
                Leer más <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .blog-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .blog-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .blog-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #e05c2a 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .blog-subtitle {
          font-size: 1.1rem;
          color: #72675f;
          margin: 0;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }

        .blog-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #ece3d7;
          box-shadow: 0 10px 30px rgba(78, 52, 24, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(224, 92, 42, 0.15);
        }

        .blog-card-image {
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: linear-gradient(135deg, #fff7ef 0%, #f2ece5 100%);
        }

        .blog-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .blog-card:hover .blog-card-image img {
          transform: scale(1.08);
        }

        .blog-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #b4aaa3;
          font-weight: 600;
        }

        .blog-card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .blog-card-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #95877d;
          font-weight: 600;
        }

        .blog-card-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.3;
          color: #1f1a17;
        }

        .blog-card-description {
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

        .blog-card-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e05c2a;
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-header {
            margin-bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
}