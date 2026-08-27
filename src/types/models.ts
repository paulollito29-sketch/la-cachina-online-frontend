export interface Category {
  idCategory: number
  name: string
  description: string
  productCount: number
}

export interface CategoryFull extends Category {
  products: ProductSummary[]
}

export interface ProductSummary {
  idProduct: number
  name: string
  price: number
  size: string
  condition: number
  imageUrl: string
  images?: string[]
  categoryId: number
  categoryName: string
  available: boolean
  sex: string
}

export interface ProductDetail {
  idProduct: number
  name: string
  description: string
  price: number
  size: string
  condition: number
  imageUrl: string
  images?: string[]
  categoryId: number
  categoryName: string
  available: boolean
  sex: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  size?: string
  condition: number
  imageUrl?: string
  images?: string[]
  categoryId: number
  available: boolean
  sex?: string
}

export interface ProductUpdate extends ProductCreate {}

export interface Customer {
  idCustomer: number
  name: string
  email: string
  phone: string
  address: string
}

export interface Sale {
  idSale: number
  subTotal: number
  tax: number
  total: number
  description: string
  customerId: number
  customerName: string
  saleDate: string
}

export interface SaleDetail {
  idSaleDetail: number
  quantity: number
  unitPrice: number
  total: number
  productId: number
  productName: string
  saleId: number
}

export interface CartItem {
  product: ProductSummary
  quantity: number
}
