import React from 'react'
import TopBar from '../components/TopBar'
import BottomBar from '../components/BottomBar'
import Sidebar from '../components/Sidebar'

const MobileLayout = ({ children }) => {
    return (
        <>
            <TopBar />
            <main>
                {children}
            </main>
            <BottomBar />
        </>
    )
}

export default MobileLayout