import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { API_BASE } from '../services/api'

interface User {
  email: string
  name: string
  token: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithPassword: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>
  forgotPassword: (email: string) => Promise<{ resetToken?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('vv_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('vv_user')
      }
    }
    setLoading(false)
  }, [])

  const setUserAndStore = useCallback((u: User) => {
    setUser(u)
    localStorage.setItem('vv_user', JSON.stringify(u))
  }, [])

  const loginWithPassword = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Usuario o contraseña incorrectos')
    const data = await res.json()
    setUserAndStore({ email: data.email, name: data.name, token: data.token, role: data.role })
  }, [setUserAndStore])

  const register = useCallback(async (username: string, email: string, password: string, displayName?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al registrarse')
    setUserAndStore({ email: data.email, name: data.name, token: data.token, role: data.role })
  }, [setUserAndStore])

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al solicitar recuperación')
    return data
  }, [])

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al restablecer contraseña')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('vv_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPassword, register, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const stored = localStorage.getItem('vv_user')
  const token = stored ? JSON.parse(stored).token : null
  return fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
}
