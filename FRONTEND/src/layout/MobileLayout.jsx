import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomBar from '../components/BottomBar'
import Sidebar from '../components/Sidebar'

const MobileLayout = () => {
  return (
    <>
      <TopBar />
      <main>
        <Outlet />
      </main>
      <BottomBar />
    </>
  )
}

export default MobileLayout