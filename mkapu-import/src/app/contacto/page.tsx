"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

const contactInfo = [
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
    label: "Dirección",
    value: "Lima, Perú",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A1.5 1.5 0 0 1 4.5 4h2.382a1 1 0 0 1 .894.553l1.276 2.553a1 1 0 0 1-.217 1.162L7.5 9.5s1 2 3 4 4 3 4 3l1.232-1.335a1 1 0 0 1 1.162-.217l2.553 1.276A1 1 0 0 1 20 17.118V19.5A1.5 1.5 0 0 1 18.5 21C9.94 21 3 14.06 3 5.5z" />
      </svg>
    ),
    label: "Teléfono / WhatsApp",
    value: "+51 977 600 019",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75L2.25 6.75" />
      </svg>
    ),
    label: "Email",
    value: "marlomauriciop1@gmail.com",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
      </svg>
    ),
    label: "Horario",
    value: "Lun–Vie: 9am – 6pm\nSáb: 9am – 1pm",
  },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/mkapu.import" },
  { label: "Facebook", href: "https://www.facebook.com/mkapu.peru/?locale=es_LA" },
  { label: "TikTok", href: "https://www.tiktok.com/@mkapu.import" },
];

export default function ContactoPage() {
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", asunto: "", mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/contacto")
      .single()
      .then(({ data }) => setBanner(data));
  }, []);

  const heroTitulo = banner?.titulo || "Contáctanos";
  const heroSub = banner?.subtitulo || "¿Tienes dudas sobre algún producto o quieres hacer un pedido especial? Escríbenos y te respondemos a la brevedad.";
  const heroImg = banner?.activo && banner?.image_url ? banner.image_url : null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/notificar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const textData = await res.text();
      if (!res.ok) {
        console.error("Error del servidor:", textData);
        setErrorMsg("Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo más tarde.");
        setEnviando(false);
        return;
      }
      setEnviando(false);
      setEnviado(true);
    } catch {
      setErrorMsg("No se pudo conectar con el servidor. Verifica tu conexión.");
      setEnviando(false);
    }
  }

  return (
    <main className="ct-main">
      <section className="ct-hero">
        {heroImg && <Image src={heroImg} alt={heroTitulo} fill priority className="ct-hero-bg" />}
        <div className="ct-hero-overlay" />
        <div className="ct-hero-content">
          <span className="ct-hero-tag">Estamos para ayudarte</span>
          <h1 className="ct-hero-title">{heroTitulo}</h1>
          <p className="ct-hero-sub">{heroSub}</p>
        </div>
      </section>

      <section className="ct-body">
        <div className="ct-grid">
          <div className="ct-info-col">
            <div className="ct-info-card">
              <h2 className="ct-info-title">Información de contacto</h2>
              {contactInfo.map((item) => (
                <div key={item.label} className="ct-info-row">
                  <span className="ct-info-icon">{item.icon}</span>
                  <div>
                    <div className="ct-info-label">{item.label}</div>
                    <div className="ct-info-value">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ct-social-card">
              <p className="ct-social-title">Síguenos en redes</p>
              <div className="ct-social-row">
                {socialLinks.map((red) => (
                  <a key={red.label} href={red.href} target="_blank" rel="noopener noreferrer" className="ct-social-link">
                    {red.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="ct-form-card">
            {enviado ? (
              <div className="ct-success">
                <div className="ct-success-icon">✅</div>
                <h3 className="ct-success-title">¡Mensaje enviado!</h3>
                <p className="ct-success-desc">Gracias por contactarnos. Te responderemos pronto a tu correo.</p>
                <button onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" }); }} className="ct-btn ct-btn--secondary">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ct-form">
                <h2 className="ct-form-title">Envíanos un mensaje</h2>

                {errorMsg && <div className="ct-error">{errorMsg}</div>}

                <div className="ct-form-row">
                  <div className="ct-field">
                    <label className="ct-label">Nombre *</label>
                    <input required name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" className="ct-input" />
                  </div>
                  <div className="ct-field">
                    <label className="ct-label">Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="999 000 000" className="ct-input" />
                  </div>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Email *</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@email.com" className="ct-input" />
                </div>

                <div className="ct-field">
                  <label className="ct-label">Asunto</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} className="ct-input ct-select">
                    <option value="">Seleccionar asunto...</option>
                    <option value="consulta">Consulta sobre producto</option>
                    <option value="pedido">Pedido especial</option>
                    <option value="garantia">Garantía / Postventa</option>
                    <option value="envio">Información de envío</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="ct-field">
                  <label className="ct-label">Mensaje *</label>
                  <textarea required name="mensaje" value={form.mensaje} onChange={handleChange} placeholder="Escribe tu mensaje aquí..." rows={5} className="ct-input ct-textarea" />
                </div>

                <button type="submit" disabled={enviando} className={`ct-btn${enviando ? " ct-btn--disabled" : ""}`}>
                  {enviando ? "Enviando..." : "Enviar mensaje →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .ct-main { background: #f8f7f4; min-height: 100vh; }

        /* ── HERO ── */
        .ct-hero { position: relative; width: 100%; min-height: 320px; display: flex; align-items: center; justify-content: center; background: #1a1a1a; overflow: hidden; }
        .ct-hero-bg { object-fit: cover; object-position: center; }
        .ct-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%); z-index: 1; }
        .ct-hero-content { position: relative; z-index: 2; text-align: center; padding: 4rem 1.5rem 3.5rem; max-width: 680px; }
        .ct-hero-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #f5a623; margin-bottom: 0.75rem; padding: 0.4rem 1rem; border: 1px solid rgba(245,166,35,0.3); border-radius: 999px; background: rgba(245,166,35,0.08); }
        .ct-hero-title { font-size: clamp(2rem, 4.5vw, 3.2rem); font-weight: 900; color: #fff; letter-spacing: -0.03em; margin: 0 0 1rem; line-height: 1.05; }
        .ct-hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.7); margin: 0 auto; line-height: 1.7; max-width: 520px; }

        /* ── BODY ── */
        .ct-body { max-width: 1100px; margin: 0 auto; padding: 80px 24px 120px; }
        .ct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }

        /* ── INFO ── */
        .ct-info-col { display: flex; flex-direction: column; gap: 20px; }
        .ct-info-card { background: #1a1a1a; border-radius: 20px; padding: 2rem; color: #fff; border: 1px solid #2a2a2a; }
        .ct-info-title { font-size: 1.15rem; font-weight: 800; margin: 0 0 1.5rem; color: #f5a623; }
        .ct-info-row { display: flex; gap: 14px; margin-bottom: 1.25rem; }
        .ct-info-row:last-child { margin-bottom: 0; }
        .ct-info-icon { margin-top: 2px; flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(245,166,35,0.1); border-radius: 10px; }
        .ct-info-label { font-size: 0.7rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
        .ct-info-value { font-size: 0.92rem; color: #ddd; line-height: 1.5; white-space: pre-line; }

        /* ── SOCIAL ── */
        .ct-social-card { background: #fff; border-radius: 16px; border: 1px solid #ede8e1; padding: 1.5rem; }
        .ct-social-title { font-size: 0.85rem; font-weight: 700; color: #444; margin: 0 0 0.75rem; }
        .ct-social-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .ct-social-link { padding: 0.5rem 1rem; background: #f8f7f4; border: 1px solid #ede8e1; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #444; text-decoration: none; transition: all 0.15s; }
        .ct-social-link:hover { background: #f5a623; color: #fff; border-color: #f5a623; }

        /* ── FORM ── */
        .ct-form-card { background: #fff; border-radius: 20px; border: 1px solid #ede8e1; padding: 2rem; box-shadow: 0 8px 32px rgba(78,52,24,0.06); }
        .ct-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .ct-form-title { font-size: 1.2rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.25rem; }
        .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .ct-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .ct-label { font-size: 0.8rem; font-weight: 700; color: #444; letter-spacing: 0.02em; }
        .ct-input { width: 100%; padding: 0.75rem 1rem; font-size: 16px; border: 1.5px solid #ddd; border-radius: 10px; outline: none; background: #fafafa; color: #1a1a1a; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .ct-input:focus { border-color: #f5a623; box-shadow: 0 0 0 3px rgba(245,166,35,0.12); }
        .ct-select { cursor: pointer; }
        .ct-textarea { resize: vertical; min-height: 120px; }
        .ct-error { background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; border: 1px solid #fca5a5; }
        .ct-btn { width: 100%; padding: 0.85rem; background: #f5a623; color: #fff; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 800; cursor: pointer; transition: background 0.15s, transform 0.12s; letter-spacing: 0.02em; }
        .ct-btn:hover { background: #d4891a; transform: translateY(-1px); }
        .ct-btn--disabled { background: #ccc !important; cursor: not-allowed; transform: none !important; }
        .ct-btn--secondary { background: #f5a623; color: #fff; padding: 0.6rem 1.5rem; border: none; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: background 0.15s; }

        /* ── SUCCESS ── */
        .ct-success { text-align: center; padding: 2.5rem 1rem; }
        .ct-success-icon { font-size: 3rem; margin-bottom: 1rem; }
        .ct-success-title { font-size: 1.25rem; font-weight: 800; color: #1a1a1a; margin: 0 0 0.5rem; }
        .ct-success-desc { font-size: 0.9rem; color: #666; margin: 0 0 1.5rem; line-height: 1.6; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .ct-grid { grid-template-columns: 1fr; }
          .ct-body { padding: 60px 20px 80px; }
        }
        @media (max-width: 520px) {
          .ct-hero { min-height: 240px; }
          .ct-hero-content { padding: 3rem 1.25rem 2.5rem; }
          .ct-body { padding: 40px 14px 60px; }
          .ct-form-row { grid-template-columns: 1fr; }
          .ct-form-card { padding: 1.5rem; }
          .ct-info-card { padding: 1.5rem; }
        }
      `}</style>
    </main>
  );
}
