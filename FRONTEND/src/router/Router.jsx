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
import Profile from '../pages/Profile'


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
        <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/bisnis-form" element={<BisnisForm />} />
            <Route path={`/profile/:user_id`} element={<><Profile /></>} />
            {isMobile ? (
                <Route element={<MobileLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/member" element={<Member />} />
                    <Route path="/simulation" element={<Simulation />} />
                </Route>
            ) : (
                <Route element={<DesktopLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/roadmap" element={<Roadmap />} />
                    <Route path="/member" element={<Member />} />
                    <Route path="/simulation" element={<Simulation />} />
                </Route>
            )}
        </Routes>
    )
}

export default Router