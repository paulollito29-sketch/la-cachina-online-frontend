import { useState, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useSearchParams, Link } from 'react-router-dom'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenFromUrl)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError('El token es requerido')
      return
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSaving(true)
    try {
      await resetPassword(token.trim(), newPassword)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña')
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
            <h2>Contraseña Actualizada</h2>
            <p>Tu contraseña se ha modificado exitosamente. Ya puedes acceder a tu cuenta.</p>
          </div>

          <div className="auth-card-footer">
            <Link to="/login" className="btn-primary-luxury full-width">
              <span>Iniciar Sesión Ahora</span>
              <span className="icon">→</span>
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
          <h2>Nueva Contraseña</h2>
          <p>Define una nueva contraseña segura para tu cuenta.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form className="auth-form-body" onSubmit={handleSubmit}>
          {!tokenFromUrl && (
            <div className="form-group-modern">
              <label>Token de Recuperación</label>
              <input
                type="text"
                placeholder="Pega tu token aquí"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group-modern">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Mín. 6 caracteres"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group-modern">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary-luxury btn-auth-submit full-width"
            disabled={saving}
          >
            <span>{saving ? 'Guardando...' : 'Cambiar Contraseña'}</span>
            <span className="icon">→</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <Link to="/login" className="back-home-link">
            ← Cancelar y volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
