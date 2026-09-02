import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { categoryApi, productApi, customerApi, saleApi, claimApi, userApi, sellerApplicationApi } from '../services/api'
import type { Category, ProductSummary, ProductCreate, ClaimResponse, AppUser, SellerApplication } from '../types/models'
import ImageGalleryUploader from '../components/ImageGalleryUploader'
import CategorySearchSelector from '../components/CategorySearchSelector'

type Tab = 'dashboard' | 'pending' | 'seller-applications' | 'products' | 'categories' | 'claims' | 'users'

const emptyProduct: ProductCreate = {
  name: '', description: '', price: 0, size: 'M', condition: 4,
  imageUrl: '', images: [], categoryId: '', available: true, sex: 'U',
}

interface DashboardStats {
  products: number
  categories: number
  sales: number
  customers: number
  revenue: number
  pending: number
  sellerApps: number
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('pending')
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingAppsCount, setPendingAppsCount] = useState(0)

  const refreshCounts = () => {
    productApi.getPending()
      .then(res => setPendingCount(res.length))
      .catch(() => setPendingCount(0))

    sellerApplicationApi.getAll()
      .then(apps => setPendingAppsCount(apps.filter(a => a.status === 'PENDING').length))
      .catch(() => setPendingAppsCount(0))
  }

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }
    refreshCounts()
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
            <p>Control de inventario, aprobación de prendas, solicitudes de vendedores y roles</p>
          </div>
        </div>

        <nav className="admin-nav-tabs">
          <button className={`admin-tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            ⏳ Prendas por Aprobar {pendingCount > 0 && <span className="tab-badge-alert">{pendingCount}</span>}
          </button>
          <button className={`admin-tab-btn ${tab === 'seller-applications' ? 'active' : ''}`} onClick={() => setTab('seller-applications')}>
            👔 Solicitudes Vendedores {pendingAppsCount > 0 && <span className="tab-badge-alert">{pendingAppsCount}</span>}
          </button>
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
            📖 Reclamaciones
          </button>
          <button className={`admin-tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            👥 Usuarios & Roles
          </button>
        </nav>
      </div>

      <div className="admin-tab-content">
        {tab === 'pending' && <AdminPendingProducts onUpdate={refreshCounts} />}
        {tab === 'seller-applications' && <AdminSellerApplications onUpdate={refreshCounts} />}
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
  const [stats, setStats] = useState<DashboardStats>({ products: 0, categories: 0, sales: 0, customers: 0, revenue: 0, pending: 0, sellerApps: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productApi.getAll(),
      categoryApi.getAll(),
      saleApi.getAll(),
      customerApi.getAll(),
      productApi.getPending(),
      sellerApplicationApi.getAll(),
    ])
      .then(([prods, cats, sales, customers, pending, apps]) => {
        const rev = sales.reduce((acc, s) => acc + (s.total || s.subTotal || 0), 0)
        setStats({
          products: prods.length,
          categories: cats.length,
          sales: sales.length,
          customers: customers.length,
          revenue: rev,
          pending: pending.length,
          sellerApps: apps.filter(a => a.status === 'PENDING').length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Cargando métricas del sistema...</div>

  const metricCards = [
    { title: 'Prendas Publicadas', value: stats.products, icon: '👕', badge: 'Catálogo activo' },
    { title: 'Pendientes Revisión', value: stats.pending, icon: '⏳', badge: `${stats.pending} por aprobar` },
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
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
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
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar prenda')
    }
  }

  const startEdit = async (id: string) => {
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

  const handleDelete = async (id: string) => {
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

          <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
            <CategorySearchSelector
              categories={categories}
              selectedCategories={form.categories && form.categories.length > 0
                ? form.categories
                : [categories.find(x => x.idCategory === form.categoryId)?.name || 'Chaquetas']}
              onChange={(nextCats) => {
                const primaryCat = categories.find(x => x.name === nextCats[0])
                setForm(p => ({
                  ...p,
                  categories: nextCats,
                  categoryId: primaryCat ? primaryCat.idCategory : p.categoryId,
                }))
              }}
              label="Buscador de Categorías Asociadas (puedes seleccionar múltiples)"
              required
            />
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
            <label>Silueta / Género</label>
            <select
              value={form.sex || 'UNISEX'}
              onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}
            >
              <option value="UNISEX">⚡ Unisex (Para todos)</option>
              <option value="HOMBRE">♂ Hombre (Corte masculino)</option>
              <option value="MUJER">♀ Mujer (Corte femenino)</option>
            </select>
          </div>
        </div>

        {/* ─── Multi-Image Uploader with Auto-Compression (Max 5) ─── */}
        <ImageGalleryUploader
          images={imageList}
          onChange={updateImages}
          maxImages={5}
        />

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
  const [editing, setEditing] = useState<string | null>(null)
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

  const handleDelete = async (id: string) => {
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

function AdminPendingProducts({ onUpdate }: { onUpdate?: () => void }) {
  const [pending, setPending] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingProduct, setRejectingProduct] = useState<ProductSummary | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const { showToast } = useToast()

  const loadPending = () => {
    setLoading(true)
    productApi.getPending()
      .then(res => setPending(res))
      .catch(() => setPending([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPending()
  }, [])

  const handleApprove = async (prod: ProductSummary) => {
    setProcessing(true)
    try {
      await productApi.approve(prod.idProduct)
      showToast('¡Prenda aprobada!', `"${prod.name}" ya está publicada y visible en la tienda para todos los clientes.`, 'success')
      loadPending()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      showToast('Error al aprobar', err.message || 'No se pudo aprobar la prenda', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingProduct) return
    setProcessing(true)
    try {
      await productApi.reject(rejectingProduct.idProduct, rejectionReason)
      showToast('Prenda rechazada', `Se notificó el motivo al vendedor`, 'info')
      setRejectingProduct(null)
      setRejectionReason('')
      loadPending()
      if (onUpdate) onUpdate()
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo registrar el rechazo', 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="admin-pending-container">
      <div className="admin-inventory-card">
        <div className="inventory-header">
          <div>
            <h3>Prendas Enviadas por Vendedores (Por Confirmar)</h3>
            <p>Revisa la autenticidad, fotos y condición de las piezas. Solo se mostrarán en la tienda tras tu aprobación.</p>
          </div>
          <span className="inventory-count-tag alert">{pending.length} por revisar</span>
        </div>

        {loading ? (
          <div className="admin-loading-state">Cargando prendas en revisión...</div>
        ) : pending.length === 0 ? (
          <div className="empty-pending-state">
            <span className="empty-pending-icon">✨</span>
            <h4>No hay prendas pendientes de revisión</h4>
            <p>Todos los envíos de los vendedores han sido evaluados y atendidos. ¡Todo al día!</p>
          </div>
        ) : (
          <div className="pending-products-grid">
            {pending.map(prod => (
              <div key={prod.idProduct} className="pending-product-card">
                <div className="pending-card-media">
                  <img
                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    className="pending-img"
                    onError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80'
                    }}
                  />
                  <span className="pending-status-ribbon">⏳ Por Revisar</span>
                </div>

                <div className="pending-card-body">
                  <div className="pending-seller-info">
                    <span className="seller-label">Vendedor:</span>
                    <strong>{prod.sellerName || prod.sellerEmail || 'Vendedor La Cachina'}</strong>
                    <span className="seller-email">({prod.sellerEmail})</span>
                  </div>

                  <h4 className="pending-title">{prod.name}</h4>

                  <div className="pending-meta-tags">
                    <span className="meta-pill">{prod.categoryName}</span>
                    <span className="meta-pill">Talla: {prod.size}</span>
                    <span className="meta-pill condition">Condición: {prod.condition}/5</span>
                  </div>

                  <div className="pending-price-tag">
                    <span>Precio sugerido:</span>
                    <strong>S/ {prod.price.toFixed(2)}</strong>
                  </div>

                  <div className="pending-actions-row">
                    <button
                      type="button"
                      className="btn-approve-product"
                      onClick={() => handleApprove(prod)}
                      disabled={processing}
                    >
                      <span>✓ Aprobar y Publicar</span>
                    </button>

                    <button
                      type="button"
                      className="btn-reject-product"
                      onClick={() => setRejectingProduct(prod)}
                      disabled={processing}
                    >
                      <span>✕ Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setRejectingProduct(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rechazar Prenda: {rejectingProduct.name}</h3>
              <button type="button" className="btn-modal-close" onClick={() => setRejectingProduct(null)}>✕</button>
            </div>

            <form onSubmit={handleRejectSubmit} className="reject-reason-form">
              <p>Indica el motivo por el cual no se aprueba la prenda para que el vendedor pueda corregirlo o retirarla:</p>

              <div className="form-group-modern">
                <label>Motivo del Rechazo *</label>
                <textarea
                  rows={4}
                  placeholder="Ej. Fotos poco nítidas, precio fuera de rango de mercado vintage, o requiere verificar autenticidad de etiqueta..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="btn-reject-confirm" disabled={processing}>
                  {processing ? 'Guardando...' : 'Confirmar Rechazo'}
                </button>
                <button type="button" className="btn-outline-luxury" onClick={() => setRejectingProduct(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const { updateUserRole } = useAuth()
  const { showToast } = useToast()

  const loadUsers = () => {
    userApi.getAllUsers()
      .then(res => setUsers(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (username: string, newRole: string) => {
    try {
      await updateUserRole(username, newRole)
      showToast('Rol actualizado', `El usuario @${username} ahora es ${newRole}`, 'success')
      loadUsers()
    } catch (err: any) {
      showToast('Error al actualizar rol', err.message || 'No se pudo modificar el rol', 'error')
    }
  }

  return (
    <div className="admin-users-container">
      <div className="admin-inventory-card">
        <div className="inventory-header">
          <div>
            <h3>Usuarios Registrados & Control de Roles</h3>
            <p>Asigna y gestiona los 3 roles del sistema: Comprador (`CUSTOMER` / `USER`), Vendedor Vintage (`SELLER`) y Administrador (`ADMIN`).</p>
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
                  <th>Rol Actual</th>
                  <th>Modificar Rol</th>
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
                      <select
                        value={u.role}
                        className="role-change-select"
                        onChange={e => handleRoleChange(u.username, e.target.value)}
                      >
                        <option value="USER">Comprador (USER)</option>
                        <option value="CUSTOMER">Cliente (CUSTOMER)</option>
                        <option value="SELLER">Vendedor (SELLER)</option>
                        <option value="ADMIN">Administrador (ADMIN)</option>
                      </select>
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

function AdminSellerApplications({ onUpdate }: { onUpdate: () => void }) {
  const { showToast } = useToast()
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalApp, setRejectModalApp] = useState<SellerApplication | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const loadApplications = () => {
    setLoading(true)
    sellerApplicationApi.getAll()
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleApprove = async (app: SellerApplication) => {
    setProcessingId(app.idApplication)
    try {
      await sellerApplicationApi.approve(app.idApplication)
      showToast('¡Vendedor Aprobado!', `El usuario ${app.userEmail} ahora tiene permisos oficiales de VENDEDOR (SELLER).`, 'success')
      loadApplications()
      onUpdate()
    } catch (err: any) {
      showToast('Error al aprobar', err.message || 'No se pudo aprobar la solicitud', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalApp) return

    setProcessingId(rejectModalApp.idApplication)
    try {
      await sellerApplicationApi.reject(rejectModalApp.idApplication, rejectionReason)
      showToast('Solicitud rechazada', `Se notificó el rechazo a ${rejectModalApp.userEmail}.`, 'info')
      setRejectModalApp(null)
      setRejectionReason('')
      loadApplications()
      onUpdate()
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo rechazar la solicitud', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredApps = applications.filter(a => {
    if (filterStatus === 'ALL') return true
    return a.status === filterStatus
  })

  const pendingCount = applications.filter(a => a.status === 'PENDING').length

  return (
    <div className="admin-seller-apps-container">
      <div className="admin-inventory-card">
        <div className="inventory-header">
          <div>
            <h3>Solicitudes de Admisión para Vendedores Vintage</h3>
            <p>Revisa las postulaciones de compradores que desean convertirse en Vendedores Oficiales de La Cachina.</p>
          </div>

          <div className="inventory-actions">
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-pill-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                Todas ({applications.length})
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
                onClick={() => setFilterStatus('PENDING')}
              >
                ⏳ Pendientes ({pendingCount})
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${filterStatus === 'APPROVED' ? 'active' : ''}`}
                onClick={() => setFilterStatus('APPROVED')}
              >
                ✓ Aprobadas ({applications.filter(a => a.status === 'APPROVED').length})
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${filterStatus === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setFilterStatus('REJECTED')}
              >
                ✕ Rechazadas ({applications.filter(a => a.status === 'REJECTED').length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading-state">Cargando solicitudes de vendedor...</div>
        ) : filteredApps.length === 0 ? (
          <div className="admin-empty-state">
            <span className="empty-icon">👔</span>
            <p>No hay solicitudes en esta sección.</p>
          </div>
        ) : (
          <div className="seller-apps-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tienda / Marca</th>
                  <th>Solicitante & Correo</th>
                  <th>Doc. Identidad</th>
                  <th>Contacto & Redes</th>
                  <th>Catálogo & Experiencia</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acción Administrador</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.idApplication}>
                    <td>
                      <strong style={{ color: 'var(--brand-volt)', fontSize: '0.95rem' }}>{app.shopName}</strong>
                    </td>
                    <td>
                      <div><strong>{app.userName || 'Usuario'}</strong></div>
                      <small style={{ color: 'var(--text-muted)' }}>{app.userEmail}</small>
                    </td>
                    <td>
                      <span>{app.docNumber || '—'}</span>
                    </td>
                    <td>
                      {app.phone && <div>📞 {app.phone}</div>}
                      {app.instagram && (
                        <div style={{ color: 'var(--brand-volt)', fontWeight: 600 }}>
                          📸 {app.instagram}
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {app.experienceDetails || 'Sin detalles adicionales'}
                      </p>
                      {app.rejectionReason && (
                        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#ef4444' }}>
                          <strong>Motivo de rechazo:</strong> {app.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(app.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <span className={`user-role-badge role-${app.status.toLowerCase()}`} style={{
                        background: app.status === 'APPROVED' ? 'rgba(210, 248, 11, 0.15)' : app.status === 'PENDING' ? 'rgba(250, 204, 21, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: app.status === 'APPROVED' ? 'var(--brand-volt)' : app.status === 'PENDING' ? '#facc15' : '#ef4444',
                        borderColor: app.status === 'APPROVED' ? 'var(--brand-volt)' : app.status === 'PENDING' ? '#facc15' : '#ef4444',
                      }}>
                        {app.status === 'APPROVED' ? '✓ APROBADO' : app.status === 'PENDING' ? '⏳ PENDIENTE' : '✕ RECHAZADO'}
                      </span>
                    </td>
                    <td>
                      {app.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn-action-approve"
                            disabled={processingId === app.idApplication}
                            onClick={() => handleApprove(app)}
                            title="Aprobar y otorgar rol VENDEDOR"
                            style={{
                              background: 'var(--brand-volt)',
                              color: '#0D0D10',
                              border: 'none',
                              padding: '0.4rem 0.75rem',
                              borderRadius: 'var(--radius-xs)',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            {processingId === app.idApplication ? '...' : '✓ Aprobar'}
                          </button>
                          <button
                            type="button"
                            className="btn-action-reject"
                            disabled={processingId === app.idApplication}
                            onClick={() => {
                              setRejectModalApp(app)
                              setRejectionReason('')
                            }}
                            title="Rechazar solicitud"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              padding: '0.4rem 0.65rem',
                              borderRadius: 'var(--radius-xs)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      ) : app.status === 'REJECTED' ? (
                        <button
                          type="button"
                          disabled={processingId === app.idApplication}
                          onClick={() => handleApprove(app)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-secondary)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Reconsiderar & Aprobar
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--brand-volt)', fontWeight: 700 }}>
                          ✓ Vendedor Activo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalApp && (
        <div className="admin-modal-overlay" onClick={() => setRejectModalApp(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h3>Rechazar Solicitud de Vendedor</h3>
              <button type="button" onClick={() => setRejectModalApp(null)}>✕</button>
            </div>
            <form onSubmit={handleRejectConfirm} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Indica el motivo por el cual la postulación de <strong>{rejectModalApp.shopName}</strong> ({rejectModalApp.userEmail}) no fue aceptada:
              </p>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ej. El catálogo presentado no cumple con los criterios de autenticidad o condición vintage requeridos."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setRejectModalApp(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectModalApp.idApplication}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


