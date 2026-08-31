import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { auctionApi, categoryApi } from '../services/api'
import type { Auction, Category } from '../types/models'
import ImageGalleryUploader from '../components/ImageGalleryUploader'
import CategorySearchSelector from '../components/CategorySearchSelector'

// Helper component for live ticking countdown
function CountdownTimer({ endTime, onExpire }: { endTime: string; onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endTime) - +new Date()
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true })
        if (onExpire) onExpire()
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({ hours, minutes, seconds, isExpired: false })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [endTime, onExpire])

  if (timeLeft.isExpired) {
    return <span className="auction-timer-pill expired">🏁 Subasta Finalizada</span>
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="auction-timer-pill active">
      <span className="live-dot" />
      <span>{pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s</span>
    </span>
  )
}

export default function Auctions() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [auctions, setAuctions] = useState<Auction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'FINISHED'>('ACTIVE')
  
  // Selected auction for bidding modal
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null)
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [bidAmount, setBidAmount] = useState<string>('')
  const [submittingBid, setSubmittingBid] = useState(false)

  // Create auction modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newAuctionImages, setNewAuctionImages] = useState<string[]>([])
  const [newAuctionCategories, setNewAuctionCategories] = useState<string[]>(['Chaquetas'])
  const [newAuctionForm, setNewAuctionForm] = useState<{
    title: string
    description: string
    startingPrice: string
    minIncrement: string
    durationHours: string
    size: string
    condition: number
  }>({
    title: '',
    description: '',
    startingPrice: '',
    minIncrement: '10',
    durationHours: '24',
    size: 'M',
    condition: 5,
  })
  const [creatingAuction, setCreatingAuction] = useState(false)

  const isSeller = user?.role === 'SELLER'
  const isAdmin = user?.role === 'ADMIN'
  const isSellerOrAdmin = isSeller || isAdmin

  const sellerActiveAuctions = useMemo(() => {
    if (!user || !isSeller) return []
    const now = Date.now()
    return auctions.filter(a =>
      a.sellerEmail?.toLowerCase() === user.email?.toLowerCase() &&
      a.status === 'ACTIVE' &&
      new Date(a.endTime).getTime() > now
    )
  }, [auctions, user, isSeller])

  const canLaunchAuction = isAdmin || (isSeller && sellerActiveAuctions.length === 0)

  const loadAuctions = async () => {
    try {
      const list = await auctionApi.getAll()
      setAuctions(list)
    } catch {
      setAuctions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuctions()
    categoryApi.getAll().then(setCategories).catch(() => {})
  }, [])

  // Refreshes single auction when opening modal
  const openBidModal = async (auction: Auction) => {
    setSelectedAuction(auction)
    setActiveImgIndex(0)
    const minNext = auction.bidCount === 0 ? auction.startingPrice : auction.currentBid + auction.minIncrement
    setBidAmount(String(minNext))
    try {
      const detailed = await auctionApi.getOne(auction.idAuction)
      setSelectedAuction(detailed)
    } catch {}
  }

  const handlePlaceBid = async (amount: number) => {
    if (!selectedAuction) return
    if (!user) {
      showToast('Inicia sesión para pujar', 'Debes tener una cuenta activa para realizar ofertas en vivo.', 'error')
      return
    }

    const minNext = selectedAuction.bidCount === 0 ? selectedAuction.startingPrice : selectedAuction.currentBid + selectedAuction.minIncrement
    if (amount < minNext) {
      showToast('Monto insuficiente', `La puja mínima requerida es de S/ ${minNext.toFixed(2)}`, 'error')
      return
    }

    setSubmittingBid(true)
    try {
      const updated = await auctionApi.placeBid(selectedAuction.idAuction, {
        bidderEmail: user.email,
        bidderName: user.name || user.email.split('@')[0],
        amount,
      })

      setSelectedAuction(updated)
      showToast('¡Puja registrada exitosamente!', `Eres el postor más alto con S/ ${amount.toFixed(2)}`, 'success')
      loadAuctions()
      setBidAmount(String(amount + updated.minIncrement))
    } catch (err: any) {
      showToast('Error al ofertar', err.message || 'No se pudo procesar tu puja', 'error')
    } finally {
      setSubmittingBid(false)
    }
  }

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (isSeller && sellerActiveAuctions.length > 0) {
      showToast('Límite de Vendedor', 'Como vendedor solo puedes tener 1 subasta activa a la vez.', 'error')
      return
    }

    const priceNum = parseFloat(newAuctionForm.startingPrice)
    const incNum = parseFloat(newAuctionForm.minIncrement) || 10
    const hoursNum = parseInt(newAuctionForm.durationHours) || 24

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Precio inválido', 'Ingresa un precio base válido', 'error')
      return
    }

    const imgs = newAuctionImages.length > 0
      ? newAuctionImages
      : ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80']

    setCreatingAuction(true)
    try {
      const now = new Date()
      const end = new Date(now.getTime() + hoursNum * 3600 * 1000)

      await auctionApi.create({
        title: newAuctionForm.title.trim(),
        description: newAuctionForm.description.trim(),
        startingPrice: priceNum,
        minIncrement: incNum,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        imageUrl: imgs[0],
        images: imgs,
        sellerEmail: user.email,
        sellerName: user.name || user.email,
        size: newAuctionForm.size,
        condition: newAuctionForm.condition,
        categoryName: newAuctionCategories[0] || 'Chaquetas',
      })

      showToast('¡Subasta lanzada con éxito!', 'Tu prenda ya está activa y recibiendo ofertas en tiempo real.', 'success')
      setCreateModalOpen(false)
      loadAuctions()
      setNewAuctionForm({
        title: '',
        description: '',
        startingPrice: '',
        minIncrement: '10',
        durationHours: '24',
        size: 'M',
        condition: 5,
      })
      setNewAuctionImages([])
    } catch (err: any) {
      showToast('Error', err.message || 'No se pudo crear la subasta', 'error')
    } finally {
      setCreatingAuction(false)
    }
  }

  const filteredAuctions = useMemo(() => {
    return auctions.filter(a => {
      const isExpired = new Date(a.endTime).getTime() <= Date.now()
      if (activeTab === 'ACTIVE') return a.status === 'ACTIVE' && !isExpired
      return a.status === 'FINISHED' || isExpired
    })
  }, [auctions, activeTab])

  const minNextBid = selectedAuction
    ? (selectedAuction.bidCount === 0 ? selectedAuction.startingPrice : selectedAuction.currentBid + selectedAuction.minIncrement)
    : 0

  return (
    <div className="auctions-page-wrapper">
      {/* ─── 1. Editorial Hero Header ─── */}
      <section className="auctions-hero-banner">
        <div className="auctions-hero-content">
          <div className="hero-tag-pill">
            <span className="live-pulsing-badge" />
            <span>PUJAS EN VIVO DE ARCHIVO</span>
          </div>
          <h1 className="auctions-hero-title">
            SUBASTAS
          </h1>
          <p className="auctions-hero-subtitle">
            Oferta en tiempo real por piezas históricas, chaquetas de culto y prendas raras de colección autenticadas por nuestros curadores.
          </p>

          <div className="hero-stats-row">
            <div className="stat-card-pill">
              <strong>{auctions.filter(a => a.status === 'ACTIVE').length}</strong>
              <span>Subastas Activas</span>
            </div>
            <div className="stat-card-pill">
              <strong>🛡️ 100%</strong>
              <span>Autenticidad Verificada</span>
            </div>
            <div className="stat-card-pill">
              <strong>⚡ 0% Comisiones Ocultas</strong>
              <span>Garantía de Entrega</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Seller Active Limit Notice Banner ─── */}
      {isSeller && sellerActiveAuctions.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
          <div style={{
            background: 'rgba(210, 248, 11, 0.08)',
            border: '1px solid rgba(210, 248, 11, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.86rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🏷️</span>
            <div>
              <strong style={{ color: 'var(--brand-volt)' }}>Límite de Vendedor (1 Subasta a la vez):</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                Actualmente tienes activa la subasta <strong>"{sellerActiveAuctions[0].title}"</strong>. Podrás lanzar una nueva en cuanto concluya.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. Tabs & Action Bar ─── */}
      <div className="auctions-action-bar">
        <div className="auctions-tab-switch">
          <button
            type="button"
            className={`tab-switch-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            🔥 En Vivo ({auctions.filter(a => a.status === 'ACTIVE' && new Date(a.endTime).getTime() > Date.now()).length})
          </button>
          <button
            type="button"
            className={`tab-switch-btn ${activeTab === 'FINISHED' ? 'active' : ''}`}
            onClick={() => setActiveTab('FINISHED')}
          >
            🏁 Historial de Cerradas
          </button>
        </div>

        {/* Action Button: ONLY visible for ADMIN and SELLER */}
        {isSellerOrAdmin && (
          canLaunchAuction ? (
            <button
              type="button"
              className="btn-primary-luxury create-auction-btn"
              onClick={() => setCreateModalOpen(true)}
            >
              <span>➕ Lanzar Nueva Subasta</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary-modern create-auction-btn"
              onClick={() => showToast('Límite de subasta alcanzado', 'Como vendedor solo puedes tener 1 subasta activa a la vez. Cuando finalice tu subasta en curso, podrás lanzar otra.', 'info')}
              title="Como vendedor solo puedes tener 1 subasta activa a la vez"
              style={{ opacity: 0.8 }}
            >
              <span>🔒 1 Subasta en Curso (Vendedor)</span>
            </button>
          )
        )}
      </div>

      {/* ─── 3. Auctions Grid ─── */}
      {loading ? (
        <div className="auctions-loading-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="auction-skeleton-card" />
          ))}
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="no-auctions-card">
          <span className="no-auctions-icon">🔨</span>
          <h3>No hay subastas en esta sección</h3>
          <p>Pronto se añadirán nuevos drops de archivo vintage. ¡Mantente atento!</p>
          <Link to="/tienda" className="btn-secondary-modern">Explorar Tienda Regular</Link>
        </div>
      ) : (
        <div className="auctions-cards-grid">
          {filteredAuctions.map(auction => {
            const gallery = (auction.images && auction.images.length > 0) ? auction.images : [auction.imageUrl]
            return (
              <div key={auction.idAuction} className="auction-card-modern">
                {/* Image Media Box */}
                <div className="auction-media-box">
                  <div className="auction-top-pills">
                    <CountdownTimer endTime={auction.endTime} onExpire={loadAuctions} />
                    <span className="auction-condition-tag">★ {auction.condition}/5</span>
                  </div>

                  <img
                    src={gallery[0]}
                    alt={auction.title}
                    className="auction-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
                    }}
                  />

                  {gallery.length > 1 && (
                    <span className="auction-photos-count">📷 {gallery.length} fotos</span>
                  )}
                </div>

                {/* Auction Info */}
                <div className="auction-card-content">
                  <div className="auction-meta-row">
                    <span className="auction-cat-pill">{auction.categoryName || 'Archivo'}</span>
                    <span className="auction-size-pill">Talla {auction.size || 'M'}</span>
                  </div>

                  <h3 className="auction-title">{auction.title}</h3>
                  {auction.description && (
                    <p className="auction-desc-clamp">{auction.description}</p>
                  )}

                  {/* Bidding Stats Box */}
                  <div className="auction-bidding-box">
                    <div className="bid-stat-item">
                      <span className="bid-label">Puja Actual</span>
                      <div className="bid-price-tag">
                        <span className="curr">S/</span>
                        <span className="val">{auction.currentBid.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bid-stat-item right">
                      <span className="bid-label">Ofertas</span>
                      <span className="bid-count-badge">🔨 {auction.bidCount} pujas</span>
                    </div>
                  </div>

                  {auction.highestBidderName && (
                    <div className="highest-bidder-pill">
                      <span>👑 Postor líder: <strong>{auction.highestBidderName}</strong></span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    className="btn-auction-bid"
                    onClick={() => openBidModal(auction)}
                  >
                    <span>{auction.status === 'ACTIVE' ? '⚡ Entrar a Pujar' : 'Ver Resultados'}</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── 4. Live Bidding Modal / Drawer ─── */}
      {selectedAuction && (
        <div className="auction-modal-overlay" onClick={() => setSelectedAuction(null)}>
          <div className="auction-modal-container" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedAuction(null)}
            >
              ✕
            </button>

            <div className="auction-modal-grid">
              {/* Left: Gallery */}
              <div className="modal-gallery-col">
                {(() => {
                  const modalGallery = (selectedAuction.images && selectedAuction.images.length > 0)
                    ? selectedAuction.images
                    : [selectedAuction.imageUrl]
                  const curImg = modalGallery[activeImgIndex] || modalGallery[0]
                  return (
                    <>
                      <div className="modal-main-img-box">
                        <img
                          src={curImg}
                          alt={selectedAuction.title}
                          className="modal-main-img"
                        />
                        <div className="modal-timer-badge">
                          <CountdownTimer endTime={selectedAuction.endTime} onExpire={loadAuctions} />
                        </div>
                      </div>

                      {modalGallery.length > 1 && (
                        <div className="modal-thumb-strip">
                          {modalGallery.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`thumb-btn ${i === activeImgIndex ? 'active' : ''}`}
                              onClick={() => setActiveImgIndex(i)}
                            >
                              <img src={imgUrl} alt={`Vista ${i + 1}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()}

                <div className="auction-legal-callout">
                  <span>🛡️ <strong>Garantía de Archivo:</strong> Cada puja es un compromiso vinculante. El ganador tendrá 24 horas para completar el pago seguro con Culqi.</span>
                </div>
              </div>

              {/* Right: Bidding Controls & History */}
              <div className="modal-bidding-col">
                <div className="modal-header-info">
                  <div className="modal-category-pills">
                    <span className="cat-badge">{selectedAuction.categoryName}</span>
                    <span className="size-badge">Talla {selectedAuction.size}</span>
                    <span className="condition-badge">Condición {selectedAuction.condition}/5</span>
                  </div>
                  <h2 className="modal-auction-title">{selectedAuction.title}</h2>
                  <p className="modal-seller-tag">Vendido por: <strong>{selectedAuction.sellerName || 'La Cachina'}</strong></p>
                </div>

                {/* Price Display */}
                <div className="modal-pricing-banner">
                  <div className="price-block">
                    <span className="p-label">Puja Actual Más Alta</span>
                    <div className="p-amount">
                      <span className="p-curr">S/</span>
                      <span className="p-val">{selectedAuction.currentBid.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="price-sub-block">
                    <span>Precio base: S/ {selectedAuction.startingPrice.toFixed(2)}</span>
                    <span>Incremento mín.: +S/ {selectedAuction.minIncrement.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Bid Increments */}
                {selectedAuction.status === 'ACTIVE' && (
                  <div className="bidding-controls-box">
                    <label className="bidding-input-label">
                      Pujar rápido con un clic:
                    </label>
                    <div className="quick-increment-pills">
                      {[
                        selectedAuction.minIncrement,
                        selectedAuction.minIncrement * 2,
                        selectedAuction.minIncrement * 5,
                        selectedAuction.minIncrement * 10,
                      ].map((increment) => {
                        const targetAmt = selectedAuction.currentBid + increment
                        return (
                          <button
                            key={increment}
                            type="button"
                            className="quick-inc-btn"
                            disabled={submittingBid}
                            onClick={() => handlePlaceBid(targetAmt)}
                          >
                            + S/ {increment.toFixed(0)} <small>(S/ {targetAmt.toFixed(2)})</small>
                          </button>
                        )
                      })}
                    </div>

                    {/* Custom Bid Input */}
                    <div className="custom-bid-row">
                      <div className="input-with-curr">
                        <span className="curr-symbol">S/</span>
                        <input
                          type="number"
                          step={selectedAuction.minIncrement}
                          min={minNextBid}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          placeholder={`Mínimo S/ ${minNextBid.toFixed(2)}`}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-submit-bid"
                        disabled={submittingBid || parseFloat(bidAmount) < minNextBid}
                        onClick={() => handlePlaceBid(parseFloat(bidAmount))}
                      >
                        {submittingBid ? 'Enviando Puja...' : '⚡ Confirmar Puja'}
                      </button>
                    </div>

                    {!user && (
                      <div className="auth-alert-pill">
                        <span>🔒 Inicia sesión con tu cuenta para poder ofertar. <Link to="/login">Entrar</Link></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Bids Feed */}
                <div className="bids-history-container">
                  <h4>Historial de Pujas ({selectedAuction.bidCount})</h4>
                  {selectedAuction.bids && selectedAuction.bids.length > 0 ? (
                    <div className="bids-scroll-feed">
                      {selectedAuction.bids.map((bid, bIdx) => (
                        <div key={bid.idBid || bIdx} className={`bid-feed-item ${bIdx === 0 ? 'leader' : ''}`}>
                          <div className="bidder-avatar">
                            {bIdx === 0 ? '👑' : '🔨'}
                          </div>
                          <div className="bidder-info">
                            <span className="bidder-name">
                              {bid.bidderName || bid.bidderEmail?.split('@')[0] || 'Postor'}
                              {bIdx === 0 && <span className="leader-tag">Líder</span>}
                            </span>
                            <span className="bidder-time">
                              {bid.bidTime ? new Date(bid.bidTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'}
                            </span>
                          </div>
                          <span className="bid-amount-tag">S/ {bid.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-bids-message">
                      <span>No hay pujas registradas aún. ¡Sé el primer postor con S/ {selectedAuction.startingPrice.toFixed(2)}!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. Create Auction Modal (For Admin & Sellers) ─── */}
      {createModalOpen && (
        <div className="auction-modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="create-auction-modal-content" onClick={e => e.stopPropagation()}>
            <div className="create-modal-header">
              <h3>➕ Lanzar Nueva Subasta de Archivo</h3>
              <button type="button" className="modal-close-btn" onClick={() => setCreateModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateAuction} className="create-auction-form">
              <div className="form-group-modern">
                <label>Título de la Pieza Vintage *</label>
                <input
                  type="text"
                  placeholder="Ej. Chaqueta Aviador Alpha Industries 1991"
                  value={newAuctionForm.title}
                  onChange={e => setNewAuctionForm(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group-modern">
                <CategorySearchSelector
                  categories={categories}
                  selectedCategories={newAuctionCategories}
                  onChange={setNewAuctionCategories}
                  label="Categoría Principal"
                  required
                />
              </div>

              <div className="form-row-dual">
                <div className="form-group-modern">
                  <label>Precio Base de Inicio (S/) *</label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    placeholder="Ej. 150.00"
                    value={newAuctionForm.startingPrice}
                    onChange={e => setNewAuctionForm(p => ({ ...p, startingPrice: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label>Incremento Mínimo por Puja (S/)</label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    value={newAuctionForm.minIncrement}
                    onChange={e => setNewAuctionForm(p => ({ ...p, minIncrement: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row-dual">
                <div className="form-group-modern">
                  <label>Duración de la Subasta</label>
                  <select
                    value={newAuctionForm.durationHours}
                    onChange={e => setNewAuctionForm(p => ({ ...p, durationHours: e.target.value }))}
                  >
                    <option value="12">12 Horas (Subasta Flash)</option>
                    <option value="24">24 Horas (1 Día)</option>
                    <option value="48">48 Horas (2 Días)</option>
                    <option value="72">72 Horas (3 Días)</option>
                    <option value="168">7 Días (Subasta Semanal)</option>
                  </select>
                </div>

                <div className="form-group-modern">
                  <label>Talla</label>
                  <input
                    type="text"
                    value={newAuctionForm.size}
                    onChange={e => setNewAuctionForm(p => ({ ...p, size: e.target.value }))}
                    placeholder="Ej. L Boxy, 32/32"
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <ImageGalleryUploader
                  images={newAuctionImages}
                  onChange={setNewAuctionImages}
                  maxImages={5}
                />
              </div>

              <div className="form-group-modern">
                <label>Historia, Procedencia & Detalles de la pieza</label>
                <textarea
                  rows={3}
                  value={newAuctionForm.description}
                  onChange={e => setNewAuctionForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detalla año, etiquetas, características especiales, detalles de uso..."
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel-modal" onClick={() => setCreateModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-luxury" disabled={creatingAuction}>
                  {creatingAuction ? 'Lanzando Subasta...' : '🚀 Publicar Subasta en Vivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
