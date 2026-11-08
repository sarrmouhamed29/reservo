import { createContext, useContext, useEffect, useState } from 'react'
import {
  getCsrfCookie,
  getUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '@/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data } = await getUser()
      setUser(data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email, password) => {
    await getCsrfCookie()
    const { data } = await apiLogin({ email, password })
    setUser(data.data)
    return data.data
  }

  const register = async (name, email, password, passwordConfirmation) => {
    await getCsrfCookie()
    const { data } = await apiRegister({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    setUser(data.data)
    return data.data
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
