import { Link } from 'react-router-dom'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'

export default function Header() {
  const { itemCount } = useCart()
  const { user, loading, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">Vault Vintage</Link>
        <nav className="header-nav">
          <Link to="/">Inicio</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/carrito" className="cart-link">
            Carrito
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          <div className="auth-section">
            {loading ? null : user ? (
              <div className="user-menu">
                <span className="user-email">{user.email}</span>
                {user.role === 'ADMIN' && <span className="role-badge">Admin</span>}
                <button className="btn-logout" onClick={logout}>Salir</button>
              </div>
            ) : (
              <Link to="/login" className="btn-login-link">Iniciar Sesión</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
