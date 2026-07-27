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
      <div className="page-center">
        <div className="cart-done">
          <h2>Contraseña actualizada</h2>
          <p style={{ color: 'var(--gray-500)' }}>
            Tu contraseña se ha restablecido exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link to="/login" className="btn-primary">Iniciar sesión</Link>
          <Link to="/" className="back-link">← Volver a la tienda</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Restablecer contraseña</h2>
        {error && <p className="form-error">{error}</p>}
        {!tokenFromUrl && (
          <>
            <label style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Token de recuperación
            </label>
            <input
              type="text"
              placeholder="Pega el token aquí"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="password"
          placeholder="Nueva contraseña (mín. 6 caracteres)"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Actualizando...' : 'Restablecer contraseña'}
        </button>
        <Link to="/login" className="back-link" style={{ textAlign: 'center' }}>← Volver a iniciar sesión</Link>
      </form>
    </div>
  )
}
