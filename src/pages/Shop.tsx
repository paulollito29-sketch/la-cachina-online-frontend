import { useEffect, useState, useCallback } from 'react'
import { productApi, categoryApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import type { ProductSummary, Category } from '../types/models'

export default function Shop() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedCats, setSelectedCats] = useState<number[]>([])
  const [minCondition, setMinCondition] = useState(0)
  const [maxCondition, setMaxCondition] = useState(5)
  const [sex, setSex] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [size, setSize] = useState('')

  useEffect(() => {
    categoryApi.getAll().then(setCategories)
  }, [])

  const doSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      if (search.trim()) params.q = search.trim()
      if (selectedCats.length) params.category = selectedCats
      if (minCondition > 0) params.minCondition = minCondition
      if (maxCondition < 5) params.maxCondition = maxCondition
      if (sex) params.sex = sex
      if (available !== null) params.available = available
      if (size) params.size = size

      const hasFilters = Object.keys(params).length > 0
      if (!hasFilters) {
        const result = await productApi.getAll()
        setProducts(result)
      } else {
        const result = await productApi.search(params as Parameters<typeof productApi.search>[0])
        setProducts(result)
      }
    } finally {
      setLoading(false)
    }
  }, [search, selectedCats, minCondition, maxCondition, sex, available, size])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  const toggleCat = (id: number) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCats([])
    setMinCondition(0)
    setMaxCondition(5)
    setSex('')
    setAvailable(null)
    setSize('')
  }

  const hasFilters = search || selectedCats.length || minCondition > 0 || maxCondition < 5 || sex || available !== null || size

  return (
    <div className="shop-page">
      <aside className="shop-sidebar">
        <h3>Filtros</h3>

        <div className="filter-group">
          <label className="filter-label">Búsqueda</label>
          <input
            type="text"
            className="filter-search"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Categorías</label>
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
        </div>

        <div className="filter-group">
          <label className="filter-label">Estado</label>
          <div className="filter-range">
            <span>Min:</span>
            <select value={minCondition} onChange={e => setMinCondition(Number(e.target.value))}>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'Cualquiera' : '★'.repeat(n)}</option>)}
            </select>
            <span>Máx:</span>
            <select value={maxCondition} onChange={e => setMaxCondition(Number(e.target.value))}>
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'Cualquiera' : '★'.repeat(n)}</option>)}
            </select>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sexo</label>
          <div className="filter-list filter-row">
            {[
              { value: '', label: 'Todos' },
              { value: 'F', label: '♀ Mujer' },
              { value: 'M', label: '♂ Hombre' },
              { value: 'U', label: '⚤ Unisex' },
            ].map(opt => (
              <label key={opt.value} className="filter-item filter-radio">
                <input
                  type="radio"
                  name="sex"
                  checked={sex === opt.value}
                  onChange={() => setSex(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Disponibilidad</label>
          <div className="filter-list filter-row">
            {[
              { value: null, label: 'Todos' },
              { value: true, label: 'Disponible' },
              { value: false, label: 'No disponible' },
            ].map(opt => (
              <label key={String(opt.value)} className="filter-item filter-radio">
                <input
                  type="radio"
                  name="available"
                  checked={available === opt.value}
                  onChange={() => setAvailable(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Talla</label>
          <input
            type="text"
            className="filter-search"
            placeholder="Ej: M, L, 38..."
            value={size}
            onChange={e => setSize(e.target.value)}
          />
        </div>

        {hasFilters && (
          <button className="btn-clear" onClick={clearFilters}>
            Limpiar todos los filtros
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
          <div className="empty">No hay productos con esos filtros</div>
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
