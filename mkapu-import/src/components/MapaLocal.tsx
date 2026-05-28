"use client";
import { useEffect, useState } from "react";
import { useEmpresa } from "@/context/EmpresaContext";

export default function MapaLocal() {
  const { empresa } = useEmpresa();
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    if (empresa?.direccion) setDireccion(empresa.direccion);
  }, [empresa]);

  const address = direccion || "San Juan de Lurigancho, Lima, Perú";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=17&output=embed`;

  return (
    <section className="mapa-section">
      <div className="mapa-inner">
        <div className="mapa-info">
          <span className="mapa-tag">Encuéntranos</span>
          <h2 className="mapa-title">Visita nuestra tienda</h2>
          <p className="mapa-address">📍 {address}</p>
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
    </section>
  );
}
