import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { customerApi, saleApi } from '../services/api'

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    setSaving(true)
    try {
      const customer = await customerApi.create(form)
      await saleApi.create({ customerId: customer.idCustomer, description: `Compra Vault Vintage - ${items.length} items` })
      clearCart()
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="page-center">
        <div className="cart-done">
          <h2>¡Compra registrada!</h2>
          <p>Te contactaremos pronto para coordinar la entrega.</p>
          <Link to="/tienda" className="btn-primary">Seguir comprando</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-center">
        <div className="cart-empty">
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestra tienda y encuentra piezas únicas.</p>
          <Link to="/tienda" className="btn-primary">Ir a la tienda</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-items">
        <h2>Carrito ({items.length} productos)</h2>
        {items.map(item => (
          <div key={item.product.idProduct} className="cart-item">
            <img
              src={item.product.imageUrl || `https://picsum.photos/seed/${item.product.idProduct}/100/120`}
              alt={item.product.name}
              className="cart-item-image"
            />
            <div className="cart-item-info">
              <Link to={`/producto/${item.product.idProduct}`}>{item.product.name}</Link>
              <span className="cart-item-category">{item.product.categoryName}</span>
              <span className="cart-item-price">S/ {item.product.price.toFixed(2)}</span>
            </div>
            <div className="cart-item-qty">
              <button onClick={() => updateQuantity(item.product.idProduct, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product.idProduct, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-total">
              S/ {(item.product.price * item.quantity).toFixed(2)}
            </div>
            <button className="cart-item-remove" onClick={() => removeItem(item.product.idProduct)}>
              ✕
            </button>
          </div>
        ))}
        <div className="cart-total">
          <strong>Total: S/ {total.toFixed(2)}</strong>
        </div>
      </div>

      <form className="cart-form" onSubmit={handleSubmit}>
        <h3>Datos de contacto</h3>
        {error && <p className="form-error">{error}</p>}
        <input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
        <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} required />
        <input name="address" placeholder="Dirección de entrega" value={form.address} onChange={handleChange} required />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Procesando...' : 'Confirmar compra'}
        </button>
      </form>
    </div>
  )
}
