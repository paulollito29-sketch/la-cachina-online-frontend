import type { Category, CategoryFull, ProductSummary, ProductDetail, Customer, Sale } from '../types/models'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
}

export const productApi = {
  getAll: (categoryIds?: number[]) => {
    const params = categoryIds?.length ? `?category=${categoryIds.join('&category=')}` : ''
    return request<ProductSummary[]>(`/products${params}`)
  },
  getOne: (id: number) => request<ProductDetail>(`/products/${id}`),
}

export const customerApi = {
  create: (data: { name: string; email: string; phone?: string; address?: string }) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
}

export const saleApi = {
  create: (data: { customerId: number; description: string }) =>
    request<Sale>('/sales', { method: 'POST', body: JSON.stringify(data) }),
}
