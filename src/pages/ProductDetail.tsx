import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCart } from '../components/CartContext'
import type { ProductDetail } from '../types/models'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { addItem, items } = useCart()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productApi.getOne(Number(id))
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-center"><div className="loading">Cargando...</div></div>
  if (!product) return <div className="page-center"><div className="empty">Producto no encontrado</div></div>

  const inCart = items.find(i => i.product.idProduct === product.idProduct)

  return (
    <div className="product-detail-page">
      <div className="product-detail-image">
        <img
          src={product.imageUrl || `https://picsum.photos/seed/${product.idProduct}/600/700`}
          alt={product.name}
        />
      </div>
      <div className="product-detail-info">
        <Link to="/tienda" className="back-link">&larr; Volver a tienda</Link>
        <span className="product-detail-category">{product.categoryName}</span>
        <h1>{product.name}</h1>
        <p className="product-detail-price">S/ {product.price.toFixed(2)}</p>
        <div className="product-detail-meta">
          <div className="meta-item">
            <strong>Talla:</strong> {product.size || 'Única'}
          </div>
          <div className="meta-item">
            <strong>Estado:</strong>
            <span className="stars">
              {'★'.repeat(product.condition)}{'☆'.repeat(5 - product.condition)}
            </span>
            <span className="condition-label">
              {product.condition === 5 ? 'Perfecto' :
               product.condition === 4 ? 'Muy bueno' :
               product.condition === 3 ? 'Bueno' :
               product.condition === 2 ? 'Aceptable' : 'Con señales de uso'}
            </span>
          </div>
        </div>
        {product.description && (
          <p className="product-detail-desc">{product.description}</p>
        )}
        <button
          className="btn-primary btn-add-cart"
          onClick={() => addItem({
            idProduct: product.idProduct,
            name: product.name,
            price: product.price,
            size: product.size,
            condition: product.condition,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
            categoryName: product.categoryName,
          })}
        >
          {inCart ? `Agregar otro (${inCart.quantity} en carrito)` : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
