export interface UserOrderItem {
  idProduct: number
  name: string
  price: number
  size?: string
  imageUrl: string
  quantity: number
}

export interface UserOrder {
  orderId: string
  orderDate: string
  items: UserOrderItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  shippingAddress: string
  department: string
  province: string
  district: string
  trackingCode: string
  status: 'PROCESANDO' | 'EN_CAMINO' | 'ENTREGADO'
  userEmail: string
}

const ORDERS_STORAGE_KEY = 'lco_user_orders_v1'

export function getAllOrders(): UserOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function getOrdersByUser(userEmail?: string): UserOrder[] {
  if (!userEmail) return []
  const all = getAllOrders()
  return all.filter(o => o.userEmail.toLowerCase() === userEmail.toLowerCase())
}

export function saveUserOrder(order: UserOrder) {
  try {
    const all = getAllOrders()
    const updated = [order, ...all]
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}
