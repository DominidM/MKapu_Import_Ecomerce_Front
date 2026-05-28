"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/context/EmpresaContext";

type BannerConfig = {
  titulo: string;
  subtitulo: string | null;
  image_url: string | null;
  activo: boolean;
};

type EmpresaData = {
  direccion: string | null;
  whatsapp_soporte: string | null;
  email: string | null;
  horario_atencion: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

const contactIcons = {
  direccion: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A1.5 1.5 0 0 1 4.5 4h2.382a1 1 0 0 1 .894.553l1.276 2.553a1 1 0 0 1-.217 1.162L7.5 9.5s1 2 3 4 4 3 4 3l1.232-1.335a1 1 0 0 1 1.162-.217l2.553 1.276A1 1 0 0 1 20 17.118V19.5A1.5 1.5 0 0 1 18.5 21C9.94 21 3 14.06 3 5.5z" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0-9.75 6.75L2.25 6.75" />
    </svg>
  ),
  horario: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f5a623" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
    </svg>
  ),
};

const contactFields: { key: keyof EmpresaData; label: string; iconKey: keyof typeof contactIcons }[] = [
  { key: "direccion", label: "Dirección", iconKey: "direccion" },
  { key: "whatsapp_soporte", label: "Teléfono / WhatsApp", iconKey: "whatsapp" },
  { key: "email", label: "Email", iconKey: "email" },
  { key: "horario_atencion", label: "Horario", iconKey: "horario" },
];

const socialDefaults: { label: string; key: keyof EmpresaData }[] = [
  { label: "Instagram", key: "instagram_url" },
  { label: "Facebook", key: "facebook_url" },
  { label: "TikTok", key: "tiktok_url" },
];

export default function ContactoPage() {
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const { empresa, loaded } = useEmpresa();
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

  const contactInfo = contactFields
    .filter((f) => empresa?.[f.key])
    .map((f) => ({
      label: f.label,
      icon: contactIcons[f.iconKey],
      value: empresa![f.key]!,
    }));

  const socialLinks = socialDefaults
    .filter((s) => empresa?.[s.key])
    .map((s) => ({ label: s.label, href: empresa![s.key]! }));

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
              {loaded ? (
                contactInfo.map((item) => (
                  <div key={item.label} className="ct-info-row">
                    <span className="ct-info-icon">{item.icon}</span>
                    <div>
                      <div className="ct-info-label">{item.label}</div>
                      <div className="ct-info-value">{item.value}</div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="ct-info-row ct-skeleton">
                    <span className="ct-skeleton-icon" />
                    <div>
                      <div className="ct-skeleton-label" />
                      <div className="ct-skeleton-value" />
                    </div>
                  </div>
                  <div className="ct-info-row ct-skeleton">
                    <span className="ct-skeleton-icon" />
                    <div>
                      <div className="ct-skeleton-label" />
                      <div className="ct-skeleton-value" />
                    </div>
                  </div>
                  <div className="ct-info-row ct-skeleton">
                    <span className="ct-skeleton-icon" />
                    <div>
                      <div className="ct-skeleton-label" />
                      <div className="ct-skeleton-value" />
                    </div>
                  </div>
                  <div className="ct-info-row ct-skeleton">
                    <span className="ct-skeleton-icon" />
                    <div>
                      <div className="ct-skeleton-label" />
                      <div className="ct-skeleton-value" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="ct-social-card">
              <p className="ct-social-title">Síguenos en redes</p>
              <div className="ct-social-row">
                {loaded ? (
                  socialLinks.map((red) => (
                    <a key={red.label} href={red.href} target="_blank" rel="noopener noreferrer" className="ct-social-link">
                      {red.label}
                    </a>
                  ))
                ) : (
                  <>
                    <span className="ct-skeleton-social" />
                    <span className="ct-skeleton-social" />
                    <span className="ct-skeleton-social" />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="ct-form-card">
            {enviado ? (
              <div className="ct-success">
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
    </main>
  );
}
