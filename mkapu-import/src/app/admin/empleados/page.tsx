"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  nombre: "", apellido: "", email: "", password: "", activo: true,
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0",
  borderRadius: "8px", fontSize: "0.875rem", background: "#fff",
  color: "#1a1a1a", outline: "none", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#888",
  marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em",
};

export default function AdminEmpleadosPage() {
  const [rows, setRows] = useState<Empleado[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPass, setShowPass] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("empleados")
      .select("*")
      .order("id", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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

    // Solo actualizar password si se escribió algo al editar
    if (form.password.trim()) payload.password = form.password;

    const { error } = editId
      ? await supabase.from("empleados").update(payload).eq("id", editId)
      : await supabase.from("empleados").insert({ ...payload, password: form.password });

    if (error) return alert(error.message);
    setForm(initialForm); setEditId(null); setShowForm(false); load();
  }

  function onEdit(emp: Empleado) {
    setEditId(emp.id);
    setForm({
      nombre: emp.nombre, apellido: emp.apellido ?? "",
      email: emp.email, password: "", activo: emp.activo,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id: number) {
    if (!confirm("¿Eliminar empleado?")) return;
    await supabase.from("empleados").delete().eq("id", id);
    load();
  }

  async function toggleActivo(emp: Empleado) {
    await supabase.from("empleados").update({ activo: !emp.activo }).eq("id", emp.id);
    load();
  }

  function cancelForm() {
    setEditId(null); setForm(initialForm); setShowForm(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
      <style>{`.fi:focus{border-color:#f5a623!important;box-shadow:0 0 0 3px rgba(245,166,35,0.12)}.rh:hover{background:#fafafa!important}.be:hover{background:rgba(0,123,255,0.1)!important;color:#0056b3!important}.bd:hover{background:rgba(220,53,69,0.1)!important;color:#a71d2a!important}.bp:hover{background:#e69510!important}`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a" }}>Empleados</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#888" }}>
            {rows.length} empleado{rows.length !== 1 ? "s" : ""} registrado{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="bp" onClick={() => { setShowForm(!showForm); if (showForm) cancelForm(); }}
          style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
          {showForm ? "✕ Cancelar" : "+ Nuevo empleado"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "24px", marginBottom: "28px", borderTop: "3px solid #f5a623" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700 }}>{editId ? "Editar empleado" : "Nuevo empleado"}</h2>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Nombre *</label>
                <input className="fi" style={inp} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Apellido</label>
                <input className="fi" style={inp} value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={lbl}>Email *</label>
                <input className="fi" style={inp} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>{editId ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}</label>
                <div style={{ position: "relative" }}>
                  <input className="fi" style={{ ...inp, paddingRight: "44px" }}
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editId}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "0.8rem" }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", color: "#444" }}>
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#f5a623" }} />
                Empleado activo
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="bp"
                style={{ background: "#f5a623", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                {editId ? "Guardar cambios" : "Crear empleado"}
              </button>
              <button type="button" onClick={cancelForm}
                style={{ background: "#f0f0f0", color: "#555", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>Cargando...</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                {["ID", "Nombre", "Email", "Estado", "Creado", "Acciones"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No hay empleados aún</td></tr>
              ) : rows.map((emp, i) => (
                <tr key={emp.id} className="rh" style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f0f0" : "none", background: "#fff" }}>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontWeight: 600 }}>#{emp.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a1a" }}>
                    {emp.nombre} {emp.apellido}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{emp.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => toggleActivo(emp)} style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", border: "none",
                      background: emp.activo ? "#e8f7ee" : "#fde8e8",
                      color: emp.activo ? "#1a7a3c" : "#a71d2a",
                    }}>
                      {emp.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#888", fontSize: "0.8rem" }}>
                    {new Date(emp.created_at).toLocaleDateString("es-PE")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="be" onClick={() => onEdit(emp)}
                        style={{ background: "rgba(0,123,255,0.08)", color: "#007bff", border: "1px solid rgba(0,123,255,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                        Editar
                      </button>
                      <button className="bd" onClick={() => onDelete(emp.id)}
                        style={{ background: "rgba(220,53,69,0.08)", color: "#dc3545", border: "1px solid rgba(220,53,69,0.2)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}