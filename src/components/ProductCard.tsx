import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import { useToast } from './ToastContext'
import type { ProductSummary } from '../types/models'

const sexLabel: Record<string, string> = { M: 'Hombre', F: 'Mujer', U: 'Unisex' }

const conditionText: Record<number, string> = {
  5: '5/5 Impecable',
  4: '4/5 Excelente',
  3: '3/5 Muy Bueno',
  2: '2/5 Buen Estado',
  1: '1/5 Con Historia',
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    showToast('Prenda agregada al carrito', `${product.name} (S/ ${product.price.toFixed(2)})`)
  }

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    if (!isLiked) {
      showToast('Guardado en favoritos', product.name, 'info')
    }
  }

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80']

  const primaryImage = images[0]
  const hoverImage = images.length > 1 ? images[1] : primaryImage
  const currentImage = (isHovered && images.length > 1) ? hoverImage : primaryImage

  return (
    <div className="product-card-container">
      <Link
        to={`/producto/${product.idProduct}`}
        className="product-card-modern"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Image Container */}
        <div className="product-card-media">
          {/* Top Badges */}
          <div className="product-badges-top">
            <span className="badge-condition">
              <span className="star-icon">★</span> {conditionText[product.condition] || `${product.condition}/5`}
            </span>
            {!product.available && (
              <span className="badge-sold">Agotado</span>
            )}
            {images.length > 1 && (
              <span className="badge-multi-photo" title={`${images.length} fotos disponibles`}>
                📷 {images.length}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            className={`btn-favorite ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            aria-label="Guardar en favoritos"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'var(--accent-rust)' : 'none'} stroke={isLiked ? 'var(--accent-rust)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Main Product Image with Smooth Transition on Multi-Image */}
          <img
            src={currentImage}
            alt={product.name}
            loading="lazy"
            className="product-image-element"
          />

          {/* Quick Action Overlay on Hover */}
          <div className="product-hover-overlay">
            <button
              type="button"
              className="btn-quick-add"
              onClick={handleQuickAdd}
              disabled={!product.available}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>{product.available ? 'Añadir Rápido' : 'No Disponible'}</span>
            </button>
          </div>
        </div>

        {/* Card Info Body */}
        <div className="product-card-details">
          <div className="product-category-row">
            <span className="product-category-label">{product.categoryName}</span>
            <span className="product-spec-pill">
              {product.size} · {sexLabel[product.sex] || product.sex}
            </span>
          </div>

          <h3 className="product-title">{product.name}</h3>

          <div className="product-pricing-row">
            <div className="price-tag">
              <span className="currency">S/</span>
              <span className="amount">{product.price.toFixed(2)}</span>
            </div>
            <span className="tag-unique-piece">Pieza Única</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
