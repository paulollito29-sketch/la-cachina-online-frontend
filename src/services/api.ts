import type { Category, CategoryFull, ProductSummary, ProductDetail, ProductCreate, Customer, Sale } from '../types/models'
import { getStoredCategories, getStoredProducts, saveStoredCategories, saveStoredProducts } from './mockData'

export const API_BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = localStorage.getItem('lco_user')
  const token = stored ? JSON.parse(stored).token : null
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1500)

  try {
    const response = await fetch(`${API_BASE}/api${path}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    })
    clearTimeout(timeoutId)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }))
      throw new Error(error.message || `Request failed with status ${response.status}`)
    }
    return response.status === 204 ? undefined as T : response.json() as Promise<T>
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    try {
      return await request<Category[]>('/categories')
    } catch {
      return getStoredCategories()
    }
  },
  getOne: async (id: number): Promise<CategoryFull> => {
    try {
      return await request<CategoryFull>(`/categories/${id}`)
    } catch {
      const cats = getStoredCategories()
      const found = cats.find(c => c.idCategory === id) || cats[0]
      const products = getStoredProducts().filter(p => p.categoryId === id)
      return { ...found, products }
    }
  },
  create: async (data: { name: string; description?: string }): Promise<Category> => {
    try {
      return await request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      const cats = getStoredCategories()
      const newCat: Category = {
        idCategory: Date.now(),
        name: data.name,
        description: data.description || '',
        productCount: 0,
      }
      const updated = [...cats, newCat]
      saveStoredCategories(updated)
      return newCat
    }
  },
  update: async (id: number, data: { name: string; description?: string }): Promise<Category> => {
    try {
      return await request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    } catch {
      const cats = getStoredCategories()
      const updated = cats.map(c => c.idCategory === id ? { ...c, name: data.name, description: data.description || '' } : c)
      saveStoredCategories(updated)
      return updated.find(c => c.idCategory === id)!
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      return await request<void>(`/categories/${id}`, { method: 'DELETE' })
    } catch {
      const cats = getStoredCategories().filter(c => c.idCategory !== id)
      saveStoredCategories(cats)
    }
  },
}

export const productApi = {
  getAll: async (categoryIds?: number[]): Promise<ProductSummary[]> => {
    try {
      const params = categoryIds?.length ? `?category=${categoryIds.join('&category=')}` : ''
      return await request<ProductSummary[]>(`/products${params}`)
    } catch {
      let prods = getStoredProducts()
      if (categoryIds && categoryIds.length > 0) {
        prods = prods.filter(p => categoryIds.includes(p.categoryId))
      }
      return prods
    }
  },
  getOne: async (id: number): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>(`/products/${id}`)
    } catch {
      const prods = getStoredProducts()
      const found = prods.find(p => p.idProduct === id)
      if (!found) throw new Error('Producto no encontrado')
      return found
    }
  },
  search: async (params: { q?: string; category?: number[]; minCondition?: number; maxCondition?: number; available?: boolean; sex?: string; size?: string }): Promise<ProductSummary[]> => {
    try {
      const sp = new URLSearchParams()
      if (params.q) sp.set('q', params.q)
      if (params.category?.length) params.category.forEach(c => sp.append('category', String(c)))
      if (params.minCondition !== undefined) sp.set('minCondition', String(params.minCondition))
      if (params.maxCondition !== undefined) sp.set('maxCondition', String(params.maxCondition))
      if (params.available !== undefined) sp.set('available', String(params.available))
      if (params.sex) sp.set('sex', params.sex)
      if (params.size) sp.set('size', params.size)
      const qs = sp.toString()
      return await request<ProductSummary[]>(`/products/search${qs ? '?' + qs : ''}`)
    } catch {
      let list = getStoredProducts()
      if (params.q) {
        const query = params.q.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
      }
      if (params.category && params.category.length > 0) {
        list = list.filter(p => params.category!.includes(p.categoryId))
      }
      if (params.minCondition !== undefined && params.minCondition > 0) {
        list = list.filter(p => p.condition >= params.minCondition!)
      }
      if (params.maxCondition !== undefined && params.maxCondition < 5) {
        list = list.filter(p => p.condition <= params.maxCondition!)
      }
      if (params.sex) {
        list = list.filter(p => p.sex === params.sex || p.sex === 'U')
      }
      if (params.available !== undefined) {
        list = list.filter(p => p.available === params.available)
      }
      if (params.size) {
        list = list.filter(p => p.size.toLowerCase().includes(params.size!.toLowerCase()))
      }
      return list
    }
  },
  create: async (data: ProductCreate): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>('/products', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      const prods = getStoredProducts()
      const cats = getStoredCategories()
      const cat = cats.find(c => c.idCategory === data.categoryId)

      // Ensure images array has at most 5 items and primary imageUrl is set
      const cleanImages = (data.images && data.images.length > 0)
        ? data.images.slice(0, 5)
        : (data.imageUrl ? [data.imageUrl] : [])
      const primaryImg = cleanImages[0] || data.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'

      const newProduct: ProductDetail = {
        idProduct: Date.now(),
        name: data.name,
        description: data.description || '',
        price: data.price,
        size: data.size || 'M',
        condition: data.condition,
        imageUrl: primaryImg,
        images: cleanImages.length > 0 ? cleanImages : [primaryImg],
        categoryId: data.categoryId,
        categoryName: cat?.name || 'Varios',
        available: data.available,
        sex: data.sex || 'U',
      }
      const updated = [newProduct, ...prods]
      saveStoredProducts(updated)
      return newProduct
    }
  },
  update: async (id: number, data: ProductCreate): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    } catch {
      const prods = getStoredProducts()
      const cats = getStoredCategories()
      const cat = cats.find(c => c.idCategory === data.categoryId)

      const cleanImages = (data.images && data.images.length > 0)
        ? data.images.slice(0, 5)
        : (data.imageUrl ? [data.imageUrl] : [])
      const primaryImg = cleanImages[0] || data.imageUrl || ''

      const updated = prods.map(p => p.idProduct === id ? {
        ...p,
        ...data,
        description: data.description || '',
        size: data.size || 'M',
        imageUrl: primaryImg || p.imageUrl,
        images: cleanImages.length > 0 ? cleanImages : (p.images || [p.imageUrl]),
        categoryName: cat?.name || p.categoryName,
        sex: data.sex || p.sex,
      } : p)
      saveStoredProducts(updated)
      return updated.find(p => p.idProduct === id)!
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      return await request<void>(`/products/${id}`, { method: 'DELETE' })
    } catch {
      const prods = getStoredProducts().filter(p => p.idProduct !== id)
      saveStoredProducts(prods)
    }
  },
}

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    try {
      return await request<Customer[]>('/customers')
    } catch {
      return [
        { idCustomer: 1, name: 'Camila Rossi', email: 'camila@example.com', phone: '+51 987654321', address: 'Av. Larco 450, Miraflores, Lima' },
        { idCustomer: 2, name: 'Diego Benavides', email: 'diego@example.com', phone: '+51 912345678', address: 'Jr. Colina 210, Barranco, Lima' },
      ]
    }
  },
  getOne: async (id: number): Promise<Customer> => {
    try {
      return await request<Customer>(`/customers/${id}`)
    } catch {
      return { idCustomer: id, name: 'Cliente La Cachina', email: 'cliente@lacachinaonline.pe', phone: '+51 999888777', address: 'Lima, Perú' }
    }
  },
  create: async (data: { name: string; email: string; phone?: string; address?: string }): Promise<Customer> => {
    try {
      return await request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      return {
        idCustomer: Date.now(),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
      }
    }
  },
}

export const saleApi = {
  getAll: async (): Promise<Sale[]> => {
    try {
      return await request<Sale[]>('/sales')
    } catch {
      return [
        {
          idSale: 101,
          subTotal: 340.00,
          tax: 61.20,
          total: 401.20,
          description: 'Chaqueta Aviador 1980s',
          customerId: 1,
          customerName: 'Camila Rossi',
          saleDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          idSale: 102,
          subTotal: 210.00,
          tax: 37.80,
          total: 247.80,
          description: 'Levi\'s 501 Selvedge',
          customerId: 2,
          customerName: 'Diego Benavides',
          saleDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ]
    }
  },
  getOne: async (id: number): Promise<Sale> => {
    try {
      return await request<Sale>(`/sales/${id}`)
    } catch {
      return {
        idSale: id,
        subTotal: 200,
        tax: 36,
        total: 236,
        description: 'Venta de prueba',
        customerId: 1,
        customerName: 'Cliente VV',
        saleDate: new Date().toISOString(),
      }
    }
  },
  create: async (data: { customerId: number; description: string }): Promise<Sale> => {
    try {
      return await request<Sale>('/sales', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      return {
        idSale: Math.floor(1000 + Math.random() * 9000),
        subTotal: 180,
        tax: 32.4,
        total: 212.4,
        description: data.description,
        customerId: data.customerId,
        customerName: 'Cliente',
        saleDate: new Date().toISOString(),
      }
    }
  },
}
