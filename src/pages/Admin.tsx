import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { categoryApi, productApi, customerApi, saleApi } from '../services/api'
import type { Category, ProductSummary, ProductCreate } from '../types/models'

type Tab = 'dashboard' | 'categories' | 'products'

const emptyProduct: ProductCreate = {
  name: '', description: '', price: 0, size: '', condition: 3,
  imageUrl: '', categoryId: 0, available: true, sex: 'U',
}

interface DashboardStats {
  products: number
  categories: number
  sales: number
  customers: number
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
    <div className="admin-page">
      <h1>Panel de Administración</h1>
      <nav className="admin-tabs">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Categorías</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Productos</button>
      </nav>
      {tab === 'dashboard' && <AdminDashboard />}
      {tab === 'categories' && <AdminCategories />}
      {tab === 'products' && <AdminProducts />}
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ products: 0, categories: 0, sales: 0, customers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productApi.getAll().then(p => p.length),
      categoryApi.getAll().then(c => c.length),
      saleApi.getAll().then(s => s.length),
      customerApi.getAll().then(c => c.length),
    ])
      .then(([products, categories, sales, customers]) => {
        setStats({ products, categories, sales, customers })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Cargando estadísticas...</div>

  const cards = [
    { icon: '👕', value: stats.products, label: 'Productos' },
    { icon: '📂', value: stats.categories, label: 'Categorías' },
    { icon: '🧾', value: stats.sales, label: 'Ventas' },
    { icon: '👤', value: stats.customers, label: 'Clientes' },
  ]

  return (
    <>
      <div className="admin-dashboard">
        {cards.map(card => (
          <div key={card.label} className="dashboard-card">
            <div className="dashboard-card-icon">{card.icon}</div>
            <div className="dashboard-card-value">{card.value}</div>
            <div className="dashboard-card-label">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="admin-section">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Bienvenido al panel de administración de Vault Vintage. Gestiona tus categorías y productos desde aquí.
        </p>
      </div>
    </>
  )
}

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => categoryApi.getAll().then(setCategories)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await categoryApi.update(editing, { name, description: desc })
      } else {
        await categoryApi.create({ name, description: desc })
      }
      setName(''); setDesc(''); setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
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
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="admin-section">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
        {error && <p className="form-error">{error}</p>}
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" required />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (opcional)" />
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-clear" onClick={() => { setEditing(null); setName(''); setDesc('') }}>Cancelar</button>}
        </div>
      </form>
      <div className="admin-list">
        {categories.map(cat => (
          <div key={cat.idCategory} className="admin-list-item">
            <div className="admin-list-info">
              <strong>{cat.name}</strong>
              <span className="admin-list-meta">{cat.description} · {cat.productCount} productos</span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => startEdit(cat)}>Editar</button>
              <button className="delete" onClick={() => handleDelete(cat.idCategory)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductCreate>(emptyProduct)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => Promise.all([productApi.getAll(), categoryApi.getAll()]).then(([p, c]) => { setProducts(p); setCategories(c) })
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await productApi.update(editing, form)
      } else {
        await productApi.create(form)
      }
      setForm(emptyProduct); setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const startEdit = async (id: number) => {
    try {
      const p = await productApi.getOne(id)
      setForm({
        name: p.name, description: p.description || '', price: p.price,
        size: p.size || '', condition: p.condition, imageUrl: p.imageUrl || '',
        categoryId: p.categoryId, available: p.available, sex: p.sex || 'U',
      })
      setEditing(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await productApi.delete(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  return (
    <div className="admin-section">
      <form className="admin-form admin-form-product" onSubmit={handleSubmit}>
        <h3>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
        {error && <p className="form-error">{error}</p>}
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Nombre de la prenda</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Chaqueta vaquera vintage" required />
          </div>
          <div className="admin-field">
            <label>Categoría</label>
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))} required>
              <option value={0}>— Seleccionar —</option>
              {categories.map(c => <option key={c.idCategory} value={c.idCategory}>{c.name}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Precio (S/)</label>
            <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} placeholder="Ej: 89.90" required />
          </div>
          <div className="admin-field">
            <label>Talla</label>
            <input value={form.size || ''} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} placeholder="Ej: M, L, 38, Única" />
          </div>
          <div className="admin-field">
            <label>Estado (1–5 estrellas)</label>
            <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: Number(e.target.value) }))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)} — {['','Aceptable','Bueno','Muy bueno','Excelente','Perfecto'][n]}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Sexo / Género</label>
            <select value={form.sex || 'U'} onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}>
              <option value="U">⚤ Unisex — cualquier género</option>
              <option value="M">♂ Masculino — hombre</option>
              <option value="F">♀ Femenino — mujer</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
              Disponible para la venta
            </label>
          </div>
        </div>
        <div className="admin-field">
          <label>Descripción (opcional)</label>
          <input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Chaqueta vaquera de los 90, perfecto estado, talla M. Sin rotos ni manchas." />
        </div>
        <div className="admin-field">
          <label>URL de imagen (opcional)</label>
          <input value={form.imageUrl || ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="Ej: https://ejemplo.com/mi-imagen.jpg — si no pones nada se usará una aleatoria" />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Agregar'}</button>
          {editing && <button type="button" className="btn-clear" onClick={() => { setForm(emptyProduct); setEditing(null) }}>Cancelar</button>}
        </div>
      </form>
      <div className="admin-list">
        {products.map(p => (
          <div key={p.idProduct} className="admin-list-item">
            <div className="admin-list-info">
              <strong>{p.name}</strong>
              <span className="admin-list-meta">
                {categories.find(c => c.idCategory === p.categoryId)?.name || p.categoryName} · S/ {p.price.toFixed(2)} · {'★'.repeat(p.condition)}{'☆'.repeat(5-p.condition)}
                {!p.available && ' · NO DISPONIBLE'}
                {p.sex === 'M' ? ' · ♂' : p.sex === 'F' ? ' · ♀' : ' · ⚤'}
              </span>
            </div>
            <div className="admin-list-actions">
              <button onClick={() => startEdit(p.idProduct)}>Editar</button>
              <button className="delete" onClick={() => handleDelete(p.idProduct)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
