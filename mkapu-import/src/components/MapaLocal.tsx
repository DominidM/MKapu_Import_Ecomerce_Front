export default function MapaLocal() {
  const lat = -11.9981982;
  const lng = -77.0145005;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

  return (
    <section className="mapa-section">
      <div className="mapa-inner">
        <div className="mapa-info">
          <span className="mapa-tag">Encuéntranos</span>
          <h2 className="mapa-title">Visita nuestra tienda</h2>
          <p className="mapa-address">📍 San Juan de Luringancho, Lima, Perú</p>
          <p className="mapa-desc">
            Contamos con showroom para que puedas ver los equipos en persona
            antes de comprar.
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mapa-btn"
          >
            Cómo llegar →
          </a>
        </div>

        <div className="mapa-embed">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Mkapu Import"
          />
        </div>
      </div>

      <style>{`
        .mapa-section { padding: 4rem 1.5rem; background: #0d0d0d; }
        .mapa-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.6fr; gap: 3rem; align-items: center; }
        .mapa-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #f5a623; margin-bottom: 0.75rem; }
        .mapa-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900; color: #fff; margin: 0 0 1rem; line-height: 1.15; }
        .mapa-address { font-size: 0.95rem; color: #ccc; margin: 0 0 0.75rem; font-weight: 600; }
        .mapa-desc { font-size: 0.9rem; color: #888; line-height: 1.65; margin: 0 0 1.75rem; }
        .mapa-btn { display: inline-flex; align-items: center; gap: 8px; background: #f5a623; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: background 0.2s; }
        .mapa-btn:hover { background: #d4891a; }
        .mapa-embed { height: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        @media (max-width: 768px) { .mapa-inner { grid-template-columns: 1fr; gap: 2rem; } .mapa-embed { height: 280px; } }
      `}</style>
    </section>
  );
}
