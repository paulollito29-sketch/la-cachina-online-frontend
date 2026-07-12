import { useEffect, useState } from 'react'
import { productApi, categoryApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import type { ProductSummary, Category } from '../types/models'

export default function Shop() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCats, setSelectedCats] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoryApi.getAll().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    productApi.getAll(selectedCats.length ? selectedCats : undefined)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [selectedCats])

  const toggleCat = (id: number) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="shop-page">
      <aside className="shop-sidebar">
        <h3>Categorías</h3>
        <div className="filter-list">
          {categories.map(cat => (
            <label key={cat.idCategory} className="filter-item">
              <input
                type="checkbox"
                checked={selectedCats.includes(cat.idCategory)}
                onChange={() => toggleCat(cat.idCategory)}
              />
              <span>{cat.name}</span>
              <span className="filter-count">({cat.productCount})</span>
            </label>
          ))}
        </div>
        {selectedCats.length > 0 && (
          <button className="btn-clear" onClick={() => setSelectedCats([])}>
            Limpiar filtros
          </button>
        )}
      </aside>

      <div className="shop-content">
        <div className="shop-header">
          <h2>Tienda</h2>
          <span className="shop-count">{products.length} productos</span>
        </div>
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : products.length === 0 ? (
          <div className="empty">No hay productos en esta categoría</div>
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <ProductCard key={p.idProduct} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
