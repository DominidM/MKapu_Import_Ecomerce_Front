"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

type Seccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  activo: boolean;
};

export default function AdminSobreNosotrosPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSecciones() {
    const { data } = await supabase
      .from("quienes_somos_secciones")
      .select("*")
      .order("orden");
    setSecciones(data || []);
    setLoading(false);
  }

  async function toggleActivo(id: number, activo: boolean) {
    await supabase
      .from("quienes_somos_secciones")
      .update({ activo: !activo })
      .eq("id", id);
    loadSecciones();
  }

  async function deleteSeccion(id: number) {
    if (!confirm("¿Eliminar esta sección?")) return;
    await supabase.from("quienes_somos_secciones").delete().eq("id", id);
    loadSecciones();
  }

  useEffect(() => {
    loadSecciones();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sobre Nosotros</h1>
          <p className="page-subtitle">
            Gestiona las secciones de la página "Quiénes Somos"
          </p>
        </div>
        <Link
          href="/admin/sobre-nosotros/nueva"
          className="btn-primary"
        >
          <Plus size={18} />
          Nueva Sección
        </Link>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : secciones.length === 0 ? (
        <div className="empty-state">
          <p>No hay secciones creadas</p>
          <Link href="/admin/sobre-nosotros/nueva" className="btn-primary">
            Crear primera sección
          </Link>
        </div>
      ) : (
        <div className="list">
          {secciones.map((sec) => (
            <div key={sec.id} className="list-item">
              <div className="item-order">#{sec.orden}</div>
              <div className="item-info">
                <div className="item-title">
                  {sec.titulo || "(Sin título)"}
                </div>
                <div className="item-desc">
                  {sec.descripcion
                    ? sec.descripcion.replace(/<[^>]*>/g, "").slice(0, 120) + "..."
                    : "Sin descripción"}
                </div>
              </div>
              <div className="item-actions">
                <span
                  className={`badge ${sec.activo ? "badge--active" : "badge--inactive"}`}
                >
                  {sec.activo ? "Activo" : "Inactivo"}
                </span>
                <button
                  className="btn-icon"
                  onClick={() => toggleActivo(sec.id, sec.activo)}
                  title={sec.activo ? "Desactivar" : "Activar"}
                >
                  {sec.activo ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <Link
                  href={`/admin/sobre-nosotros/${sec.id}/editar`}
                  className="btn-icon"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  className="btn-icon btn-icon--danger"
                  onClick={() => deleteSeccion(sec.id)}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 2rem; font-weight: 900; margin: 0 0 6px 0; color: #1a1a1a; }
        .page-subtitle { font-size: 0.95rem; color: #888; margin: 0; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: linear-gradient(135deg, #e05c2a 0%, #f59e0b 100%); color: #fff; font-weight: 700; border-radius: 10px; text-decoration: none; border: none; cursor: pointer; font-size: 0.9rem; transition: all 0.2s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(224, 92, 42, 0.3); }
        .loading { text-align: center; padding: 60px; color: #888; }
        .empty-state { background: #fff; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 60px; text-align: center; color: #888; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .empty-state p { margin: 0; font-size: 1.1rem; }
        .list { display: flex; flex-direction: column; gap: 12px; }
        .list-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; transition: box-shadow 0.2s ease; }
        .list-item:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); }
        .item-order { font-size: 1.2rem; font-weight: 900; color: #d1d5db; width: 36px; text-align: center; flex-shrink: 0; }
        .item-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .item-title { font-size: 1.05rem; font-weight: 700; color: #1a1a1a; }
        .item-desc { font-size: 0.88rem; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .item-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .badge { padding: 4px 12px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }
        .badge--active { background: #d1fae5; color: #065f46; }
        .badge--inactive { background: #f3f4f6; color: #6b7280; }
        .btn-icon { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; text-decoration: none; transition: all 0.2s ease; flex-shrink: 0; }
        .btn-icon:hover { background: #f9fafb; color: #1f2937; }
        .btn-icon--danger:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
      `}</style>
    </div>
  );
}