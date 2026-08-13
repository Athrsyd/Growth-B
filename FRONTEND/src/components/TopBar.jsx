import React from 'react'
import logo from '../assets/GrowthB_logo.svg'
import { IoIosSettings } from "react-icons/io";
import { Link } from 'react-router-dom';


const TopBar = () => {
    return (
        <div className='flex flex-row w-full items-center justify-between md:justify-end px-4 py-2 bg-green-300'>
            <div className="flex w-2/10 md:hidden flex-row items-center gap-2">
                <img src={logo} alt="Logo" className="h-8" />
                <h1 className='font-bold text-md'>GrowthB</h1>
            </div>
            <div className="flex  flex-row items-center gap-2">
                <IoIosSettings size={24} />
                <Link to="/profile/1" className="flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300" >
                    </div>
                </Link>

            </div>
        </div>
    )
}

export default TopBar