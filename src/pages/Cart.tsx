import { useState, type FormEvent, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { customerApi, saleApi } from '../services/api'
import { saveUserOrder } from '../services/orderHistory'
import CulqiPaymentModal from '../components/CulqiPaymentModal'

const SHIPPING_LIMA = 12.00
const SHIPPING_PROVINCIA = 18.00
const FREE_SHIPPING_THRESHOLD = 300.00
const PAYMENT_GATEWAY_FEE = 1.50

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [vintageConditionAcknowledged, setVintageConditionAcknowledged] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: 'Lima',
    province: 'Lima',
    district: '',
    address: '',
    paymentMethod: 'culqi',
  })

  const [culqiModalOpen, setCulqiModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [orderSummary, setOrderSummary] = useState<{
    orderNumber: string
    paymentRef: string
    paymentMethod: string
    voucherType: string
    docNumber: string
    totalPaid: number
    shippingAddress: string
    itemsCount: number
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  const isProvincia = form.department.toLowerCase() !== 'lima'
  const baseShipping = isProvincia ? SHIPPING_PROVINCIA : SHIPPING_LIMA
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : baseShipping
  const gatewayFee = form.paymentMethod === 'whatsapp' ? 0 : PAYMENT_GATEWAY_FEE
  const finalTotal = total + shippingCost + gatewayFee
  const igvAmount = (finalTotal * 0.18) / 1.18 // 18% IGV included in price per Peruvian Law

  const WHATSAPP_NUMBER = '51906920958'

  const handleConsolidateWhatsApp = () => {
    if (items.length === 0) {
      showToast('Bolsa vacía', 'Agrega prendas a tu carrito para consolidar tu pedido.', 'error')
      return
    }

    const itemsText = items
      .map((it, idx) => {
        const p = it.product
        return `${idx + 1}. *${p.name}*\n   • Talla: ${p.size || 'Única'} | Cantidad: ${it.quantity}\n   • Precio unitario: S/ ${p.price.toFixed(2)}\n   • Subtotal: S/ ${(p.price * it.quantity).toFixed(2)}`
      })
      .join('\n\n')

    const hasUserData = form.name.trim() || form.phone.trim() || form.address.trim()
    const userDataBlock = hasUserData
      ? `\n\n👤 *MIS DATOS DE ENTREGA:*\n• Nombre: ${form.name.trim() || 'Por confirmar'}\n• Teléfono: ${form.phone.trim() || 'Por confirmar'}\n• Destino: ${form.district ? form.district + ', ' : ''}${form.department || 'Lima'}\n• Dirección: ${form.address.trim() || 'Por confirmar'}`
      : ''

    const message = `¡Hola La Cachina Online! 👋
Quiero consolidar mi pedido desde el carrito de la web:

🛍️ *PRENDAS EN MI BOLSA (${items.length} ${items.length === 1 ? 'prenda' : 'prendas'}):*
${itemsText}

💰 *Subtotal Prendas:* S/ ${total.toFixed(2)} PEN
📦 *Envío:* ${shippingCost === 0 ? '¡GRATIS!' : `S/ ${shippingCost.toFixed(2)} PEN`}
✨ *Total Estimado:* S/ ${(total + shippingCost).toFixed(2)} PEN${userDataBlock}

¿Tienen disponibilidad de estas piezas para coordinar el pago (Yape / Plin / Transferencia) y la entrega? ¡Muchas gracias! 🙌`

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

    showToast('Abriendo WhatsApp...', 'Conectando con La Cachina Online para coordinar tu compra.', 'success')
    window.open(waUrl, '_blank')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePaymentSelect = (method: string) => {
    setForm(prev => ({ ...prev, paymentMethod: method }))
  }

  // Pre-validate before opening Culqi or submitting
  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setError('Por favor ingresa tu nombre y apellido.')
      return false
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.')
      return false
    }
    if (!form.phone.trim() || form.phone.length < 9) {
      setError('Por favor ingresa un número de teléfono/WhatsApp de 9 dígitos.')
      return false
    }
    if (!form.address.trim()) {
      setError('Por favor ingresa tu dirección de entrega y distrito.')
      return false
    }
    if (!termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Venta Final.')
      return false
    }
    if (!vintageConditionAcknowledged) {
      setError('Debes confirmar que has revisado las condiciones y fotos de las prendas de archivo.')
      return false
    }
    setError('')
    return true
  }

  const handleProceedToPayment = (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (form.paymentMethod === 'whatsapp') {
      handleConsolidateWhatsApp()
      return
    }

    if (form.paymentMethod === 'culqi') {
      setCulqiModalOpen(true)
    } else {
      // Direct Cash / Manual Transfer flow
      executeOrderCreation({
        method: form.paymentMethod,
        transactionId: `DIR-${Date.now().toString().slice(-6)}`,
        voucherType: 'boleta',
        documentNumber: '00000000',
      })
    }
  }

  const executeOrderCreation = async (paymentData: {
    method: string
    transactionId: string
    cardBrand?: string
    last4?: string
    cipCode?: string
    voucherType: string
    documentNumber: string
    companyName?: string
  }) => {
    setSaving(true)
    setError('')

    try {
      const customer = await customerApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.district || form.province}, ${form.department}`,
      })

      const sale = await saleApi.create({
        customerId: customer.idCustomer,
        description: `Pedido LCO-${Date.now().toString().slice(-4)} (${paymentData.method.toUpperCase()}) - ${paymentData.transactionId}`,
      })

      const orderRef = `LCO-${sale.idSale || Math.floor(1000 + Math.random() * 9000)}`

      const fullAddress = `${form.address}, ${form.district ? form.district + ', ' : ''}${form.province}, ${form.department}`

      saveUserOrder({
        orderId: orderRef,
        orderDate: new Date().toISOString(),
        items: items.map(it => ({
          idProduct: it.product.idProduct,
          name: it.product.name,
          price: it.product.price,
          size: it.product.size,
          imageUrl: it.product.imageUrl,
          quantity: it.quantity,
        })),
        subtotal: total,
        shipping: shippingCost,
        total: finalTotal,
        paymentMethod: paymentData.method,
        shippingAddress: fullAddress,
        department: form.department,
        province: form.province,
        district: form.district || form.province,
        trackingCode: `OLVA-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'PROCESANDO',
        userEmail: user?.email || form.email,
      })

      setOrderSummary({
        orderNumber: orderRef,
        paymentRef: paymentData.transactionId,
        paymentMethod: paymentData.method,
        voucherType: paymentData.voucherType === 'factura' ? 'Factura Electrónica' : 'Boleta de Venta Electrónica',
        docNumber: paymentData.documentNumber,
        totalPaid: finalTotal,
        shippingAddress: fullAddress,
        itemsCount: items.length,
      })

      clearCart()
      setCulqiModalOpen(false)
      setDone(true)
      showToast('¡Pago exitoso y pedido confirmado!', `Orden: ${orderRef}`, 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido. Por favor intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const diffForFreeShipping = FREE_SHIPPING_THRESHOLD - total
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)

  if (done && orderSummary) {
    return (
      <div className="page-center-modern">
        <div className="order-success-card">
          <div className="success-icon-badge">✓</div>
          <span className="order-success-eyebrow">✦ PAGO APROBADO CON CULQI · PEDIDO CONFIRMADO</span>
          <h2>¡Gracias por tu compra circular!</h2>
          <p className="success-subtitle">
            Hemos procesado tu pago satisfactoriamente con la orden <strong>{orderSummary.orderNumber}</strong>.
          </p>

          <div className="order-details-box">
            <div className="order-detail-row">
              <span>N° de Orden / Referencia:</span>
              <strong>{orderSummary.orderNumber}</strong>
            </div>
            <div className="order-detail-row">
              <span>ID Transacción Culqi:</span>
              <span className="tx-code">{orderSummary.paymentRef}</span>
            </div>
            <div className="order-detail-row">
              <span>Comprobante SUNAT:</span>
              <strong>{orderSummary.voucherType} (N° {orderSummary.docNumber})</strong>
            </div>
            <div className="order-detail-row">
              <span>Total Pagado:</span>
              <strong className="price-tag-gold">S/ {orderSummary.totalPaid.toFixed(2)} PEN</strong>
            </div>
            <div className="order-detail-row">
              <span>Dirección de Envío:</span>
              <span>{orderSummary.shippingAddress}</span>
            </div>
          </div>

          <div className="order-compliance-box">
            <div className="compliance-row">
              <span>⚖️ Ley N° 29571:</span>
              <p>Tu compra está registrada bajo la normativa del Código de Protección y Defensa del Consumidor del Perú.</p>
            </div>
            <div className="compliance-row">
              <span>📦 Envío Olva / Shalom:</span>
              <p>Te enviaremos el código de seguimiento en las próximas 24 horas hábiles a {form.email}.</p>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/perfil" className="btn-primary-luxury">
              <span>Ver en Mi Historial de Pedidos</span>
              <span className="icon">→</span>
            </Link>
            <Link to="/tienda" className="btn-outline-luxury">
              <span>Seguir Explorando el Archivo</span>
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
                Agrega <strong>S/ {diffForFreeShipping.toFixed(2)}</strong> más para obtener <strong>Envío Gratis</strong> a todo el Perú
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

            {/* Indecopi & Consumer Trust Badges */}
            <div className="cart-extra-trust">
              <div className="trust-cell">
                <span>🛡️ Pasarela Segura Culqi</span>
                <p>Pagos cifrados con 3DS y certificación PCI-DSS.</p>
              </div>
              <div className="trust-cell">
                <span>⚖️ Respaldo INDECOPI</span>
                <p>Cumplimiento estricto del Código de Consumo (Ley 29571).</p>
              </div>
              <div className="trust-cell">
                <span>🌱 Moda Circular Auténtica</span>
                <p>Cada prenda es única, curada e higienizada profesionalmente.</p>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Checkout Form & Summary ─── */}
          <div className="cart-checkout-section">
            <form className="checkout-card" onSubmit={handleProceedToPayment}>
              <h3 className="checkout-title">Datos de Entrega y Facturación</h3>

              {error && <div className="checkout-error-banner">{error}</div>}

              <div className="form-group-modern">
                <label>Nombre y Apellidos *</label>
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
                  <label>Correo Electrónico *</label>
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
                  <label>Teléfono / WhatsApp *</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="987654321"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-modern">
                  <label>Departamento de Destino *</label>
                  <select name="department" value={form.department} onChange={handleChange}>
                    <option value="Lima">Lima Metropolitana (S/ 12.00)</option>
                    <option value="Callao">Callao (S/ 12.00)</option>
                    <option value="Arequipa">Arequipa (S/ 18.00)</option>
                    <option value="Cusco">Cusco (S/ 18.00)</option>
                    <option value="La Libertad">La Libertad / Trujillo (S/ 18.00)</option>
                    <option value="Lambayeque">Lambayeque / Chiclayo (S/ 18.00)</option>
                    <option value="Piura">Piura (S/ 18.00)</option>
                    <option value="Ica">Ica (S/ 18.00)</option>
                    <option value="Junin">Junín / Huancayo (S/ 18.00)</option>
                    <option value="Ancash">Áncash / Chimbote (S/ 18.00)</option>
                    <option value="San Martin">San Martín / Tarapoto (S/ 18.00)</option>
                    <option value="Loreto">Loreto / Iquitos (S/ 18.00)</option>
                    <option value="Tacna">Tacna (S/ 18.00)</option>
                    <option value="Puno">Puno / Juliaca (S/ 18.00)</option>
                    <option value="Otro">Otro Departamento (S/ 18.00)</option>
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>Distrito / Ciudad *</label>
                  <input
                    name="district"
                    type="text"
                    placeholder="Ej. Miraflores / Cayma"
                    value={form.district}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Dirección y Referencia de Entrega *</label>
                <input
                  name="address"
                  type="text"
                  placeholder="Av. Principal 123, Dpto 401 (Ref: Altura cdra 5)"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Payment Method Selector */}
              <div className="payment-selection-block">
                <label className="payment-label-header">
                  <span>Pasarela de Pago Autorizada</span>
                  <span className="pci-tag">🛡️ Culqi 3DS & WhatsApp Direct</span>
                </label>
                <div className="payment-methods-grid">
                  {[
                    { id: 'whatsapp', name: 'Consolidar por WhatsApp (+51 906 920 958)', icon: '💬', highlightWa: true },
                    { id: 'culqi', name: 'Culqi (Tarjetas / Yape / CIP)', icon: '⚡', highlight: true },
                    { id: 'transfer', name: 'Transferencia BCP / BBVA', icon: '🏦' },
                    { id: 'cash', name: 'Contraentrega (Lima Centro)', icon: '💵' },
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      className={`payment-method-card ${form.paymentMethod === method.id ? 'active' : ''} ${method.highlight ? 'highlight-culqi' : ''} ${method.highlightWa ? 'highlight-whatsapp' : ''}`}
                      onClick={() => handlePaymentSelect(method.id)}
                    >
                      <span className="method-icon">{method.icon}</span>
                      <span className="method-name">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* INDECOPI Legal & Second-Hand Condition Notice */}
              <div className="cart-final-sale-banner">
                <span className="banner-icon">⚖️</span>
                <div>
                  <strong>INFORMACIÓN AL CONSUMIDOR (Art. 13 & 97 Ley 29571):</strong>
                  <p>
                    Las prendas del catálogo son piezas auténticas de segunda mano / archivo vintage. Su estado físico, detalles de uso y fotos reales forman parte de la descripción previa. Cuentas con garantía legal por vicios ocultos no informados conforme a las normas de INDECOPI.
                  </p>
                </div>
              </div>

              {/* Order Summary Breakdown */}
              <div className="checkout-summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal ({items.length} prendas)</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Envío ({form.department === 'Lima' || form.department === 'Callao' ? 'Lima/Callao' : 'Provincias'})</span>
                  <span className={shippingCost === 0 ? 'free-tag' : ''}>
                    {shippingCost === 0 ? 'GRATIS' : `S/ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {gatewayFee > 0 && (
                  <div className="breakdown-row">
                    <span>Fee de Pasarela de Pago</span>
                    <span style={{ fontWeight: 700, color: 'var(--brand-volt)' }}>S/ {gatewayFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="breakdown-row">
                  <span>IGV (18% incluido según ley)</span>
                  <span className="igv-tag">S/ {igvAmount.toFixed(2)}</span>
                </div>
                <div className="breakdown-separator" />
                <div className="breakdown-row total-row">
                  <span>Total a Pagar</span>
                  <span className="total-amount">
                    S/ {finalTotal.toFixed(2)} PEN
                  </span>
                </div>
              </div>

              {/* Legal Checkboxes */}
              <div className="cart-terms-acceptance">
                <label className="checkbox-label-modern">
                  <input
                    type="checkbox"
                    checked={vintageConditionAcknowledged}
                    onChange={e => setVintageConditionAcknowledged(e.target.checked)}
                    required
                  />
                  <span>
                    He verificado las fotos, medidas y nivel de condición de cada prenda vintage seleccionada. *
                  </span>
                </label>

                <label className="checkbox-label-modern">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    Acepto los <Link to="/terminos-y-condiciones" target="_blank" className="terms-link-inline">Términos y Condiciones</Link>, la Política de Protección de Datos Personales (Ley 29733) y sé que cuento con acceso al <Link to="/libro-de-reclamaciones" target="_blank" className="terms-link-inline">Libro de Reclamaciones</Link>. *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary-luxury btn-submit-order full-width"
                disabled={saving || !termsAccepted || !vintageConditionAcknowledged}
              >
                <span>
                  {saving
                    ? 'Procesando...'
                    : form.paymentMethod === 'whatsapp'
                    ? `💬 Consolidar por WhatsApp (+51 906 920 958) →`
                    : form.paymentMethod === 'culqi'
                    ? `Pagar S/ ${finalTotal.toFixed(2)} con Culqi →`
                    : `Confirmar Pedido (S/ ${finalTotal.toFixed(2)}) →`}
                </span>
              </button>

              <div className="whatsapp-checkout-divider">
                <span>o coordina directamente sin pasar por pasarela</span>
              </div>

              <button
                type="button"
                onClick={handleConsolidateWhatsApp}
                className="btn-whatsapp-direct full-width"
              >
                <span className="wa-icon">💬</span>
                <span>Pedir y Consolidar por WhatsApp</span>
                <span className="wa-number-pill">+51 906 920 958</span>
              </button>

              <div className="checkout-indecopi-seal">
                <Link to="/libro-de-reclamaciones" className="indecopi-link-seal">
                  <span>📖 Libro de Reclamaciones Virtual Conforme a Ley</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Culqi Checkout Modal */}
      <CulqiPaymentModal
        isOpen={culqiModalOpen}
        onClose={() => setCulqiModalOpen(false)}
        amount={finalTotal}
        customerEmail={form.email}
        customerName={form.name}
        onSuccess={executeOrderCreation}
      />
    </div>
  )
}
