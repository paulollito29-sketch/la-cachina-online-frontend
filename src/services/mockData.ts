import type { Category, ProductDetail } from '../types/models'

export const INITIAL_CATEGORIES: Category[] = [
  { idCategory: 1, name: 'Casacas & Cortavientos', description: 'Casacas de cuero, cortavientos 90s, bombers retro, polar fleece y varsity jackets.', productCount: 4 },
  { idCategory: 2, name: 'Jeans & Pantalones', description: 'Levi\'s 501 vintage, pantalones cargo, carpinteros Carhartt, pana y cortes baggy.', productCount: 3 },
  { idCategory: 3, name: 'Polos Gráficos & Band Tees', description: 'Polos de bandas de rock, hip hop 90s, gráficos vintage, skate y anime de época.', productCount: 4 },
  { idCategory: 4, name: 'Camisas & Sedas', description: 'Camisas de seda pura, camisas floreadas retro, franelas pesadas y estilo bowling.', productCount: 3 },
  { idCategory: 5, name: 'Tabas & Zapatillas', description: 'Zapatillas retro de colección, botines de cuero legítimo y calzado vintage.', productCount: 2 },
  { idCategory: 6, name: 'Huachaferías & Accesorios', description: 'Gorras vintage, correas de cuero con hebillas clásicas, bolsos y reliquias.', productCount: 3 },
]

export const INITIAL_PRODUCTS: ProductDetail[] = [
  {
    idProduct: 1,
    name: 'Casaca de Cuero Aviador 1980s Legit',
    description: 'Joya encontrada en lote de archivo. Cuero vacuno pesado legítimo estilo aviador con cuello de borrego desmontable y cierres YKK de bronce macizo. Pátina envejecida natural impecable, forro interior satinado limpio y acondicionado.',
    price: 320.00,
    size: 'L',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 1,
    categoryName: 'Casacas & Cortavientos',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 2,
    name: 'Levi\'s 501 Original Selvedge 1994 USA',
    description: 'El clásico grial de La Cachina. Jeans Levi\'s 501 corte recto en denim pesado 14oz Made in USA. Desgaste y bigotes naturales en muslos con remaches de cobre originales y botón de metal con grabado auténtico de época.',
    price: 195.00,
    size: '32/32',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 2,
    categoryName: 'Jeans & Pantalones',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 3,
    name: 'Polo Vintage Nirvana In Utero Tour 1993',
    description: 'Polo de algodón 100% hilado con costura simple (single stitch) en mangas y dobladillo. Lavado gris carbón desgastado con micro-craquelado natural en estampado. Una verdadera reliquia noventera.',
    price: 180.00,
    size: 'XL (Oversized)',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 3,
    categoryName: 'Polos Gráficos & Band Tees',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 4,
    name: 'Camisa de Seda Pura Barock Versace Style 90s',
    description: 'Camisa confeccionada en 100% seda salvaje con estampado barroco dorado sobre fondo negro y azul cobalto. Botones de nácar genuino, caída suelta y brillo satinado vintage de alta calidad.',
    price: 160.00,
    size: 'M',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603252109303-2751441ec157?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 4,
    categoryName: 'Camisas & Sedas',
    available: true,
    sex: 'M',
  },
  {
    idProduct: 5,
    name: 'Trench Coat Gabardina Británica Clásica 1985',
    description: 'Abrigo trench cruzado en gabardina de algodón repelente con forro interior en tartán escocés. Cinturón ajustable con hebilla de cuero y botones de carey originales.',
    price: 260.00,
    size: 'M',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 1,
    categoryName: 'Casacas & Cortavientos',
    available: true,
    sex: 'F',
  },
  {
    idProduct: 6,
    name: 'Casaca Bomber Varsity Wool & Leather 90s',
    description: 'Chaqueta universitaria vintage con cuerpo de lana pesada color verde pino, mangas en cuero crema vacuno y parches bordados en chenille de época.',
    price: 250.00,
    size: 'L',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 1,
    categoryName: 'Casacas & Cortavientos',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 7,
    name: 'Pantalón Corduroy Pana Ancha Mostaza 70s',
    description: 'Pantalón de pana de canalé grueso de los 70s en tono mostaza tostado. Tiro alto estructurado con bolsillos frontales de parche y bota ancha acampanada.',
    price: 135.00,
    size: 'S',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 2,
    categoryName: 'Jeans & Pantalones',
    available: true,
    sex: 'F',
  },
  {
    idProduct: 8,
    name: 'Tabas Chelsea Boots Cuero Graso Hecho a Mano',
    description: 'Botines Chelsea en cuero engrasado castaño oscuro con construcción artesanal GoodYear Welt y suela de suela legítima. Elásticos laterales con ajuste perfecto.',
    price: 240.00,
    size: '41',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 5,
    categoryName: 'Tabas & Zapatillas',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 9,
    name: 'Morral Bandolera Cuero Sillero Vintage 70s',
    description: 'Bolso morral de cuero vacuno grueso con costuras enceradas artesanales, herrajes de latón macizo y compartimento interior en gamuza suave. Pátina rústica hermosa.',
    price: 140.00,
    size: 'Única',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 6,
    categoryName: 'Huachaferías & Accesorios',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 10,
    name: 'Polo Ralph Lauren Vintage Piqué Club 90s',
    description: 'Polo de colección de los 90s en piqué de algodón peinado verde esmeralda con bordado original en hilo de seda dorada. Calce regular vintage.',
    price: 105.00,
    size: 'M',
    condition: 5,
    imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 3,
    categoryName: 'Polos Gráficos & Band Tees',
    available: true,
    sex: 'M',
  },
  {
    idProduct: 11,
    name: 'Camisa Franela Leñadora Oversized 80s',
    description: 'Camisa a cuadros escoceses en franela de algodón pesado ultrasuave. Silueta holgada con bolsillos de parche con solapa en pecho.',
    price: 115.00,
    size: 'XL',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 4,
    categoryName: 'Camisas & Sedas',
    available: true,
    sex: 'U',
  },
  {
    idProduct: 12,
    name: 'Casaca Vaquera Denim Sherpa Wrangler 70s',
    description: 'Casaca denim vintage con forro interior de borrego abrigador, botones metálicos a presión nacarados Wrangler y desgastes auténticos de archivo.',
    price: 220.00,
    size: 'L',
    condition: 4,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80',
    ],
    categoryId: 1,
    categoryName: 'Casacas & Cortavientos',
    available: true,
    sex: 'U',
  },
]

export function getStoredProducts(): ProductDetail[] {
  try {
    const data = localStorage.getItem('lco_mock_products')
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return INITIAL_PRODUCTS
}

export function saveStoredProducts(products: ProductDetail[]) {
  localStorage.setItem('lco_mock_products', JSON.stringify(products))
}

export function getStoredCategories(): Category[] {
  try {
    const data = localStorage.getItem('lco_mock_categories')
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return INITIAL_CATEGORIES
}

export function saveStoredCategories(categories: Category[]) {
  localStorage.setItem('lco_mock_categories', JSON.stringify(categories))
}
