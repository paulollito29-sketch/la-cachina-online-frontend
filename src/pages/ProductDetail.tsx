import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'
import ProductCard from '../components/ProductCard'
import type { ProductDetail, ProductSummary } from '../types/models'

const conditionDescriptions: Record<number, { title: string; desc: string }> = {
  5: { title: 'Impecable / Como Nueva', desc: 'Prenda sin desgastes perceptibles, tejido íntegro, colores vivos y costuras originales perfectas.' },
  4: { title: 'Excelente / Vintage A+', desc: 'Mínimas señales de uso normales por el paso del tiempo. Excelente conservación estética y estructural.' },
  3: { title: 'Muy Bueno / Vintage Clásico', desc: 'Pátina auténtica con carácter. Sin roturas ni defectos funcionales.' },
  2: { title: 'Buen Estado / Con Historia', desc: 'Leves marcas de desgaste natural que realzan su valor retro.' },
  1: { title: 'Para Colección / Rework', desc: 'Prenda con marcado desgaste de archivo histórico.' },
}

const sexLabel: Record<string, string> = {
  M: 'Hombre',
  HOMBRE: 'Hombre',
  F: 'Mujer',
  MUJER: 'Mujer',
  U: 'Unisex',
  UNISEX: 'Unisex',
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [related, setRelated] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const { addItem, items } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setActiveImageIndex(0)
    productApi.getOne(Number(id))
      .then(prod => {
        setProduct(prod)
        productApi.getAll([prod.categoryId]).then(allInCat => {
          setRelated(allInCat.filter(p => p.idProduct !== prod.idProduct).slice(0, 3))
        })
      })
      .catch(() => {
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="detail-loading-skeleton" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-center">
        <div className="empty-state-box">
          <h2>Pieza no encontrada</h2>
          <p>Es posible que esta prenda única ya haya sido adquirida.</p>
          <Link to="/tienda" className="btn-primary-luxury">
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </div>
    )
  }

  const galleryImages: string[] = (product.images && product.images.length > 0)
    ? product.images.slice(0, 5)
    : [product.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80']

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0]
  const inCart = items.find(i => i.product.idProduct === product.idProduct)

  const handlePrevImage = () => {
    setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  const handleAddToCart = () => {
    addItem({
      idProduct: product.idProduct,
      name: product.name,
      price: product.price,
      size: product.size,
      condition: product.condition,
      imageUrl: product.imageUrl || galleryImages[0],
      images: galleryImages,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      available: product.available,
      sex: product.sex,
    })
    showToast('¡Prenda agregada al carrito!', `${product.name} lista para compra`, 'success')
  }

  const handleBuyNow = () => {
    if (!inCart) {
      addItem({
        idProduct: product.idProduct,
        name: product.name,
        price: product.price,
        size: product.size,
        condition: product.condition,
        imageUrl: product.imageUrl || galleryImages[0],
        images: galleryImages,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        available: product.available,
        sex: product.sex,
      })
    }
    navigate('/carrito')
  }

  const cond = conditionDescriptions[product.condition] || conditionDescriptions[5]

  return (
    <div className="product-detail-wrapper">
      {/* Breadcrumbs */}
      <div className="detail-breadcrumbs">
        <Link to="/">Inicio</Link>
        <span className="sep">/</span>
        <Link to="/tienda">Tienda</Link>
        <span className="sep">/</span>
        <Link to={`/tienda?category=${product.categoryId}`}>{product.categoryName}</Link>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* ─── Left: Multi-Image Gallery ─── */}
        <div className="product-gallery-section">
          <div className="main-image-container">
            <span className="exclusive-badge">⚡ PRENDA ÚNICA EN STOCK</span>
            
            {galleryImages.length > 1 && (
              <span className="gallery-counter-badge">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            )}

            <img
              src={activeImage}
              alt={`${product.name} - Vista ${activeImageIndex + 1}`}
              className="main-gallery-img"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
              }}
            />

            {/* Next / Prev Navigation Controls */}
            {galleryImages.length > 1 && (
              <div className="gallery-arrows-container">
                <button
                  type="button"
                  className="gallery-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="gallery-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Foto siguiente"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails Strip (Up to 5 images) */}
          {galleryImages.length > 1 && (
            <div className="gallery-thumbnails-strip">
              {galleryImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img
                    src={thumbUrl}
                    alt={`Miniatura ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          
          <div className="gallery-trust-pills">
            <div className="trust-pill-item">
              <span>🛡️ Autenticidad Garantizada</span>
            </div>
            <div className="trust-pill-item">
              <span>🧼 Sanitizado Profesional</span>
            </div>
            <div className="trust-pill-item">
              <span>🚚 Envíos a todo el Perú</span>
            </div>
          </div>
        </div>

        {/* ─── Right: Product Spec & Action Area ─── */}
        <div className="product-info-section">
          <div className="product-header-info">
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              {(product as any).categories && (product as any).categories.length > 0 ? (
                (product as any).categories.map((catName: string, cIdx: number) => (
                  <span key={cIdx} className="category-tag-luxury">{catName}</span>
                ))
              ) : (
                <span className="category-tag-luxury">{product.categoryName}</span>
              )}
              <span className="category-tag-luxury" style={{ background: 'rgba(210, 248, 11, 0.15)', color: 'var(--brand-volt)' }}>
                {sexLabel[product.sex] || product.sex}
              </span>
            </div>
            <h1 className="detail-product-title">{product.name}</h1>

            <div className="detail-price-box">
              <span className="detail-currency">S/</span>
              <span className="detail-price">{product.price.toFixed(2)}</span>
              <span className="vat-included">Impuestos incluidos · Envío calculado al checkout</span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="specs-card-modern">
            <div className="spec-row">
              <span className="spec-label">Talla declarada:</span>
              <div className="spec-value-group">
                <span className="spec-badge-size">{product.size || 'Única'}</span>
                <button
                  type="button"
                  className="btn-size-guide"
                  onClick={() => setShowSizeModal(true)}
                >
                  📐 Ver guía de medidas
                </button>
              </div>
            </div>

            <div className="spec-row">
              <span className="spec-label">Silueta / Corte:</span>
              <span className="spec-value">{product.sex === 'M' ? 'Hombre / Regular' : product.sex === 'F' ? 'Mujer / Regular' : 'Unisex / Relajado'}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Disponibilidad:</span>
              <span className={`spec-stock ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                {product.available ? '● Disponible (1 en existencia)' : '○ No disponible'}
              </span>
            </div>
          </div>

          {/* Condition Inspection Report */}
          <div className="condition-report-box">
            <div className="condition-header">
              <span className="condition-title-tag">INFORME DE CONDICIÓN</span>
              <span className="condition-stars-pill">
                {'★'.repeat(product.condition)}{'☆'.repeat(5 - product.condition)} {product.condition}/5
              </span>
            </div>
            <h4 className="condition-verdict">{cond.title}</h4>
            <p className="condition-detail-text">{cond.desc}</p>
            <div className="inspection-checklist">
              <span>✓ Costuras originales verificadas</span>
              <span>✓ Botones y cierres operativos</span>
              <span>✓ Sin manchas estructurales</span>
            </div>
          </div>

          {/* Product Story Description */}
          {product.description && (
            <div className="product-story-box">
              <h3>Descripción & Detalles</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Eco Impact Banner */}
          <div className="eco-impact-card">
            <span className="eco-icon">🌱</span>
            <div className="eco-text">
              <strong>Impacto Circular Positivo</strong>
              <p>Al comprar esta prenda de segunda mano, evitas el consumo de aprox. 2,700 litros de agua nueva y reduces 3.5 kg de CO2.</p>
            </div>
          </div>

          {/* Strict Sales Policy Notice */}
          <div className="product-policy-notice-box">
            <div className="policy-item-row">
              <span className="policy-icon">🛡️</span>
              <div>
                <strong>Pieza Única de Archivo (1 de 1)</strong>
                <p>Prenda original autenticada y sanitizada profesionalmente.</p>
              </div>
            </div>
            <div className="policy-item-row">
              <span className="policy-icon">🚫</span>
              <div>
                <strong>Política de Venta Final (Sin Cambios ni Devoluciones)</strong>
                <p>Todas las ventas son finales al tratarse de prendas vintage exclusivas irrepetibles.</p>
              </div>
            </div>
            <div className="policy-item-row">
              <span className="policy-icon">🇵🇪</span>
              <div>
                <strong>Envíos a Todo el Perú</strong>
                <p>Lima Express 24-48h y Provincias por Olva Courier / Shalom con tracking.</p>
              </div>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="detail-action-buttons">
            <button
              type="button"
              className="btn-primary-luxury btn-detail-add"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              <span>{inCart ? `Agregar otra unidad (${inCart.quantity} en carrito)` : 'Añadir al Carrito'}</span>
              <span className="icon">🛍️</span>
            </button>

            <button
              type="button"
              className="btn-outline-luxury btn-detail-buy"
              onClick={handleBuyNow}
              disabled={!product.available}
            >
              <span>Comprar Ahora</span>
              <span className="icon">⚡</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Size Guide Modal ─── */}
      {showSizeModal && (
        <div className="modal-backdrop" onClick={() => setShowSizeModal(false)}>
          <div className="modal-content-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Guía de Medidas Vintage</h3>
              <button type="button" className="modal-close" onClick={() => setShowSizeModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Las tallas de prendas vintage pueden variar respecto a las marcas modernas. Recomendamos comparar con una prenda similar de tu armario:</p>
              <table className="size-table">
                <thead>
                  <tr>
                    <th>Talla Etiqueta</th>
                    <th>Ancho Pecho</th>
                    <th>Largo Total</th>
                    <th>Hombros</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>S</strong></td>
                    <td>50 - 52 cm</td>
                    <td>66 - 68 cm</td>
                    <td>44 cm</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong></td>
                    <td>54 - 56 cm</td>
                    <td>70 - 72 cm</td>
                    <td>47 cm</td>
                  </tr>
                  <tr>
                    <td><strong>L</strong></td>
                    <td>58 - 60 cm</td>
                    <td>74 - 76 cm</td>
                    <td>50 cm</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong></td>
                    <td>62 - 65 cm</td>
                    <td>77 - 80 cm</td>
                    <td>53 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Related Products ─── */}
      {related.length > 0 && (
        <section className="detail-related-section">
          <div className="section-header-centered">
            <span className="section-eyebrow">✦ COMPLETA EL LOOK</span>
            <h2 className="section-title-modern">Otras piezas similares</h2>
          </div>
          <div className="products-grid-modern">
            {related.map(p => (
              <ProductCard key={p.idProduct} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
