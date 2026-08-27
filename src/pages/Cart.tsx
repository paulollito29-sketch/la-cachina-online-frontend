import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { useToast } from '../components/ToastContext'
import { customerApi, saleApi } from '../services/api'

const FREE_SHIPPING_THRESHOLD = 250

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', paymentMethod: 'yape', notes: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePaymentSelect = (method: string) => {
    setForm(prev => ({ ...prev, paymentMethod: method }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setError('')
    setSaving(true)

    try {
      const customer = await customerApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })

      const sale = await saleApi.create({
        customerId: customer.idCustomer,
        description: `Pedido LCO-${Date.now().toString().slice(-4)} (${form.paymentMethod.toUpperCase()}) - ${items.length} items`,
      })

      const orderRef = `LCO-${sale.idSale || Math.floor(1000 + Math.random() * 9000)}`
      setOrderNumber(orderRef)
      clearCart()
      setDone(true)
      showToast('¡Pedido registrado!', `Referencia: ${orderRef}`, 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido. Por favor intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const diffForFreeShipping = FREE_SHIPPING_THRESHOLD - total
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  if (done) {
    return (
      <div className="page-center-modern">
        <div className="order-success-card">
          <div className="success-icon-badge">✓</div>
          <span className="order-success-eyebrow">✦ PEDIDO CONFIRMADO</span>
          <h2>¡Gracias por tu compra circular!</h2>
          <p className="success-subtitle">
            Hemos registrado tu pedido con el código <strong>{orderNumber}</strong>.
          </p>
          <div className="order-details-box">
            <div className="order-detail-row">
              <span>Cliente:</span>
              <strong>{form.name}</strong>
            </div>
            <div className="order-detail-row">
              <span>Correo:</span>
              <strong>{form.email}</strong>
            </div>
            <div className="order-detail-row">
              <span>Método seleccionado:</span>
              <strong className="payment-tag">{form.paymentMethod.toUpperCase()}</strong>
            </div>
            <div className="order-detail-row">
              <span>Dirección de envío:</span>
              <span>{form.address}</span>
            </div>
          </div>
          <p className="order-instruction-note">
            Nuestro equipo te contactará vía WhatsApp ({form.phone}) para validar la entrega y coordinar los detalles finales.
          </p>
          <div className="success-actions">
            <Link to="/tienda" className="btn-primary-luxury">
              <span>Volver a la tienda</span>
              <span className="icon">→</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-center-modern">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">🛍️</div>
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestro archivo de piezas únicas seleccionadas a mano y encuentra tu próxima joya vintage.</p>
          <Link to="/tienda" className="btn-primary-luxury">
            <span>Explorar Tienda</span>
            <span className="icon">→</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page-modern">
      <div className="cart-container-inner">
        {/* Free Shipping Progress Bar */}
        <div className="shipping-progress-banner">
          <div className="shipping-progress-text">
            {diffForFreeShipping > 0 ? (
              <span>
                Agrega <strong>S/ {diffForFreeShipping.toFixed(2)}</strong> más para obtener <strong>Envío Gratis</strong> en Lima
              </span>
            ) : (
              <span className="free-shipping-achieved">
                🎉 ¡Felicidades! Tienes <strong>Envío Gratis</strong> para esta orden.
              </span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="cart-layout-grid">
          {/* ─── Left Column: Cart Items List ─── */}
          <div className="cart-items-section">
            <div className="cart-section-header">
              <h2>Bolsa de Compras</h2>
              <span className="cart-items-count-tag">{items.length} prendas únicas</span>
            </div>

            <div className="cart-items-list">
              {items.map(item => (
                <div key={item.product.idProduct} className="cart-item-row">
                  <Link to={`/producto/${item.product.idProduct}`} className="cart-item-thumbnail">
                    <img
                      src={item.product.imageUrl || `https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=200&q=80`}
                      alt={item.product.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=200&q=80'
                      }}
                    />
                  </Link>

                  <div className="cart-item-content">
                    <div className="cart-item-top">
                      <span className="cart-item-category-label">{item.product.categoryName}</span>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => {
                          removeItem(item.product.idProduct)
                          showToast('Prenda removida del carrito', item.product.name, 'info')
                        }}
                        title="Eliminar de la bolsa"
                      >
                        ✕
                      </button>
                    </div>

                    <Link to={`/producto/${item.product.idProduct}`} className="cart-item-title">
                      {item.product.name}
                    </Link>

                    <div className="cart-item-specs">
                      <span>Talla: <strong>{item.product.size || 'Única'}</strong></span>
                      <span>•</span>
                      <span>Condición: <strong>★ {item.product.condition}/5</strong></span>
                    </div>

                    <div className="cart-item-bottom">
                      <div className="quantity-counter">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.idProduct, item.quantity - 1)}
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="quantity-val">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.idProduct, item.quantity + 1)}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price-col">
                        <span className="cart-unit-price">S/ {item.product.price.toFixed(2)} c/u</span>
                        <span className="cart-subtotal-price">S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-extra-trust">
              <div className="trust-cell">
                <span>⚡ Reserva Inmediata</span>
                <p>Las prendas se apartan temporalmente en tu orden.</p>
              </div>
              <div className="trust-cell">
                <span>🌱 Empaque Eco-Friendly</span>
                <p>Cajas de cartón reciclado y papel kraft.</p>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Checkout Form & Summary ─── */}
          <div className="cart-checkout-section">
            <form className="checkout-card" onSubmit={handleSubmit}>
              <h3 className="checkout-title">Datos de Entrega</h3>

              {error && <div className="checkout-error-banner">{error}</div>}

              <div className="form-group-modern">
                <label>Nombre y Apellidos</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ej. Mateo De La Flor"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group-modern">
                  <label>Correo Electrónico</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+51 987 654 321"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Dirección y Distrito de Entrega</label>
                <input
                  name="address"
                  type="text"
                  placeholder="Av. Principal 123, Dpto 401, Miraflores, Lima"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Payment Method Selector */}
              <div className="payment-selection-block">
                <label className="payment-label-header">Método de Pago Preferido</label>
                <div className="payment-methods-grid">
                  {[
                    { id: 'yape', name: 'Yape / Plin', icon: '📱' },
                    { id: 'bcp', name: 'Transferencia BCP / BBVA', icon: '🏦' },
                    { id: 'card', name: 'Tarjeta (Link POS)', icon: '💳' },
                    { id: 'cash', name: 'Contraentrega (Lima)', icon: '💵' },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment-method-card ${form.paymentMethod === method.id ? 'active' : ''}`}
                      onClick={() => handlePaymentSelect(method.id)}
                    >
                      <span className="method-icon">{method.icon}</span>
                      <span className="method-name">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary Pricing */}
              <div className="checkout-summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal ({items.length} prendas)</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Envío a domicilio</span>
                  <span className={diffForFreeShipping <= 0 ? 'free-tag' : ''}>
                    {diffForFreeShipping <= 0 ? 'GRATIS' : 'S/ 12.00'}
                  </span>
                </div>
                <div className="breakdown-separator" />
                <div className="breakdown-row total-row">
                  <span>Total estimado</span>
                  <span className="total-amount">
                    S/ {(total + (diffForFreeShipping <= 0 ? 0 : 12)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-luxury btn-submit-order full-width"
                disabled={saving}
              >
                <span>{saving ? 'Procesando pedido...' : 'Confirmar y Solicitar Compra'}</span>
                <span className="icon">→</span>
              </button>

              <p className="checkout-security-note">
                🔒 Compra 100% segura. No cobramos hasta confirmar el stock de la prenda y coordinar contigo.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
