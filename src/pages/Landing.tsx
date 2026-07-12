import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import type { ProductSummary } from '../types/models'

const categories = [
  { icon: '👕', name: 'Polos' },
  { icon: '👖', name: 'Pantalones' },
  { icon: '🧥', name: 'Chaquetas' },
  { icon: '👗', name: 'Vestidos' },
  { icon: '👟', name: 'Calzado' },
  { icon: '👜', name: 'Accesorios' },
]

export default function Landing() {
  const [featured, setFeatured] = useState<ProductSummary[]>([])

  useEffect(() => {
    productApi.getAll().then(setFeatured)
  }, [])

  return (
    <>
      <section className="hero-section" style={{ backgroundImage: `url(/assets/Vintage_leather_jacket_floating_._202607121545.jpeg)` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-eyebrow">Vault Vintage</span>
          <h1>Donde lo vintage<br />encuentra un nuevo hogar</h1>
          <p>Ropa de segunda mano seleccionada con cuidado. Piezas únicas con historia, esperando por ti.</p>
          <Link to="/tienda" className="btn-primary">Explorar tienda</Link>
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="section-inner">
          <h2 className="section-title">Cómo funciona</h2>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Explora</h3>
              <p>Navega por nuestras categorías y encuentra lo que buscas.</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Elige</h3>
              <p>Cada pieza tiene su propia historia. Revisa el estado y talla.</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <h3>Lleva</h3>
              <p>Agrega al carrito y coordina la entrega. Simple y seguro.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-image-between" style={{ backgroundImage: `url(/assets/Workers_inspect_vintage_clothes_2K_202607121545.jpeg)` }}>
        <div className="section-overlay" />
        <div className="section-inner">
          <div className="image-between-content">
            <span className="image-between-eyebrow">Detrás de cada prenda</span>
            <h2>Selección cuidadosa,<br />restauración dedicada</h2>
            <p>Cada pieza que llega a Vault Vintage pasa por un proceso de inspección, limpieza y restauración. No vendemos ropa usada — vendemos historias renovadas.</p>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-inner">
          <h2 className="section-title">Categorías</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link to="/tienda" key={cat.name} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Productos destacados</h2>
          <div className="products-grid">
            {featured.slice(0, 4).map(p => (
              <ProductCard key={p.idProduct} product={p} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/tienda" className="btn-outline">Ver todos</Link>
          </div>
        </div>
      </section>

      <section className="section section-image-between" style={{ backgroundImage: `url(/assets/Vintage_storefront_diorama_2K_202607121545.jpeg)` }}>
        <div className="section-overlay" />
        <div className="section-inner">
          <div className="image-between-content image-between-right">
            <span className="image-between-eyebrow">La tienda</span>
            <h2>Un escaparate<br />que cambia contigo</h2>
            <p>Desde chaquetas de los 70 hasta sedas de los 90. Cada colección es una cápsula curada con piezas únicas que no se repiten.</p>
            <Link to="/tienda" className="btn-primary">Visitar tienda</Link>
          </div>
        </div>
      </section>

      <section className="section section-cream" id="contacto">
        <div className="section-inner">
          <h2 className="section-title">¿Tienes ropa para vender?</h2>
          <p className="section-text">
            Contáctanos y dale una segunda vida a tus prendas. Seleccionamos piezas en buen estado
            y las preparamos para un nuevo dueño.
          </p>
          <a href="mailto:hola@vaultvintage.pe" className="btn-primary">Escríbenos</a>
        </div>
      </section>
    </>
  )
}
