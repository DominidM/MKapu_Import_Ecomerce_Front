"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, X } from "lucide-react";

type Promocion = {
  id: number;
  producto_id: number;
  producto_nombre?: string;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  created_at: string;
};

type ProductoSimple = {
  id: number;
  code: string;
  name: string;
  agotado: boolean;
};

const initialForm: {
  producto_id: number;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
} = {
  producto_id: 0,
  tipo_descuento: "porcentaje",
  valor_descuento: 0,
  fecha_inicio: "",
  fecha_fin: "",
  activo: true,
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#444",
  marginBottom: "0.4rem",
};

export default function AdminPromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [productos, setProductos] = useState<ProductoSimple[]>([]);
  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [agotadoSearch, setAgotadoSearch] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPromociones() {
    setLoading(true);
    const { data } = await supabase
      .from("promociones")
      .select("*, productos(name)")
      .order("id", { ascending: false });

    const mapped = (data ?? []).map((p: any) => ({
      ...p,
      producto_nombre: p.productos?.name ?? "Producto eliminado",
      productos: undefined,
    }));
    setPromociones(mapped);
    setLoading(false);
  }

  async function loadProductos() {
    const { data } = await supabase
      .from("productos")
      .select("id, code, name, agotado")
      .order("code");

    setProductos(data ?? []);
  }

  useEffect(() => {
    loadPromociones();
    loadProductos();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.producto_id) return alert("Selecciona un producto");
    if (!form.valor_descuento || form.valor_descuento <= 0)
      return alert("Valor de descuento inválido");

    if (form.tipo_descuento === "porcentaje" && form.valor_descuento > 100)
      return alert("El porcentaje no puede ser mayor a 100");

    const payload: Record<string, any> = {
      producto_id: form.producto_id,
      tipo_descuento: form.tipo_descuento,
      valor_descuento: form.valor_descuento,
      activo: form.activo,
    };

    if (form.fecha_inicio) payload.fecha_inicio = form.fecha_inicio;
    if (form.fecha_fin) payload.fecha_fin = form.fecha_fin;

    setSaving(true);
    const { error } = editId
      ? await supabase.from("promociones").update(payload).eq("id", editId)
      : await supabase.from("promociones").insert(payload);
    setSaving(false);

    if (error) return alert(error.message);
    cancelForm();
    loadPromociones();
  }

  function onEdit(p: Promocion) {
    setEditId(p.id);
    setForm({
      producto_id: p.producto_id,
      tipo_descuento: p.tipo_descuento,
      valor_descuento: p.valor_descuento,
      fecha_inicio: p.fecha_inicio?.slice(0, 16) ?? "",
      fecha_fin: p.fecha_fin?.slice(0, 16) ?? "",
      activo: p.activo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    const { error } = await supabase.from("promociones").delete().eq("id", id);
    if (error) return alert(error.message);
    loadPromociones();
  }

  async function toggleActivo(p: Promocion) {
    await supabase
      .from("promociones")
      .update({ activo: !p.activo })
      .eq("id", p.id);
    loadPromociones();
  }

  async function toggleAgotado(producto: ProductoSimple) {
    await supabase
      .from("productos")
      .update({ agotado: !producto.agotado })
      .eq("id", producto.id);
    loadProductos();
  }

  function cancelForm() {
    setEditId(null);
    setForm(initialForm);
    setShowForm(false);
  }

  function onFocusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "#f5a623";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
  }

  function onBlurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = "#ddd";
    e.currentTarget.style.boxShadow = "none";
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatValor(p: Promocion) {
    if (p.tipo_descuento === "porcentaje")
      return `${p.valor_descuento}%`;
    return `S/ ${p.valor_descuento.toFixed(2)}`;
  }

  const filteredPromos = promociones.filter(
    (p) =>
      (p.producto_nombre ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.tipo_descuento.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredProductos = productos.filter(
    (p) =>
      p.code.toLowerCase().includes(agotadoSearch.toLowerCase()),
  );

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Promociones
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            {promociones.length} promoción
            {promociones.length !== 1 ? "es" : ""} registrada
            {promociones.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) cancelForm();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f5a623",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.65rem 1.1rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#d4891a")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f5a623")}
        >
          {showForm ? "✕ Cancelar" : "+ Nueva promoción"}
        </button>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            borderTop: "3px solid #f5a623",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.25rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            {editId ? "Editar promoción" : "Nueva promoción"}
          </h2>

          <form onSubmit={save}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>Producto *</label>
                <select
                  style={inp}
                  value={form.producto_id || ""}
                  onChange={(e) =>
                    setForm({ ...form, producto_id: Number(e.target.value) })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}{p.agotado ? " (agotado)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Tipo descuento</label>
                <select
                  style={inp}
                  value={form.tipo_descuento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo_descuento: e.target.value as "porcentaje" | "monto_fijo",
                    })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto_fijo">Monto fijo (S/)</option>
                </select>
              </div>

              <div>
                <label style={lbl}>
                  Valor{" "}
                  <span style={{ color: "#bbb", fontWeight: 400 }}>
                    ({form.tipo_descuento === "porcentaje" ? "%" : "S/"})
                  </span>
                </label>
                <input
                  style={inp}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.valor_descuento || ""}
                  onChange={(e) =>
                    setForm({ ...form, valor_descuento: Number(e.target.value) })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label style={lbl}>
                  Fecha inicio{" "}
                  <span style={{ color: "#bbb", fontWeight: 400 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  style={inp}
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) =>
                    setForm({ ...form, fecha_inicio: e.target.value })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>
                  Fecha fin{" "}
                  <span style={{ color: "#bbb", fontWeight: 400 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  style={inp}
                  type="datetime-local"
                  value={form.fecha_fin}
                  onChange={(e) =>
                    setForm({ ...form, fecha_fin: e.target.value })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={lbl}>Estado</label>
                <select
                  style={inp}
                  value={form.activo ? "true" : "false"}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.value === "true" })
                  }
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#f5a623",
                  color: "#fff",
                  border: "none",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#d4891a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f5a623")
                }
              >
                {saving
                  ? "Guardando..."
                  : editId
                    ? "Guardar cambios"
                    : "Crear promoción"}
              </button>

              <button
                type="button"
                onClick={cancelForm}
                style={{
                  padding: "0.65rem 1.2rem",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fff",
                  color: "#555",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Agotado section ── */}
      {!showForm && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            borderTop: "3px solid #dc2626",
          }}
        >
          <h2
            style={{
              margin: "0 0 1rem",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#dc2626",
                color: "#fff",
                fontSize: "0.75rem",
                fontWeight: 800,
              }}
            >
              !
            </span>
            Marcar productos como agotados
          </h2>

          <div style={{ marginBottom: "1rem", maxWidth: 380 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ccc",
                  pointerEvents: "none",
                }}
              />
              <input
                style={{ ...inp, paddingLeft: "36px" }}
                placeholder="Buscar por código..."
                value={agotadoSearch}
                onChange={(e) => setAgotadoSearch(e.target.value)}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </div>
          </div>

          <div
            style={{
              maxHeight: "320px",
              overflowY: "auto",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#fafafa",
                    borderBottom: "1px solid #e8e8e8",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <th
                    style={{
                      padding: "0.7rem 1rem",
                      textAlign: "left",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Código
                  </th>
                  <th
                    style={{
                      padding: "0.7rem 1rem",
                      textAlign: "left",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Producto
                  </th>
                  <th
                    style={{
                      padding: "0.7rem 1rem",
                      textAlign: "center",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 140,
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: "0.7rem 1rem",
                      textAlign: "center",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: 100,
                    }}
                  >
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "#aaa",
                      }}
                    >
                      {agotadoSearch
                        ? "Sin resultados"
                        : "No hay productos registrados"}
                    </td>
                  </tr>
                ) : (
                  filteredProductos.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom:
                          i < filteredProductos.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                        background: p.agotado ? "#fef2f2" : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.7rem 1rem",
                          fontWeight: 600,
                          color: "#666",
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {p.code}
                      </td>

                      <td
                        style={{
                          padding: "0.7rem 1rem",
                          fontWeight: 600,
                          color: "#1a1a1a",
                          fontSize: "0.875rem",
                        }}
                      >
                        {p.name}
                      </td>

                      <td style={{ padding: "0.7rem 1rem", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 12px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            background: p.agotado
                              ? "rgba(220,38,38,0.1)"
                              : "rgba(34,197,94,0.1)",
                            color: p.agotado ? "#dc2626" : "#16a34a",
                          }}
                        >
                          {p.agotado ? "Agotado" : "Disponible"}
                        </span>
                      </td>

                      <td style={{ padding: "0.7rem 1rem", textAlign: "center" }}>
                        <button
                          onClick={() => toggleAgotado(p)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            border: "1px solid",
                            borderColor: p.agotado ? "#16a34a" : "#dc2626",
                            background: p.agotado ? "rgba(34,197,94,0.08)" : "rgba(220,53,69,0.08)",
                            color: p.agotado ? "#16a34a" : "#dc2626",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            transition: "all 0.2s",
                          }}
                        >
                          {p.agotado ? "Marcar disponible" : "Marcar agotado"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      {!showForm && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <input
              style={{ ...inp, maxWidth: 380 }}
              placeholder="Buscar promoción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
            />
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#aaa",
              }}
            >
              Cargando promociones...
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e8e8e8",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    {["Producto", "Descuento", "Vigencia", "Estado", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "0.85rem 1rem",
                            textAlign: "left",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#888",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredPromos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "3rem",
                          textAlign: "center",
                          color: "#aaa",
                        }}
                      >
                        {search
                          ? "Sin resultados"
                          : "No hay promociones aún"}
                      </td>
                    </tr>
                  ) : (
                    filteredPromos.map((p, i) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom:
                            i < filteredPromos.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.9rem 1rem",
                            fontWeight: 600,
                            color: "#1a1a1a",
                            fontSize: "0.9rem",
                          }}
                        >
                          {productos.find(pr => pr.id === p.producto_id)?.code ? (
                            <><span style={{ color: "#888", fontFamily: "monospace", fontSize: "0.8rem" }}>
                              [{productos.find(pr => pr.id === p.producto_id)!.code}]
                            </span> {p.producto_nombre}</>
                          ) : p.producto_nombre}
                        </td>

                        <td style={{ padding: "0.9rem 1rem" }}>
                          <span
                            style={{
                              background: "#fff8e6",
                              color: "#b07800",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {formatValor(p)}
                          </span>
                        </td>

                        <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#666" }}>
                          {p.fecha_inicio || p.fecha_fin
                            ? `${formatDate(p.fecha_inicio)} → ${formatDate(p.fecha_fin)}`
                            : "Sin fecha"}
                        </td>

                        <td style={{ padding: "0.9rem 1rem" }}>
                          <button
                            onClick={() => toggleActivo(p)}
                            title="Click para cambiar estado"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 12px",
                              borderRadius: "999px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                              background: p.activo
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(239,68,68,0.1)",
                              color: p.activo ? "#16a34a" : "#dc2626",
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            {p.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>

                        <td style={{ padding: "0.9rem 1rem" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => onEdit(p)}
                              style={{
                                background: "rgba(0,123,255,0.08)",
                                color: "#007bff",
                                border: "1px solid rgba(0,123,255,0.2)",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(0,123,255,0.1)";
                                e.currentTarget.style.color = "#0056b3";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(0,123,255,0.08)";
                                e.currentTarget.style.color = "#007bff";
                              }}
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => onDelete(p.id)}
                              style={{
                                background: "rgba(220,53,69,0.08)",
                                color: "#dc3545",
                                border: "1px solid rgba(220,53,69,0.2)",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(220,53,69,0.1)";
                                e.currentTarget.style.color = "#a71d2a";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(220,53,69,0.08)";
                                e.currentTarget.style.color = "#dc3545";
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e8e8e8",
                  background: "#fafafa",
                  fontSize: "0.8rem",
                  color: "#aaa",
                }}
              >
                {filteredPromos.length} de {promociones.length} promoción
                {promociones.length !== 1 ? "es" : ""}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
