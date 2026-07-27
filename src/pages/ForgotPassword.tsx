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
      <div className="page-center">
        <div className="cart-done" style={{ maxWidth: 420 }}>
          <h2>Revisa tu correo</h2>
          <p style={{ color: 'var(--gray-500)' }}>
            Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.
          </p>
          {resetToken && (
            <div style={{ background: 'var(--gray-100)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', margin: '1rem 0' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🔧 Modo desarrollo:</p>
              <p style={{ marginBottom: '0.5rem', color: 'var(--gray-500)' }}>
                Token de recuperación (cópialo):
              </p>
              <code style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>{resetToken}</code>
              <p style={{ marginTop: '0.75rem' }}>
                <Link to={`/reset-password?token=${resetToken}`} style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
                  → Ir a restablecer contraseña
                </Link>
              </p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/login" className="btn-primary">Volver a iniciar sesión</Link>
            <Link to="/" className="back-link">← Volver a la tienda</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Recuperar contraseña</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', textAlign: 'center' }}>
          Ingresa tu correo y te enviaremos las instrucciones.
        </p>
        {error && <p className="form-error">{error}</p>}
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enviando...' : 'Enviar instrucciones'}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
          <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Volver a iniciar sesión</Link>
        </div>
        <Link to="/" className="back-link">← Volver a la tienda</Link>
      </form>
    </div>
  )
}
