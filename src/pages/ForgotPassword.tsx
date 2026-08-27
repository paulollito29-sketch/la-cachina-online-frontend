import { useState, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const result = await forgotPassword(email)
      setDone(true)
      if (result.resetToken) {
        setResetToken(result.resetToken)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar recuperación')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="page-center-modern">
        <div className="auth-card-modern">
          <div className="auth-card-header">
            <div className="success-icon-badge">✓</div>
            <h2>Revisa tu bandeja</h2>
            <p>Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.</p>
          </div>

          {resetToken && (
            <div className="dev-token-box">
              <span className="dev-token-badge">Modo desarrollo</span>
              <p>Token de recuperación generado:</p>
              <code>{resetToken}</code>
              <Link to={`/reset-password?token=${resetToken}`} className="btn-primary-luxury full-width" style={{ marginTop: '1rem' }}>
                <span>Restablecer Contraseña Ahora →</span>
              </Link>
            </div>
          )}

          <div className="auth-card-footer">
            <Link to="/login" className="btn-outline-luxury full-width">
              <span>Volver a Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center-modern">
      <div className="auth-card-modern">
        <div className="auth-card-header">
          <div className="brand-monogram medium">
            <span className="monogram-text">LC</span>
          </div>
          <span className="auth-eyebrow">✦ SEGURIDAD LA CACHINA ONLINE</span>
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu correo y te enviaremos las instrucciones de acceso.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form className="auth-form-body" onSubmit={handleSubmit}>
          <div className="form-group-modern">
            <label>Correo Electrónico Registrado</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-luxury btn-auth-submit full-width"
            disabled={saving}
          >
            <span>{saving ? 'Enviando enlace...' : 'Enviar Instrucciones'}</span>
            <span className="icon">→</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="auth-switch-link">
              Inicia sesión
            </Link>
          </p>
          <Link to="/" className="back-home-link">
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
