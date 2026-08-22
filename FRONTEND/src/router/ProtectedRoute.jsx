import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <svg style={{ animation: 'spin 0.8s linear infinite' }} width={32} height={32} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return user ? <Outlet /> : <Navigate to="/auth" replace />
}