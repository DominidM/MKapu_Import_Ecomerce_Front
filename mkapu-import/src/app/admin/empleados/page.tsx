"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PlusCircle,
  X,
  CheckCircle,
  Loader2,
  Users,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

type Empleado = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  activo: boolean;
  created_at: string;
};

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  activo: true,
};

export default function AdminEmpleadosPage() {
  const [rows, setRows] = useState<Empleado[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPass, setShowPass] = useState(false);

  // Scroll al contenedor del layout
  function scrollToTop() {
    const container = document.querySelector(".main-content");
    if (container) container.scrollTop = 0;
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("empleados")
      .select("*")
      .order("id", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setShowPass(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return alert("Nombre requerido");
    if (!form.email.trim()) return alert("Email requerido");
    if (!editId && !form.password.trim()) return alert("Contraseña requerida");

    const payload: Record<string, unknown> = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      activo: form.activo,
    };
    if (form.password.trim()) payload.password = form.password;

    const { error } = editId
      ? await supabase.from("empleados").update(payload).eq("id", editId)
      : await supabase
          .from("empleados")
          .insert({ ...payload, password: form.password });

    if (error) return alert(error.message);
    resetForm();
    load();
  }

  function onEdit(emp: Empleado) {
    setEditId(emp.id);
    setForm({
      nombre: emp.nombre,
      apellido: emp.apellido ?? "",
      email: emp.email,
      password: "",
      activo: emp.activo,
    });
    setShowPass(false);
    setShowForm(true);
    setTimeout(() => scrollToTop(), 50);
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar empleado?")) return;
    await supabase.from("empleados").delete().eq("id", id);
    load();
  }

  async function toggleActivo(emp: Empleado) {
    await supabase
      .from("empleados")
      .update({ activo: !emp.activo })
      .eq("id", emp.id);
    load();
  }

  return (
    <>
      <style>{`
        .ae-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: #fff;
          color: #1a1a1a;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ae-input:focus {
          border-color: #f5a623;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }
        .ae-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #999;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ae-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #f5a623;
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ae-btn-primary:hover { background: #e69510; }
        .ae-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #f0f0f0;
          color: #555;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ae-btn-secondary:hover { background: #e4e4e4; }
        .ae-row:hover { background: #fafafa !important; }
        .ae-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,123,255,0.07);
          color: #007bff;
          border: 1px solid rgba(0,123,255,0.2);
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ae-btn-edit:hover { background: rgba(0,123,255,0.15); }
        .ae-btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(220,53,69,0.07);
          color: #dc3545;
          border: 1px solid rgba(220,53,69,0.2);
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ae-btn-delete:hover { background: rgba(220,53,69,0.15); }
        .ae-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: opacity 0.15s;
        }
        .ae-badge:hover { opacity: 0.8; }
        @keyframes ae-spin { to { transform: rotate(360deg); } }
        .ae-spin { animation: ae-spin 0.8s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#1a1a1a",
              }}
            >
              Empleados
            </h1>
            <p
              style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#999" }}
            >
              {rows.length} empleado{rows.length !== 1 ? "s" : ""} registrado
              {rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            className="ae-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? (
              <>
                <X size={15} /> Cancelar
              </>
            ) : (
              <>
                <PlusCircle size={15} /> Nuevo empleado
              </>
            )}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderTop: "3px solid #f5a623",
              borderRadius: 12,
              padding: 24,
              marginBottom: 28,
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              {editId ? "Editar empleado" : "Nuevo empleado"}
            </h2>

            <form onSubmit={save}>
              {/* Nombre y Apellido */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label className="ae-label">Nombre *</label>
                  <input
                    className="ae-input"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="ae-label">Apellido</label>
                  <input
                    className="ae-input"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={(e) =>
                      setForm({ ...form, apellido: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email y Contraseña */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label className="ae-label">Email *</label>
                  <input
                    className="ae-input"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="ae-label">
                    {editId
                      ? "Nueva contraseña (vacío = no cambiar)"
                      : "Contraseña *"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="ae-input"
                      style={{ paddingRight: 44 }}
                      type={showPass ? "text" : "password"}
                      placeholder={
                        editId ? "Dejar vacío para no cambiar" : "Contraseña"
                      }
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required={!editId}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#aaa",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Activo */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#555",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) =>
                      setForm({ ...form, activo: e.target.checked })
                    }
                    style={{ width: 16, height: 16, accentColor: "#f5a623" }}
                  />
                  Empleado activo
                </label>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="ae-btn-primary">
                  {editId ? (
                    <>
                      <CheckCircle size={15} /> Guardar cambios
                    </>
                  ) : (
                    <>
                      <PlusCircle size={15} /> Crear empleado
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ae-btn-secondary"
                  onClick={resetForm}
                >
                  <X size={15} /> Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros y tabla — solo visibles cuando el form está cerrado */}
        {!showForm &&
          (loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "48px 0",
                color: "#aaa",
              }}
            >
              <Loader2 size={20} className="ae-spin" color="#f5a623" />
              <span style={{ fontSize: "0.9rem" }}>Cargando...</span>
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #e8e8e8",
                    }}
                  >
                    {["Nombre", "Email", "Estado", "Creado", "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#aaa",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ padding: 48, textAlign: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            color: "#ccc",
                          }}
                        >
                          <Users size={32} />
                          <span style={{ fontSize: "0.9rem" }}>
                            No hay empleados aún
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((emp, i) => (
                      <tr
                        key={emp.id}
                        className="ae-row"
                        style={{
                          borderBottom:
                            i < rows.length - 1 ? "1px solid #f0f0f0" : "none",
                          background: "#fff",
                        }}
                      >
                        {/* Nombre */}
                        <td
                          style={{
                            padding: "12px 16px",
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {emp.nombre} {emp.apellido}
                        </td>

                        {/* Email */}
                        <td style={{ padding: "12px 16px", color: "#555" }}>
                          {emp.email}
                        </td>

                        {/* Estado — clic para toggle */}
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            className="ae-badge"
                            onClick={() => toggleActivo(emp)}
                            title="Clic para cambiar estado"
                            style={{
                              background: emp.activo ? "#e8f7ee" : "#fde8e8",
                              color: emp.activo ? "#1a7a3c" : "#a71d2a",
                            }}
                          >
                            {emp.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>

                        {/* Fecha */}
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#aaa",
                            fontSize: "0.8rem",
                          }}
                        >
                          {new Date(emp.created_at).toLocaleDateString("es-PE")}
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="ae-btn-edit"
                              onClick={() => onEdit(emp)}
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              className="ae-btn-delete"
                              onClick={() => onDelete(emp.id)}
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </>
  );
}
