import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Roadmap from '../pages/Roadmap'
import Auth from '../pages/Auth'
import BisnisForm from '../pages/BisnisForm'
import Member from '../pages/Member'
import Simulation from '../pages/Simulation'
import ProtectedRoute from './ProtectedRoute'
import DesktopLayout from '../layout/DesktopLayout'
import MobileLayout from '../layout/MobileLayout'


const Router = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        isMobile ? (
            <MobileLayout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    {/* <Route path="/bisnis-form" element={<ProtectedRoute><BisnisForm /></ProtectedRoute>} />
                    <Route path="/member" element={<ProtectedRoute><Member /></ProtectedRoute>} />
                    <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} /> */}

                </Routes>
            </MobileLayout>
        ) : (
            <DesktopLayout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/auth" element={<Auth />} />
                </Routes>
            </DesktopLayout>
        )
    )
}

export default Router