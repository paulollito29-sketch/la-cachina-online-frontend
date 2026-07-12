import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

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

  const loginWithPassword = useCallback(async (username: string, password: string) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    const u: User = { email: data.email, name: data.name, token: data.token, role: data.role }
    setUser(u)
    localStorage.setItem('vv_user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('vv_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginWithPassword, logout }}>
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
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
}
