import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBar from '../components/BottomBar'

export default function MobileLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <main style={{
        flex: 1,
        paddingBottom: 80, /* clearance for BottomBar */
        overflowY: 'auto',
      }}>
        <Outlet />
      </main>
      <BottomBar />
    </div>
  )
}