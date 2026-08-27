import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { categoryApi, productApi, customerApi, saleApi, claimApi, userApi } from '../services/api'
import type { Category, ProductSummary, ProductCreate, ClaimResponse, AppUser } from '../types/models'

type Tab = 'dashboard' | 'products' | 'categories' | 'claims' | 'users'

const emptyProduct: ProductCreate = {
  name: '', description: '', price: 0, size: 'M', condition: 4,
  imageUrl: '', images: [], categoryId: 1, available: true, sex: 'U',
}

interface DashboardStats {
  products: number
  categories: number
  sales: number
  customers: number
  revenue: number
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/')
  }, [user, navigate])

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="admin-page-modern">
      <div className="admin-header-bar">
        <div className="admin-header-title">
          <div className="brand-monogram small">
            <span className="monogram-text">LC</span>
          </div>
          <div>
            <h1>Panel de Administración</h1>
            <p>Control de inventario, archivo de piezas, Libro de Reclamaciones y métricas</p>
          </div>
        </div>

        <nav className="admin-nav-tabs">
          <button className={`admin-tab-btn ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`admin-tab-btn ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            🏷️ Productos
          </button>
          <button className={`admin-tab-btn ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>
            📂 Categorías
          </button>
          <button className={`admin-tab-btn ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
            📖 Reclamaciones INDECOPI
          </button>
          <button className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            👥 Usuarios & Roles
          </button>
        </nav>
      </div>

      <div className="admin-tab-content">
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'products' && <AdminProducts />}
        {tab === 'categories' && <AdminCategories />}
        {tab === 'claims' && <AdminClaims />}
        {tab === 'users' && <AdminUsers />}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, categories: 0, sales: 0, customers: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      saleApi.getAll(),
      customerApi.getAll(),
    ])
      .then(([prods, cats, sales, customers]) => {
        const rev = sales.reduce((acc, s) => acc + (s.total || s.subTotal || 0), 0)
        setStats({
          products: prods.length,
          categories: cats.length,
          sales: sales.length,
          customers: customers.length,
          revenue: rev,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Cargando métricas del sistema...</div>

  const metricCards = [
    { title: 'Prendas en Archivo', value: stats.products, icon: '👕', badge: 'Catálogo activo' },
    { title: 'Categorías Activas', value: stats.categories, icon: '📂', badge: `${stats.categories} colecciones` },
    { title: 'Ventas Registradas', value: stats.sales, icon: '🧾', badge: '100% verificado' },
    { title: 'Ingresos Totales', value: `S/ ${stats.revenue.toFixed(2)}`, icon: '💰', badge: 'Moda circular' },
  ]

  return (
    <div className="admin-dashboard-view">
      <div className="admin-stats-grid">
        {metricCards.map((card, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="stat-card-header">
              <span className="stat-card-icon">{card.icon}</span>
              <span className="stat-badge">{card.badge}</span>
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-title">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="admin-quick-summary-box">
        <h3>✦ Gestión de Inventario & Galería de Imágenes</h3>
        <p>
          Ahora puedes subir hasta <strong>5 imágenes por prenda</strong> tanto mediante <strong>subida de archivos locales</strong> como mediante <strong>enlaces URL</strong>. La primera imagen actuará como portada principal en el catálogo.
        </p>
      </div>
    </div>
  )
}

function AdminProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductCreate>(emptyProduct)
  const [imageList, setImageList] = useState<string[]>([])
  const [inputUrl, setInputUrl] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const load = () => {
    Promise.all([productApi.getAll(), categoryApi.getAll()]).then(([p, c]) => {
      setProducts(p)
      setCategories(c)
    })
  }

  useEffect(() => { load() }, [])

  // Sync imageList into form.images and form.imageUrl
  const updateImages = (newImages: string[]) => {
    const limited = newImages.slice(0, 5)
    setImageList(limited)
    setForm(prev => ({
      ...prev,
      images: limited,
      imageUrl: limited[0] || '',
    }))
  }

  // Handle local file selection
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const availableSlots = 5 - imageList.length
    if (availableSlots <= 0) {
      showToast('Límite alcanzado', 'Solo puedes añadir un máximo de 5 imágenes por prenda.', 'warning')
      return
    }

    const filesToRead = Array.from(files).slice(0, availableSlots)
    const readPromises = filesToRead.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readPromises).then(base64Array => {
      const combined = [...imageList, ...base64Array].slice(0, 5)
      updateImages(combined)
      showToast('Imágenes añadidas', `${base64Array.length} foto(s) cargadas localmente.`, 'success')
      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  // Handle URL Add
  const handleAddUrl = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    if (!inputUrl.trim()) return

    if (imageList.length >= 5) {
      showToast('Límite de imágenes', 'Máximo 5 imágenes por producto.', 'warning')
      return
    }

    const trimmed = inputUrl.trim()
    const updated = [...imageList, trimmed].slice(0, 5)
    updateImages(updated)
    setInputUrl('')
    showToast('Imagen añadida', 'URL registrada correctamente.', 'success')
  }

  const handleRemoveImage = (index: number) => {
    const updated = imageList.filter((_, idx) => idx !== index)
    updateImages(updated)
  }

  const handleSetCover = (index: number) => {
    if (index === 0) return
    const selected = imageList[index]
    const rest = imageList.filter((_, idx) => idx !== index)
    const reordered = [selected, ...rest]
    updateImages(reordered)
    showToast('Portada actualizada', 'La imagen seleccionada ahora es la foto principal.', 'info')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const finalImages = imageList.length > 0
      ? imageList.slice(0, 5)
      : (form.imageUrl ? [form.imageUrl] : [])

    const payload: ProductCreate = {
      ...form,
      images: finalImages,
      imageUrl: finalImages[0] || '',
    }

    try {
      if (editing) {
        await productApi.update(editing, payload)
        showToast('Prenda actualizada', form.name, 'success')
      } else {
        await productApi.create(payload)
        showToast('Prenda añadida al catálogo', form.name, 'success')
      }
      setForm(emptyProduct)
      setImageList([])
      setInputUrl('')
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar prenda')
    }
  }

  const startEdit = async (id: number) => {
    try {
      const p = await productApi.getOne(id)
      const initialImgs = (p.images && p.images.length > 0)
        ? p.images.slice(0, 5)
        : (p.imageUrl ? [p.imageUrl] : [])

      setForm({
        name: p.name, description: p.description || '', price: p.price,
        size: p.size || '', condition: p.condition, imageUrl: initialImgs[0] || '',
        images: initialImgs, categoryId: p.categoryId, available: p.available, sex: p.sex || 'U',
      })
      setImageList(initialImgs)
      setEditing(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar prenda para edición')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta prenda del archivo?')) return
    try {
      await productApi.delete(id)
      showToast('Prenda eliminada', '', 'info')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const filteredProds = products.filter(p =>
    p.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(filterSearch.toLowerCase())
  )

  return (
    <div className="admin-section-grid">
      {/* Product Form Card */}
      <form className="admin-card-box" onSubmit={handleSubmit}>
        <div className="admin-form-header">
          <h3>{editing ? '✏️ Editar Prenda' : '➕ Nueva Prenda al Archivo'}</h3>
          {editing && (
            <button
              type="button"
              className="btn-cancel-edit"
              onClick={() => { setForm(emptyProduct); setImageList([]); setEditing(null) }}
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {error && <div className="admin-error-banner">{error}</div>}

        <div className="admin-form-fields-grid">
          <div className="form-group-modern">
            <label>Nombre de la prenda</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Chaqueta Aviador 1980s"
              required
            />
          </div>

          <div className="form-group-modern">
            <label>Categoría</label>
            <select
              value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}
              required
            >
              {categories.map(c => (
                <option key={c.idCategory} value={c.idCategory}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group-modern">
            <label>Precio (S/)</label>
            <input
              type="number"
              step="0.01"
              value={form.price || ''}
              onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
              placeholder="Ej. 240.00"
              required
            />
          </div>

          <div className="form-group-modern">
            <label>Talla</label>
            <input
              value={form.size || ''}
              onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
              placeholder="Ej: S, M, L, XL, 32/32"
            />
          </div>

          <div className="form-group-modern">
            <label>Nivel de Condición</label>
            <select
              value={form.condition}
              onChange={e => setForm(p => ({ ...p, condition: Number(e.target.value) }))}
            >
              <option value={5}>★★★★★ (5/5 Impecable)</option>
              <option value={4}>★★★★☆ (4/5 Excelente)</option>
              <option value={3}>★★★☆☆ (3/5 Muy Bueno)</option>
              <option value={2}>★★☆☆☆ (2/5 Con Historia)</option>
            </select>
          </div>

          <div className="form-group-modern">
            <label>Género / Silueta</label>
            <select
              value={form.sex || 'U'}
              onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}
            >
              <option value="U">Unisex</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
            </select>
          </div>
        </div>

        {/* ─── Multi-Image Uploader (Max 5) ─── */}
        <div className="image-manager-block">
          <div className="image-manager-header">
            <label className="image-manager-label">
              📸 Galería de Imágenes <span>(Máximo 5 fotos)</span>
            </label>
            <span className={`image-count-indicator ${imageList.length >= 5 ? 'max-reached' : ''}`}>
              {imageList.length} / 5 imágenes
            </span>
          </div>

          {/* Option 1: File Upload */}
          <div className="image-upload-methods">
            <div className="file-upload-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                id="file-upload-input"
                className="hidden-file-input"
                onChange={handleFilesSelect}
                disabled={imageList.length >= 5}
              />
              <label htmlFor="file-upload-input" className={`dropzone-label ${imageList.length >= 5 ? 'disabled' : ''}`}>
                <span className="dropzone-icon">📁</span>
                <span className="dropzone-text">
                  <strong>Subir fotos locales</strong> o arrastra aquí (JPG, PNG, WebP)
                </span>
                <span className="dropzone-hint">Puedes seleccionar múltiples archivos a la vez</span>
              </label>
            </div>

            {/* Option 2: Add by URL */}
            <div className="url-add-bar">
              <input
                type="url"
                placeholder="O pega una URL de imagen (https://...)"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddUrl(e) }}
                disabled={imageList.length >= 5}
              />
              <button
                type="button"
                className="btn-add-url"
                onClick={handleAddUrl}
                disabled={!inputUrl.trim() || imageList.length >= 5}
              >
                + Añadir URL
              </button>
            </div>
          </div>

          {/* Image Previews Grid */}
          {imageList.length > 0 && (
            <div className="image-previews-strip">
              {imageList.map((img, idx) => (
                <div key={idx} className={`preview-item-card ${idx === 0 ? 'is-cover' : ''}`}>
                  <img src={img} alt={`Prenda foto ${idx + 1}`} />
                  <div className="preview-item-badge">
                    {idx === 0 ? '★ Portada' : `#${idx + 1}`}
                  </div>
                  <div className="preview-item-actions">
                    {idx !== 0 && (
                      <button
                        type="button"
                        className="btn-action-cover"
                        onClick={() => handleSetCover(idx)}
                        title="Hacer foto principal"
                      >
                        ★
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-action-delete"
                      onClick={() => handleRemoveImage(idx)}
                      title="Eliminar foto"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group-modern">
          <label>Descripción & Detalles de la pieza</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe la época, material, detalles de confección y estado..."
            rows={3}
          />
        </div>

        <div className="form-group-checkbox">
          <label className="checkbox-label-modern">
            <input
              type="checkbox"
              checked={form.available}
              onChange={e => setForm(p => ({ ...p, available: e.target.checked }))}
            />
            <span className="checkbox-custom" />
            <span>Prenda disponible para la venta inmediata</span>
          </label>
        </div>

        <button type="submit" className="btn-primary-luxury full-width">
          <span>{editing ? 'Guardar Cambios' : 'Publicar en Catálogo'}</span>
          <span className="icon">→</span>
        </button>
      </form>

      {/* Inventory List with Live Search */}
      <div className="admin-inventory-card">
        <div className="inventory-header">
          <div>
            <h3>Inventario de Prendas</h3>
            <span className="inventory-count-tag">{filteredProds.length} registradas</span>
          </div>

          <input
            type="text"
            className="inventory-search-input"
            placeholder="Buscar en inventario..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
          />
        </div>

        <div className="admin-products-table-list">
          {filteredProds.map(p => {
            const count = p.images?.length || 1
            return (
              <div key={p.idProduct} className="admin-product-row">
                <div className="admin-thumb-wrapper">
                  <img
                    src={p.imageUrl || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=120&q=80'}
                    alt={p.name}
                    className="admin-product-img"
                  />
                  {count > 1 && (
                    <span className="admin-thumb-badge">📷 {count}</span>
                  )}
                </div>
                <div className="admin-product-info">
                  <h4>{p.name}</h4>
                  <div className="admin-product-meta">
                    <span>{p.categoryName}</span>
                    <span>•</span>
                    <span>Talla: <strong>{p.size || 'U'}</strong></span>
                    <span>•</span>
                    <span>★ {p.condition}/5</span>
                    <span>•</span>
                    <strong className="admin-price-tag">S/ {p.price.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="admin-actions-cell">
                  <button
                    type="button"
                    className="btn-admin-edit"
                    onClick={() => startEdit(p.idProduct)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-admin-delete"
                    onClick={() => handleDelete(p.idProduct)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const load = () => categoryApi.getAll().then(setCategories)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await categoryApi.update(editing, { name, description: desc })
        showToast('Categoría actualizada', name, 'success')
      } else {
        await categoryApi.create({ name, description: desc })
        showToast('Categoría creada', name, 'success')
      }
      setName('')
      setDesc('')
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar categoría')
    }
  }

  const startEdit = (cat: Category) => {
    setEditing(cat.idCategory)
    setName(cat.name)
    setDesc(cat.description)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await categoryApi.delete(id)
      showToast('Categoría eliminada', '', 'info')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="admin-section-grid">
      <form className="admin-card-box" onSubmit={handleSubmit}>
        <h3>{editing ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</h3>
        {error && <div className="admin-error-banner">{error}</div>}

        <div className="form-group-modern">
          <label>Nombre de la Categoría</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Chaquetas & Abrigos"
            required
          />
        </div>

        <div className="form-group-modern">
          <label>Descripción de la Colección</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Breve explicación de las prendas que abarca..."
            rows={3}
          />
        </div>

        <div className="admin-form-actions-row">
          <button type="submit" className="btn-primary-luxury">
            <span>{editing ? 'Guardar Cambios' : 'Crear Categoría'}</span>
          </button>
          {editing && (
            <button
              type="button"
              className="btn-outline-luxury"
              onClick={() => { setEditing(null); setName(''); setDesc('') }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="admin-inventory-card">
        <div className="inventory-header">
          <h3>Categorías en el Sistema</h3>
          <span className="inventory-count-tag">{categories.length} activas</span>
        </div>

        <div className="admin-categories-list">
          {categories.map(cat => (
            <div key={cat.idCategory} className="admin-category-row">
              <div className="admin-category-info">
                <h4>{cat.name}</h4>
                <p>{cat.description || 'Sin descripción'}</p>
                <span className="cat-product-count">{cat.productCount} prendas asignadas</span>
              </div>
              <div className="admin-actions-cell">
                <button type="button" className="btn-admin-edit" onClick={() => startEdit(cat)}>
                  Editar
                </button>
                <button type="button" className="btn-admin-delete" onClick={() => handleDelete(cat.idCategory)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminClaims() {
  const { showToast } = useToast()
  const [claims, setClaims] = useState<ClaimResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<ClaimResponse | null>(null)
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDIENTE' | 'EN_REVISION' | 'ATENDIDO'>('TODOS')
  const [adminResponse, setAdminResponse] = useState('')
  const [newStatus, setNewStatus] = useState<'PENDIENTE' | 'EN_REVISION' | 'ATENDIDO'>('ATENDIDO')
  const [updating, setUpdating] = useState(false)

  const loadClaims = () => {
    setLoading(true)
    claimApi.getAll()
      .then(res => setClaims(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const handleOpenDetail = (claim: ClaimResponse) => {
    setSelectedClaim(claim)
    setAdminResponse(claim.adminResponse || '')
    setNewStatus(claim.status)
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClaim) return

    setUpdating(true)
    try {
      const res = await claimApi.updateStatus(selectedClaim.idClaim, {
        status: newStatus,
        adminResponse: adminResponse.trim(),
      })
      showToast('Reclamación actualizada', `Código ${res.claimCode} actualizado a ${newStatus}`, 'success')
      setSelectedClaim(null)
      loadClaims()
    } catch (err: any) {
      showToast('Error al actualizar', err.message || 'Error', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const filteredClaims = statusFilter === 'TODOS'
    ? claims
    : claims.filter(c => c.status === statusFilter)

  return (
    <div className="admin-claims-container">
      <div className="admin-claims-header-row">
        <div>
          <h2>Libro de Reclamaciones Virtual (INDECOPI)</h2>
          <p>Supervisión legal y atención de quejas y reclamos conforme a la Ley N° 29571 (Plazo máx. 15 días hábiles).</p>
        </div>

        <div className="claims-filter-buttons">
          {(['TODOS', 'PENDIENTE', 'EN_REVISION', 'ATENDIDO'] as const).map(st => (
            <button
              key={st}
              type="button"
              className={`filter-chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'TODOS' ? 'Todos' : st}
              <span className="chip-count">
                ({st === 'TODOS' ? claims.length : claims.filter(c => c.status === st).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-state">Cargando reclamaciones...</div>
      ) : filteredClaims.length === 0 ? (
        <div className="admin-empty-state">
          <p>No hay reclamaciones en este estado.</p>
        </div>
      ) : (
        <div className="admin-claims-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Consumidor</th>
                <th>Documento</th>
                <th>Bien Reclamado</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map(c => (
                <tr key={c.idClaim}>
                  <td><strong className="claim-code-cell">{c.claimCode}</strong></td>
                  <td>{new Date(c.createdAt).toLocaleDateString('es-PE')}</td>
                  <td>
                    <div>
                      <strong>{c.fullName}</strong>
                      <small className="cell-sub">{c.email}</small>
                    </div>
                  </td>
                  <td>{c.docType} {c.docNumber}</td>
                  <td>
                    <div className="good-desc-cell">
                      <span>{c.goodDescription}</span>
                      {c.claimedAmount && <small className="cell-sub">S/ {c.claimedAmount.toFixed(2)}</small>}
                    </div>
                  </td>
                  <td>
                    <span className={`claim-type-badge ${c.claimType.toLowerCase()}`}>
                      {c.claimType}
                    </span>
                  </td>
                  <td>
                    <span className={`claim-status-pill ${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-admin-edit"
                      onClick={() => handleOpenDetail(c)}
                    >
                      Ver / Atender
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalle y Respuesta */}
      {selectedClaim && (
        <div className="admin-modal-overlay" onClick={() => setSelectedClaim(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="code-label">RECLAMACIÓN OFICIAL</span>
                <h3>{selectedClaim.claimCode} — {selectedClaim.fullName}</h3>
                <small>Registrado el {new Date(selectedClaim.createdAt).toLocaleString('es-PE')}</small>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedClaim(null)}>✕</button>
            </div>

            <div className="modal-body-scroll">
              <div className="modal-detail-grid">
                <div className="detail-item">
                  <strong>Consumidor:</strong>
                  <span>{selectedClaim.fullName} ({selectedClaim.docType}: {selectedClaim.docNumber})</span>
                </div>
                <div className="detail-item">
                  <strong>Contacto:</strong>
                  <span>{selectedClaim.email} | Tel: {selectedClaim.phone}</span>
                </div>
                <div className="detail-item">
                  <strong>Dirección:</strong>
                  <span>{selectedClaim.address}, {selectedClaim.district} - {selectedClaim.province}</span>
                </div>
                <div className="detail-item">
                  <strong>Bien Contratado:</strong>
                  <span>{selectedClaim.contractedGoodType} — {selectedClaim.goodDescription}</span>
                </div>
                {selectedClaim.claimedAmount && (
                  <div className="detail-item">
                    <strong>Monto Reclamado:</strong>
                    <span>S/ {selectedClaim.claimedAmount.toFixed(2)}</span>
                  </div>
                )}
                {selectedClaim.orderNumber && (
                  <div className="detail-item">
                    <strong>N° Pedido:</strong>
                    <span>{selectedClaim.orderNumber}</span>
                  </div>
                )}
              </div>

              <div className="modal-facts-box">
                <h4>📝 Detalle de los Hechos ({selectedClaim.claimType}):</h4>
                <p>{selectedClaim.detail}</p>
              </div>

              <div className="modal-facts-box">
                <h4>🎯 Pedido Concreto del Consumidor:</h4>
                <p>{selectedClaim.consumerRequest}</p>
              </div>

              <form onSubmit={handleUpdateStatus} className="admin-reply-form">
                <h4>🏛️ Resolución y Respuesta Oficial del Proveedor</h4>
                
                <div className="form-group-modern">
                  <label>Estado de la Reclamación</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                  >
                    <option value="PENDIENTE">PENDIENTE (En espera de revisión)</option>
                    <option value="EN_REVISION">EN REVISIÓN (Evaluando con logística/taller)</option>
                    <option value="ATENDIDO">ATENDIDO (Respuesta formal emitida al consumidor)</option>
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>Respuesta Oficial (Será visible por el consumidor y enviada por correo)</label>
                  <textarea
                    rows={4}
                    placeholder="Redacta la fundamentación y resolución de La Cachina Online conforme a ley..."
                    value={adminResponse}
                    onChange={e => setAdminResponse(e.target.value)}
                    required={newStatus === 'ATENDIDO'}
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="submit" className="btn-primary-luxury" disabled={updating}>
                    {updating ? 'Guardando...' : '💾 Guardar y Emitir Respuesta'}
                  </button>
                  <button type="button" className="btn-outline-luxury" onClick={() => setSelectedClaim(null)}>
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.getAllUsers()
      .then(res => setUsers(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="admin-users-container">
      <div className="admin-inventory-card">
        <div className="inventory-header">
          <div>
            <h3>Usuarios Registrados en La Cachina Online</h3>
            <p>Control de perfiles, administradores (`ADMIN`), vendedores vintage (`SELLER`) y clientes (`CUSTOMER`).</p>
          </div>
          <span className="inventory-count-tag">{users.length} usuarios</span>
        </div>

        {loading ? (
          <div className="admin-loading-state">Cargando usuarios...</div>
        ) : (
          <div className="admin-users-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre Mostrado</th>
                  <th>Correo Electrónico</th>
                  <th>Rol Asignado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.username}>
                    <td><strong>@{u.username}</strong></td>
                    <td>{u.displayName || u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`user-role-badge role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="user-active-badge">✓ Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

