import { useLocation, NavLink, Link } from 'react-router-dom'
import { LuUser, LuSparkles } from 'react-icons/lu'
import logo from '../assets/GrowthB_logo.svg'

const ROUTE_TITLES = {
    '/': 'Dashboard',
    '/analisis': 'Input & Analisis',
    '/simulation': 'What If',
    '/member': 'Member',
    '/roadmap': 'Roadmap',
}

export default function TopBar() {
    const location = useLocation()
    const title = ROUTE_TITLES[location.pathname] ?? 'GrowthB'
    const isHome = location.pathname === '/'

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border-light)',
            height: 56,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 16,
            paddingRight: 16,
        }}>
            {/* Logo / Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <img src={logo} alt="Growth-B Logo" style={{ width: 28, height: 28 }} />
                <span style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                }}>
                    Growth-B
                </span>
            </div>

            {/* Right: Notification */}
            <Link to="/profile/1"
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--color-text-secondary)',
                }}
            >
                <LuUser size={18} />
                {/* Notification dot */}
               
            </Link>
        </header>
    )
}