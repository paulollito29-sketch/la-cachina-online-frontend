import { useState, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (user) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    try {
      await register(username, email, password, displayName || undefined)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-center">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', textAlign: 'center' }}>
          Únete a Vault Vintage
        </p>
        {error && <p className="form-error">{error}</p>}
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nombre completo (opcional)"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Inicia sesión</Link>
        </div>
        <Link to="/" className="back-link">← Volver a la tienda</Link>
      </form>
    </div>
  )
}
