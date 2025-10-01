import { useState, useContext, createContext, useEffect } from 'react'
import ApiService from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if(!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Vérifie le token au démarrage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          // Vérifier si le token est toujours valide
          const response = await ApiService.getProfile()
          setUser(response.data)
          setToken(savedToken)
        } catch (error) {
          // Token invalide ou expiré
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          console.log(error)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await ApiService.login({ email, password })
      const { token: newToken, user: userData } = response

      // Sauvegarder le token
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)

      return {success: true, user: userData}
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await ApiService.register(userData)
      const { token: newToken, user: newUser } = response

      // Sauvegarder le token
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)

      return { success: true, user: newUser }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erreur lors de l\'inscription'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!user && !!token
  const hasRole = (role) => {
    return user?.role === role
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}