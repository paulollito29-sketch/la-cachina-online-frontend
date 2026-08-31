import type { Category, ProductDetail } from '../types/models'

export const INITIAL_CATEGORIES: Category[] = []

export const INITIAL_PRODUCTS: ProductDetail[] = []

const CATEGORIES_KEY = 'lco_categories_v2'
const PRODUCTS_KEY = 'lco_products_v2'

export function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveStoredCategories(categories: Category[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  } catch {}
}

export function getStoredProducts(): ProductDetail[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveStoredProducts(products: ProductDetail[]) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  } catch {}
}

const AUCTIONS_KEY = 'lco_auctions_v3'

// Clear legacy cached demo auctions
try {
  localStorage.removeItem('lco_auctions_v2')
  localStorage.removeItem('lco_auctions_v1')
  localStorage.removeItem('vv_auctions')
} catch {}

export const INITIAL_AUCTIONS: import('../types/models').Auction[] = []

export function getStoredAuctions(): import('../types/models').Auction[] {
  try {
    const raw = localStorage.getItem(AUCTIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function saveStoredAuctions(auctions: import('../types/models').Auction[]) {
  try {
    localStorage.setItem(AUCTIONS_KEY, JSON.stringify(auctions))
  } catch {}
}

const SELLER_APPS_KEY = 'lco_seller_applications_v1'

export const INITIAL_SELLER_APPLICATIONS: import('../types/models').SellerApplication[] = [
  {
    idApplication: 1,
    userEmail: 'comprador@lacachinaonline.pe',
    userName: 'Camila Compradora',
    shopName: 'Archive Lima Co.',
    docNumber: '74829103',
    phone: '+51 987 654 321',
    instagram: '@archivelimaco',
    experienceDetails: 'Coleccionista y curadora de prendas deportivas noventeras (Nike, adidas, Umbro) y denim pesado japonés/americano. 4 años vendiendo en ferias vintage locales.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    idApplication: 2,
    userEmail: 'vendedor@lacachinaonline.pe',
    userName: 'Mateo Vendedor',
    shopName: 'Mateo Vintage Vault',
    docNumber: '10459283719',
    phone: '+51 912 345 678',
    instagram: '@mateovintagepe',
    experienceDetails: 'Especialista en camisetas de bandas de rock de los 80s y 90s, chaquetas de cuero Schott y bombers militares.',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

export function getStoredSellerApplications(): import('../types/models').SellerApplication[] {
  try {
    const raw = localStorage.getItem(SELLER_APPS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return INITIAL_SELLER_APPLICATIONS
}

export function saveStoredSellerApplications(apps: import('../types/models').SellerApplication[]) {
  try {
    localStorage.setItem(SELLER_APPS_KEY, JSON.stringify(apps))
  } catch {}
}
