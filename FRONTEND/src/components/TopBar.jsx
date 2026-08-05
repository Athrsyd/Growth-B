import React from 'react'
import logo from '../assets/GrowthB_logo.svg'
import { IoIosSettings } from "react-icons/io";


const TopBar = () => {
    return (
        <div className='flex flex-row w-full items-center justify-between md:justify-end px-4 py-2 bg-white '>
            <div className="flex w-2/10 md:hidden flex-row items-center gap-2">
                <img src={logo} alt="Logo" className="h-8" />
                <h1 className='font-bold text-md'>GrowthB</h1>
            </div>
            <div className="flex  flex-row items-center gap-2">
                <IoIosSettings size={24} />
                <div className="h-10 w-10 rounded-full bg-gray-300" >
                </div>

            </div>
        </div>
    )
}

export default TopBar