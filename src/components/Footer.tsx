import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="footer-modern">
      {/* ─── VIP Newsletter Drop Alert ─── */}
      <section className="footer-newsletter-banner">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <span className="newsletter-eyebrow">✦ CLUB LA CACHINA · DROPS EXCLUSIVOS</span>
            <h3>Entérate antes que nadie de las nuevas joyas vintage</h3>
            <p>Suscríbete y recibe el catálogo de drops semanales 30 minutos antes de su publicación general.</p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            {subscribed ? (
              <div className="subscribed-success">
                <span>✓ ¡Te uniste al Club La Cachina! Revisa tu bandeja para el próximo drop.</span>
              </div>
            ) : (
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Ingresa tu correo electrónico..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-subscribe">
                  Unirme
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ─── Main Footer Links ─── */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand & Manifesto */}
          <div className="footer-col brand-col">
            <div className="footer-brand-header">
              <div className="brand-monogram small">
                <span className="monogram-text">LC</span>
              </div>
              <span className="footer-brand-name">LA CACHINA ONLINE</span>
            </div>
            <p className="footer-brand-desc">
              El point digital de moda circular y piezas de archivo del Perú. Rescatamos y curamos prendas únicas, casacas retro y reliquias de segunda mano listas para tu clóset.
            </p>
            <div className="footer-badges">
              <span className="trust-pill">🛡️ 100% Auténtico</span>
              <span className="trust-pill">🧼 Lavado & Sanitizado</span>
              <span className="trust-pill">🇵🇪 Hecho en Perú</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">El Mercado</h4>
            <ul className="footer-list">
              <li><Link to="/tienda">Ver Catálogo Completo</Link></li>
              <li><Link to="/tienda?category=1">Casacas & Cortavientos</Link></li>
              <li><Link to="/tienda?category=2">Jeans & Levi's 501</Link></li>
              <li><Link to="/tienda?category=3">Band Tees & Polos 90s</Link></li>
              <li><Link to="/tienda?category=4">Camisas & Sedas</Link></li>
            </ul>
          </div>

          {/* Customer Service & Guarantees */}
          <div className="footer-col">
            <h4 className="footer-heading">Atención al Cliente</h4>
            <ul className="footer-list">
              <li><Link to="/tienda">Cómo Comprar en La Cachina</Link></li>
              <li><Link to="/tienda">Guía de Tallas & Medidas</Link></li>
              <li><Link to="/tienda">Envíos Lima & Shalom Provincias</Link></li>
              <li><Link to="/tienda">Políticas de Devolución</Link></li>
              <li><Link to="/tienda">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Contact & Points */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contacto & Point</h4>
            <div className="footer-contact-item">
              <strong>Showroom & Pick-up:</strong>
              <span>Miraflores / Barranco, Lima - Perú</span>
            </div>
            <div className="footer-contact-item">
              <strong>Email de atención:</strong>
              <span>hola@lacachinaonline.pe</span>
            </div>
            <div className="footer-contact-item">
              <strong>Horario de atención:</strong>
              <span>Lun a Sáb: 10:00 AM – 8:00 PM</span>
            </div>

            <div className="footer-social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-pill">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-pill">TikTok</a>
              <a href="https://wa.me/51999888777" target="_blank" rel="noopener noreferrer" className="social-pill">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Copyright & Payment Badges ─── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} La Cachina Online (LC). Todos los derechos reservados. Moda Circular Peruana.</p>
          <div className="payment-badges-row">
            <span className="payment-badge">Yape</span>
            <span className="payment-badge">Plin</span>
            <span className="payment-badge">BCP</span>
            <span className="payment-badge">Interbank</span>
            <span className="payment-badge">BBVA</span>
            <span className="payment-badge">Tarjetas Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
