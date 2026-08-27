import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import type { ProductSummary } from '../types/models'

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([])
  const [activeDropCategory, setActiveDropCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productApi.getAll()
      .then(prods => setFeaturedProducts(prods))
      .catch(() => setFeaturedProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const displayedDrops = activeDropCategory
    ? featuredProducts.filter(p => p.categoryId === activeDropCategory)
    : featuredProducts.slice(0, 8)

  const categoriesPreview = [
    {
      id: 1,
      title: 'Casacas & Cortavientos',
      tag: 'Cuero, Polar & Bombers 90s',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 2,
      title: 'Jeans & Levi\'s 501',
      tag: 'Denim Pesado & Cortes Baggy',
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 3,
      title: 'Polos Gráficos & Band Tees',
      tag: 'Rock, Hip Hop 90s & Skate',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 4,
      title: 'Camisas & Sedas Retro',
      tag: 'Sedas Puras, Flores & Franela',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    },
  ]

  return (
    <div className="landing-page-modern">
      {/* ─── 1. EDITORIAL HERO SECTION ─── */}
      <section className="hero-section-modern">
        <div className="hero-content-inner">
          <div className="hero-badge-pill">
            <span className="sparkle">✦</span>
            <span>LA CACHINA ONLINE · EL POINT VINTAGE DEL PERÚ</span>
          </div>

          <h1 className="hero-headline">
            La Cachina, <br />
            <em>ahora en digital.</em>
          </h1>

          <p className="hero-subheading">
            Tesoros vintage, prendas de archivo y moda circular auténtica. Rescatamos las mejores piezas de segunda mano para que encuentres tu estilo con esquina y carácter.
          </p>

          <div className="hero-cta-group">
            <Link to="/tienda" className="btn-primary-luxury">
              <span>Explorar el Mercado</span>
              <span className="icon">→</span>
            </Link>
          </div>

          <div className="hero-trust-metrics">
            <div className="metric-item">
              <span className="metric-number">100%</span>
              <span className="metric-label">Piezas Únicas</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">★ 4.9</span>
              <span className="metric-label">Curaduría de Estado</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">24h</span>
              <span className="metric-label">Envíos Lima & Shalom</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. CATEGORY EDITORIAL CARDS ─── */}
      <section className="section-categories-modern">
        <div className="section-header-modern">
          <div>
            <span className="section-eyebrow">✦ ELIGE TU ESTILO</span>
            <h2 className="section-title-modern">Colecciones de Archivo</h2>
          </div>
          <Link to="/tienda" className="view-all-link desktop-only">
            Ver todas las categorías →
          </Link>
        </div>

        <div className="category-cards-grid">
          {categoriesPreview.map(cat => (
            <Link
              key={cat.id}
              to={`/tienda?category=${cat.id}`}
              className="category-card-modern"
              style={{ backgroundImage: `url(${cat.image})` }}
            >
              <div className="category-card-overlay" />
              <div className="category-card-content">
                <span className="cat-tag">{cat.tag}</span>
                <h3 className="cat-title">{cat.title}</h3>
                <span className="cat-explore-btn">Explorar piezas →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 3. WEEKLY DROPS / CURATED SELECTION ─── */}
      <section className="section-drops-modern">
        <div className="section-header-modern">
          <div>
            <span className="section-eyebrow">✦ JOYAS RECIÉN LLEGADAS</span>
            <h2 className="section-title-modern">Drops de la Semana</h2>
          </div>

          {/* Quick Drop Category Filters */}
          <div className="drop-filter-tabs">
            <button
              type="button"
              className={`drop-tab-btn ${activeDropCategory === null ? 'active' : ''}`}
              onClick={() => setActiveDropCategory(null)}
            >
              Todos
            </button>
            <button
              type="button"
              className={`drop-tab-btn ${activeDropCategory === 1 ? 'active' : ''}`}
              onClick={() => setActiveDropCategory(1)}
            >
              Casacas
            </button>
            <button
              type="button"
              className={`drop-tab-btn ${activeDropCategory === 2 ? 'active' : ''}`}
              onClick={() => setActiveDropCategory(2)}
            >
              Jeans 501
            </button>
            <button
              type="button"
              className={`drop-tab-btn ${activeDropCategory === 3 ? 'active' : ''}`}
              onClick={() => setActiveDropCategory(3)}
            >
              Band Tees
            </button>
          </div>
        </div>

        {loading ? (
          <div className="products-grid-modern">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-product-card" />
            ))}
          </div>
        ) : displayedDrops.length > 0 ? (
          <div className="products-grid-modern">
            {displayedDrops.map(product => (
              <ProductCard key={product.idProduct} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-drop-state-card">
            <span className="empty-drop-icon">📦</span>
            <h3>Próximo Drop en Preparación</h3>
            <p>Nuestro equipo de cazadores de tesoros está preparando el próximo lanzamiento de archivo vintage.</p>
            <Link to="/admin" className="btn-outline-luxury small">
              <span>Publicar prendas desde el panel Admin</span>
              <span className="icon">→</span>
            </Link>
          </div>
        )}

        {featuredProducts.length > 0 && (
          <div className="section-footer-centered">
            <Link to="/tienda" className="btn-primary-luxury large">
              <span>Ver Todo el Inventario ({featuredProducts.length} Prendas)</span>
              <span className="icon">→</span>
            </Link>
          </div>
        )}
      </section>

      {/* ─── 4. INTERSTITIAL MANIFESTO ─── */}
      <section className="section-interstitial" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80)` }}>
        <div className="interstitial-overlay" />
        <div className="interstitial-card">
          <span className="interstitial-badge">✦ MANIFIESTO CACHINERO</span>
          <h2>El arte de rescatar lo auténtico</h2>
          <p>
            En La Cachina Online creemos que la mejor prenda ya fue fabricada. Buscamos prenda por prenda en mercadillos y archivos históricos del Perú para traerte joyas con historia, pátina real y calidad que ya no se fabrica.
          </p>
          <div className="interstitial-features">
            <div className="int-feature">
              <span className="int-feature-num">01</span>
              <div>
                <strong>Cero Fast-Fashion</strong>
                <p>Prendas confeccionadas con materiales de calidad superior hechos para durar décadas.</p>
              </div>
            </div>
            <div className="int-feature">
              <span className="int-feature-num">02</span>
              <div>
                <strong>Lavado & Desinfección Profesional</strong>
                <p>Cada pieza pasa por un proceso de higienización y restauración antes de salir a la venta.</p>
              </div>
            </div>
            <div className="int-feature">
              <span className="int-feature-num">03</span>
              <div>
                <strong>Economía Circular Peruana</strong>
                <p>Reducimos el impacto ambiental y fomentamos el consumo consciente y local.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. HOW IT WORKS ─── */}
      <section className="section-how-it-works">
        <div className="section-header-centered">
          <span className="section-eyebrow">✦ EXPERIENCIA LA CACHINA</span>
          <h2 className="section-title-modern">¿Cómo Funciona?</h2>
        </div>

        <div className="steps-cards-modern">
          <div className="step-card-modern">
            <div className="step-badge-number">01</div>
            <div className="step-icon-modern">🔍</div>
            <h3>Curaduría de Archivo</h3>
            <p>Seleccionamos lotes vintage por época, estado de conservación, autenticidad y corte de silueta.</p>
          </div>

          <div className="step-card-modern">
            <div className="step-badge-number">02</div>
            <div className="step-icon-modern">✨</div>
            <h3>Inspección & Sanitizado</h3>
            <p>Evaluamos costuras, cierres y tejidos. Asignamos una calificación de 1 a 5 estrellas con total transparencia.</p>
          </div>

          <div className="step-card-modern">
            <div className="step-badge-number">03</div>
            <div className="step-icon-modern">📦</div>
            <h3>Envío Seguro a tu Puerta</h3>
            <p>Empaque ecológico biodegradable. Envíos express a Lima en 24h y a provincias vía Shalom / Olva.</p>
          </div>
        </div>
      </section>

      {/* ─── 6. REVIEWS & COMMUNITY ─── */}
      <section className="section-reviews">
        <div className="section-header-centered">
          <span className="section-eyebrow">✦ COMUNIDAD CACHINERA</span>
          <h2 className="section-title-modern">Lo que dicen los coleccionistas</h2>
        </div>

        <div className="reviews-grid">
          <div className="review-card-modern">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "Encontré una casaca de cuero 80s idéntica a la que buscaba hace años. Llegó impecable y sanitizada en menos de 24 horas a Miraflores."
            </p>
            <div className="review-footer">
              <strong className="review-author-name">Mateo Z. <span className="review-author-city">· Miraflores, Lima</span></strong>
              <span className="review-item-tag">Compró: Casaca Aviador 1980s</span>
            </div>
          </div>

          <div className="review-card-modern">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "Los Levi's 501 son 100% originales Made in USA con un desvanecimiento increíble. La mejor tienda vintage online del Perú sin duda."
            </p>
            <div className="review-footer">
              <strong className="review-author-name">Valeria M. <span className="review-author-city">· Barranco, Lima</span></strong>
              <span className="review-item-tag">Compró: Levi's 501 Selvedge</span>
            </div>
          </div>

          <div className="review-card-modern">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "El polo de Nirvana In Utero es una joya. Se nota que cada prenda tiene una historia y está seleccionada con muchísimo criterio."
            </p>
            <div className="review-footer">
              <strong className="review-author-name">Rodrigo S. <span className="review-author-city">· Arequipa</span></strong>
              <span className="review-item-tag">Compró: Band Tee Nirvana 1993</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. SELL YOUR PIECES BANNER ─── */}
      <section className="section-sell-banner">
        <div className="sell-banner-box">
          <div className="sell-banner-content">
            <span className="sell-eyebrow">✦ VENDE EN LA CACHINA</span>
            <h2>¿Tienes ropa vintage o de archivo guardada?</h2>
            <p>
              Compramos lotes de prendas retro, casacas de cuero, camisetas gráficas y reliquias en buen estado. Dale una segunda vida a tu ropa y gana dinero al instante.
            </p>
            <a
              href="https://wa.me/51999888777?text=Hola%20La%20Cachina%20Online,%20quiero%20vender%20prendas%20vintage"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-luxury"
            >
              <span>Vender con Nosotros vía WhatsApp</span>
              <span className="icon">💬</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
