"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Seccion = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  orden: number;
  activo: boolean;
};

type SeccionImagen = {
  id: number;
  seccion_id: number;
  url_imagen: string;
  orden: number;
};

const initialForm = { titulo: "", descripcion: "", orden: 1, activo: true };

const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#888",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function AdminSobreNosotrosPage() {
  const [rows, setRows]                   = useState<Seccion[]>([]);
  const [form, setForm]                   = useState(initialForm);
  const [editId, setEditId]               = useState<number | null>(null);
  const [showForm, setShowForm]           = useState(false);
  const [loading, setLoading]             = useState(true);
  const [imagenes, setImagenes]           = useState<SeccionImagen[]>([]);
  const [imagenesMap, setImagenesMap]     = useState<Record<number, number>>({});
  const [uploadingImg, setUploadingImg]   = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const [{ data: secciones }, { data: imgs }] = await Promise.all([
      supabase.from("quienes_somos_secciones").select("*").order("orden"),
      supabase.from("quienes_somos_imagenes").select("seccion_id"),
    ]);
    setRows(secciones ?? []);

    // Mapa: { [seccion_id]: cantidad_imagenes }
    const mapa: Record<number, number> = {};
    for (const img of imgs ?? []) {
      mapa[img.seccion_id] = (mapa[img.seccion_id] ?? 0) + 1;
    }
    setImagenesMap(mapa);
    setLoading(false);
  }

  async function loadImagenes(seccionId: number) {
    const { data } = await supabase
      .from("quienes_somos_imagenes")
      .select("*")
      .eq("seccion_id", seccionId)
      .order("orden");
    setImagenes(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function uploadImagen(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `sobre-nosotros/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true });
    if (error) { alert("Error subiendo imagen: " + error.message); return null; }
    return supabase.storage.from("imagenes").getPublicUrl(path).data.publicUrl;
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editId) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    const baseOrden = imagenes.length;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImagen(files[i]);
      if (url) {
        await supabase.from("quienes_somos_imagenes").insert({
          seccion_id: editId,
          url_imagen: url,
          orden: baseOrden + i,
        });
      }
    }
    await loadImagenes(editId);
    setUploadingImg(false);
    if (imgRef.current) imgRef.current.value = "";
  }

  async function deleteImagen(id: number) {
    if (!confirm("¿Eliminar imagen?")) return;
    await supabase.from("quienes_somos_imagenes").delete().eq("id", id);
    if (editId) loadImagenes(editId);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      titulo: form.titulo || null,
      descripcion: form.descripcion || null,
      orden: form.orden,
      activo: form.activo,
    };

    if (editId) {
      const { error } = await supabase
        .from("quienes_somos_secciones")
        .update(payload)
        .eq("id", editId);
      if (error) return alert(error.message);
      cancelForm();
      load();
    } else {
      // Crear y quedar en modo edición para subir imágenes de inmediato
      const { data, error } = await supabase
        .from("quienes_somos_secciones")
        .insert(payload)
        .select()
        .single();
      if (error) return alert(error.message);
      await load();
      setEditId(data.id);
      setForm({
        titulo: data.titulo ?? "",
        descripcion: data.descripcion ?? "",
        orden: data.orden ?? 1,
        activo: data.activo ?? true,
      });
      setImagenes([]);
      setShowForm(true);
    }
  }

  function onEdit(s: Seccion) {
    setEditId(s.id);
    setForm({
      titulo: s.titulo ?? "",
      descripcion: s.descripcion ?? "",
      orden: s.orden ?? 1,
      activo: s.activo ?? true,
    });
    loadImagenes(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar esta sección? También se eliminarán sus imágenes.")) return;
    await supabase.from("quienes_somos_imagenes").delete().eq("seccion_id", id);
    await supabase.from("quienes_somos_secciones").delete().eq("id", id);
    load();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
    setImagenes([]);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
      <style>{`
        .fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}
        .rh:hover{background:#fafafa!important}
        .be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}
        .bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}
        .bp:hover{background:#e69510!important}
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Sobre Nosotros</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            {rows.length} sección{rows.length !== 1 ? "es" : ""} registrada{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="bp"
          onClick={() => { setShowForm(!showForm); if (showForm) cancelForm(); }}
          style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
        >
          {showForm ? "✕ Cancelar" : "+ Nueva sección"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "24px", marginBottom: "28px", borderTop: "3px solid #f5a623" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "#1a1a1a" }}>
            {editId ? "Editar sección" : "Nueva sección"}
          </h2>
          <form onSubmit={save}>

            {/* Fila 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>
                  Título{" "}
                  <span style={{ color: "#bbb", textTransform: "none", fontWeight: 400 }}>(opcional)</span>
                </label>
                <input
                  className="fi" style={inp} placeholder="Ej: Nuestra Historia"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div>
                <label style={lbl}>Orden</label>
                <input
                  className="fi" style={inp} type="number" min={1}
                  value={form.orden}
                  onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label style={lbl}>Estado</label>
                <select
                  className="fi" style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) => setForm({ ...form, activo: e.target.value === "true" })}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: "16px" }}>
              <label style={lbl}>
                Descripción / Texto{" "}
                <span style={{ color: "#bbb", textTransform: "none", fontWeight: 400 }}>(HTML permitido)</span>
              </label>
              <textarea
                className="fi"
                style={{ ...inp, minHeight: "140px", resize: "vertical" }}
                placeholder="<p>Escribe el contenido de esta sección...</p>"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
              <span style={{ fontSize: "0.75rem", color: "#bbb" }}>
                Puedes usar: &lt;strong&gt;, &lt;p&gt;, &lt;br&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </span>
            </div>

            {/* Imágenes — siempre visible, pero upload solo con editId */}
            <div style={{ background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div>
                  <label style={lbl}>Imágenes del carrusel</label>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#aaa" }}>
                    {editId ? "Se mostrarán en carrusel en la sección" : "Disponible después de crear la sección"}
                  </p>
                </div>
                {editId && (
                  <>
                    <button
                      type="button"
                      onClick={() => imgRef.current?.click()}
                      disabled={uploadingImg}
                      style={{ background: "#f0f0f0", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "5px 14px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, opacity: uploadingImg ? 0.6 : 1 }}
                    >
                      {uploadingImg ? "⏳ Subiendo..." : "📁 Subir imágenes"}
                    </button>
                    <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImgUpload} />
                  </>
                )}
              </div>

              {editId ? (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {imagenes.map((img) => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img
                        src={img.url_imagen} alt=""
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "8px", border: "1px solid #e0e0e0" }}
                      />
                      <button
                        type="button" onClick={() => deleteImagen(img.id)}
                        style={{ position: "absolute", top: -6, right: -6, background: "#dc3545", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {imagenes.length === 0 && (
                    <span style={{ fontSize: "0.8rem", color: "#bbb", padding: "8px 0" }}>Sin imágenes aún</span>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0" }}>
                  <div style={{ width: 80, height: 80, background: "#ececec", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.6rem", opacity: 0.35 }}>🖼️</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#bbb" }}>
                    Crea la sección primero y podrás<br />subir imágenes de inmediato.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit" className="bp"
                style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
              >
                {editId ? "Guardar cambios" : "Crear sección"}
              </button>
              <button
                type="button" onClick={cancelForm}
                style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla — oculta cuando formulario abierto */}
      {!showForm && (
        loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Cargando secciones...</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                  {["Título", "Descripción", "Orden", "Imágenes", "Estado", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                      No hay secciones aún
                    </td>
                  </tr>
                ) : (
                  rows.map((s, i) => {
                    const cantImg = imagenesMap[s.id] ?? 0;
                    return (
                      <tr key={s.id} className="rh" style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>
                          {s.titulo || <span style={{ color: "#ccc", fontWeight: 400 }}>Sin título</span>}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#666", maxWidth: 280 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {s.descripcion
                              ? s.descripcion.replace(/<[^>]*>/g, "").slice(0, 90) + (s.descripcion.length > 90 ? "..." : "")
                              : <span style={{ color: "#ccc" }}>—</span>}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#888", textAlign: "center" }}>{s.orden}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          {cantImg > 0 ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: "#eef4ff", color: "#2563eb" }}>
                              🖼️ {cantImg}
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, background: "#f5f5f5", color: "#bbb" }}>
                              Sin imágenes
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, background: s.activo ? "#e8f7ee" : "#fde8e8", color: s.activo ? "#1a7a3c" : "#a71d2a" }}>
                            {s.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="be" onClick={() => onEdit(s)}
                              style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                              Editar
                            </button>
                            <button className="bd" onClick={() => onDelete(s.id)}
                              style={{ background: "rgba(220,53,69,0.08)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #e8e8e8", background: "#fafafa", fontSize: "0.8rem", color: "#aaa" }}>
              {rows.length} sección{rows.length !== 1 ? "es" : ""} en total
            </div>
          </div>
        )
      )}
    </div>
  );
}