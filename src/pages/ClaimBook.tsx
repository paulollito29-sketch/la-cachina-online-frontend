import { useState } from 'react'
import { Link } from 'react-router-dom'
import { claimApi } from '../services/api'
import type { ClaimCreate, ClaimResponse } from '../types/models'
import { useToast } from '../components/ToastContext'

export default function ClaimBook() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'form' | 'track'>('form')

  // Form State
  const [docType, setDocType] = useState('DNI')
  const [docNumber, setDocNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [department, setDepartment] = useState('Lima')
  const [province, setProvince] = useState('Lima')
  const [district, setDistrict] = useState('')
  
  const [isMinor, setIsMinor] = useState(false)
  const [parentName, setParentName] = useState('')
  const [parentDocNumber, setParentDocNumber] = useState('')

  const [contractedGoodType, setContractedGoodType] = useState('PRODUCTO')
  const [claimedAmount, setClaimedAmount] = useState('')
  const [goodDescription, setGoodDescription] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const [claimType, setClaimType] = useState<'RECLAMO' | 'QUEJA'>('RECLAMO')
  const [detail, setDetail] = useState('')
  const [consumerRequest, setConsumerRequest] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submittedClaim, setSubmittedClaim] = useState<ClaimResponse | null>(null)

  // Tracking State
  const [trackCode, setTrackCode] = useState('')
  const [trackingClaim, setTrackingClaim] = useState<ClaimResponse | null>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) {
      addToast('Debes aceptar la declaración jurada y condiciones del Libro de Reclamaciones', 'error')
      return
    }

    if (!docNumber.trim() || !fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !goodDescription.trim() || !detail.trim() || !consumerRequest.trim()) {
      addToast('Por favor completa todos los campos obligatorios (*)', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload: ClaimCreate = {
        docType,
        docNumber: docNumber.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        department,
        province,
        district: district.trim(),
        isMinor,
        parentName: isMinor ? parentName.trim() : undefined,
        parentDocNumber: isMinor ? parentDocNumber.trim() : undefined,
        contractedGoodType,
        claimedAmount: claimedAmount ? parseFloat(claimedAmount) : undefined,
        goodDescription: goodDescription.trim(),
        orderNumber: orderNumber.trim() || undefined,
        claimType,
        detail: detail.trim(),
        consumerRequest: consumerRequest.trim(),
      }

      const res = await claimApi.create(payload)
      setSubmittedClaim(res)
      addToast(`Reclamación ${res.claimCode} registrada exitosamente`, 'success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      addToast(err.message || 'Error al registrar la reclamación', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackCode.trim()) return

    setTrackingLoading(true)
    setTrackingError(null)
    setTrackingClaim(null)

    try {
      const res = await claimApi.getOneByCode(trackCode.trim())
      setTrackingClaim(res)
    } catch (err: any) {
      setTrackingError(err.message || 'No se encontró la reclamación ingresada')
    } finally {
      setTrackingLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="claim-page-wrapper">
      {/* ─── Header Hero ─── */}
      <section className="claim-hero-section">
        <div className="claim-hero-container">
          <div className="claim-badge-pill">
            <span className="indecopi-badge">INDECOPI</span>
            <span>D.S. N° 011-2011-PCM / LEY N° 29571</span>
          </div>
          <h1 className="claim-hero-title">Libro de Reclamaciones Virtual</h1>
          <p className="claim-hero-desc">
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, La Cachina Online pone a tu disposición este registro oficial para atender cualquier disconformidad con transparencia y celeridad.
          </p>

          <div className="claim-tab-nav">
            <button
              type="button"
              className={`claim-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => { setActiveTab('form'); setSubmittedClaim(null); }}
            >
              📝 Registrar Nueva Reclamación
            </button>
            <button
              type="button"
              className={`claim-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => setActiveTab('track')}
            >
              🔍 Consultar Estado de Reclamo
            </button>
          </div>
        </div>
      </section>

      <main className="claim-main-container">
        {/* ─── SUCCESS / PRINTABLE SHEET VIEW ─── */}
        {submittedClaim && (
          <div className="claim-success-sheet">
            <div className="sheet-header">
              <div className="sheet-brand">
                <h2>LA CACHINA ONLINE</h2>
                <p>RUC: 20609871234 | LA CACHINA ONLINE S.A.C.</p>
                <p>Jr. Paruro 1045, Lima Cercado, Lima - Perú</p>
              </div>
              <div className="sheet-code-badge">
                <span className="code-label">HOJA DE RECLAMACIÓN</span>
                <strong className="code-value">{submittedClaim.claimCode}</strong>
                <span className="code-date">Fecha: {new Date(submittedClaim.createdAt).toLocaleString('es-PE')}</span>
              </div>
            </div>

            <div className="alert-sheet-notice">
              <span className="notice-icon">✓</span>
              <div>
                <strong>¡Reclamación Registrada Satisfactoriamente!</strong>
                <p>
                  Guarda o imprime tu código correlativo <strong>{submittedClaim.claimCode}</strong>. Conforme al D.S. N° 011-2011-PCM, el plazo legal de respuesta es de máximo <strong>15 días hábiles</strong> a través de tu correo electrónico <strong>{submittedClaim.email}</strong>.
                </p>
              </div>
            </div>

            <div className="sheet-grid-sections">
              <div className="sheet-block">
                <h3>1. Identificación del Consumidor</h3>
                <p><strong>Nombres y Apellidos:</strong> {submittedClaim.fullName}</p>
                <p><strong>Documento:</strong> {submittedClaim.docType} - {submittedClaim.docNumber}</p>
                <p><strong>Correo Electrónico:</strong> {submittedClaim.email}</p>
                <p><strong>Teléfono:</strong> {submittedClaim.phone}</p>
                <p><strong>Dirección:</strong> {submittedClaim.address}, {submittedClaim.district}, {submittedClaim.province} - {submittedClaim.department}</p>
                {submittedClaim.isMinor && (
                  <p><strong>Padre/Tutor:</strong> {submittedClaim.parentName} ({submittedClaim.parentDocNumber})</p>
                )}
              </div>

              <div className="sheet-block">
                <h3>2. Identificación del Bien Contratado</h3>
                <p><strong>Tipo de Bien:</strong> {submittedClaim.contractedGoodType}</p>
                {submittedClaim.claimedAmount && <p><strong>Monto Reclamado:</strong> S/ {submittedClaim.claimedAmount.toFixed(2)}</p>}
                {submittedClaim.orderNumber && <p><strong>N° de Pedido:</strong> {submittedClaim.orderNumber}</p>}
                <p><strong>Descripción:</strong> {submittedClaim.goodDescription}</p>
              </div>

              <div className="sheet-block full-width">
                <h3>3. Detalle de la Reclamación ({submittedClaim.claimType})</h3>
                <p><strong>Hechos:</strong> {submittedClaim.detail}</p>
                <p><strong>Pedido del Consumidor:</strong> {submittedClaim.consumerRequest}</p>
              </div>

              <div className="sheet-block full-width status-block">
                <h3>4. Estado Actual de la Reclamación</h3>
                <p><strong>Estado:</strong> <span className={`claim-status-pill ${submittedClaim.status.toLowerCase()}`}>{submittedClaim.status}</span></p>
                {submittedClaim.adminResponse && (
                  <div className="admin-reply-box">
                    <strong>Respuesta del Proveedor:</strong>
                    <p>{submittedClaim.adminResponse}</p>
                    <small>Atendido por {submittedClaim.respondedBy || 'Administración'} el {submittedClaim.respondedAt ? new Date(submittedClaim.respondedAt).toLocaleDateString('es-PE') : ''}</small>
                  </div>
                )}
              </div>
            </div>

            <div className="sheet-actions no-print">
              <button type="button" className="btn-primary-luxury" onClick={handlePrint}>
                🖨️ Imprimir / Guardar en PDF
              </button>
              <button
                type="button"
                className="btn-outline-luxury"
                onClick={() => {
                  setSubmittedClaim(null)
                  setDocNumber('')
                  setFullName('')
                  setEmail('')
                  setPhone('')
                  setAddress('')
                  setDistrict('')
                  setGoodDescription('')
                  setDetail('')
                  setConsumerRequest('')
                  setTermsAccepted(false)
                }}
              >
                Ingresar Otra Reclamación
              </button>
              <Link to="/tienda" className="view-all-link">
                Volver a la Tienda →
              </Link>
            </div>
          </div>
        )}

        {/* ─── FORM TAB ─── */}
        {!submittedClaim && activeTab === 'form' && (
          <form className="claim-form-card" onSubmit={handleSubmit}>
            {/* Legal Provider Info Box */}
            <div className="provider-info-banner">
              <div className="provider-icon">🏛️</div>
              <div className="provider-details">
                <strong>Proveedor: LA CACHINA ONLINE S.A.C.</strong>
                <p>RUC: 20609871234 | Jr. Paruro 1045, Lima Cercado, Lima - Perú</p>
                <p>Establecimiento Virtual: <a href="https://lacachinaonline.pe" target="_blank" rel="noreferrer">www.lacachinaonline.pe</a> | Contacto: contacto@lacachinaonline.pe</p>
              </div>
            </div>

            {/* SECCIÓN 1: CONSUMIDOR */}
            <div className="form-section-group">
              <div className="section-group-header">
                <span className="step-tag">01</span>
                <div>
                  <h2 className="step-title">Identificación del Consumidor Reclamante</h2>
                  <p className="step-desc">Ingresa tus datos personales y de contacto para recibir la respuesta oficial.</p>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-modern">
                  <label>Tipo de Documento *</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)} required>
                    <option value="DNI">DNI - Documento Nacional de Identidad</option>
                    <option value="CE">Carné de Extranjería (CE)</option>
                    <option value="RUC">RUC</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Número de Documento *</label>
                  <input
                    type="text"
                    placeholder="Ej. 74829103"
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Nombres y Apellidos Completos / Razón Social *</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez Quispe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-modern">
                  <label>Correo Electrónico (Donde recibirás la respuesta) *</label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group-modern">
                  <label>Teléfono / Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="Ej. 987654321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Dirección Domiciliaria *</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Larco 450, Dpto 302"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-3">
                <div className="form-group-modern">
                  <label>Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Ej. Lima"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Provincia</label>
                  <input
                    type="text"
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    placeholder="Ej. Lima"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Distrito</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="Ej. Miraflores"
                  />
                </div>
              </div>

              {/* Checkbox Menor de Edad */}
              <div className="minor-checkbox-wrapper">
                <label className="checkbox-label-modern">
                  <input
                    type="checkbox"
                    checked={isMinor}
                    onChange={e => setIsMinor(e.target.checked)}
                  />
                  <span>El consumidor reclamante es menor de edad</span>
                </label>
              </div>

              {isMinor && (
                <div className="minor-fields-box">
                  <div className="form-row-2">
                    <div className="form-group-modern">
                      <label>Nombre del Padre, Madre o Tutor *</label>
                      <input
                        type="text"
                        placeholder="Nombre completo del apoderado"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        required={isMinor}
                      />
                    </div>
                    <div className="form-group-modern">
                      <label>DNI/Documento del Padre/Tutor *</label>
                      <input
                        type="text"
                        placeholder="Documento del apoderado"
                        value={parentDocNumber}
                        onChange={e => setParentDocNumber(e.target.value)}
                        required={isMinor}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: BIEN CONTRATADO */}
            <div className="form-section-group">
              <div className="section-group-header">
                <span className="step-tag">02</span>
                <div>
                  <h2 className="step-title">Identificación del Bien Contratado</h2>
                  <p className="step-desc">Detalla el producto o servicio materia de la presente reclamación.</p>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-modern">
                  <label>Tipo de Bien *</label>
                  <select
                    value={contractedGoodType}
                    onChange={e => setContractedGoodType(e.target.value)}
                    required
                  >
                    <option value="PRODUCTO">PRODUCTO (Prenda Vintage, Casaca, Calzado, Joya, etc.)</option>
                    <option value="SERVICIO">SERVICIO (Envío, Atención al cliente, Plataforma)</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Monto Reclamado (S/ Soles)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 180.00"
                    value={claimedAmount}
                    onChange={e => setClaimedAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label>Número de Pedido / Orden (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. ORD-2026-1049"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                />
              </div>

              <div className="form-group-modern">
                <label>Descripción del Producto o Servicio *</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Casaca Cuero Retro Biker Talla L comprada en el drop del 20 de Agosto"
                  value={goodDescription}
                  onChange={e => setGoodDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SECCIÓN 3: DETALLE DE LA RECLAMACIÓN */}
            <div className="form-section-group">
              <div className="section-group-header">
                <span className="step-tag">03</span>
                <div>
                  <h2 className="step-title">Detalle de la Reclamación</h2>
                  <p className="step-desc">Selecciona el tipo de reclamación según la definición oficial de INDECOPI.</p>
                </div>
              </div>

              {/* Selector Reclamo vs Queja */}
              <div className="claim-type-selector">
                <label className={`claim-type-card ${claimType === 'RECLAMO' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="claimType"
                    value="RECLAMO"
                    checked={claimType === 'RECLAMO'}
                    onChange={() => setClaimType('RECLAMO')}
                  />
                  <div className="claim-type-content">
                    <strong>📢 RECLAMO</strong>
                    <p>Disconformidad relacionada a los productos adquiridos o servicios contratados (ej. estado de la prenda, discrepancia, tiempo de envío).</p>
                  </div>
                </label>

                <label className={`claim-type-card ${claimType === 'QUEJA' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="claimType"
                    value="QUEJA"
                    checked={claimType === 'QUEJA'}
                    onChange={() => setClaimType('QUEJA')}
                  />
                  <div className="claim-type-content">
                    <strong>⚠️ QUEJA</strong>
                    <p>Malestar o descontento respecto a la atención al público recibida, sin tener relación directa con el producto o servicio en sí.</p>
                  </div>
                </label>
              </div>

              <div className="form-group-modern">
                <label>Detalle de los Hechos / Descripción de la Reclamación *</label>
                <textarea
                  rows={4}
                  placeholder="Describe con claridad los hechos sucedidos, fechas y motivos de tu disconformidad..."
                  value={detail}
                  onChange={e => setDetail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label>Pedido Concreto del Consumidor *</label>
                <textarea
                  rows={3}
                  placeholder="¿Cuál es la solución o pedido específico que solicitas a La Cachina Online?..."
                  value={consumerRequest}
                  onChange={e => setConsumerRequest(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Declaración Jurada */}
            <div className="affidavit-box">
              <label className="checkbox-label-modern">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  required
                />
                <span>
                  <strong>Declaración Jurada y Aceptación:</strong> Declaro que los datos consignados en el presente formulario son verídicos. Tomo conocimiento de que el proveedor cuenta con un plazo legal máximo e improrrogable de <strong>quince (15) días hábiles</strong> para emitir respuesta oficial a mi correo electrónico registrado (D.S. N° 011-2011-PCM / Ley N° 29571).
                </span>
              </label>
            </div>

            <div className="form-submit-actions">
              <button
                type="submit"
                className="btn-primary-luxury large"
                disabled={submitting || !termsAccepted}
              >
                {submitting ? 'Registrando Reclamación...' : '✉️ Enviar y Generar Hoja de Reclamación'}
              </button>
            </div>
          </form>
        )}

        {/* ─── TRACKING TAB ─── */}
        {activeTab === 'track' && (
          <div className="claim-track-card">
            <div className="track-header">
              <h2>Consulta y Seguimiento de Reclamación</h2>
              <p>Ingresa el código correlativo asignado a tu reclamación (ej. <strong>LR-2026-0001</strong>) para conocer su estado de atención.</p>
            </div>

            <form className="track-input-row" onSubmit={handleTrackSubmit}>
              <input
                type="text"
                placeholder="Ingresa tu código: LR-2026-XXXX"
                value={trackCode}
                onChange={e => setTrackCode(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary-luxury" disabled={trackingLoading}>
                {trackingLoading ? 'Consultando...' : '🔍 Buscar'}
              </button>
            </form>

            {trackingError && (
              <div className="track-error-box">
                <p>❌ {trackingError}</p>
              </div>
            )}

            {trackingClaim && (
              <div className="track-result-sheet">
                <div className="track-result-top">
                  <div>
                    <span className="code-tag">{trackingClaim.claimCode}</span>
                    <h3>{trackingClaim.fullName}</h3>
                    <p className="track-meta">Registrado el: {new Date(trackingClaim.createdAt).toLocaleString('es-PE')}</p>
                  </div>
                  <div className="track-status-wrapper">
                    <span className={`claim-status-pill ${trackingClaim.status.toLowerCase()}`}>
                      {trackingClaim.status}
                    </span>
                  </div>
                </div>

                <div className="track-details-grid">
                  <div>
                    <strong>Tipo:</strong> {trackingClaim.claimType} ({trackingClaim.contractedGoodType})
                  </div>
                  <div>
                    <strong>Bien:</strong> {trackingClaim.goodDescription}
                  </div>
                  <div className="full-col">
                    <strong>Hechos:</strong> {trackingClaim.detail}
                  </div>
                  <div className="full-col">
                    <strong>Pedido del Consumidor:</strong> {trackingClaim.consumerRequest}
                  </div>
                </div>

                {trackingClaim.adminResponse ? (
                  <div className="admin-resolution-box">
                    <h4>🏛️ Respuesta Oficial del Proveedor</h4>
                    <p>{trackingClaim.adminResponse}</p>
                    <div className="resolution-footer">
                      <span>Atendido por: {trackingClaim.respondedBy || 'La Cachina Admin'}</span>
                      {trackingClaim.respondedAt && <span>Fecha: {new Date(trackingClaim.respondedAt).toLocaleDateString('es-PE')}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="pending-notice-box">
                    <p>⏳ Tu reclamación se encuentra en proceso de revisión por nuestro equipo legal dentro del plazo de 15 días hábiles establecido por INDECOPI.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
