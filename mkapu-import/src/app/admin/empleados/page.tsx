"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { UserPlus, Pencil, Trash2, X, Check, Eye, EyeOff } from "lucide-react";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  created_at: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  activo: boolean;
}

const FORM_INICIAL: FormData = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  activo: true,
};

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  async function fetchEmpleados() {
    setLoading(true);
    const { data } = await supabase
      .from("empleados")
      .select("id, nombre, apellido, email, activo, created_at")
      .order("created_at", { ascending: false });
    setEmpleados(data ?? []);
    setLoading(false);
  }

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setError("");
    setShowPassword(false);
    setModalOpen(true);
  }

  function abrirEditar(emp: Empleado) {
    setEditando(emp);
    setForm({
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      password: "", // vacío — solo se cambia si escribe algo
      activo: emp.activo,
    });
    setError("");
    setShowPassword(false);
    setModalOpen(true);
  }

  async function guardar() {
    setError("");
    if (!form.nombre || !form.email) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!editando && !form.password) {
      setError("La contraseña es obligatoria al crear un empleado.");
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        // Actualizar
        const updates: Partial<Empleado & { password: string }> = {
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          activo: form.activo,
        };

        // Solo hashear y actualizar password si escribió uno nuevo
        if (form.password.trim()) {
          updates.password = await bcrypt.hash(form.password, 10);
        }

        const { error: err } = await supabase
          .from("empleados")
          .update(updates)
          .eq("id", editando.id);

        if (err) throw err;
      } else {
        // Crear nuevo
        const hash = await bcrypt.hash(form.password, 10);
        const { error: err } = await supabase.from("empleados").insert({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: hash,
          activo: form.activo,
        });

        if (err) throw err;
      }

      setModalOpen(false);
      fetchEmpleados();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al guardar.";
      setError(msg);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    await supabase.from("empleados").delete().eq("id", id);
    setConfirmDelete(null);
    fetchEmpleados();
  }

  async function toggleActivo(emp: Empleado) {
    await supabase
      .from("empleados")
      .update({ activo: !emp.activo })
      .eq("id", emp.id);
    fetchEmpleados();
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
            }}
          >
            Empleados
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#888",
              margin: "0.25rem 0 0",
            }}
          >
            Gestiona los accesos al panel de administración
          </p>
        </div>
        <button
          onClick={abrirCrear}
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
          <UserPlus size={16} />
          Nuevo empleado
        </button>
      </div>

      {/* Tabla */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
            Cargando empleados...
          </div>
        ) : empleados.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
            No hay empleados registrados.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
              {empleados.map((emp, i) => (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom:
                      i < empleados.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                        fontSize: "0.9rem",
                      }}
                    >
                      {emp.nombre} {emp.apellido}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      color: "#555",
                      fontSize: "0.875rem",
                    }}
                  >
                    {emp.email}
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <button
                      onClick={() => toggleActivo(emp)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: emp.activo
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: emp.activo ? "#16a34a" : "#dc2626",
                        transition: "all 0.2s",
                      }}
                    >
                      {emp.activo ? <Check size={12} /> : <X size={12} />}
                      {emp.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td
                    style={{
                      padding: "0.9rem 1rem",
                      color: "#aaa",
                      fontSize: "0.8rem",
                    }}
                  >
                    {new Date(emp.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => abrirEditar(emp)}
                        title="Editar"
                        style={{
                          background: "rgba(245,166,35,0.1)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px",
                          cursor: "pointer",
                          color: "#f5a623",
                          display: "flex",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(245,166,35,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(245,166,35,0.1)")
                        }
                      >
                        <Pencil size={15} />
                      </button>
                      {confirmDelete === emp.id ? (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => eliminar(emp.id)}
                            style={{
                              background: "rgba(220,38,38,0.1)",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 10px",
                              cursor: "pointer",
                              color: "#dc2626",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{
                              background: "#f0f0f0",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px",
                              cursor: "pointer",
                              color: "#555",
                              display: "flex",
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(emp.id)}
                          title="Eliminar"
                          style={{
                            background: "rgba(220,38,38,0.08)",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px",
                            cursor: "pointer",
                            color: "#dc2626",
                            display: "flex",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(220,38,38,0.18)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(220,38,38,0.08)")
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                {editando ? "Editar empleado" : "Nuevo empleado"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#aaa",
                  display: "flex",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
              {error && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    padding: "0.7rem 1rem",
                    fontSize: "0.85rem",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {[
                  { label: "Nombre *", key: "nombre", placeholder: "Juan" },
                  { label: "Apellido", key: "apellido", placeholder: "Pérez" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      value={form[key as keyof FormData] as string}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      placeholder={placeholder}
                      style={inputStyle}
                      onFocus={onFocusInput}
                      onBlur={onBlurInput}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="empleado@correo.com"
                  style={inputStyle}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Contraseña {editando ? "(dejar vacío para no cambiar)" : "*"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    onFocus={onFocusInput}
                    onBlur={onBlurInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#aaa",
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.checked })
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "#f5a623",
                  }}
                />
                <label
                  htmlFor="activo"
                  style={{
                    fontSize: "0.875rem",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  Empleado activo
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                padding: "1rem 1.5rem",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <button
                onClick={() => setModalOpen(false)}
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
              <button
                onClick={guardar}
                disabled={guardando}
                style={{
                  padding: "0.65rem 1.4rem",
                  borderRadius: "8px",
                  border: "none",
                  background: guardando ? "#e0b97a" : "#f5a623",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: guardando ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {guardando
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Crear empleado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos reutilizables
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#444",
  marginBottom: "0.4rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function onFocusInput(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#f5a623";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,166,35,0.1)";
}

function onBlurInput(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "#ddd";
  e.currentTarget.style.boxShadow = "none";
}
