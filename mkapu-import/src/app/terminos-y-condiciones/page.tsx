export default function TerminosYCondiciones() {
  return (
    <main className="legal-page">
        
      <style>{`
        .legal-page {
          background: #111;
          color: #ccc;
          min-height: 100vh;
          padding: 3rem 1.5rem;
        }

        .legal-page__container {
          max-width: 800px;
          margin: 0 auto;
        }

        .legal-page__title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .legal-page__updated {
          font-size: 0.8rem;
          color: #555;
          margin-bottom: 2.5rem;
        }

        .legal-page__section {
          margin-bottom: 2rem;
          border-left: 3px solid #e05c2a;
          padding-left: 1.25rem;
        }

        .legal-page__section h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.6rem;
        }

        .legal-page__section p,
        .legal-page__section ol,
        .legal-page__section li {
          font-size: 0.9rem;
          line-height: 1.75;
          color: #aaa;
          margin-bottom: 0.5rem;
        }

        .legal-page__section ol {
          padding-left: 1.25rem;
        }

        .legal-page__section a {
          color: #e05c2a;
          text-decoration: none;
        }

        .legal-page__section a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="legal-page__container">
        <h1 className="legal-page__title">Términos y Condiciones</h1>
        <p className="legal-page__updated">Última actualización: abril 2026</p>

        <section className="legal-page__section">
          <h2>1. Información de la empresa</h2>
          <p>
            El presente sitio web es operado por <strong>Mkapu Import</strong>,
            empresa debidamente registrada en el Perú con RUC activo. Para
            cualquier consulta puedes contactarnos a través de{" "}
            <a href="mailto:marlomauriciop1@gmail.com">marlomauriciop1@gmail.com</a> o por
            WhatsApp.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Aceptación de los términos</h2>
          <p>
            Al navegar y/o realizar una consulta de compra a través de este
            sitio web, el usuario acepta los presentes Términos y Condiciones en
            su totalidad. Si no está de acuerdo con alguno de ellos, le
            recomendamos abstenerse de usar el sitio.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Proceso de compra</h2>
          <p>
            Mkapu Import opera como un catálogo digital de equipos de
            importación. El proceso de compra se realiza de la siguiente manera:
          </p>
          <ol>
            <li>
              El usuario selecciona el producto de su interés en el catálogo.
            </li>
            <li>
              La solicitud es derivada automáticamente a nuestro equipo de
              ventas a través de WhatsApp.
            </li>
            <li>
              Un asesor de Mkapu Import contactará al usuario para confirmar
              disponibilidad, precio final, condiciones de pago y detalles del
              pedido.
            </li>
            <li>
              El contrato de compraventa se perfecciona únicamente cuando ambas
              partes confirman los términos del pedido por escrito (vía
              WhatsApp, correo u otro medio).
            </li>
          </ol>
          <p>
            Mkapu Import se reserva el derecho de rechazar o cancelar cualquier
            pedido por razones de stock, error en el precio publicado u otras
            causas justificadas, informando al usuario en el menor tiempo
            posible.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Precios</h2>
          <p>
            Los precios publicados en el catálogo son referenciales y están
            expresados en soles peruanos (S/) o dólares americanos (USD) según
            se indique. El precio definitivo será confirmado por el asesor de
            ventas al momento de la cotización, pudiendo variar por tipo de
            cambio, disponibilidad o configuración del equipo.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Envíos y despacho</h2>
          <p>
            Realizamos envíos a Lima Metropolitana y provincias a nivel
            nacional. Los plazos y costos de envío son coordinados directamente
            con el asesor de ventas según la ubicación del cliente y el tipo de
            equipo. Para Lima Metropolitana, el despacho estándar se realiza en
            24 a 48 horas hábiles confirmado el pedido.
          </p>
          <p>
            El riesgo sobre los productos se transfiere al comprador en el
            momento de la entrega al transportista o al cliente, según se haya
            pactado.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Garantía y soporte técnico</h2>
          <p>
            Todos los equipos comercializados por Mkapu Import cuentan con
            garantía según las condiciones del fabricante. Contamos con equipo
            técnico en Lima para instalación, mantenimiento y atención de
            garantías. Las condiciones específicas de garantía de cada producto
            serán informadas al momento de la compra.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Devoluciones y cambios</h2>
          <p>
            De acuerdo con el Código de Protección y Defensa del Consumidor
            (Ley N° 29571), el usuario tiene derecho a solicitar la reparación,
            reposición o devolución del producto en caso de defecto o
            disconformidad. Las solicitudes deben realizarse dentro del plazo
            legal aplicable, contactando a nuestro equipo a través de los
            canales oficiales.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Propiedad intelectual</h2>
          <p>
            Todo el contenido de este sitio web (textos, imágenes, logotipos,
            diseño) es propiedad de Mkapu Import o de sus proveedores y está
            protegido por la legislación peruana de propiedad intelectual. Queda
            prohibida su reproducción total o parcial sin autorización expresa.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Limitación de responsabilidad</h2>
          <p>
            Mkapu Import no será responsable por daños indirectos, pérdida de
            datos o lucro cesante derivados del uso del sitio web. La
            información del catálogo es de carácter referencial y puede estar
            sujeta a cambios sin previo aviso.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>10. Ley aplicable y jurisdicción</h2>
          <p>
            Los presentes Términos y Condiciones se rigen por las leyes de la
            República del Perú. Cualquier controversia será sometida a la
            jurisdicción de los tribunales competentes de la ciudad de Lima,
            renunciando las partes a cualquier otro fuero que pudiera
            corresponderles. Asimismo, el usuario puede presentar un reclamo
            ante el INDECOPI de conformidad con la Ley N° 29571.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>11. Modificaciones</h2>
          <p>
            Mkapu Import se reserva el derecho de modificar estos Términos y
            Condiciones en cualquier momento. Los cambios serán publicados en
            esta página con indicación de la fecha de actualización.
          </p>
        </section>
      </div>

    </main>
  );
}