import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AppUser } from '../types/models'

export interface User {
  id: number
  email: string
  name: string
  role: string
  token: string
}

interface StoredAccount extends AppUser {
  password?: string
}

interface AuthContextType {
  user: User | null
  login: (token: string, userData: { id: number; email: string; name: string; role: string }) => void
  loginWithPassword: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, displayName?: string, role?: string) => Promise<void>
  loginWithGoogle: (credential?: string, customEmail?: string, customName?: string, role?: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>
  sendVerificationCode: (email: string) => Promise<{ message: string; email: string; code?: string }>
  resetWithCode: (email: string, code: string, newPassword: string) => Promise<{ message: string }>
  becomeSeller: () => Promise<void>
  updateUserRole: (username: string, newRole: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isSeller: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_STORAGE_KEY = 'lco_registered_users_v2'

export function getRegisteredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(u => !u.username.startsWith('usuariogoogle') && !u.username.startsWith('coleccionista'))
      }
    }
  } catch {}

  const initialUsers: StoredAccount[] = [
    {
      username: 'cachina',
      email: 'cachina@lacachinaonline.pe',
      displayName: 'La Cachina Admin',
      password: 'paulex1909@',
      role: 'ADMIN',
    },
    {
      username: 'admin',
      email: 'admin@lacachinaonline.pe',
      displayName: 'Administrador',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      username: 'vendedor',
      email: 'vendedor@lacachina.pe',
      displayName: 'Vendedor Vintage Oficial',
      password: 'vendedor123',
      role: 'SELLER',
    },
  ]
  saveRegisteredUsers(initialUsers)
  return initialUsers
}

export function saveRegisteredUsers(users: StoredAccount[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('lco_user') || localStorage.getItem('vv_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (token: string, userData: { id: number; email: string; name: string; role: string }) => {
    const fullUser: User = { ...userData, token }
    setUser(fullUser)
    localStorage.setItem('lco_user', JSON.stringify(fullUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('lco_user')
    localStorage.removeItem('vv_user')
  }

  const loginWithPassword = async (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. Try real backend API if available
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId, password: cleanPass }),
      })
      const contentType = res.headers.get('content-type') || ''
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json()
        login(data.token, {
          id: Date.now(),
          email: data.email || `${cleanId}@lacachinaonline.pe`,
          name: data.name || cleanId,
          role: data.role || 'CUSTOMER',
        })
        return
      }
    } catch {}

    // 2. Fallback / Persistent Local Storage Authentication
    const allUsers = getRegisteredUsers()
    const matched = allUsers.find(
      u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    )

    if (matched) {
      if (matched.password && matched.password !== cleanPass) {
        throw new Error('Contraseña incorrecta')
      }
      login(`token_${matched.username}_${Date.now()}`, {
        id: Date.now(),
        email: matched.email,
        name: matched.displayName || matched.username,
        role: matched.role || 'CUSTOMER',
      })
      return
    }

    // Special hardcoded catch for admin
    if (cleanId === 'cachina' && cleanPass === 'paulex1909@') {
      login('mock_admin_token_cachina', {
        id: 1,
        email: 'cachina@lacachinaonline.pe',
        name: 'La Cachina Admin',
        role: 'ADMIN',
      })
      return
    }

    throw new Error('Usuario o correo no encontrado')
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    displayName?: string,
    role: string = 'CUSTOMER'
  ) => {
    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, '')
    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password.trim()
    const cleanName = displayName?.trim() || cleanUser
    const assignedRole = role ? role.toUpperCase() : 'CUSTOMER'

    // 1. Try real backend API if available
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          email: cleanEmail,
          password: cleanPass,
          displayName: cleanName,
          role: assignedRole,
        }),
      })
      const contentType = res.headers.get('content-type') || ''
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json()
        login(data.token, {
          id: Date.now(),
          email: data.email || cleanEmail,
          name: data.name || cleanName,
          role: data.role || assignedRole,
        })
        return
      }
    } catch {}

    // 2. Persistent Local Storage Register
    const allUsers = getRegisteredUsers()
    const exists = allUsers.find(
      u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanEmail
    )

    if (exists) {
      throw new Error('El usuario o correo ya se encuentra registrado')
    }

    const newUserAccount: StoredAccount = {
      username: cleanUser,
      email: cleanEmail,
      displayName: cleanName,
      password: cleanPass,
      role: (assignedRole as any) || 'CUSTOMER',
    }

    const updatedList = [...allUsers, newUserAccount]
    saveRegisteredUsers(updatedList)

    login(`token_${cleanUser}_${Date.now()}`, {
      id: Date.now(),
      email: cleanEmail,
      name: cleanName,
      role: assignedRole,
    })
  }

  const loginWithGoogle = async (credential?: string, customEmail?: string, customName?: string, role?: string) => {
    let googleEmail = customEmail?.trim().toLowerCase()
    let googleName = customName?.trim()
    const assignedRole = role ? (role.toUpperCase() === 'SELLER' ? 'SELLER' : 'CUSTOMER') : 'USER'

    if (credential) {
      try {
        const base64Url = credential.split('.')[1]
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          const decoded = JSON.parse(jsonPayload)
          if (decoded.email) {
            googleEmail = decoded.email.toLowerCase()
            const emailPart = googleEmail ? googleEmail.split('@')[0] : 'usuario'
            googleName = decoded.name || decoded.given_name || emailPart
          }
        }
      } catch {}

      try {
        const res = await fetch('/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        })
        const contentType = res.headers.get('content-type') || ''
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json()
          login(data.token, {
            id: Date.now(),
            email: data.email,
            name: data.name,
            role: data.role || assignedRole,
          })
          return
        }
      } catch {}
    }

    if (!googleEmail) {
      throw new Error('No se recibió un correo electrónico válido de Google.')
    }

    const allUsers = getRegisteredUsers().filter(
      u => !u.username.startsWith('usuariogoogle') && !u.username.startsWith('coleccionista')
    )
    const matched = allUsers.find(u => u.email.toLowerCase() === googleEmail!.toLowerCase())
    let userRole = assignedRole
    if (!matched) {
      const cleanUsername = googleEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      const newUser: StoredAccount = {
        username: cleanUsername || googleEmail,
        email: googleEmail,
        displayName: googleName || googleEmail.split('@')[0],
        role: assignedRole,
      }
      saveRegisteredUsers([...allUsers, newUser])
    } else {
      userRole = matched.role || assignedRole
    }

    login(`google_token_${Date.now()}`, {
      id: Date.now(),
      email: googleEmail,
      name: googleName || googleEmail.split('@')[0],
      role: userRole,
    })
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Debes iniciar sesión para cambiar tu contraseña')

    // 1. Call real backend API to verify current password and update database hash
    try {
      const res = await fetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email: user.email,
          username: user.name,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña en el servidor')
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
    }

    // 2. Also sync in local registered users cache
    const allUsers = getRegisteredUsers()
    const idx = allUsers.findIndex(
      u => u.email.toLowerCase() === user.email.toLowerCase() || u.username.toLowerCase() === user.name.toLowerCase()
    )
    if (idx !== -1) {
      allUsers[idx].password = newPassword
      saveRegisteredUsers(allUsers)
    }
  }

  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      if (res.ok) {
        const data = await res.json()
        return data
      }
    } catch {}

    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    return {
      message: `Enlace de restablecimiento generado para ${cleanEmail}`,
      resetToken: token,
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña')
      }
      return data
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
    }
    return { message: 'Contraseña actualizada correctamente' }
  }

  const sendVerificationCode = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase()
    try {
      const res = await fetch('/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      if (res.ok) {
        const data = await res.json()
        sessionStorage.setItem(`lco_code_${cleanEmail}`, data.code)
        return {
          message: data.message || `Código de verificación enviado a ${cleanEmail}`,
          email: cleanEmail,
          code: data.code,
        }
      }
    } catch {}

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    sessionStorage.setItem(`lco_code_${cleanEmail}`, code)
    return {
      message: `Código de verificación generado para ${cleanEmail}`,
      email: cleanEmail,
      code,
    }
  }

  const resetWithCode = async (email: string, code: string, newPassword: string) => {
    const cleanEmail = email.trim().toLowerCase()
    const cleanCode = code.trim()

    try {
      const res = await fetch('/auth/reset-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña con código')
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
    }

    const allUsers = getRegisteredUsers()
    const idx = allUsers.findIndex(u => u.email.toLowerCase() === cleanEmail)
    if (idx !== -1) {
      allUsers[idx].password = newPassword
      saveRegisteredUsers(allUsers)
    }
    sessionStorage.removeItem(`lco_code_${cleanEmail}`)
    return { message: 'Contraseña actualizada exitosamente con código de verificación' }
  }

  const becomeSeller = async () => {
    if (!user) throw new Error('Debes iniciar sesión')

    try {
      const res = await fetch('/auth/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ email: user.email }),
      })
      if (res.ok) {
        const data = await res.json()
        login(data.token || user.token, {
          id: user.id,
          email: data.email || user.email,
          name: data.name || user.name,
          role: data.role || 'SELLER',
        })
        return
      }
    } catch {}

    const allUsers = getRegisteredUsers()
    const idx = allUsers.findIndex(
      u => u.email.toLowerCase() === user.email.toLowerCase() || u.username.toLowerCase() === user.name.toLowerCase()
    )

    if (idx !== -1 && allUsers[idx].role !== 'ADMIN') {
      allUsers[idx].role = 'SELLER'
      saveRegisteredUsers(allUsers)
    }

    login(user.token, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'SELLER',
    })
  }

  const updateUserRole = async (username: string, newRole: string) => {
    try {
      await fetch('/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ username, role: newRole }),
      })
    } catch {}

    const allUsers = getRegisteredUsers()
    const idx = allUsers.findIndex(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    )
    if (idx !== -1) {
      allUsers[idx].role = newRole as any
      saveRegisteredUsers(allUsers)
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithPassword,
        register,
        loginWithGoogle,
        changePassword,
        forgotPassword,
        resetPassword,
        sendVerificationCode,
        resetWithCode,
        becomeSeller,
        updateUserRole,
        logout,
        isAdmin,
        isSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
