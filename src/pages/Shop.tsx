import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productApi, categoryApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import type { ProductSummary, Category } from '../types/models'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'condition-desc'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state from URL or defaults
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCats, setSelectedCats] = useState<number[]>(() => {
    const cat = searchParams.get('category')
    return cat ? [Number(cat)] : []
  })
  const [minCondition, setMinCondition] = useState(0)
  const [maxCondition, setMaxCondition] = useState(5)
  const [sex, setSex] = useState(searchParams.get('sex') || '')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [size, setSize] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [gridCols, setGridCols] = useState<'3' | '4'>('3')

  // Load Categories
  useEffect(() => {
    categoryApi.getAll().then(setCategories)
  }, [])

  // Sync URL params if user arrives via external link / search bar
  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null && qParam !== search) setSearch(qParam)

    const catParam = searchParams.get('category')
    if (catParam) {
      const catId = Number(catParam)
      if (!isNaN(catId)) {
        setSelectedCats([catId])
      } else if (categories.length > 0) {
        const found = categories.find(c => c.name.toLowerCase().includes(catParam.toLowerCase()))
        if (found) setSelectedCats([found.idCategory])
      }
    }
  }, [searchParams, categories])

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
      let result: ProductSummary[] = []
      if (!hasFilters) {
        result = await productApi.getAll()
      } else {
        result = await productApi.search(params as Parameters<typeof productApi.search>[0])
      }
      setProducts(result)
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
    setSearchParams({})
  }

  const hasFilters = Boolean(
    search || selectedCats.length || minCondition > 0 || maxCondition < 5 || sex || available !== null || size
  )

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...products]
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'condition-desc':
        return list.sort((a, b) => b.condition - a.condition)
      case 'newest':
      default:
        return list.sort((a, b) => b.idProduct - a.idProduct)
    }
  }, [products, sortBy])

  return (
    <div className="shop-page-wrapper">
      <div className="shop-main-container">
        {/* ─── Mobile Filter Trigger Button ─── */}
        <div className="shop-mobile-bar mobile-only">
          <button
            type="button"
            className="btn-open-filters"
            onClick={() => setMobileFilterOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filtros {hasFilters ? `(Activos)` : ''}</span>
          </button>

          <span className="mobile-product-count">{products.length} prendas</span>
        </div>

        {/* ─── Sidebar Filters ─── */}
        <aside className={`shop-sidebar-modern ${mobileFilterOpen ? 'mobile-drawer-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filtrar Catálogo</h3>
            {hasFilters && (
              <button type="button" className="btn-clear-inline" onClick={clearFilters}>
                Limpiar todo
              </button>
            )}
            <button
              type="button"
              className="sidebar-close-btn mobile-only"
              onClick={() => setMobileFilterOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Search Box */}
          <div className="filter-block">
            <label className="filter-title">Búsqueda rápida</label>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="filter-input-text"
                placeholder="Ej. Chaqueta, Denim, 90s..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="input-clear-btn" onClick={() => setSearch('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Accordion */}
          <div className="filter-block">
            <label className="filter-title">Categorías Principales</label>
            <div className="filter-checkbox-list">
              {categories.map(cat => {
                const isSelected = selectedCats.includes(cat.idCategory)
                return (
                  <label key={cat.idCategory} className={`filter-checkbox-row ${isSelected ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCat(cat.idCategory)}
                    />
                    <span className="checkbox-custom" />
                    <span className="cat-label-text">{cat.name}</span>
                    {cat.productCount > 0 && (
                      <span className="cat-count-badge">{cat.productCount}</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Condition Slider / Selector */}
          <div className="filter-block">
            <label className="filter-title">Nivel de Condición</label>
            <div className="condition-pills-row">
              {[0, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  className={`condition-pill ${minCondition === rating ? 'active' : ''}`}
                  onClick={() => setMinCondition(rating)}
                >
                  {rating === 0 ? 'Cualquiera' : `${rating}★ o más`}
                </button>
              ))}
            </div>
          </div>

          {/* Sex / Genre */}
          <div className="filter-block">
            <label className="filter-title">Silueta / Género</label>
            <div className="genre-pill-group">
              {[
                { val: '', label: 'Todas' },
                { val: 'UNISEX', label: '⚡ Unisex' },
                { val: 'HOMBRE', label: '♂ Hombre' },
                { val: 'MUJER', label: '♀ Mujer' },
              ].map(item => (
                <button
                  key={item.val}
                  type="button"
                  className={`genre-pill ${sex === item.val ? 'active' : ''}`}
                  onClick={() => setSex(item.val)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-block">
            <label className="filter-title">Talla</label>
            <div className="size-tags-row">
              {['', 'XS', 'S', 'M', 'L', 'XL', '32/32', '41'].map(sz => (
                <button
                  key={sz}
                  type="button"
                  className={`size-tag-btn ${size === sz ? 'active' : ''}`}
                  onClick={() => setSize(sz)}
                >
                  {sz === '' ? 'Todas' : sz}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Switch */}
          <div className="filter-block">
            <label className="filter-checkbox-row availability-row">
              <input
                type="checkbox"
                checked={available === true}
                onChange={e => setAvailable(e.target.checked ? true : null)}
              />
              <span className="checkbox-custom" />
              <span className="cat-label-text">Solo disponibles para entrega inmediata</span>
            </label>
          </div>

          {/* Mobile Apply Button */}
          <div className="mobile-apply-bar mobile-only">
            <button
              type="button"
              className="btn-primary-luxury full-width"
              onClick={() => setMobileFilterOpen(false)}
            >
              Ver {products.length} Prendas
            </button>
          </div>
        </aside>

        {/* ─── Product Listing Area ─── */}
        <main className="shop-catalog-area">
          {/* Top Bar with Sort & Active Filters */}
          <div className="catalog-toolbar">
            <div className="toolbar-left">
              <span className="results-counter">
                Mostrando <strong>{sortedProducts.length}</strong> piezas encontradas
              </span>
            </div>

            <div className="toolbar-right">
              {/* Sort Selector */}
              <div className="sort-selector-wrapper">
                <label htmlFor="sort-select">Ordenar por:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                >
                  <option value="newest">Más recientes</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="condition-desc">Mejor condición</option>
                </select>
              </div>

              {/* Grid Column Selector (Desktop) */}
              <div className="grid-toggle-desktop desktop-only">
                <button
                  type="button"
                  className={`grid-btn ${gridCols === '3' ? 'active' : ''}`}
                  onClick={() => setGridCols('3')}
                  title="Vista 3 columnas"
                >
                  ■■■
                </button>
                <button
                  type="button"
                  className={`grid-btn ${gridCols === '4' ? 'active' : ''}`}
                  onClick={() => setGridCols('4')}
                  title="Vista 4 columnas"
                >
                  ■■■■
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasFilters && (
            <div className="active-filters-strip">
              <span className="active-filters-label">Filtros:</span>
              {search && (
                <span className="filter-pill-badge">
                  Búsqueda: "{search}"
                  <button type="button" onClick={() => setSearch('')}>✕</button>
                </span>
              )}
              {selectedCats.map(catId => {
                const cat = categories.find(c => c.idCategory === catId)
                return (
                  <span key={catId} className="filter-pill-badge">
                    {cat?.name || 'Categoría'}
                    <button type="button" onClick={() => toggleCat(catId)}>✕</button>
                  </span>
                )
              })}
              {minCondition > 0 && (
                <span className="filter-pill-badge">
                  Min: {minCondition}★
                  <button type="button" onClick={() => setMinCondition(0)}>✕</button>
                </span>
              )}
              {sex && (
                <span className="filter-pill-badge">
                  {sex === 'M' ? 'Hombre' : sex === 'F' ? 'Mujer' : 'Unisex'}
                  <button type="button" onClick={() => setSex('')}>✕</button>
                </span>
              )}
              {size && (
                <span className="filter-pill-badge">
                  Talla: {size}
                  <button type="button" onClick={() => setSize('')}>✕</button>
                </span>
              )}
              {available !== null && (
                <span className="filter-pill-badge">
                  Solo Disponibles
                  <button type="button" onClick={() => setAvailable(null)}>✕</button>
                </span>
              )}
              <button type="button" className="btn-reset-filters" onClick={clearFilters}>
                Limpiar todo
              </button>
            </div>
          )}

          {/* Product Grid or States */}
          {loading ? (
            <div className={`products-grid-shop cols-${gridCols}`}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-product-card" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-shop-state">
              <div className="empty-icon">⚡</div>
              <h3>Próximo Drop en Preparación</h3>
              <p>Actualmente estamos preparando y clasificando las nuevas joyas del archivo. Muy pronto estarán disponibles en la tienda.</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="empty-shop-state">
              <div className="empty-icon">🔍</div>
              <h3>No encontramos prendas con esos filtros</h3>
              <p>Prueba ajustando los parámetros de búsqueda o explora todo el catálogo.</p>
              <button type="button" className="btn-primary-luxury" onClick={clearFilters}>
                <span>Restablecer Filtros</span>
              </button>
            </div>
          ) : (
            <div className={`products-grid-shop cols-${gridCols}`}>
              {sortedProducts.map(product => (
                <ProductCard key={product.idProduct} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
