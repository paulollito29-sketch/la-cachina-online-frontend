import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Register() {
  const { register, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/perfil', { replace: true })
    }
  }, [user, navigate])

  if (user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !email.trim() || !password) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await register(username, email, password, displayName || undefined, 'CUSTOMER')
      showToast('¡Cuenta creada con éxito!', 'Bienvenido a La Cachina Online', 'success')
      navigate('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-center-modern">
      <div className="auth-card-modern">
        <div className="auth-card-header">
          <div className="brand-monogram medium">
            <span className="monogram-text">LC</span>
          </div>
          <span className="auth-eyebrow">✦ MEMBRESÍA LA CACHINA ONLINE</span>
          <h2>Crear Cuenta</h2>
          <p>Únete a nuestra comunidad de moda circular y accede a drops exclusivos.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* ─── Google Registration Button ─── */}
        <GoogleSignInButton text="signup_with" onSuccessRedirect="/perfil" />

        <div className="auth-divider">
          <span>o completa tus datos</span>
        </div>

        <form className="auth-form-body" onSubmit={handleSubmit}>
          <div className="form-group-modern">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              placeholder="tu_usuario (sin espacios)"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              required
            />
          </div>

          <div className="form-group-modern">
            <label>Nombre Completo o Alias</label>
            <input
              type="text"
              placeholder="Ej. Mateo Zárate"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group-modern">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-modern">
            <label>Contraseña (mínimo 6 caracteres)</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ver u ocultar contraseña"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-luxury btn-auth-submit full-width"
            disabled={saving}
          >
            <span>{saving ? 'Creando cuenta...' : 'Crear mi Cuenta'}</span>
            <span className="icon">→</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <div className="seller-hint-box" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', textAlign: 'left', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent, #e5b887)', display: 'block', marginBottom: '4px' }}>🏷️ ¿Deseas vender tus prendas vintage?</span>
            <span style={{ color: 'var(--text-muted, #9ca3af)', lineHeight: 1.4 }}>
              Crea tu cuenta de usuario y podrás postular para ser <strong>Vendedor Oficial</strong> directamente desde tu perfil.
            </span>
          </div>

          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-switch-link">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
