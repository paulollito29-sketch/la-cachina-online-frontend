import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Vault Vintage</h3>
          <p>Donde lo vintage encuentra un nuevo hogar</p>
        </div>
        <div className="footer-links">
          <Link to="/tienda">Tienda</Link>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#contacto">Contacto</a>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Vault Vintage. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
