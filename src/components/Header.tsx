import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import ChangePasswordModal from './ChangePasswordModal'

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
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>

            {/* Left: Brand Monogram & Name */}
            <Link to="/" className="brand-logo-modern" onClick={() => setMobileMenuOpen(false)}>
              <div className="brand-monogram">
                <span className="monogram-text">LC</span>
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
                  <span className="user-welcome desktop-only">
                    Hola, <strong>{user.name.split(' ')[0]}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className="action-btn-key desktop-only"
                    title="Cambiar contraseña"
                  >
                    🔑 Clave
                  </button>
                  <button type="button" onClick={logout} className="action-btn-logout" title="Cerrar sesión">
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
                    <span className="monogram-text">LC</span>
                  </div>
                  <span className="brand-name">LA CACHINA ONLINE</span>
                </div>
                <button type="button" className="drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>

              <nav className="mobile-drawer-nav">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>🏠 Inicio</Link>
                <Link to="/tienda" onClick={() => setMobileMenuOpen(false)}>🛍️ Ver Todo el Mercado</Link>
                <Link to="/tienda?category=1" onClick={() => setMobileMenuOpen(false)}>🧥 Casacas & Cortavientos</Link>
                <Link to="/tienda?category=2" onClick={() => setMobileMenuOpen(false)}>👖 Jeans & Levi's 501</Link>
                <Link to="/tienda?category=3" onClick={() => setMobileMenuOpen(false)}>👕 Polos Gráficos & Band Tees</Link>
                <Link to="/tienda?category=4" onClick={() => setMobileMenuOpen(false)}>👔 Camisas & Sedas</Link>
                <Link to="/tienda?category=5" onClick={() => setMobileMenuOpen(false)}>👟 Tabas & Zapatillas</Link>
                <Link to="/tienda?category=6" onClick={() => setMobileMenuOpen(false)}>🎒 Huachaferías & Accesorios</Link>
                <div className="drawer-divider" />
                {user ? (
                  <>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>⚙️ Panel Administrador</Link>
                    )}
                    <button
                      type="button"
                      className="mobile-drawer-action-btn"
                      onClick={() => { setPasswordModalOpen(true); setMobileMenuOpen(false); }}
                    >
                      🔑 Cambiar Contraseña
                    </button>
                    <button type="button" className="mobile-logout-btn" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                      Cerrar Sesión ({user.name})
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="drawer-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                    Ingresar a mi cuenta
                  </Link>
                )}
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
