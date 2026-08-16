import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    IoHomeOutline, IoHome,
    IoStatsChartOutline, IoStatsChart,
    IoPeopleOutline, IoPeople,
    IoMapOutline, IoMap,
} from 'react-icons/io5'
import {
    LuSparkles,
    LuPencilLine,
    LuLogOut,
    LuUser,
} from 'react-icons/lu'
import { TbBulb, TbBulbFilled } from 'react-icons/tb'
import logo from '../assets/GrowthB_logo.svg'


const NAV_ITEMS = [
    {
        path: '/',
        label: 'Dashboard',
        icon: <IoHomeOutline size={20} />,
        iconActive: <IoHome size={20} />,
        end: true,
    },
    {
        path: '/analisis',
        label: 'Input & Analisis',
        icon: <IoPencilLine />,
        iconActive: <IoPencilLine />,
        end: false,
    },
    {
        path: '/simulation',
        label: 'What If',
        icon: <TbBulb size={20} />,
        iconActive: <TbBulbFilled size={20} />,
        end: false,
    },
    {
        path: '/member',
        label: 'Member',
        icon: <IoPeopleOutline size={20} />,
        iconActive: <IoPeople size={20} />,
        end: false,
    },
    {
        path: '/roadmap',
        label: 'Roadmap',
        icon: <IoMapOutline size={20} />,
        iconActive: <IoMap size={20} />,
        end: false,
    },
]

function IoPencilLine() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
    )
}

export default function Sidebar() {
    const navigate = useNavigate()
    const [isHovered, setIsHovered] = useState(false)

    return (
        <>
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: isHovered ? 'var(--sidebar-expanded)' : 'var(--sidebar-collapsed)',
                    minHeight: '100vh',
                    background: 'var(--color-bg)',
                    borderRight: '1px solid var(--color-border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: `width var(--transition)`,
                    overflow: 'hidden',
                    position: 'fixed',

                    zIndex: 100,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                }}
                className="sidebar-root pt-4"
            >
                {/* Logo */}
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 18,
                    gap: 12,
                    flexShrink: 0,
                    borderBottom: '1px solid var(--color-border-light)',
                    overflow: 'hidden',
                    marginBottom: 8,
                }}>
                    <img src={logo} alt="Growth-B Logo" className="w-10" />

                    <span className="sidebar-label" style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        opacity: isHovered ? 1 : 0,
                        transition: `opacity var(--transition)`,
                    }}>
                        GrowthB
                    </span>
                </div>
                <div className={` ${isHovered ? 'w-7/10' : 'w-5/10'} transition-all ease-in-out 
                duration-300 mx-auto h-0.5 rounded-full bg-gray-300`}></div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: '12px 0', overflow: 'hidden' }}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 18px',
                                margin: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                                background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: 14,
                                transition: `background var(--transition), color var(--transition)`,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                position: 'relative',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active left border accent */}
                                    {isActive && (
                                        <span style={{
                                            position: 'absolute',
                                            left: -8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: 20,
                                            background: 'var(--color-primary)',
                                            borderRadius: 2,
                                        }} />
                                    )}
                                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                        {isActive ? item.iconActive : item.icon}
                                    </span>
                                    <span className="sidebar-label" style={{
                                        opacity: isHovered ? 1 : 0,
                                        transition: `opacity var(--transition)`,
                                        fontSize: 14,
                                        fontweight: isActive ? 600 : 400,
                                    }}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom: Profile + Logout */}
                <div style={{
                    padding: '12px 0',
                    borderTop: '1px solid var(--color-border-light)',
                    overflow: 'hidden',
                }}>
                    <NavLink
                        to="/profile/1"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 18px',
                            margin: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            textDecoration: 'none',
                            color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                            background: isActive ? 'var(--color-primary-muted)' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            transition: `background var(--transition), color var(--transition)`,
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <span style={{ flexShrink: 0, display: 'flex' }}>
                                    <LuUser size={20} />
                                </span>
                                <span className="sidebar-label" style={{
                                    opacity: isHovered ? 1 : 0,
                                    transition: `opacity var(--transition)`,
                                    fontSize: 14,
                                    fontweight: isActive ? 600 : 400,
                                }}>
                                    Profil
                                </span>
                            </>
                        )}
                    </NavLink>

                    <button
                        onClick={() => navigate('/auth')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 18px',
                            margin: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontFamily: 'inherit',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            width: 'calc(100% - 16px)',
                            textAlign: 'left',
                            transition: `background var(--transition), color var(--transition)`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#FEF2F2'
                            e.currentTarget.style.color = 'var(--color-danger)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                    >
                        <span style={{ flexShrink: 0, display: 'flex' }}>
                            <LuLogOut size={20} />
                        </span>
                        <span className="sidebar-label" style={{
                            opacity: isHovered ? 1 : 0,
                            transition: `opacity var(--transition)`,
                        }}>
                            Keluar
                        </span>
                    </button>
                </div>

                <style>{`
                .sidebar-root {
                    box-shadow: var(--shadow-xl);
                }
      `}</style>
            </aside>

            <div
                className="sidebar-overlay"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: 'rgba(15, 23, 42, 0.32)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    opacity: isHovered ? 1 : 0,
                    transition: `opacity var(--transition)`,
                    pointerEvents: 'none',
                    zIndex: 50,
                }}
            />
        </>
    )
}