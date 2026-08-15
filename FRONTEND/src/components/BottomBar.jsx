import { NavLink } from 'react-router-dom'
import { IoHomeOutline, IoHome, IoPeopleOutline, IoPeople, IoMapOutline, IoMap } from 'react-icons/io5'
import { LuUser, LuPencilLine } from 'react-icons/lu'
import { FaQuestion } from "react-icons/fa";


const TABS = [
    { path: '/', label: 'Beranda', Icon: IoHomeOutline, IconActive: IoHome, end: true },
    { path: '/analisis', label: 'Input', Icon: LuPencilLine, IconActive: LuPencilLine, end: false },
    { path: '/roadmap', label: 'Roadmap', Icon: IoMapOutline, IconActive: IoMap, end: false },
    { path: '/member', label: 'Member', Icon: IoPeopleOutline, IconActive: IoPeople, end: false },
    { path: '/simulation', label: 'Simulation', Icon: FaQuestion, IconActive: FaQuestion, end: false },
]

export default function BottomBar() {
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border-light)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 50,
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
            {TABS.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.end}
                    style={{ flex: 1, textDecoration: 'none' }}
                >
                    {({ isActive }) => {
                        const IconComp = isActive ? tab.IconActive : tab.Icon
                        return (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3,
                                padding: '6px 4px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: isActive ? 44 : 28,
                                    height: 28,
                                    borderRadius: 'var(--radius-pill)',
                                    background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                                    transition: 'all var(--transition)',
                                }}>
                                    <IconComp size={20} style={{ color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }} />
                                </div>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                                    transition: 'color var(--transition)',
                                    lineHeight: 1,
                                }}>
                                    {tab.label}
                                </span>
                            </div>
                        )
                    }}
                </NavLink>
            ))}
        </nav>
    )
}