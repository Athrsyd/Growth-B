import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
    })
    const [bisnis, setBisnis] = useState(null)
    const [loading, setLoading] = useState(true)  // cek /me on mount

    // Panggil /me saat mount untuk sinkronisasi state
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { setLoading(false); return }

        api.get('/me')
            .then(({ data }) => {
                setUser(data.data.user)
                setBisnis(data.data.bisnis)
                localStorage.setItem('user', JSON.stringify(data.data.user))
            })
            .catch(() => {
                // interceptor sudah handle 401, untuk error lain tetap lanjut
            })
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback((userData, token) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }, [])

    const logout = useCallback(async () => {
        try { await api.post('/logout') } catch { /* ignore */ }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setBisnis(null)
        window.location.href = '/auth'
    }, [])

    return (
        <AuthContext.Provider value={{ user, bisnis, setBisnis, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
    return ctx
}