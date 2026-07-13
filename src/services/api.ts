import type { Category, CategoryFull, ProductSummary, ProductDetail, ProductCreate, Customer, Sale } from '../types/models'

export const API_BASE = import.meta.env.VITE_API_URL || 'https://vault-vintage-backend-production.up.railway.app'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = localStorage.getItem('vv_user')
  const token = stored ? JSON.parse(stored).token : null
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }))
    throw new Error(error.message || `Request failed with status ${response.status}`)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export const categoryApi = {
  getAll: () => request<Category[]>('/categories'),
  getOne: (id: number) => request<CategoryFull>(`/categories/${id}`),
  create: (data: { name: string; description?: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; description?: string }) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
}

export const productApi = {
  getAll: (categoryIds?: number[]) => {
    const params = categoryIds?.length ? `?category=${categoryIds.join('&category=')}` : ''
    return request<ProductSummary[]>(`/products${params}`)
  },
  getOne: (id: number) => request<ProductDetail>(`/products/${id}`),
  search: (params: { q?: string; category?: number[]; minCondition?: number; maxCondition?: number; available?: boolean; sex?: string; size?: string }) => {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.category?.length) params.category.forEach(c => sp.append('category', String(c)))
    if (params.minCondition !== undefined) sp.set('minCondition', String(params.minCondition))
    if (params.maxCondition !== undefined) sp.set('maxCondition', String(params.maxCondition))
    if (params.available !== undefined) sp.set('available', String(params.available))
    if (params.sex) sp.set('sex', params.sex)
    if (params.size) sp.set('size', params.size)
    const qs = sp.toString()
    return request<ProductSummary[]>(`/products/search${qs ? '?' + qs : ''}`)
  },
  create: (data: ProductCreate) =>
    request<ProductDetail>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: ProductCreate) =>
    request<ProductDetail>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
}

export const customerApi = {
  create: (data: { name: string; email: string; phone?: string; address?: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
}

export const saleApi = {
  create: (data: { customerId: number; description: string }) =>
    request<Sale>('/sales', { method: 'POST', body: JSON.stringify(data) }),
}
