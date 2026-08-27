import { Link } from 'react-router-dom'

export default function TermsAndPolicies() {
  return (
    <div className="terms-page-wrapper">
      <div className="terms-container">
        {/* Header */}
        <div className="terms-header">
          <span className="terms-eyebrow">POLÍTICAS COMERCIALES Y LEGALES</span>
          <h1 className="terms-title">Términos, Condiciones y Política de Venta Final</h1>
          <p className="terms-updated">Última actualización: Agosto 2026 | La Cachina Online S.A.C.</p>
        </div>

        {/* Warning Callout Box */}
        <div className="terms-warning-callout">
          <div className="callout-icon">⚠️</div>
          <div>
            <h3>AVISO CRUCIAL DE COMPRA: TODAS LAS VENTAS SON FINALES</h3>
            <p>
              En <strong>La Cachina Online</strong> comercializamos prendas únicas, piezas de archivo histórico y moda circular de segunda mano debidamente inspeccionadas. Debido a la naturaleza exclusiva de piezas únicas irrepetibles:
            </p>
            <strong>🚫 NO SE ACEPTAN CAMBIOS NI DEVOLUCIONES DE NINGÚN TIPO UNA VEZ COMPLETADA LA ORDEN.</strong>
          </div>
        </div>

        {/* Legal Sections */}
        <div className="terms-content-card">
          <section className="legal-section">
            <h2>1. Naturaleza de los Productos y Certificado de Estado</h2>
            <p>
              Cada artículo publicado en <strong>La Cachina Online</strong> es una pieza única (1 de 1) de época, vintage o archivo streetwear. Por su condición de segunda mano o colección:
            </p>
            <ul>
              <li>Las prendas pueden presentar signos de desgaste propios de su antigüedad y uso previo, los cuales forman parte de su valor estético e histórico.</li>
              <li>En cada ficha de producto se especifica la calificación de estado de <strong>1 a 5 estrellas</strong> (desde <em>Desgaste Vintage / Distress</em> hasta <em>Impecable / Como Nueva</em>).</li>
              <li>Las fotografías mostradas corresponden 100% a la prenda real en stock sin filtros alteradores.</li>
              <li>Es responsabilidad exclusiva del comprador verificar las medidas en centímetros antes de confirmar su orden.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. Política Estricta de Venta Final (No Devoluciones)</h2>
            <p>
              De conformidad con el Código de Protección y Defensa del Consumidor (Ley N° 29571) y las políticas comerciales de nuestra tienda:
            </p>
            <ul>
              <li><strong>Sin cambios por talla:</strong> Al ser prendas individuales y únicas, no disponemos de reposición de tallas ni stock múltiple.</li>
              <li><strong>Sin derecho a desistimiento por cambio de opinión:</strong> Una vez reservada y pagada la prenda, se retira inmediatamente del catálogo impidiendo su compra por otros usuarios.</li>
              <li><strong>Garantía de Autenticidad y Estado:</strong> Garantizamos que la prenda entregada coincide exactamente con las fotografías y descripción publicadas.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Modalidades de Pago y Seguridad</h2>
            <p>
              Los pagos se procesan de forma segura a través de pasarelas digitales certificadas (Yape, Plin, Transferencia BCP / BBVA / Interbank, Tarjetas de Débito y Crédito).
            </p>
            <p>
              Ningún dato confidencial de tarjeta o cuenta es almacenado en nuestros servidores.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Envíos y Plazos de Entrega a Nivel Nacional</h2>
            <p>
              Realizamos envíos a todo el territorio peruano mediante operadores logísticos autorizados:
            </p>
            <ul>
              <li><strong>Lima Metropolitana:</strong> Entrega express de 24 a 48 horas hábiles mediante motorizado o courier local.</li>
              <li><strong>Provincias del Perú:</strong> Entrega de 2 a 5 días hábiles mediante <em>Olva Courier</em> o <em>Shalom Empresarial</em> con código de seguimiento en tiempo real.</li>
              <li>Es deber del usuario consignar la dirección exacta y un número de celular de contacto activo para coordinar la entrega.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Libro de Reclamaciones e INDECOPI</h2>
            <p>
              En cumplimiento del D.S. N° 011-2011-PCM y la Ley N° 29571, ponemos a disposición de todos nuestros usuarios el <Link to="/libro-de-reclamaciones" className="terms-link-highlight">Libro de Reclamaciones Virtual</Link>.
            </p>
            <p>
              Las reclamaciones o quejas ingresadas recibirán respuesta formal en un plazo legal improrrogable no mayor a quince (15) días hábiles.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Privacidad y Protección de Datos Personales</h2>
            <p>
              Tus datos personales son tratados conforme a la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong>. Únicamente son utilizados para la gestión de envíos, comprobantes de pago y comunicaciones directas sobre tu orden.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="terms-actions-row">
          <Link to="/tienda" className="btn-primary-luxury">
            Explorar el Catálogo →
          </Link>
          <Link to="/libro-de-reclamaciones" className="btn-outline-luxury">
            📖 Ir al Libro de Reclamaciones
          </Link>
        </div>
      </div>
    </div>
  )
}
