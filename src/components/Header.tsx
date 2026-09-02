import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import ChangePasswordModal from './ChangePasswordModal'
import BrandLogoIcon from './BrandLogoIcon'

export default function Header() {
  const { totalCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tienda?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="header-modern">
        {/* ─── Top Announcement Ticker ─── */}
        <div className="announcement-bar">
          <div className="announcement-track">
            <span className="ticker-text">
              ✦ LA CACHINA ONLINE · EL POINT VINTAGE DEL PERÚ · DROPS CADA SEMANA · ENVÍOS A LIMA Y PROVINCIAS · MODA CIRCULAR & SOSTENIBLE ✦
            </span>
            <span className="ticker-text">
              ✦ LA CACHINA ONLINE · EL POINT VINTAGE DEL PERÚ · DROPS CADA SEMANA · ENVÍOS A LIMA Y PROVINCIAS · MODA CIRCULAR & SOSTENIBLE ✦
            </span>
          </div>
        </div>

        {/* ─── Main Navigation Bar ─── */}
        <div className="header-main-nav">
          <div className="header-inner">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Left: Brand Monogram & Name */}
            <Link to="/" className="brand-logo-modern" onClick={() => setMobileMenuOpen(false)}>
              <div className="brand-monogram">
                <BrandLogoIcon size={38} />
              </div>
              <div className="brand-titles">
                <span className="brand-name">LA CACHINA</span>
                <span className="brand-sub">ONLINE · ARCHIVO VINTAGE</span>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="nav-links-desktop desktop-only">
              <Link to="/" className="nav-item">Inicio</Link>
              <Link to="/tienda" className="nav-item">
                <span>El Mercado</span>
                <span className="nav-badge-drops">🔥 Drops</span>
              </Link>
              <Link to="/subastas" className="nav-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🔨 Subastas</span>
                <span className="nav-badge-drops" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                  EN VIVO
                </span>
              </Link>
            </nav>

            {/* Right: Actions & User Controls */}
            <div className="header-actions">
              {/* Search Popover Trigger */}
              <div className="search-popover-wrapper">
                <button
                  type="button"
                  className={`action-btn search-toggle ${searchOpen ? 'active' : ''}`}
                  onClick={() => setSearchOpen(!searchOpen)}
                  aria-label="Buscar prendas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>

                {searchOpen && (
                  <form className="search-flyout-box" onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      placeholder="Buscar casacas, Levi's, polos 90s..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="btn-search-submit">Buscar</button>
                  </form>
                )}
              </div>

              {/* User Account / Auth */}
              {user ? (
                <div className="user-logged-menu">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="btn-admin-pill desktop-only">
                      ⚙️ Panel
                    </Link>
                  )}
                  <Link to="/perfil" className="user-profile-nav-link" title="Mi Perfil & Compras">
                    <span className="user-avatar-tiny">
                      {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                    </span>
                    <span className="user-welcome desktop-only">
                      Hola, <strong>{user.name.split(' ')[0]}</strong>
                    </span>
                  </Link>
                  <button type="button" onClick={logout} className="action-btn-logout desktop-only" title="Cerrar sesión">
                    Salir
                  </button>
                </div>
              ) : (
                <Link to="/login" className="action-btn user-btn" title="Iniciar sesión">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              )}

              {/* Shopping Cart Drawer Link */}
              <Link to="/carrito" className="cart-trigger-btn" aria-label="Ver carrito">
                <div className="cart-icon-wrapper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {totalCount > 0 && (
                    <span className="cart-badge-count">{totalCount}</span>
                  )}
                </div>
                <span className="cart-label desktop-only">Bolsa</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Mobile Slide-out Drawer Menu ─── */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <div className="brand-logo-modern">
                  <div className="brand-monogram small">
                    <BrandLogoIcon size={30} />
                  </div>
                  <span className="brand-name">LA CACHINA ONLINE</span>
                </div>
                <button type="button" className="drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>

              <nav className="mobile-drawer-nav">
                <div className="drawer-section-label">EXPLORAR</div>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>🏠 Inicio</Link>
                <Link to="/tienda" onClick={() => setMobileMenuOpen(false)}>🛍️ Ver Todo el Mercado (Drops)</Link>
                <Link to="/subastas" onClick={() => setMobileMenuOpen(false)}>
                  🔨 Subastas Vintage <span className="cart-badge-inline" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>EN VIVO</span>
                </Link>
                <Link to="/carrito" onClick={() => setMobileMenuOpen(false)}>
                  🛒 Mi Carrito {totalCount > 0 && <span className="cart-badge-inline">({totalCount})</span>}
                </Link>

                <div className="drawer-divider" />
                <div className="drawer-section-label">CATEGORÍAS PRINCIPALES</div>
                <Link to="/tienda?category=Polos" onClick={() => setMobileMenuOpen(false)}>👕 Polos</Link>
                <Link to="/tienda?category=Shorts" onClick={() => setMobileMenuOpen(false)}>🩳 Shorts</Link>
                <Link to="/tienda?category=Jeans" onClick={() => setMobileMenuOpen(false)}>👖 Jeans</Link>
                <Link to="/tienda?category=Pantalones" onClick={() => setMobileMenuOpen(false)}>👖 Pantalones</Link>
                <Link to="/tienda?category=Buzos" onClick={() => setMobileMenuOpen(false)}>🏃 Buzos</Link>

                <div className="drawer-divider" />
                <div className="drawer-section-label">MI CUENTA & ACCIONES</div>
                {user ? (
                  <>
                    <Link to="/perfil" onClick={() => setMobileMenuOpen(false)}>👤 Mi Perfil & Mis Compras</Link>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="drawer-admin-link" onClick={() => setMobileMenuOpen(false)}>⚙️ Panel Administrador</Link>
                    )}
                    <button
                      type="button"
                      className="mobile-drawer-action-btn"
                      onClick={() => { setPasswordModalOpen(true); setMobileMenuOpen(false); }}
                    >
                      🔑 Cambiar Contraseña
                    </button>
                    <button type="button" className="mobile-logout-btn" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                      🚪 Cerrar Sesión ({user.name ? user.name.split(' ')[0] : 'Usuario'})
                    </button>
                  </>
                ) : (
                  <div className="drawer-auth-actions">
                    <Link to="/login" className="btn-primary-luxury full-width" onClick={() => setMobileMenuOpen(false)}>
                      <span>Iniciar Sesión</span>
                      <span className="icon">→</span>
                    </Link>
                    <Link to="/register" className="drawer-register-link" onClick={() => setMobileMenuOpen(false)}>
                      ¿Nuevo aquí? <strong>Crear Cuenta</strong>
                    </Link>
                  </div>
                )}

                <div className="drawer-divider" />
                <div className="drawer-section-label">LEGAL & TRANSPARENCIA</div>
                <Link to="/libro-de-reclamaciones" onClick={() => setMobileMenuOpen(false)}>📖 Libro de Reclamaciones</Link>
                <Link to="/terminos-y-politicas" onClick={() => setMobileMenuOpen(false)}>📜 Términos, Políticas & Envíos</Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* ─── Change Password Modal ─── */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  )
}
