import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { changePassword, user } = useAuth()
  const { showToast } = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      showToast('¡Contraseña actualizada!', 'Tu nueva contraseña se guardó exitosamente', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-box auth-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">✦ SEGURIDAD DE TU CUENTA</span>
            <h3>Cambiar Contraseña</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group-modern">
            <label>Contraseña Actual</label>
            <div className="password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label>Nueva Contraseña (mínimo 6 caracteres)</label>
            <div className="password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPass(!showPass)}
                aria-label="Ver u ocultar contraseña"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group-modern">
            <label>Confirmar Nueva Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn-primary-luxury full-width"
              disabled={loading}
            >
              <span>{loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</span>
              <span className="icon">✓</span>
            </button>
            <button
              type="button"
              className="btn-outline-luxury"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
