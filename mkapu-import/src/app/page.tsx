export const dynamic = "force-static";
export const revalidate = 300;

import Link from "next/link";
import Carousel from "@/components/carousel";
import BrandsCarousel from "@/components/BrandsCarousel";
import CollaboratorsCarousel from "@/components/CollaboratorsCarousel";
import VideoSection from "@/components/VideoSection";
import HeroAccordion from "@/components/HeroAccordion";
import { getProductos, getProductosNuevos, getBanners, getPromocionesActivasMap } from "@/lib/queries";
import HomeSecciones from "@/components/HomeSecciones";
import MapaLocal from "@/components/MapaLocal";

type AnyProduct = any;

function byCategory(products: AnyProduct[], cat: string) {
  return products.filter((p) => p.category === cat);
}

function toCarouselProduct(p: AnyProduct) {
  return {
    ...p,
    imageUrl: p.image_url ?? "",
    pricemCaja: p.price_caja ?? undefined,
    unidadcaja: p.unidad_caja ?? undefined,
    priceMayorista: p.price_mayorista ?? undefined,
    unidadMayorista: p.unidad_mayorista ?? undefined,
    description: p.description ?? "",
    featured: p.featured ?? false,
  };
}

function CarouselSection({
  tag,
  title,
  subtitle,
  products,
  href,
  dark = false,
  promocionesMap = {},
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  products: AnyProduct[];
  href: string;
  dark?: boolean;
  promocionesMap?: Record<number, { tipo_descuento: string; valor_descuento: number }>;
}) {
  if (products.length === 0)
    return (
      <section
        className={`csec${dark ? " csec--dark" : ""}`}
        style={{ minHeight: "420px" }}
      />
    );
  return (
    <section className={`csec${dark ? " csec--dark" : ""}`}>
      <div className="csec__inner">
        <div className="csec__head">
          {tag && <span className="csec__tag">{tag}</span>}
          <h2 className="csec__title">{title}</h2>
          {subtitle && <p className="csec__sub">{subtitle}</p>}
        </div>
        <Carousel products={products.map(toCarouselProduct)} title="" promocionesMap={promocionesMap} />
        <div className="csec__foot">
          <Link href={href} className="csec__link">
            Ver todos →
          </Link>
        </div>
      </div>
    </section>
  );
}

const WHY_ITEMS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="1" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: "Directo del fabricante",
    desc: "Sin intermediarios. Precios competitivos con calidad de primera.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Soporte técnico local",
    desc: "Equipo en Lima para instalación, mantenimiento y garantía.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Despacho rápido",
    desc: "Entrega en Lima Metropolitana en 24–48 horas hábiles.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Asesoría personalizada",
    desc: "Te ayudamos a elegir el equipo ideal para tu negocio.",
  },
];

export default async function HomePage() {
  const [products, nuevos, banners, promocionesMap] = await Promise.all([
    getProductos(),
    getProductosNuevos(),
    getBanners(),
    getPromocionesActivasMap(),
  ]);

  const featured = products.filter((p: AnyProduct) => p.featured);

  return (
    <div className="home">
      <HeroAccordion initialBanners={banners} />

      <CarouselSection
        tag="Más vendidos"
        title="Productos destacados"
        subtitle="Los equipos más solicitados por restaurantes y hoteles de Lima."
        products={featured.length > 0 ? featured : products.slice(0, 10)}
        href="/productos"
        promocionesMap={promocionesMap}
      />

      <CarouselSection
        tag="Recién llegados"
        title="Nuevos Productos"
        subtitle="Los últimos equipos que acaban de llegar al catálogo."
        products={nuevos}
        href="/productos?new=true"
        dark
        promocionesMap={promocionesMap}
      />

      <BrandsCarousel />

      <MapaLocal />

      <HomeSecciones />

      <section className="why">
        <div className="why__inner">
          <div className="why__head">
            <span className="why__tag">¿Por qué elegirnos?</span>
            <h2 className="why__title">
              Importación directa,
              <br />
              <em>calidad garantizada</em>
            </h2>
          </div>
          <div className="why__grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="why__card">
                <div className="why__num">{item.num}</div>
                <div className="why__icon-wrap">{item.icon}</div>
                <h3 className="why__card-title">{item.title}</h3>
                <p className="why__card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CollaboratorsCarousel />

      <VideoSection tipo="video" />

    </div>
  );
}
