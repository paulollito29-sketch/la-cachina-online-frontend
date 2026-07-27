import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productApi } from '../services/api'
import ProductCard from '../components/ProductCard'
import ScrollReveal from '../components/ScrollReveal'
import { StaggerContainer, StaggerItem } from '../components/StaggerGrid'
import VintageDust from '../components/VintageDust'
import type { ProductSummary } from '../types/models'

const categories = [
  { icon: '👕', name: 'Polos' },
  { icon: '👖', name: 'Pantalones' },
  { icon: '🧥', name: 'Chaquetas' },
  { icon: '👗', name: 'Vestidos' },
  { icon: '👟', name: 'Calzado' },
  { icon: '👜', name: 'Accesorios' },
]

const heroTextVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const heroChildVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function Landing() {
  const [featured, setFeatured] = useState<ProductSummary[]>([])

  useEffect(() => {
    productApi.getAll().then(setFeatured)
  }, [])

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(/assets/Vintage_leather_jacket_floating_._202607121545.jpeg)` }}
      >
        <div className="hero-overlay" />
        <VintageDust density={50} />
        <div className="hero-accent" />
        <motion.div
          className="hero-content"
          variants={heroTextVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero-eyebrow" variants={heroChildVariants}>
            Vault Vintage
          </motion.span>
          <motion.h1 variants={heroChildVariants}>
            Donde lo vintage<br />encuentra un nuevo hogar
          </motion.h1>
          <motion.p variants={heroChildVariants}>
            Ropa de segunda mano seleccionada con cuidado. Piezas únicas con historia, esperando por ti.
          </motion.p>
          <motion.div variants={heroChildVariants}>
            <Link to="/tienda" className="btn-primary btn-primary-glow">
              Explorar tienda
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Cómo funciona ─── */}
      <ScrollReveal>
        <section className="section" id="como-funciona">
          <div className="section-inner">
            <ScrollReveal delay={0.1}>
              <h2 className="section-title">Cómo funciona</h2>
            </ScrollReveal>
            <StaggerContainer className="steps-grid">
              {[
                { num: '1', title: 'Explora', desc: 'Navega por nuestras categorías y encuentra lo que buscas.' },
                { num: '2', title: 'Elige', desc: 'Cada pieza tiene su propia historia. Revisa el estado y talla.' },
                { num: '3', title: 'Lleva', desc: 'Agrega al carrito y coordina la entrega. Simple y seguro.' },
              ].map((step) => (
                <StaggerItem key={step.num}>
                  <div className="step-card">
                    <span className="step-number step-number-pulse">{step.num}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── Image-between 1 ─── */}
      <section
        className="section section-image-between"
        style={{ backgroundImage: `url(/assets/Workers_inspect_vintage_clothes_2K_202607121545.jpeg)` }}
      >
        <div className="section-overlay" />
        <div className="section-inner">
          <ScrollReveal direction="left">
            <div className="image-between-content">
              <span className="image-between-eyebrow">Detrás de cada prenda</span>
              <h2>Selección cuidadosa,<br />restauración dedicada</h2>
              <p>Cada pieza que llega a Vault Vintage pasa por un proceso de inspección, limpieza y restauración. No vendemos ropa usada — vendemos historias renovadas.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Categorías ─── */}
      <section className="section section-dark">
        <div className="section-inner">
          <ScrollReveal>
            <h2 className="section-title">Categorías</h2>
          </ScrollReveal>
          <StaggerContainer className="categories-grid">
            {categories.map(cat => (
              <StaggerItem key={cat.name}>
                <Link to="/tienda" className="category-card category-card-hover">
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Productos destacados ─── */}
      <ScrollReveal>
        <section className="section">
          <div className="section-inner">
            <ScrollReveal delay={0.1}>
              <h2 className="section-title">Productos destacados</h2>
            </ScrollReveal>
            <StaggerContainer className="products-grid">
              {featured.slice(0, 4).map(p => (
                <StaggerItem key={p.idProduct}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
            <div className="section-cta">
              <Link to="/tienda" className="btn-outline">Ver todos</Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ─── Image-between 2 ─── */}
      <section
        className="section section-image-between"
        style={{ backgroundImage: `url(/assets/Vintage_storefront_diorama_2K_202607121545.jpeg)` }}
      >
        <div className="section-overlay" />
        <div className="section-inner">
          <ScrollReveal direction="right">
            <div className="image-between-content image-between-right">
              <span className="image-between-eyebrow">La tienda</span>
              <h2>Un escaparate<br />que cambia contigo</h2>
              <p>Desde chaquetas de los 70 hasta sedas de los 90. Cada colección es una cápsula curada con piezas únicas que no se repiten.</p>
              <Link to="/tienda" className="btn-primary">Visitar tienda</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Contacto ─── */}
      <ScrollReveal>
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
      </ScrollReveal>
    </>
  )
}
