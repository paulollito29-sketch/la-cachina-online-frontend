import type { Category, CategoryFull, ProductSummary, ProductDetail, ProductCreate, Customer, Sale, Auction, AuctionBid, AuctionCreate, BidCreate, SellerApplication, SellerApplicationCreate } from '../types/models'
import { getStoredCategories, getStoredProducts, saveStoredCategories, saveStoredProducts, getStoredAuctions, saveStoredAuctions, getStoredSellerApplications, saveStoredSellerApplications } from './mockData'

export const API_BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = localStorage.getItem('lco_user')
  const token = stored ? JSON.parse(stored).token : null
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

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
  getOne: async (id: string): Promise<CategoryFull> => {
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
        idCategory: String(Date.now()),
        name: data.name,
        description: data.description || '',
        productCount: 0,
      }
      const updated = [...cats, newCat]
      saveStoredCategories(updated)
      return newCat
    }
  },
  update: async (id: string, data: { name: string; description?: string }): Promise<Category> => {
    try {
      return await request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    } catch {
      const cats = getStoredCategories()
      const updated = cats.map(c => c.idCategory === id ? { ...c, name: data.name, description: data.description || '' } : c)
      saveStoredCategories(updated)
      return updated.find(c => c.idCategory === id)!
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      return await request<void>(`/categories/${id}`, { method: 'DELETE' })
    } catch {
      const cats = getStoredCategories().filter(c => c.idCategory !== id)
      saveStoredCategories(cats)
    }
  },
}

export const productApi = {
  getAll: async (categoryIds?: string[]): Promise<ProductSummary[]> => {
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
  getOne: async (id: string): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>(`/products/${id}`)
    } catch {
      const prods = getStoredProducts()
      const found = prods.find(p => p.idProduct === id)
      if (!found) throw new Error('Producto no encontrado')
      return found
    }
  },
  search: async (params: { q?: string; category?: string[]; minCondition?: number; maxCondition?: number; available?: boolean; sex?: string; size?: string }): Promise<ProductSummary[]> => {
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
      const cats = getStoredCategories()
      if (params.q) {
        const query = params.q.toLowerCase()
        list = list.filter(p => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)))
      }
      if (params.category && params.category.length > 0) {
        list = list.filter(p => {
          if (params.category!.includes(p.categoryId)) return true
          if (p.categories && p.categories.some(c => {
            const catObj = cats.find(x => x.name.toLowerCase() === c.toLowerCase())
            return catObj && params.category!.includes(catObj.idCategory)
          })) return true
          return false
        })
      }
      if (params.minCondition !== undefined && params.minCondition > 0) {
        list = list.filter(p => p.condition >= params.minCondition!)
      }
      if (params.maxCondition !== undefined && params.maxCondition < 5) {
        list = list.filter(p => p.condition <= params.maxCondition!)
      }
      if (params.sex) {
        const s = params.sex.toUpperCase()
        list = list.filter(p => {
          const pSex = (p.sex || 'UNISEX').toUpperCase()
          if (s === 'U' || s === 'UNISEX') return pSex === 'UNISEX' || pSex === 'U'
          if (s === 'M' || s === 'HOMBRE') return pSex === 'HOMBRE' || pSex === 'M' || pSex === 'UNISEX' || pSex === 'U'
          if (s === 'F' || s === 'MUJER') return pSex === 'MUJER' || pSex === 'F' || pSex === 'UNISEX' || pSex === 'U'
          return pSex === s
        })
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
        idProduct: String(Date.now()),
        name: data.name,
        description: data.description || '',
        price: data.price,
        size: data.size || 'M',
        condition: data.condition,
        imageUrl: primaryImg,
        images: cleanImages.length > 0 ? cleanImages : [primaryImg],
        categories: data.categories && data.categories.length > 0 ? data.categories : (cat?.name ? [cat.name] : []),
        categoryId: data.categoryId,
        categoryName: cat?.name || 'Varios',
        available: data.available,
        sex: data.sex || 'UNISEX',
      }
      const updated = [newProduct, ...prods]
      saveStoredProducts(updated)
      return newProduct
    }
  },
  update: async (id: string, data: ProductCreate): Promise<ProductDetail> => {
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
        categories: data.categories || p.categories,
        categoryName: cat?.name || p.categoryName,
        sex: data.sex || p.sex,
      } : p)
      saveStoredProducts(updated)
      return updated.find(p => p.idProduct === id)!
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      return await request<void>(`/products/${id}`, { method: 'DELETE' })
    } catch {
      const prods = getStoredProducts().filter(p => p.idProduct !== id)
      saveStoredProducts(prods)
    }
  },
  getPending: async (): Promise<ProductSummary[]> => {
    try {
      return await request<ProductSummary[]>('/products/pending')
    } catch {
      const prods = getStoredProducts()
      return prods.filter(p => p.status === 'PENDIENTE_REVISION')
    }
  },
  getSellerSubmissions: async (sellerEmail?: string): Promise<ProductSummary[]> => {
    try {
      const qs = sellerEmail ? `?email=${encodeURIComponent(sellerEmail)}` : ''
      return await request<ProductSummary[]>(`/products/seller-submissions${qs}`)
    } catch {
      const prods = getStoredProducts()
      if (!sellerEmail) return []
      return prods.filter(p => p.sellerEmail?.toLowerCase() === sellerEmail.toLowerCase())
    }
  },
  submitBySeller: async (data: ProductCreate, sellerEmail?: string, sellerName?: string): Promise<ProductDetail> => {
    const payload = {
      ...data,
      status: 'PENDIENTE_REVISION',
      sellerEmail,
      sellerName,
    }
    try {
      return await request<ProductDetail>('/products/submit', { method: 'POST', body: JSON.stringify(payload) })
    } catch {
      const prods = getStoredProducts()
      const cats = getStoredCategories()
      const cat = cats.find(c => c.idCategory === data.categoryId)

      const cleanImages = (data.images && data.images.length > 0)
        ? data.images.slice(0, 5)
        : (data.imageUrl ? [data.imageUrl] : [])
      const primaryImg = cleanImages[0] || data.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'

      const newProduct: ProductDetail = {
        idProduct: String(Date.now()),
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
        status: 'PENDIENTE_REVISION',
        sellerEmail,
        sellerName,
      }
      const updated = [newProduct, ...prods]
      saveStoredProducts(updated)
      return newProduct
    }
  },
  approve: async (id: string): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>(`/products/${id}/approve`, { method: 'POST' })
    } catch {
      const prods = getStoredProducts()
      const updated = prods.map(p => p.idProduct === id ? { ...p, status: 'PUBLICADO', rejectionReason: undefined } : p)
      saveStoredProducts(updated)
      return updated.find(p => p.idProduct === id) as ProductDetail
    }
  },
  reject: async (id: string, reason?: string): Promise<ProductDetail> => {
    try {
      return await request<ProductDetail>(`/products/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
    } catch {
      const prods = getStoredProducts()
      const updated = prods.map(p => p.idProduct === id ? { ...p, status: 'RECHAZADO', rejectionReason: reason || 'Rechazado por el administrador' } : p)
      saveStoredProducts(updated)
      return updated.find(p => p.idProduct === id) as ProductDetail
    }
  },
}

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    try {
      return await request<Customer[]>('/customers')
    } catch {
      return [
        { idCustomer: '1', name: 'Camila Rossi', email: 'camila@example.com', phone: '+51 987654321', address: 'Av. Larco 450, Miraflores, Lima' },
        { idCustomer: '2', name: 'Diego Benavides', email: 'diego@example.com', phone: '+51 912345678', address: 'Jr. Colina 210, Barranco, Lima' },
      ]
    }
  },
  getOne: async (id: string): Promise<Customer> => {
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
        idCustomer: String(Date.now()),
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
      return []
    }
  },
  getOne: async (id: string): Promise<Sale> => {
    return await request<Sale>(`/sales/${id}`)
  },
  create: async (data: { customerId: string; description: string }): Promise<Sale> => {
    try {
      return await request<Sale>('/sales', { method: 'POST', body: JSON.stringify(data) })
    } catch {
      return {
        idSale: String(Date.now()),
        subTotal: 0,
        tax: 0,
        total: 0,
        description: data.description,
        customerId: data.customerId,
        customerName: 'Cliente',
        saleDate: new Date().toISOString(),
      }
    }
  },
}

const CLAIMS_STORAGE_KEY = 'lco_claims_prod_v1'

function getStoredClaims(): import('../types/models').ClaimResponse[] {
  try {
    const raw = localStorage.getItem(CLAIMS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveStoredClaims(claims: import('../types/models').ClaimResponse[]) {
  try {
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims))
  } catch {}
}

export const claimApi = {
  create: async (data: import('../types/models').ClaimCreate): Promise<import('../types/models').ClaimResponse> => {
    try {
      return await request<import('../types/models').ClaimResponse>('/claims', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      const existing = getStoredClaims()
      const currentYear = new Date().getFullYear()
      const code = `LR-${currentYear}-${String(existing.length + 1).padStart(4, '0')}`
      const newClaim: import('../types/models').ClaimResponse = {
        ...data,
        idClaim: String(Date.now()),
        claimCode: code,
        createdAt: new Date().toISOString(),
        status: 'PENDIENTE',
      }
      const updated = [newClaim, ...existing]
      saveStoredClaims(updated)
      return newClaim
    }
  },
  getAll: async (): Promise<import('../types/models').ClaimResponse[]> => {
    try {
      return await request<import('../types/models').ClaimResponse[]>('/claims')
    } catch {
      return getStoredClaims()
    }
  },
  getOneByCode: async (code: string): Promise<import('../types/models').ClaimResponse> => {
    try {
      return await request<import('../types/models').ClaimResponse>(`/claims/track/${code}`)
    } catch {
      const found = getStoredClaims().find(c => c.claimCode.toUpperCase() === code.trim().toUpperCase())
      if (!found) throw new Error(`No se encontró ninguna reclamación con el código ${code}`)
      return found
    }
  },
  updateStatus: async (
    id: string,
    data: { status: 'PENDIENTE' | 'EN_REVISION' | 'ATENDIDO'; adminResponse?: string }
  ): Promise<import('../types/models').ClaimResponse> => {
    try {
      return await request<import('../types/models').ClaimResponse>(`/claims/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch {
      const existing = getStoredClaims()
      const updated = existing.map(c => {
        if (c.idClaim === id) {
          return {
            ...c,
            status: data.status,
            adminResponse: data.adminResponse || c.adminResponse,
            respondedAt: data.adminResponse ? new Date().toISOString() : c.respondedAt,
            respondedBy: 'La Cachina Admin',
          }
        }
        return c
      })
      saveStoredClaims(updated)
      return updated.find(c => c.idClaim === id)!
    }
  },
}

export const userApi = {
  getAllUsers: async (): Promise<import('../types/models').AppUser[]> => {
    try {
      const res = await request<import('../types/models').AppUser[]>('/auth/users')
      if (res && res.length > 0) return res
    } catch {}

    try {
      const raw = localStorage.getItem('lco_registered_users_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(u => ({
            username: u.username,
            email: u.email,
            displayName: u.displayName || u.username,
            role: u.role || 'CUSTOMER',
          }))
        }
      }
    } catch {}

    return [
      { username: 'cachina', email: 'cachina@lacachinaonline.pe', displayName: 'La Cachina Admin', role: 'ADMIN' },
      { username: 'vendedor', email: 'vendedor@lacachina.pe', displayName: 'Vendedor Vintage Oficial', role: 'SELLER' },
    ]
  },
}

export const auctionApi = {
  getAll: async (): Promise<Auction[]> => {
    try {
      const remote = await request<Auction[]>('/auctions')
      if (remote && Array.isArray(remote)) {
        saveStoredAuctions(remote)
        return remote
      }
      return getStoredAuctions()
    } catch {
      return getStoredAuctions()
    }
  },
  getOne: async (id: string): Promise<Auction> => {
    try {
      return await request<Auction>(`/auctions/${id}`)
    } catch {
      const all = await auctionApi.getAll()
      const found = all.find(a => a.idAuction === id)
      if (!found) throw new Error(`Subasta #${id} no encontrada`)
      return found
    }
  },
  create: async (data: AuctionCreate): Promise<Auction> => {
    try {
      return await request<Auction>('/auctions', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      const all = await auctionApi.getAll()
      const newAuction: Auction = {
        idAuction: String(Date.now()),
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || data.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        images: data.images || (data.imageUrl ? [data.imageUrl] : []),
        startingPrice: data.startingPrice,
        currentBid: data.startingPrice,
        minIncrement: data.minIncrement || 10.0,
        startTime: data.startTime || new Date().toISOString(),
        endTime: data.endTime || new Date(Date.now() + 3 * 86400000).toISOString(),
        status: 'ACTIVE',
        sellerEmail: data.sellerEmail,
        sellerName: data.sellerName,
        bidCount: 0,
        size: data.size || 'M',
        condition: data.condition || 5,
        categoryName: data.categoryName || 'Chaquetas',
        createdAt: new Date().toISOString(),
        bids: [],
      }
      const updated = [newAuction, ...all]
      saveStoredAuctions(updated)
      return newAuction
    }
  },
  placeBid: async (id: string, bidData: BidCreate): Promise<Auction> => {
    try {
      return await request<Auction>(`/auctions/${id}/bid`, {
        method: 'POST',
        body: JSON.stringify(bidData),
      })
    } catch {
      const all = await auctionApi.getAll()
      const auction = all.find(a => a.idAuction === id)
      if (!auction) throw new Error('Subasta no encontrada')
      if (auction.status !== 'ACTIVE') throw new Error('Esta subasta ya finalizó')

      const minRequired = auction.bidCount === 0 ? auction.startingPrice : auction.currentBid + auction.minIncrement
      if (bidData.amount < minRequired) {
        throw new Error(`La puja mínima requerida es de S/ ${minRequired.toFixed(2)}`)
      }

      const newBid: AuctionBid = {
        idBid: String(Date.now()),
        idAuction: id,
        bidderEmail: bidData.bidderEmail,
        bidderName: bidData.bidderName,
        amount: bidData.amount,
        bidTime: new Date().toISOString(),
      }

      auction.currentBid = bidData.amount
      auction.highestBidderEmail = bidData.bidderEmail
      auction.highestBidderName = bidData.bidderName
      auction.bidCount += 1
      auction.bids = [newBid, ...(auction.bids || [])]

      const updated = all.map(a => a.idAuction === id ? auction : a)
      saveStoredAuctions(updated)
      return auction
    }
  },
}

export const sellerApplicationApi = {
  getAll: async (): Promise<SellerApplication[]> => {
    try {
      const remote = await request<SellerApplication[]>('/seller-applications')
      if (remote && Array.isArray(remote)) {
        saveStoredSellerApplications(remote)
        return remote
      }
      return getStoredSellerApplications()
    } catch {
      return getStoredSellerApplications()
    }
  },
  getMyStatus: async (email: string): Promise<SellerApplication | null> => {
    try {
      return await request<SellerApplication>(`/seller-applications/me?email=${encodeURIComponent(email)}`)
    } catch {
      const all = getStoredSellerApplications()
      return all.find(a => a.userEmail?.toLowerCase() === email.toLowerCase()) || null
    }
  },
  submit: async (data: SellerApplicationCreate): Promise<SellerApplication> => {
    try {
      return await request<SellerApplication>('/seller-applications', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      const all = getStoredSellerApplications()
      const newApp: SellerApplication = {
        idApplication: String(Date.now()),
        userEmail: data.userEmail,
        userName: data.userName,
        shopName: data.shopName,
        docNumber: data.docNumber,
        phone: data.phone,
        instagram: data.instagram,
        experienceDetails: data.experienceDetails,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      const updated = [newApp, ...all]
      saveStoredSellerApplications(updated)
      return newApp
    }
  },
  approve: async (id: string): Promise<SellerApplication> => {
    try {
      return await request<SellerApplication>(`/seller-applications/${id}/approve`, {
        method: 'POST',
      })
    } catch {
      const all = getStoredSellerApplications()
      const app = all.find(a => a.idApplication === id)
      if (!app) throw new Error('Solicitud no encontrada')
      app.status = 'APPROVED'
      app.updatedAt = new Date().toISOString()

      // Also update stored user role if matches current user
      const storedUser = localStorage.getItem('lco_user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        if (u.email?.toLowerCase() === app.userEmail?.toLowerCase()) {
          u.role = 'SELLER'
          localStorage.setItem('lco_user', JSON.stringify(u))
        }
      }

      saveStoredSellerApplications(all)
      return app
    }
  },
  reject: async (id: string, reason?: string): Promise<SellerApplication> => {
    try {
      return await request<SellerApplication>(`/seller-applications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    } catch {
      const all = getStoredSellerApplications()
      const app = all.find(a => a.idApplication === id)
      if (!app) throw new Error('Solicitud no encontrada')
      app.status = 'REJECTED'
      app.rejectionReason = reason
      app.updatedAt = new Date().toISOString()
      saveStoredSellerApplications(all)
      return app
    }
  },
}


