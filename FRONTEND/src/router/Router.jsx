import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Home          from '../pages/Home'
import Roadmap       from '../pages/Roadmap'
import Auth          from '../pages/Auth'
import BisnisForm    from '../pages/BisnisForm'
import Member        from '../pages/Member'
import Simulation    from '../pages/Simulation'
import Profile       from '../pages/Profile'
import Analisis      from '../pages/Analisis'
import FormMember    from '../pages/FormMember'
import ProtectedRoute   from './ProtectedRoute'
import DesktopLayout    from '../layout/DesktopLayout'
import MobileLayout     from '../layout/MobileLayout'

// Spinner global saat loading auth
function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC' }}>
      <svg style={{ animation: 'spin 0.8s linear infinite' }} width={32} height={32} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const Router = () => {
  const { user, loading } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Tunggu AuthContext selesai cek token sebelum render apapun
  if (loading) return <LoadingScreen />

  const Layout = isMobile ? MobileLayout : DesktopLayout

  return (
    <Routes>
      {/* Public: jika sudah login, redirect ke home */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route path="/input-member/:token" element={<FormMember />} />

      {/* Setup bisnis */}
      <Route
        path="/bisnis-form"
        element={!user ? <Navigate to="/auth" replace /> : <BisnisForm />}
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/"            element={<Home />} />
          <Route path="/roadmap"     element={<Roadmap />} />
          <Route path="/member"      element={<Member />} />
          <Route path="/simulation"  element={<Simulation />} />
          <Route path="/analisis"    element={<Analisis />} />
          <Route path="/profile/:user_id" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

export default Router