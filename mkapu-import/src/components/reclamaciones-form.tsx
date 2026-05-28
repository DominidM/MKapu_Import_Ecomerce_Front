"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type FormState = {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo: string;
  fecha_consumo: string;
  producto: string;
  monto: string;
  descripcion: string;
  pedido: string;
};

const INITIAL: FormState = {
  nombres: "",
  apellidos: "",
  dni: "",
  email: "",
  telefono: "",
  direccion: "",
  tipo: "queja",
  fecha_consumo: "",
  producto: "",
  monto: "",
  descripcion: "",
  pedido: "",
};

export default function ReclamacionesForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      if (
        !form.nombres || !form.apellidos || !form.dni || !form.email ||
        !form.telefono || !form.direccion || !form.descripcion || !form.pedido
      ) {
        setStatus("error");
        setErrorMsg("Por favor completa todos los campos requeridos.");
        return;
      }

      const { data, error } = await supabase
        .from("reclamaciones")
        .insert([
          {
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            dni: form.dni.trim(),
            email: form.email.trim(),
            telefono: form.telefono.trim(),
            direccion: form.direccion.trim(),
            tipo: form.tipo,
            fecha_consumo: form.fecha_consumo || null,
            producto: form.producto.trim() || null,
            monto: form.monto ? Number(form.monto) : null,
            descripcion: form.descripcion.trim(),
            pedido: form.pedido.trim(),
          },
        ])
        .select();

      if (error) {
        setStatus("error");
        setErrorMsg(error.message);
        return;
      }

      const ticket = data?.[0]?.ticket;

      try {
        const emailRes = await fetch("/api/notificar-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombres: form.nombres,
            apellidos: form.apellidos,
            email: form.email,
            tipo: form.tipo,
            ticket: ticket || "0000",
            dni: form.dni,
            direccion: form.direccion,
            telefono: form.telefono,
            producto: form.producto,
            monto: form.monto,
            descripcion: form.descripcion,
            pedido: form.pedido
          }),
        });

      } catch (err) {
        console.error("❌ Falló la petición a la API:", err);
      }

      setStatus("success");
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      setErrorMsg("Ocurrió un error inesperado.");
    }
  };

  if (status === "success") {
    return (
      <div className="rw-success">
        <div className="rw-success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2>Reclamación enviada</h2>
        <p>
          Hemos registrado tu <strong>{form.tipo}</strong>. Te enviaremos un correo de confirmación a{" "}
          <strong>{form.email}</strong>.
        </p>
        <span className="rw-badge">Respuesta en hasta 30 días hábiles</span>
        <button onClick={() => { setStatus("idle"); setForm(INITIAL); }} className="rw-reset">
          Enviar otra reclamación
        </button>
      </div>
    );
  }

  return (
    <div className="rw">
      <div className="rw-header">
        <div className="rw-eyebrow">mkapu import</div>
        <h1 className="rw-title">Libro de Reclamaciones</h1>
        <p className="rw-subtitle">
          Completa el formulario y nos comunicaremos dentro de los plazos establecidos por la norma peruana.
        </p>
      </div>

      {status === "error" && (
        <div className="rw-error">
          ⚠ {errorMsg || "Ocurrió un error. Intenta nuevamente."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rw-form">

        {/* Datos personales */}
        <div className="rw-section">
          <div className="rw-section-label">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
            </svg>
            Datos personales
          </div>
          <div className="rw-grid">
            <div className="rw-field">
              <label htmlFor="nombres" className="rw-label">Nombres <span className="rw-req">*</span></label>
              <input id="nombres" name="nombres" type="text" value={form.nombres} onChange={handleChange} required placeholder="Tus nombres" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="apellidos" className="rw-label">Apellidos <span className="rw-req">*</span></label>
              <input id="apellidos" name="apellidos" type="text" value={form.apellidos} onChange={handleChange} required placeholder="Tus apellidos" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="dni" className="rw-label">DNI <span className="rw-req">*</span></label>
              <input id="dni" name="dni" type="text" value={form.dni} onChange={handleChange} required placeholder="12345678" maxLength={8} className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="email" className="rw-label">Email <span className="rw-req">*</span></label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="telefono" className="rw-label">Teléfono <span className="rw-req">*</span></label>
              <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} required placeholder="+51 999 999 999" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="direccion" className="rw-label">Dirección <span className="rw-req">*</span></label>
              <input id="direccion" name="direccion" type="text" value={form.direccion} onChange={handleChange} required placeholder="Tu dirección" className="rw-input" />
            </div>
          </div>
        </div>

        {/* Tipo de reclamación */}
        <div className="rw-section">
          <div className="rw-section-label">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 2v8h12V4H2zm2 2h8v1H4V6zm0 2h5v1H4V8z" />
            </svg>
            Tipo de reclamación
          </div>
          <div className="rw-tipo-group">
            {[
              { value: "queja", label: "Queja", desc: "Mala atención o servicio" },
              { value: "reclamo", label: "Reclamo", desc: "Producto o pedido con falla" },
            ].map((opt) => (
              <label key={opt.value} className={`rw-tipo-label${form.tipo === opt.value ? " active" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value={opt.value}
                  checked={form.tipo === opt.value}
                  onChange={handleChange}
                  className="rw-tipo-radio"
                />
                <span className="tl-name">{opt.label}</span>
                <span className="tl-desc">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="rw-section">
          <div className="rw-section-label">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1h10a1 1 0 0 1 1 1v1H2V2a1 1 0 0 1 1-1zM1 4h14v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4zm3 3v1h8V7H4zm0 2v1h5V9H4z" />
            </svg>
            Detalles del pedido
          </div>
          <div className="rw-grid">
            <div className="rw-field">
              <label htmlFor="pedido" className="rw-label">Número de pedido <span className="rw-req">*</span></label>
              <input id="pedido" name="pedido" type="text" value={form.pedido} onChange={handleChange} required placeholder="ORD-2024-001" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="fecha_consumo" className="rw-label">Fecha de consumo</label>
              <input id="fecha_consumo" name="fecha_consumo" type="date" value={form.fecha_consumo} onChange={handleChange} className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="producto" className="rw-label">Producto</label>
              <input id="producto" name="producto" type="text" value={form.producto} onChange={handleChange} placeholder="Nombre del producto" className="rw-input" />
            </div>
            <div className="rw-field">
              <label htmlFor="monto" className="rw-label">Monto (S/)</label>
              <input id="monto" name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} placeholder="0.00" className="rw-input" />
            </div>
            <div className="rw-field rw-field--full">
              <label htmlFor="descripcion" className="rw-label">Descripción detallada <span className="rw-req">*</span></label>
              <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange} required rows={5} placeholder="Describe tu reclamación con el mayor detalle posible..." className="rw-textarea" />
            </div>
          </div>
        </div>

        <button type="submit" className="rw-submit" disabled={status === "loading"}>
          {status === "loading" ? (
            "Enviando..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.5 2L1 7.5l5 2 2 5 6.5-12.5z" />
              </svg>
              Enviar reclamación
            </>
          )}
        </button>

        <p className="rw-legal">
          Nos comprometemos a responder dentro de <strong>30 días hábiles</strong> según la norma peruana.
        </p>
      </form>
    </div>
  );
}