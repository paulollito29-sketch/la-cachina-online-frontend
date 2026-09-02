import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import GoogleSignInButton from '../components/GoogleSignInButton'
import BrandLogoIcon from '../components/BrandLogoIcon'

export default function Login() {
  const { loginWithPassword, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    try {
      await loginWithPassword(username, password)
      showToast('¡Bienvenido a La Cachina Online!', 'Sesión iniciada correctamente', 'success')
      navigate('/perfil')
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center-modern">
      <div className="auth-card-modern">
        <div className="auth-card-header">
          <Link to="/" title="La Cachina Online" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div className="brand-monogram medium" style={{ background: 'transparent', padding: 0 }}>
              <BrandLogoIcon size={58} />
            </div>
          </Link>
          <span className="auth-eyebrow">✦ CLUB LA CACHINA ONLINE</span>
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta para gestionar pedidos y drops exclusivos.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* ─── Official Google Sign-In Integration ─── */}
        <GoogleSignInButton text="signin_with" onSuccessRedirect="/perfil" />

        <div className="auth-divider">
          <span>o con tu usuario y contraseña</span>
        </div>

        <form className="auth-form-body" onSubmit={handleSubmit}>
          <div className="form-group-modern">
            <label>Usuario o Correo Electrónico</label>
            <input
              type="text"
              placeholder="tu_usuario o correo"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group-modern">
            <div className="label-with-link">
              <label>Contraseña</label>
              <Link to="/forgot-password" className="link-forgot-pass">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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
            disabled={loading}
          >
            <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            <span className="icon">→</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            ¿No tienes una cuenta aún?{' '}
            <Link to="/register" className="auth-switch-link">
              Registrarme en La Cachina
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
