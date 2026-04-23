export default function QuienesSomosPage() {
  const valores = [
    {
      icon: "🌎",
      titulo: "Importación directa",
      desc: "Traemos equipos directamente desde los mejores fabricantes del mundo, eliminando intermediarios para darte el mejor precio.",
    },
    {
      icon: "✅",
      titulo: "Calidad garantizada",
      desc: "Cada equipo pasa por rigurosos controles de calidad antes de llegar a tus manos. Trabajamos solo con marcas y proveedores certificados.",
    },
    {
      icon: "🚀",
      titulo: "Envíos a todo el Perú",
      desc: "Despachamos a Lima y provincias con total seguridad, asegurando que tu equipo llegue en perfectas condiciones.",
    },
    {
      icon: "🤝",
      titulo: "Atención personalizada",
      desc: "Nuestro equipo está disponible para asesorarte y ayudarte a encontrar el equipo ideal para tu negocio o hogar.",
    },
  ];

  const equipo = [
    { nombre: "Equipo Comercial", rol: "Ventas y asesoría al cliente", emoji: "💼" },
    { nombre: "Equipo Logístico", rol: "Importación y despacho", emoji: "📦" },
    { nombre: "Soporte Técnico", rol: "Postventa y garantías", emoji: "🔧" },
  ];

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* HERO */}
      <section
        style={{
          background: "#1a1a1a",
          borderBottom: "3px solid #f5a623",
          padding: "4rem 1.5rem 3.5rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#f5a623",
            marginBottom: "0.75rem",
          }}
        >
          Conócenos
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
          }}
        >
          Quiénes Somos
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "#bbb",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Somos <strong style={{ color: "#f5a623" }}>MKapu Import</strong>, una empresa
          peruana especializada en la importación y comercialización de equipos de cocina,
          gastronomía y electrodomésticos de alta calidad al mejor precio del mercado.
        </p>
      </section>

      {/* MISIÓN */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "3.5rem 1.5rem 0" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #ede8e1",
            padding: "2.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.75rem" }}>
              🎯 Nuestra Misión
            </h2>
            <p style={{ fontSize: "0.92rem", color: "#555", lineHeight: 1.7, margin: 0 }}>
              Brindar a hogares y negocios peruanos acceso a equipos de cocina y
              electrodomésticos de primera calidad a precios accesibles, con la confianza
              de una importación directa y seria.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.75rem" }}>
              🌟 Nuestra Visión
            </h2>
            <p style={{ fontSize: "0.92rem", color: "#555", lineHeight: 1.7, margin: 0 }}>
              Ser la empresa líder en importación de equipos gastronómicos y
              electrodomésticos en el Perú, reconocida por nuestra calidad, precios
              competitivos y excelente servicio al cliente.
            </p>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: "1.75rem",
            textAlign: "center",
          }}
        >
          ¿Por qué elegirnos?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
            gap: "1.25rem",
          }}
        >
          {valores.map((v) => (
            <div
              key={v.titulo}
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #ede8e1",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "2rem" }}>{v.icon}</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
                {v.titulo}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6, margin: 0 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EQUIPO */}
      <section
        style={{
          background: "#1a1a1a",
          borderTop: "3px solid #f5a623",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "2rem" }}>
          Nuestro Equipo
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {equipo.map((m) => (
            <div
              key={m.nombre}
              style={{
                background: "#2a2a2a",
                border: "1px solid #333",
                borderRadius: "14px",
                padding: "1.75rem 2rem",
                minWidth: "200px",
                flex: "1 1 200px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{m.emoji}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginBottom: "0.25rem" }}>
                {m.nombre}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>{m.rol}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}