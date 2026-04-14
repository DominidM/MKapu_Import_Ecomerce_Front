"use client";
import { useState } from "react";

type FormData = {
  // Datos del consumidor
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  // Datos del reclamo
  tipo: "reclamo" | "queja" | "";
  fecha_consumo: string;
  producto: string;
  monto: string;
  descripcion: string;
  pedido: string;
};

const initialForm: FormData = {
  nombres: "",
  apellidos: "",
  dni: "",
  email: "",
  telefono: "",
  direccion: "",
  tipo: "",
  fecha_consumo: "",
  producto: "",
  monto: "",
  descripcion: "",
  pedido: "",
};

export default function LibroDeReclamaciones() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.nombres.trim()) e.nombres = "Requerido";
    if (!form.apellidos.trim()) e.apellidos = "Requerido";
    if (!/^\d{8}$/.test(form.dni)) e.dni = "DNI debe tener 8 dígitos";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    if (!form.direccion.trim()) e.direccion = "Requerido";
    if (!form.tipo) e.tipo = "Selecciona una opción" as any;
    if (!form.fecha_consumo) e.fecha_consumo = "Requerido";
    if (!form.producto.trim()) e.producto = "Requerido";
    if (!form.descripcion.trim() || form.descripcion.length < 20)
      e.descripcion = "Mínimo 20 caracteres";
    if (!form.pedido.trim()) e.pedido = "Requerido";
    return e;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    // Simulate API call / save to backend
    await new Promise((r) => setTimeout(r, 1200));
    const ticketNum = `MKP-${Date.now().toString().slice(-8)}`;
    setTicket(ticketNum);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <main className="lr-page">
      <style>{`
        .lr-page {
          background: #111;
          color: #ccc;
          min-height: 100vh;
          padding: 3rem 1.5rem 5rem;
          font-family: inherit;
        }

        .lr-container {
          max-width: 760px;
          margin: 0 auto;
        }

        /* Header */
        .lr-header {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #222;
        }

        .lr-book-icon {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          background: #e05c2a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lr-header-text h1 {
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 0.25rem;
          line-height: 1.2;
        }

        .lr-header-text p {
          font-size: 0.82rem;
          color: #666;
          margin: 0;
          line-height: 1.6;
          max-width: 520px;
        }

        /* Notice box */
        .lr-notice {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-left: 3px solid #e05c2a;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          font-size: 0.82rem;
          color: #888;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .lr-notice strong {
          color: #e05c2a;
        }

        /* Section titles */
        .lr-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e05c2a;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .lr-section-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #222;
        }

        /* Grid */
        .lr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.5rem;
          margin-bottom: 2rem;
        }

        .lr-grid--3 {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .lr-grid--full {
          grid-column: 1 / -1;
        }

        /* Field */
        .lr-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .lr-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .lr-label span {
          color: #e05c2a;
          margin-left: 2px;
        }

        .lr-input,
        .lr-textarea,
        .lr-select {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          color: #fff;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }

        .lr-input:focus,
        .lr-textarea:focus,
        .lr-select:focus {
          border-color: #e05c2a;
        }

        .lr-input::placeholder,
        .lr-textarea::placeholder {
          color: #444;
        }

        .lr-select option {
          background: #1a1a1a;
        }

        .lr-textarea {
          resize: vertical;
          min-height: 90px;
        }

        .lr-error {
          font-size: 0.72rem;
          color: #e05c2a;
          margin-top: 2px;
        }

        .lr-input--err,
        .lr-textarea--err,
        .lr-select--err {
          border-color: #c0392b !important;
        }

        /* Tipo badges */
        .lr-tipo-group {
          display: flex;
          gap: 0.75rem;
        }

        .lr-tipo-btn {
          flex: 1;
          padding: 0.6rem;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          background: #1a1a1a;
          color: #888;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
          font-family: inherit;
        }

        .lr-tipo-btn:hover {
          border-color: #444;
          color: #ccc;
        }

        .lr-tipo-btn--active {
          border-color: #e05c2a;
          background: rgba(224, 92, 42, 0.1);
          color: #e05c2a;
        }

        .lr-tipo-hint {
          font-size: 0.72rem;
          color: #555;
          margin-top: 0.4rem;
        }

        /* Character count */
        .lr-char {
          font-size: 0.7rem;
          color: #555;
          text-align: right;
        }

        /* Submit */
        .lr-submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1e1e1e;
          flex-wrap: wrap;
        }

        .lr-submit-note {
          font-size: 0.75rem;
          color: #555;
          max-width: 340px;
          line-height: 1.5;
        }

        .lr-btn {
          background: #e05c2a;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 0.75rem 2rem;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          font-family: inherit;
          white-space: nowrap;
        }

        .lr-btn:hover:not(:disabled) {
          background: #c94f23;
        }

        .lr-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Success */
        .lr-success {
          text-align: center;
          padding: 4rem 2rem;
        }

        .lr-success__icon {
          width: 64px;
          height: 64px;
          background: rgba(224, 92, 42, 0.15);
          border: 2px solid #e05c2a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .lr-success h2 {
          font-size: 1.4rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 0.5rem;
        }

        .lr-success p {
          font-size: 0.875rem;
          color: #777;
          margin: 0 0 0.5rem;
          line-height: 1.6;
        }

        .lr-ticket {
          display: inline-block;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 0.5rem 1.25rem;
          font-size: 1rem;
          font-weight: 700;
          color: #e05c2a;
          letter-spacing: 0.08em;
          margin: 1rem 0 1.5rem;
        }

        .lr-success-list {
          font-size: 0.8rem;
          color: #666;
          line-height: 2;
          list-style: none;
          padding: 0;
        }

        .lr-success-list li::before {
          content: "✓ ";
          color: #e05c2a;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .lr-grid {
            grid-template-columns: 1fr;
          }
          .lr-grid--3 {
            grid-template-columns: 1fr 1fr;
          }
          .lr-header {
            flex-direction: column;
            gap: 1rem;
          }
          .lr-submit-row {
            flex-direction: column;
            align-items: stretch;
          }
          .lr-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="lr-container">

        {/* Header */}
        <div className="lr-header">
          <div className="lr-book-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-1 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v2z" />
            </svg>
          </div>
          <div className="lr-header-text">
            <h1>Libro de Reclamaciones</h1>
            <p>
              Conforme a la Ley N° 29571 – Código de Protección y Defensa del
              Consumidor. Tu reclamo o queja será atendido en un plazo máximo de
              30 días calendario.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="lr-notice">
          <strong>Importante:</strong> La presentación de un reclamo no impide
          acudir a otras vías de solución de controversias ni es requisito
          previo para interponer una denuncia ante el{" "}
          <strong>INDECOPI</strong>. Recibirás un número de ticket y
          confirmación a tu email en un plazo de <strong>72 horas</strong>.
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="lr-success">
            <div className="lr-success__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e05c2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>Reclamo registrado</h2>
            <p>Tu número de ticket es:</p>
            <div className="lr-ticket">{ticket}</div>
            <p>
              Guarda este número. Responderemos a{" "}
              <strong style={{ color: "#ccc" }}>{form.email}</strong> dentro
              de las próximas 72 horas.
            </p>
            <ul className="lr-success-list">
              <li>Plazo de respuesta: hasta 30 días calendario</li>
              <li>También puedes contactarnos por WhatsApp</li>
              <li>Puedes escalar tu caso ante INDECOPI en cualquier momento</li>
            </ul>
          </div>
        ) : (
          <>
            {/* ── Section 1: Datos del consumidor ── */}
            <p className="lr-section-title">1 — Datos del consumidor</p>

            <div className="lr-grid">
              <div className="lr-field">
                <label className="lr-label">Nombres <span>*</span></label>
                <input
                  className={`lr-input${errors.nombres ? " lr-input--err" : ""}`}
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Juan Carlos"
                />
                {errors.nombres && <span className="lr-error">{errors.nombres}</span>}
              </div>

              <div className="lr-field">
                <label className="lr-label">Apellidos <span>*</span></label>
                <input
                  className={`lr-input${errors.apellidos ? " lr-input--err" : ""}`}
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="García López"
                />
                {errors.apellidos && <span className="lr-error">{errors.apellidos}</span>}
              </div>

              <div className="lr-field">
                <label className="lr-label">DNI / Doc. identidad <span>*</span></label>
                <input
                  className={`lr-input${errors.dni ? " lr-input--err" : ""}`}
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength={8}
                />
                {errors.dni && <span className="lr-error">{errors.dni}</span>}
              </div>

              <div className="lr-field">
                <label className="lr-label">Teléfono <span>*</span></label>
                <input
                  className={`lr-input${errors.telefono ? " lr-input--err" : ""}`}
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="987 654 321"
                />
                {errors.telefono && <span className="lr-error">{errors.telefono}</span>}
              </div>

              <div className="lr-field lr-grid--full">
                <label className="lr-label">Correo electrónico <span>*</span></label>
                <input
                  className={`lr-input${errors.email ? " lr-input--err" : ""}`}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@email.com"
                />
                {errors.email && <span className="lr-error">{errors.email}</span>}
              </div>

              <div className="lr-field lr-grid--full">
                <label className="lr-label">Dirección <span>*</span></label>
                <input
                  className={`lr-input${errors.direccion ? " lr-input--err" : ""}`}
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Av. Javier Prado 1234, San Isidro, Lima"
                />
                {errors.direccion && <span className="lr-error">{errors.direccion}</span>}
              </div>
            </div>

            {/* ── Section 2: Datos del reclamo ── */}
            <p className="lr-section-title">2 — Identificación del reclamo</p>

            <div className="lr-grid">
              <div className="lr-field lr-grid--full">
                <label className="lr-label">Tipo <span>*</span></label>
                <div className="lr-tipo-group">
                  <button
                    type="button"
                    className={`lr-tipo-btn${form.tipo === "reclamo" ? " lr-tipo-btn--active" : ""}`}
                    onClick={() => { setForm(p => ({ ...p, tipo: "reclamo" })); setErrors(p => ({ ...p, tipo: undefined })); }}
                  >
                    📋 Reclamo
                  </button>
                  <button
                    type="button"
                    className={`lr-tipo-btn${form.tipo === "queja" ? " lr-tipo-btn--active" : ""}`}
                    onClick={() => { setForm(p => ({ ...p, tipo: "queja" })); setErrors(p => ({ ...p, tipo: undefined })); }}
                  >
                    📣 Queja
                  </button>
                </div>
                <p className="lr-tipo-hint">
                  {form.tipo === "reclamo"
                    ? "Reclamo: disconformidad con el producto o servicio adquirido."
                    : form.tipo === "queja"
                    ? "Queja: malestar o descontento respecto a la atención recibida."
                    : "Reclamo = producto/servicio. Queja = atención al cliente."}
                </p>
                {errors.tipo && <span className="lr-error">{errors.tipo}</span>}
              </div>

              <div className="lr-field">
                <label className="lr-label">Fecha de adquisición <span>*</span></label>
                <input
                  className={`lr-input${errors.fecha_consumo ? " lr-input--err" : ""}`}
                  name="fecha_consumo"
                  type="date"
                  value={form.fecha_consumo}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.fecha_consumo && <span className="lr-error">{errors.fecha_consumo}</span>}
              </div>

              <div className="lr-field">
                <label className="lr-label">Monto reclamado (S/)</label>
                <input
                  className="lr-input"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="Ej: 1500.00"
                  type="number"
                  min="0"
                />
              </div>

              <div className="lr-field lr-grid--full">
                <label className="lr-label">Producto / Servicio involucrado <span>*</span></label>
                <input
                  className={`lr-input${errors.producto ? " lr-input--err" : ""}`}
                  name="producto"
                  value={form.producto}
                  onChange={handleChange}
                  placeholder="Ej: Compresor de tornillo 10HP modelo XYZ"
                />
                {errors.producto && <span className="lr-error">{errors.producto}</span>}
              </div>

              <div className="lr-field lr-grid--full">
                <label className="lr-label">Descripción del reclamo <span>*</span></label>
                <textarea
                  className={`lr-textarea${errors.descripcion ? " lr-textarea--err" : ""}`}
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe detalladamente el motivo de tu reclamo o queja..."
                  rows={4}
                />
                <span className="lr-char">{form.descripcion.length} caracteres</span>
                {errors.descripcion && <span className="lr-error">{errors.descripcion}</span>}
              </div>

              <div className="lr-field lr-grid--full">
                <label className="lr-label">¿Qué solución solicitas? <span>*</span></label>
                <textarea
                  className={`lr-textarea${errors.pedido ? " lr-textarea--err" : ""}`}
                  name="pedido"
                  value={form.pedido}
                  onChange={handleChange}
                  placeholder="Ej: Solicito la reparación del equipo sin costo, o devolución del monto pagado..."
                  rows={3}
                />
                {errors.pedido && <span className="lr-error">{errors.pedido}</span>}
              </div>
            </div>

            {/* Submit */}
            <div className="lr-submit-row">
              <p className="lr-submit-note">
                Al enviar este formulario, confirmas que la información
                proporcionada es verídica y aceptas que Mkapu Import la utilice
                para gestionar tu reclamo.
              </p>
              <button
                className="lr-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Enviando…" : "Enviar reclamo"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}