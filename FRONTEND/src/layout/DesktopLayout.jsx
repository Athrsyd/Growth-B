import React from 'react'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import BottomBar from '../components/BottomBar'

const DesktopLayout = ({ children }) => {
  return (
    <main className='flex flex-row w-full h-screen'>
      <Sidebar />
      <div className='flex mx-4  flex-col w-full'>
        <TopBar />
        {children}
      </div>
    </main>
  )
}

export default DesktopLayout