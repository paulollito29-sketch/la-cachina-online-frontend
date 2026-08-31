import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { getOrdersByUser, type UserOrder } from '../services/orderHistory'
import { categoryApi, productApi, sellerApplicationApi } from '../services/api'
import type { Category, ProductSummary, SellerApplication } from '../types/models'
import ImageGalleryUploader from '../components/ImageGalleryUploader'
import CategorySearchSelector from '../components/CategorySearchSelector'

export default function Profile() {
  const { user, logout, sendVerificationCode, resetWithCode } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<UserOrder[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sellerProducts, setSellerProducts] = useState<ProductSummary[]>([])
  const [activeTab, setActiveTab] = useState<'orders' | 'seller' | 'security'>('orders')

  // Seller application state for buyers
  const [mySellerApp, setMySellerApp] = useState<SellerApplication | null>(null)
  const [appForm, setAppForm] = useState({
    shopName: '',
    docNumber: '',
    phone: '',
    instagram: '',
    experienceDetails: '',
  })
  const [submittingApp, setSubmittingApp] = useState(false)
  const [isReapplying, setIsReapplying] = useState(false)

  // Seller submission form state (for approved sellers)
  const [sellerImages, setSellerImages] = useState<string[]>([])
  const [sellerCategories, setSellerCategories] = useState<string[]>(['Chaquetas'])
  const [sellerForm, setSellerForm] = useState({
    name: '',
    categoryId: 0,
    price: '',
    size: 'M',
    condition: 4,
    description: '',
    sex: 'UNISEX',
  })
  const [submittingProduct, setSubmittingProduct] = useState(false)

  // Password reset code state
  const [codeSent, setCodeSent] = useState(false)
  const [demoCode, setDemoCode] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loadingCode, setLoadingCode] = useState(false)
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isSellerOrAdmin = user?.role === 'SELLER' || user?.role === 'ADMIN'

  const loadSellerStatus = () => {
    if (!user) return
    sellerApplicationApi.getMyStatus(user.email)
      .then(app => {
        setMySellerApp(app)
        if (app) {
          setAppForm({
            shopName: app.shopName || '',
            docNumber: app.docNumber || '',
            phone: app.phone || '',
            instagram: app.instagram || '',
            experienceDetails: app.experienceDetails || '',
          })
        }
      })
      .catch(() => setMySellerApp(null))
  }

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    const userOrders = getOrdersByUser(user.email)
    setOrders(userOrders)

    // Fetch categories for seller dropdown
    categoryApi.getAll().then(cats => {
      setCategories(cats)
      if (cats.length > 0 && sellerForm.categoryId === 0) {
        setSellerForm(prev => ({ ...prev, categoryId: cats[0].idCategory }))
      }
    })

    // Fetch seller submissions if seller or admin
    if (isSellerOrAdmin) {
      productApi.getSellerSubmissions(user.email).then(prods => {
        setSellerProducts(prods)
      })
    } else {
      loadSellerStatus()
    }
  }, [user, navigate, isSellerOrAdmin])

  if (!user) return null

  const handleSellerAppSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!appForm.shopName.trim()) {
      showToast('Campo obligatorio', 'Por favor ingresa el nombre de tu tienda o proyecto vintage', 'error')
      return
    }

    setSubmittingApp(true)
    try {
      const created = await sellerApplicationApi.submit({
        userEmail: user.email,
        userName: user.name || user.email.split('@')[0],
        shopName: appForm.shopName.trim(),
        docNumber: appForm.docNumber.trim(),
        phone: appForm.phone.trim(),
        instagram: appForm.instagram.trim(),
        experienceDetails: appForm.experienceDetails.trim(),
      })
      setMySellerApp(created)
      setIsReapplying(false)
      showToast('¡Solicitud enviada con éxito!', 'El administrador revisará tu perfil para autorizar tu cuenta como Vendedor Oficial.', 'success')
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo enviar la solicitud', 'error')
    } finally {
      setSubmittingApp(false)
    }
  }

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada', 'Has cerrado sesión correctamente', 'info')
    navigate('/')
  }

  const handleSellerProductSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!sellerForm.name.trim() || !sellerForm.price) {
      showToast('Campos requeridos', 'Por favor ingresa el nombre y precio de la prenda', 'error')
      return
    }

    const priceNum = parseFloat(sellerForm.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Precio inválido', 'El precio debe ser un número positivo', 'error')
      return
    }

    const finalImages = sellerImages.length > 0
      ? sellerImages.slice(0, 5)
      : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80']

    setSubmittingProduct(true)
    try {
      const selectedCatObj = categories.find(c => c.idCategory === Number(sellerForm.categoryId))
      const finalCats = sellerCategories.length > 0
        ? sellerCategories
        : [selectedCatObj?.name || 'Chaquetas']

      await productApi.submitBySeller(
        {
          name: sellerForm.name.trim(),
          categoryId: Number(sellerForm.categoryId) || (categories[0]?.idCategory ?? 1),
          price: priceNum,
          size: sellerForm.size,
          condition: Number(sellerForm.condition),
          description: sellerForm.description.trim(),
          imageUrl: finalImages[0],
          images: finalImages,
          categories: finalCats,
          available: true,
          sex: sellerForm.sex || 'UNISEX',
        },
        user.email,
        user.name
      )

      showToast('¡Prenda enviada a revisión!', 'El administrador revisará tu prenda en un plazo máximo de 48 horas.', 'success')

      // Refresh seller products list
      const updated = await productApi.getSellerSubmissions(user.email)
      setSellerProducts(updated)

      // Reset form
      setSellerForm({
        name: '',
        categoryId: categories[0]?.idCategory ?? 1,
        price: '',
        size: 'M',
        condition: 4,
        description: '',
        sex: 'UNISEX',
      })
      setSellerCategories(['Chaquetas'])
      setSellerImages([])
    } catch (err: any) {
      showToast('Error al enviar', err.message || 'No se pudo registrar la prenda para revisión', 'error')
    } finally {
      setSubmittingProduct(false)
    }
  }

  const handleSendCode = async () => {
    setLoadingCode(true)
    setSecurityMessage(null)
    try {
      const res = await sendVerificationCode(user.email)
      setCodeSent(true)
      if (res.code) {
        setDemoCode(res.code)
      }
      showToast('Código enviado', `Revisa tu bandeja de entrada en ${user.email}`, 'success')
    } catch (err: any) {
      setSecurityMessage({
        type: 'error',
        text: err.message || 'Error al enviar el código de verificación.',
      })
    } finally {
      setLoadingCode(false)
    }
  }

  const handleResetPasswordWithCode = async (e: FormEvent) => {
    e.preventDefault()
    setSecurityMessage(null)

    if (verificationCode.trim().length !== 6) {
      setSecurityMessage({ type: 'error', text: 'El código de verificación debe tener exactamente 6 dígitos.' })
      return
    }
    if (newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }

    setSubmittingPassword(true)
    try {
      await resetWithCode(user.email, verificationCode.trim(), newPassword)
      showToast('¡Contraseña actualizada!', 'Tu contraseña ha sido modificada con éxito.', 'success')
      setSecurityMessage({
        type: 'success',
        text: '¡Tu contraseña ha sido actualizada con éxito! Ahora puedes iniciar sesión con tu nueva clave.',
      })
      setCodeSent(false)
      setDemoCode(null)
      setVerificationCode('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setSecurityMessage({
        type: 'error',
        text: err.message || 'Código de verificación incorrecto o expirado.',
      })
    } finally {
      setSubmittingPassword(false)
    }
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="profile-page-wrapper">
      {/* ─── Hero Header ─── */}
      <section className="profile-hero-section">
        <div className="profile-hero-inner">
          <div className="profile-avatar-box">
            <span className="profile-avatar-text">
              {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="profile-header-info">
            <div className="profile-title-row">
              <h2>{user.name || user.email.split('@')[0]}</h2>
              <span className={`profile-role-badge role-${user.role.toLowerCase()}`}>
                {user.role === 'ADMIN' ? '⚡ Administrador' : user.role === 'SELLER' ? '🏷️ Vendedor Vintage' : '🛍️ Comprador'}
              </span>
            </div>
            <p className="profile-email-text">{user.email}</p>
          </div>

          <div className="profile-header-actions">
            {!isSellerOrAdmin && (
              <button
                type="button"
                className="btn-become-seller-badge"
                onClick={() => setActiveTab('seller')}
              >
                <span>{mySellerApp?.status === 'PENDING' ? '⏳ Solicitud en Revisión' : '👔 Postular como Vendedor'}</span>
              </button>
            )}
            <button type="button" className="btn-logout-luxury" onClick={handleLogout}>
              <span>Cerrar Sesión</span>
              <span className="icon">🚪</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="profile-stats-bar">
          <div className="stat-card">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Compras Realizadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">S/ {totalSpent.toFixed(2)}</span>
            <span className="stat-label">Total en Moda Circular</span>
          </div>
          {isSellerOrAdmin && (
            <div className="stat-card">
              <span className="stat-value">{sellerProducts.length}</span>
              <span className="stat-label">Prendas Enviadas</span>
            </div>
          )}
          <div className="stat-card">
            <span className="stat-value active-badge">Activa</span>
            <span className="stat-label">Estado de Cuenta</span>
          </div>
        </div>
      </section>

      {/* ─── Main Content Tabs ─── */}
      <div className="profile-container-main">
        <div className="profile-nav-tabs">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛍️ Historial de Compras ({orders.length})
          </button>

          {isSellerOrAdmin ? (
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              🏷️ Portal Vendedor ({sellerProducts.length} prendas)
            </button>
          ) : (
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              {mySellerApp?.status === 'PENDING'
                ? '⏳ Solicitud Vendedor (En Revisión)'
                : mySellerApp?.status === 'REJECTED'
                ? '⚠️ Solicitud de Vendedor'
                : '👔 Conviértete en Vendedor'}
            </button>
          )}

          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Seguridad & Contraseña
          </button>
        </div>

        {/* ─── Tab 1: Orders History ─── */}
        {activeTab === 'orders' && (
          <div className="profile-tab-content">
            {orders.length === 0 ? (
              <div className="empty-orders-card">
                <div className="empty-icon">📦</div>
                <h3>Aún no has realizado compras</h3>
                <p>Explora nuestro archivo exclusivo de prendas únicas seleccionadas a mano y adquiere tu primera joya vintage.</p>
                <Link to="/tienda" className="btn-primary-luxury">
                  <span>Ir a la Tienda</span>
                  <span className="icon">→</span>
                </Link>
              </div>
            ) : (
              <div className="orders-list-grid">
                {orders.map(order => (
                  <div key={order.orderId} className="order-history-card">
                    <div className="order-card-top">
                      <div>
                        <span className="order-id-label">N° DE ORDEN</span>
                        <h4 className="order-id-val">{order.orderId}</h4>
                        <span className="order-date-text">
                          {new Date(order.orderDate).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="order-status-group">
                        <span className={`order-status-pill ${order.status.toLowerCase()}`}>
                          {order.status === 'PROCESANDO' ? '⏳ En Preparación' : order.status === 'EN_CAMINO' ? '🚚 En Camino' : '✓ Entregado'}
                        </span>
                        {order.trackingCode && (
                          <span className="order-tracking-tag">
                            Guía: <strong>{order.trackingCode}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items Strip */}
                    <div className="order-items-strip">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'}
                            alt={item.name}
                            className="order-item-thumb"
                            onError={e => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'
                            }}
                          />
                          <div className="order-item-info">
                            <h5>{item.name}</h5>
                            <span className="item-meta">
                              {item.size ? `Talla: ${item.size} • ` : ''} Cant: {item.quantity}
                            </span>
                          </div>
                          <div className="order-item-price">
                            S/ {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="order-card-bottom">
                      <div className="order-address-summary">
                        <span>Envío a:</span>
                        <strong>{order.shippingAddress || `${order.district}, ${order.province}`}</strong>
                      </div>

                      <div className="order-total-summary">
                        <span className="total-label">Total Pagado ({order.paymentMethod.toUpperCase()}):</span>
                        <span className="total-val">S/ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 2: Seller Portal (For Sellers) / Application Form (For Buyers) ─── */}
        {activeTab === 'seller' && (
          isSellerOrAdmin ? (
            <div className="profile-tab-content">
              <div className="seller-portal-grid">
                {/* Submission Form Card */}
                <div className="seller-form-card">
                  <div className="seller-form-header">
                    <span className="seller-header-icon">🏷️</span>
                    <div>
                      <h3>Publicar Nueva Prenda para Revisión</h3>
                      <p>Completa la ficha técnica de la prenda. Nuestro equipo curador validará autenticidad y condición.</p>
                    </div>
                  </div>

                  {/* 48-Hour Review Mandatory Notice */}
                  <div className="review-notice-banner">
                    <span className="notice-icon">⏱️</span>
                    <div>
                      <strong>REVISIÓN OBLIGATORIA POR EL ADMINISTRADOR (MÁXIMO 48 HORAS):</strong>
                      <p>
                        Tu prenda quedará en estado <strong>Pendiente de Revisión</strong> y no será visible al público hasta que el Administrador la apruebe. Si es rechazada, recibirás el motivo.
                      </p>
                    </div>
                  </div>

                  <form className="seller-upload-form" onSubmit={handleSellerProductSubmit}>
                    <div className="form-group-modern">
                      <label>Nombre de la Prenda Vintage *</label>
                      <input
                        type="text"
                        placeholder="Ej. Casaca Nike Windrunner 1994 Colorblock"
                        value={sellerForm.name}
                        onChange={e => setSellerForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group-modern" style={{ gridColumn: 'span 2' }}>
                      <CategorySearchSelector
                        categories={categories}
                        selectedCategories={sellerCategories}
                        onChange={(nextCats) => {
                          setSellerCategories(nextCats)
                          const primaryCat = categories.find(x => x.name === nextCats[0])
                          if (primaryCat) {
                            setSellerForm(prev => ({ ...prev, categoryId: primaryCat.idCategory }))
                          }
                        }}
                        label="Buscador de Categorías Asociadas a tu Prenda"
                        required
                      />
                    </div>

                    <div className="form-row-dual">
                      <div className="form-group-modern">
                        <label>Precio de Venta (S/) *</label>
                        <input
                          type="number"
                          step="0.50"
                          min="5"
                          placeholder="Ej. 120.00"
                          value={sellerForm.price}
                          onChange={e => setSellerForm(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group-modern">
                        <label>Silueta / Género</label>
                        <select
                          value={sellerForm.sex || 'UNISEX'}
                          onChange={e => setSellerForm(prev => ({ ...prev, sex: e.target.value }))}
                        >
                          <option value="UNISEX">⚡ Unisex</option>
                          <option value="HOMBRE">♂ Hombre</option>
                          <option value="MUJER">♀ Mujer</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-dual">
                      <div className="form-group-modern">
                        <label>Talla</label>
                        <select
                          value={sellerForm.size}
                          onChange={e => setSellerForm(prev => ({ ...prev, size: e.target.value }))}
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M (Mediana)</option>
                          <option value="L">L (Grande)</option>
                          <option value="XL">XL (Extra Grande)</option>
                          <option value="XXL">XXL</option>
                          <option value="Oversized">Oversized</option>
                          <option value="Única">Talla Única</option>
                        </select>
                      </div>

                      <div className="form-group-modern">
                        <label>Condición Vintage</label>
                        <select
                          value={sellerForm.condition}
                          onChange={e => setSellerForm(prev => ({ ...prev, condition: Number(e.target.value) }))}
                        >
                          <option value={5}>★ 5/5 - Excelente / Como nuevo</option>
                          <option value={4}>★ 4/5 - Muy bueno con desgaste natural leve</option>
                          <option value={3}>★ 3/5 - Buen estado con pátina / marcas de uso</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <ImageGalleryUploader
                        images={sellerImages}
                        onChange={setSellerImages}
                        maxImages={5}
                      />
                    </div>

                    <div className="form-group-modern">
                      <label>Detalles, Medidas & Procedencia</label>
                      <textarea
                        rows={3}
                        placeholder="Indica medidas exactas (axila a axila, largo), época aproximada, detalles de fábrica o imperfecciones..."
                        value={sellerForm.description}
                        onChange={e => setSellerForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary-luxury submit-seller-product-btn"
                      disabled={submittingProduct}
                    >
                      <span>{submittingProduct ? 'Enviando a revisión...' : 'Enviar Prenda a Revisión del Admin'}</span>
                      <span className="icon">→</span>
                    </button>
                  </form>
                </div>

                {/* Submissions List Card */}
                <div className="seller-submissions-card">
                  <div className="submissions-header">
                    <h4>Mis Prendas Enviadas ({sellerProducts.length})</h4>
                    <span className="submissions-subtitle">Seguimiento de aprobación por el curador</span>
                  </div>

                  {sellerProducts.length === 0 ? (
                    <div className="empty-submissions-box">
                      <span>🧥</span>
                      <p>Aún no has enviado ninguna prenda a revisión. Completa el formulario de la izquierda para enviar tu primera joya.</p>
                    </div>
                  ) : (
                    <div className="seller-items-list">
                      {sellerProducts.map(prod => {
                        const prodStatus = prod.status ? prod.status.toUpperCase() : 'PUBLICADO'
                        return (
                          <div key={prod.idProduct} className="seller-item-card">
                            <img
                              src={prod.imageUrl || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'}
                              alt={prod.name}
                              className="seller-item-img"
                              onError={e => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80'
                              }}
                            />
                            <div className="seller-item-details">
                              <h5>{prod.name}</h5>
                              <span className="seller-item-meta">
                                {prod.categoryName} • Talla: {prod.size} • S/ {prod.price.toFixed(2)}
                              </span>
                              {prodStatus === 'PENDIENTE_REVISION' && (
                                <div className="status-badge-seller pending">
                                  <span>⏳ En Revisión por Admin (Máx 48h)</span>
                                </div>
                              )}
                              {prodStatus === 'PUBLICADO' && (
                                <div className="status-badge-seller approved">
                                  <span>✓ Aprobado y en Tienda</span>
                                </div>
                              )}
                              {prodStatus === 'RECHAZADO' && (
                                <div className="status-badge-seller rejected">
                                  <span>✕ No Aprobado: {prod.rejectionReason || 'No cumple con los estándares'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Buyer Seller Admission Application Portal */
            <div className="profile-tab-content">
              {mySellerApp && mySellerApp.status === 'PENDING' && !isReapplying ? (
                <div className="seller-app-status-card pending">
                  <div className="app-status-header">
                    <span className="status-badge-big pending">⏳ SOLICITUD EN REVISIÓN</span>
                    <h3>Tu postulación para ser Vendedor Oficial está siendo evaluada</h3>
                    <p>
                      Los administradores y curadores de <strong>La Cachina</strong> están verificando tu perfil y catálogo vintage.
                      Te notificaremos apenas tu cuenta sea activada.
                    </p>
                  </div>

                  <div className="app-submitted-details">
                    <div className="detail-item">
                      <span className="label">Tienda / Proyecto:</span>
                      <strong>{mySellerApp.shopName}</strong>
                    </div>
                    <div className="detail-item">
                      <span className="label">Documento:</span>
                      <span>{mySellerApp.docNumber || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Teléfono / WhatsApp:</span>
                      <span>{mySellerApp.phone || 'No especificado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Instagram / Redes:</span>
                      <span>{mySellerApp.instagram || 'No especificado'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="label">Detalles del Catálogo:</span>
                      <p>{mySellerApp.experienceDetails || 'Sin detalles'}</p>
                    </div>
                    <div className="detail-item">
                      <span className="label">Fecha de Envío:</span>
                      <span>{new Date(mySellerApp.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="app-callout-footer">
                    <span>🛡️ <strong>Compromiso de Autenticidad:</strong> Una vez aprobada tu cuenta, podrás publicar prendas ilimitadas a revisión y lanzar hasta 1 subasta activa simultánea.</span>
                  </div>
                </div>
              ) : mySellerApp && mySellerApp.status === 'REJECTED' && !isReapplying ? (
                <div className="seller-app-status-card rejected">
                  <div className="app-status-header">
                    <span className="status-badge-big rejected">✕ SOLICITUD NO APROBADA</span>
                    <h3>Tu solicitud anterior no fue aprobada</h3>
                    {mySellerApp.rejectionReason && (
                      <div className="rejection-reason-box">
                        <strong>Motivo indicado por el Administrador:</strong>
                        <p>{mySellerApp.rejectionReason}</p>
                      </div>
                    )}
                    <p>Puedes actualizar tus datos o proporcionar mayor información sobre tu archivo de prendas y volver a postular.</p>
                    <button
                      type="button"
                      className="btn-primary-luxury"
                      onClick={() => setIsReapplying(true)}
                    >
                      <span>✏️ Modificar y Reenviar Solicitud</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="seller-application-card">
                  <div className="seller-app-hero">
                    <div className="hero-badge">👔 PROGRAMA DE VENDEDORES OFICIALES</div>
                    <h2>Conviértete en Vendedor de Archivo Vintage</h2>
                    <p>
                      Vende tus joyas vintage seleccionadas en el mercado más exclusivo del Perú y accede a nuestro sistema de subastas exclusivas.
                      Completa el formulario para que el equipo curador evalúe tu tienda.
                    </p>
                  </div>

                  <form className="seller-app-form" onSubmit={handleSellerAppSubmit}>
                    <div className="form-group-modern">
                      <label>Nombre de tu Marca o Tienda Vintage *</label>
                      <input
                        type="text"
                        placeholder="Ej. Lima Vault Archive, Retro Kicks & Tees"
                        value={appForm.shopName}
                        onChange={e => setAppForm(p => ({ ...p, shopName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-row-dual">
                      <div className="form-group-modern">
                        <label>DNI o RUC del Titular *</label>
                        <input
                          type="text"
                          placeholder="Ej. 74829103 o 10748291031"
                          value={appForm.docNumber}
                          onChange={e => setAppForm(p => ({ ...p, docNumber: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="form-group-modern">
                        <label>Celular / WhatsApp de Contacto *</label>
                        <input
                          type="tel"
                          placeholder="Ej. +51 987 654 321"
                          value={appForm.phone}
                          onChange={e => setAppForm(p => ({ ...p, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group-modern">
                      <label>Cuenta de Instagram o Enlace a tu Catálogo *</label>
                      <input
                        type="text"
                        placeholder="Ej. @limavault_archive o https://instagram.com/tu_tienda"
                        value={appForm.instagram}
                        onChange={e => setAppForm(p => ({ ...p, instagram: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group-modern">
                      <label>Cuéntanos sobre tu catálogo y experiencia con ropa vintage *</label>
                      <textarea
                        rows={4}
                        placeholder="Describe el tipo de piezas que manejas (ej. denim 70s/80s, camisetas de bandas, chaquetas de cuero, streetwear 90s), procedencia y tiempo de experiencia vendiendo..."
                        value={appForm.experienceDetails}
                        onChange={e => setAppForm(p => ({ ...p, experienceDetails: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="seller-terms-agreement">
                      <label className="terms-checkbox-label">
                        <input type="checkbox" required defaultChecked />
                        <span>Declaro que todas las prendas que postularé son auténticas y acepto la curaduría obligatoria de 48 horas por los administradores de La Cachina.</span>
                      </label>
                    </div>

                    <div className="form-actions-row">
                      {isReapplying && (
                        <button
                          type="button"
                          className="btn-cancel-modal"
                          onClick={() => setIsReapplying(false)}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="btn-primary-luxury submit-seller-app-btn"
                        disabled={submittingApp}
                      >
                        <span>{submittingApp ? 'Enviando Solicitud...' : '🚀 Enviar Solicitud a los Administradores'}</span>
                        <span className="icon">→</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )
        )}

        {/* ─── Tab 3: Security & Password with Email Code ─── */}
        {activeTab === 'security' && (
          <div className="profile-tab-content">
            <div className="profile-security-card">
              <div className="security-card-header">
                <span className="security-icon-tag">🔐</span>
                <div>
                  <h3>Cambio Seguro de Contraseña</h3>
                  <p>Para proteger tu cuenta, enviamos un código de verificación de 6 dígitos a tu correo registrado.</p>
                </div>
              </div>

              {securityMessage && (
                <div className={`auth-${securityMessage.type}-banner`}>
                  {securityMessage.text}
                </div>
              )}

              {!codeSent ? (
                <div className="security-step-initial">
                  <div className="email-verify-notice">
                    <span className="notice-icon">✉️</span>
                    <div>
                      <strong>Correo Asociado:</strong>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary-luxury large"
                    onClick={handleSendCode}
                    disabled={loadingCode}
                  >
                    <span>{loadingCode ? 'Enviando código...' : 'Solicitar Código de Verificación al Correo'}</span>
                    <span className="icon">→</span>
                  </button>
                </div>
              ) : (
                <form className="security-code-form" onSubmit={handleResetPasswordWithCode}>
                  <div className="code-dispatched-box">
                    <span className="check-icon">✓</span>
                    <div>
                      <strong>Código de 6 dígitos enviado</strong>
                      <p>Revisa tu correo <strong>{user.email}</strong> e ingresa el código a continuación.</p>
                      {demoCode && (
                        <div className="demo-code-pill">
                          <span>Código generado: <strong>{demoCode}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>Código de Verificación (6 dígitos)</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="pin-code-input"
                      placeholder="••••••"
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Nueva Contraseña (mínimo 6 caracteres)</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-password"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-modern">
                    <label>Confirmar Nueva Contraseña</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="security-actions-row">
                    <button
                      type="button"
                      className="btn-outline-luxury"
                      onClick={() => setCodeSent(false)}
                      disabled={submittingPassword}
                    >
                      <span>Volver / Reenviar</span>
                    </button>

                    <button
                      type="submit"
                      className="btn-primary-luxury"
                      disabled={submittingPassword}
                    >
                      <span>{submittingPassword ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</span>
                      <span className="icon">✓</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
