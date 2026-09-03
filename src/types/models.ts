export interface Category {
  idCategory: string
  name: string
  description: string
  productCount: number
}

export interface CategoryFull extends Category {
  products: ProductSummary[]
}

export interface ProductSummary {
  idProduct: string
  name: string
  description?: string
  price: number
  size: string
  condition: number
  imageUrl: string
  images?: string[]
  categories?: string[]
  categoryId: string
  categoryName: string
  available: boolean
  sex: string
  status?: 'PUBLICADO' | 'PENDIENTE_REVISION' | 'RECHAZADO' | string
  sellerEmail?: string
  sellerName?: string
  rejectionReason?: string
}

export interface ProductDetail {
  idProduct: string
  name: string
  description: string
  price: number
  size: string
  condition: number
  imageUrl: string
  images?: string[]
  categories?: string[]
  categoryId: string
  categoryName: string
  available: boolean
  sex: string
  status?: 'PUBLICADO' | 'PENDIENTE_REVISION' | 'RECHAZADO' | string
  sellerEmail?: string
  sellerName?: string
  rejectionReason?: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  size?: string
  condition: number
  imageUrl?: string
  images?: string[]
  categories?: string[]
  categoryId: string
  available: boolean
  sex?: string
  status?: string
  sellerEmail?: string
  sellerName?: string
}

export interface ProductUpdate extends ProductCreate {
  rejectionReason?: string
}

export interface Customer {
  idCustomer: string
  name: string
  email: string
  phone: string
  address: string
}

export interface Sale {
  idSale: string
  subTotal: number
  tax: number
  total: number
  description: string
  customerId: string
  customerName: string
  saleDate: string
}

export interface SaleDetail {
  idSaleDetail: string
  quantity: number
  unitPrice: number
  total: number
  productId: string
  productName: string
  saleId: string
}

export interface CartItem {
  product: ProductSummary
  quantity: number
}

export interface ClaimCreate {
  docType: string
  docNumber: string
  fullName: string
  email: string
  phone: string
  address: string
  department?: string
  province?: string
  district?: string
  isMinor?: boolean
  parentName?: string
  parentDocNumber?: string
  contractedGoodType: string
  claimedAmount?: number
  goodDescription: string
  orderNumber?: string
  claimType: 'RECLAMO' | 'QUEJA'
  detail: string
  consumerRequest: string
}

export interface ClaimResponse {
  idClaim: string
  claimCode: string
  createdAt: string
  docType: string
  docNumber: string
  fullName: string
  email: string
  phone: string
  address: string
  department?: string
  province?: string
  district?: string
  isMinor?: boolean
  parentName?: string
  parentDocNumber?: string
  contractedGoodType: string
  claimedAmount?: number
  goodDescription: string
  orderNumber?: string
  claimType: 'RECLAMO' | 'QUEJA'
  detail: string
  consumerRequest: string
  status: 'PENDIENTE' | 'EN_REVISION' | 'ATENDIDO'
  adminResponse?: string
  respondedAt?: string
  respondedBy?: string
}

export interface AppUser {
  username: string
  email: string
  displayName?: string
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER' | 'USER'
}

export interface AuctionBid {
  idBid: string
  idAuction: string
  bidderEmail: string
  bidderName: string
  amount: number
  bidTime: string
}

export interface Auction {
  idAuction: string
  title: string
  description?: string
  imageUrl: string
  images?: string[]
  startingPrice: number
  currentBid: number
  minIncrement: number
  startTime: string
  endTime: string
  status: 'ACTIVE' | 'FINISHED' | 'CANCELLED' | string
  sellerEmail?: string
  sellerName?: string
  highestBidderEmail?: string
  highestBidderName?: string
  bidCount: number
  size?: string
  condition: number
  categoryName?: string
  createdAt?: string
  bids?: AuctionBid[]
}

export interface AuctionCreate {
  title: string
  description?: string
  imageUrl?: string
  images?: string[]
  startingPrice: number
  minIncrement?: number
  startTime?: string
  endTime?: string
  sellerEmail?: string
  sellerName?: string
  size?: string
  condition?: number
  categoryName?: string
}

export interface BidCreate {
  bidderEmail: string
  bidderName: string
  amount: number
}

export interface SellerApplication {
  idApplication: string
  userEmail: string
  userName?: string
  shopName: string
  docNumber?: string
  phone?: string
  instagram?: string
  experienceDetails?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  rejectionReason?: string
  createdAt: string
  updatedAt?: string
}

export interface SellerApplicationCreate {
  userEmail: string
  userName?: string
  shopName: string
  docNumber?: string
  phone?: string
  instagram?: string
  experienceDetails?: string
}



