import { useState, type FormEvent } from 'react'
import { useAuth } from '../components/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { loginWithPassword, user } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await loginWithPassword(username, password)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="page-center">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        {error && <p className="form-error">{error}</p>}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">Ingresar</button>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
          <Link to="/forgot-password" style={{ color: 'var(--gold-dark)' }}>¿Olvidaste tu contraseña?</Link>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Regístrate</Link>
        </div>
        <Link to="/" className="back-link">← Volver a la tienda</Link>
      </form>
    </div>
  )
}
