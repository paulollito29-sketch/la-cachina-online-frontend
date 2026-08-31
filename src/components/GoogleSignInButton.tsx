import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  onSuccessRedirect?: string
}

export default function GoogleSignInButton({ text = 'continue_with', onSuccessRedirect = '/perfil' }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const isSignup = text === 'signup_with'

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })

        if (!userInfoRes.ok) {
          throw new Error('No se pudo obtener la información de Google')
        }

        const userInfo = await userInfoRes.json()
        const email = userInfo.email
        const name = userInfo.name || userInfo.given_name || email.split('@')[0]

        await loginWithGoogle(undefined, email, name, isSignup ? 'CUSTOMER' : undefined)
        showToast('¡Bienvenido!', `Sesión iniciada como ${name}`, 'success')
        navigate(onSuccessRedirect)
      } catch (err: any) {
        showToast('Error de autenticación', err.message || 'Error al autenticar con Google', 'error')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      showToast('Aviso de Google', 'No se completó el acceso con tu cuenta de Google', 'info')
      setLoading(false)
    },
  })

  return (
    <div className="google-signin-container">
      <button
        type="button"
        className="btn-google-luxury-full"
        onClick={() => handleGoogleAuth()}
        disabled={loading}
      >
        <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span className="google-btn-text">
          {loading
            ? 'Conectando con Google...'
            : isSignup
            ? 'Registrarme con Google'
            : 'Iniciar Sesión con Google'}
        </span>
      </button>
    </div>
  )
}
