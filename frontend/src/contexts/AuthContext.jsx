import React, { createContext, useState, useEffect } from 'react'
import jwtDecode from 'jwt-decode/dist/jwt-decode.esm.js'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const data = jwtDecode(token)
        setUser({ id: data.id, email: data.email, name: data.name })
      } catch (e) {
        console.error('Invalid token', e)
        localStorage.removeItem('token')
      }
    }
  }, [])

  async function login(email, password) {
    const res = await api.post('/members/login', { email, password })
    const { token, member } = res.data
    localStorage.setItem('token', token)
    setUser(member)
    return member
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
