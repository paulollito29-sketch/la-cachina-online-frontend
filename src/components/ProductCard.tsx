import { Link } from 'react-router-dom'
import type { ProductSummary } from '../types/models'

export default function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link to={`/producto/${product.idProduct}`} className="product-card">
      <div className="product-card-image">
        <img
          src={product.imageUrl || `https://picsum.photos/seed/${product.idProduct}/400/500`}
          alt={product.name}
          loading="lazy"
        />
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.categoryName}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-meta">
          <span className="product-card-size">{product.size}</span>
          <span className="product-card-condition">
            {'★'.repeat(product.condition)}{'☆'.repeat(5 - product.condition)}
          </span>
        </div>
        <span className="product-card-price">S/ {product.price.toFixed(2)}</span>
      </div>
    </Link>
  )
}
