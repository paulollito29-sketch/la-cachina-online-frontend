import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register, loginWithGoogle, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
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
      await register(username, email, password, displayName || undefined)
      showToast('¡Cuenta creada con éxito!', 'Bienvenido a La Cachina Online', 'success')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      showToast('¡Registro con Google exitoso!', 'Bienvenido a La Cachina Online', 'success')
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar con Google')
    } finally {
      setGoogleLoading(false)
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
        <button
          type="button"
          className="btn-google-auth"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? 'Conectando con Google...' : 'Registrarme con Google'}</span>
        </button>

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
            <span>{saving ? 'Creando cuenta...' : 'Registrarme'}</span>
            <span className="icon">→</span>
          </button>
        </form>

        <div className="auth-card-footer">
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
