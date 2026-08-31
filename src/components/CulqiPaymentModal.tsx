import { useState } from 'react'

interface CulqiPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  currency?: string
  customerEmail: string
  customerName: string
  onSuccess: (paymentData: {
    method: string
    transactionId: string
    cardBrand?: string
    last4?: string
    cipCode?: string
    voucherType: string
    documentNumber: string
    companyName?: string
  }) => void
}

export default function CulqiPaymentModal({
  isOpen,
  onClose,
  amount,
  currency = 'PEN',
  customerEmail,
  customerName,
  onSuccess,
}: CulqiPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'yape' | 'pagoefectivo' | 'transfer'>('card')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardHolder, setCardHolder] = useState(customerName || '')
  const [installments, setInstallments] = useState('1')

  // Yape fields
  const [yapePhone, setYapePhone] = useState('')
  const [yapeOtp, setYapeOtp] = useState('')

  // Comprobante SUNAT / INDECOPI
  const [voucherType, setVoucherType] = useState<'boleta' | 'factura'>('boleta')
  const [docNumber, setDocNumber] = useState('')
  const [companyName, setCompanyName] = useState('')

  if (!isOpen) return null

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16)
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExp = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`
    }
    return raw
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (voucherType === 'factura') {
      if (!docNumber || docNumber.length !== 11) {
        setErrorMessage('Para Factura Electrónica, el RUC debe contener exactamente 11 dígitos.')
        return
      }
      if (!companyName.trim()) {
        setErrorMessage('Ingresa la Razón Social de la empresa.')
        return
      }
    } else {
      if (!docNumber || (docNumber.length !== 8 && docNumber.length !== 9 && docNumber.length !== 12)) {
        setErrorMessage('Ingresa un número de DNI (8 dígitos) o Carnet de Extranjería válido.')
        return
      }
    }

    setProcessing(true)

    // Simulate real Culqi API tokenization & charge processing (1.2s delay)
    setTimeout(() => {
      setProcessing(false)
      const txnId = `culqi_chr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

      let cardBrand = 'VISA'
      if (cardNumber.startsWith('5')) cardBrand = 'MASTERCARD'
      if (cardNumber.startsWith('3')) cardBrand = 'AMEX'

      let last4 = '4242'
      const digitsOnly = cardNumber.replace(/\D/g, '')
      if (digitsOnly.length >= 4) {
        last4 = digitsOnly.slice(-4)
      }

      onSuccess({
        method: activeTab,
        transactionId: txnId,
        cardBrand: activeTab === 'card' ? cardBrand : undefined,
        last4: activeTab === 'card' ? last4 : undefined,
        cipCode: activeTab === 'pagoefectivo' ? `CIP-${Math.floor(1000000 + Math.random() * 9000000)}` : undefined,
        voucherType,
        documentNumber: docNumber,
        companyName: voucherType === 'factura' ? companyName : undefined,
      })
    }, 1200)
  }

  return (
    <div className="culqi-modal-overlay" onClick={onClose}>
      <div className="culqi-modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="culqi-modal-header">
          <div className="culqi-brand-row">
            <div className="culqi-logo-pill">
              <span className="culqi-badge-icon">⚡</span>
              <strong>Culqi Checkout 3DS</strong>
            </div>
            <span className="culqi-security-pill">🛡️ PCI-DSS Nivel 1</span>
          </div>
          <button type="button" className="culqi-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Order amount banner */}
        <div className="culqi-amount-banner">
          <div className="amount-info">
            <span className="amount-label">Monto Total (incluye fee pasarela S/ 1.50 e IGV)</span>
            <h3 className="amount-number">S/ {amount.toFixed(2)} {currency}</h3>
          </div>
          <div className="buyer-info">
            <span>{customerEmail}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="culqi-tabs-nav">
          <button
            type="button"
            className={`culqi-tab ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            💳 Tarjeta (Crédito / Débito)
          </button>
          <button
            type="button"
            className={`culqi-tab ${activeTab === 'yape' ? 'active' : ''}`}
            onClick={() => setActiveTab('yape')}
          >
            📱 Yape con Culqi
          </button>
          <button
            type="button"
            className={`culqi-tab ${activeTab === 'pagoefectivo' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagoefectivo')}
          >
            🏦 PagoEfectivo (CIP)
          </button>
        </div>

        {errorMessage && (
          <div className="culqi-error-box">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePay} className="culqi-form-body">
          {/* TAB 1: Card */}
          {activeTab === 'card' && (
            <div className="culqi-fields-pane">
              <div className="culqi-input-group">
                <label>Número de Tarjeta</label>
                <div className="input-with-card-icons">
                  <input
                    type="text"
                    placeholder="4557 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                  />
                  <div className="card-icons-inline">
                    <span className="card-tag visa">VISA</span>
                    <span className="card-tag mc">MC</span>
                    <span className="card-tag amex">AMEX</span>
                  </div>
                </div>
              </div>

              <div className="culqi-dual-row">
                <div className="culqi-input-group">
                  <label>Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExp}
                    onChange={e => setCardExp(formatExp(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="culqi-input-group">
                  <label>CVV / CVC (3-4 dígitos)</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="culqi-input-group">
                <label>Nombre del Titular (como figura en la tarjeta)</label>
                <input
                  type="text"
                  placeholder="Ej. JUAN PEREZ"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="culqi-input-group">
                <label>Número de Cuotas</label>
                <select value={installments} onChange={e => setInstallments(e.target.value)}>
                  <option value="1">1 Cuota (Sin intereses)</option>
                  <option value="2">2 Cuotas</option>
                  <option value="3">3 Cuotas</option>
                  <option value="6">6 Cuotas</option>
                  <option value="12">12 Cuotas</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Yape */}
          {activeTab === 'yape' && (
            <div className="culqi-fields-pane">
              <div className="yape-instruction-box">
                <span className="yape-step-badge">1</span>
                <p>Abre tu app <strong>Yape</strong>, entra al menú superior y selecciona <strong>Código de Aprobación</strong>.</p>
              </div>
              <div className="culqi-dual-row">
                <div className="culqi-input-group">
                  <label>Celular Yape (9 dígitos)</label>
                  <input
                    type="tel"
                    placeholder="987654321"
                    value={yapePhone}
                    onChange={e => setYapePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    maxLength={9}
                    required
                  />
                </div>
                <div className="culqi-input-group">
                  <label>Código de Aprobación Yape</label>
                  <input
                    type="text"
                    placeholder="6 dígitos (Ej: 123456)"
                    value={yapeOtp}
                    onChange={e => setYapeOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PagoEfectivo */}
          {activeTab === 'pagoefectivo' && (
            <div className="culqi-fields-pane">
              <div className="pagoefectivo-info-box">
                <div className="pagoefectivo-logo-title">🏦 PAGOEFECTIVO CIP</div>
                <p>
                  Al confirmar, se generará tu <strong>Código CIP</strong> con validez de 24 horas. Podrás pagar desde la app de tu banco (BCP, BBVA, Interbank, Scotiabank, BanBif) o en miles de agentes autorizados (Kasnet, Western Union).
                </p>
              </div>
            </div>
          )}

          {/* SUNAT & INDECOPI Invoicing Section */}
          <div className="culqi-invoice-section">
            <label className="invoice-section-title">📄 Comprobante de Pago Electrónico (SUNAT / INDECOPI)</label>
            <div className="invoice-type-toggle">
              <label className={`invoice-radio ${voucherType === 'boleta' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="voucherType"
                  value="boleta"
                  checked={voucherType === 'boleta'}
                  onChange={() => setVoucherType('boleta')}
                />
                <span>Boleta de Venta Electrónica</span>
              </label>
              <label className={`invoice-radio ${voucherType === 'factura' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="voucherType"
                  value="factura"
                  checked={voucherType === 'factura'}
                  onChange={() => setVoucherType('factura')}
                />
                <span>Factura Electrónica (RUC)</span>
              </label>
            </div>

            <div className="invoice-inputs-row">
              <div className="culqi-input-group">
                <label>{voucherType === 'factura' ? 'RUC de la Empresa (11 dígitos)' : 'DNI / Carnet Extranjería'}</label>
                <input
                  type="text"
                  placeholder={voucherType === 'factura' ? '20123456789' : '72345678'}
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              {voucherType === 'factura' && (
                <div className="culqi-input-group">
                  <label>Razón Social</label>
                  <input
                    type="text"
                    placeholder="EMPRESA SAC"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Legal Indecopi Notice */}
          <div className="culqi-legal-footer">
            <span>⚖️ Operación protegida por el Código de Protección al Consumidor (Ley N° 29571) y procesada por Culqi (Compañía Incubadora de Soluciones Móviles S.A.C. - BCP).</span>
          </div>

          {/* Submit Action */}
          <div className="culqi-actions-footer">
            <button
              type="submit"
              className="btn-culqi-pay"
              disabled={processing}
            >
              {processing ? (
                <span>⏳ Procesando pago seguro con Culqi...</span>
              ) : (
                <span>
                  🔒 Pagar S/ {amount.toFixed(2)} {currency} con {activeTab === 'card' ? 'Tarjeta' : activeTab === 'yape' ? 'Yape' : 'PagoEfectivo'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
