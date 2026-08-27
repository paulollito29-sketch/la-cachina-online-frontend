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
