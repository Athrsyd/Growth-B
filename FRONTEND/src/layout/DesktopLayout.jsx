import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DesktopLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-collapsed)',
          minHeight: '100vh',
          transition: `margin-left var(--transition)`,
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 32px',
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}