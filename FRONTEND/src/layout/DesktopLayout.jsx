import React from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import BottomBar from '../components/BottomBar'

const DesktopLayout = () => {
  return (
    <div className="w-full h-screen">
      <main className='flex flex-row justify-between w-full h-screen'>
        <div className="h-screen w-1/6">
          <Sidebar />
        </div>
        <div className='flex w-5/6 mx-8 my-4 flex-col '>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DesktopLayout