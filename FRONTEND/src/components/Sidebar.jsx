import React from 'react'
import logo from '../assets/GrowthB_logo.svg'
import { IoIosAnalytics, IoMdHome } from 'react-icons/io';
import { LuGoal } from 'react-icons/lu';
import { RiVipCrown2Fill } from 'react-icons/ri';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom'

const navItems = [
    { name: 'Home', path: '/', icon: <IoMdHome size={24} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <LuGoal size={24} /> },
    { name: 'Analisis', path: '/analisis', icon: <IoIosAnalytics size={24} /> },
    { name: 'Member', path: '/member', icon: <RiVipCrown2Fill size={24} /> },
    { name: 'Simulation', path: '/simulation', icon: <FaRegQuestionCircle size={24} /> },
];

const Sidebar = () => {
    return (
        <div className=' w-1/6 fixed h-screen bg-red-600 shadow-sm rounded-e-3xl px-4 py-8'>
            <div className="flex w-full flex-row items-center gap-2">
                <img src={logo} alt="Logo" className="w-16" />
                <h1 className='font-bold text-xl'>GrowthB</h1>
            </div>

            <div className="flex flex-col justify-between h-4/5 items-center">

                <div className="mt-8 gap-2 flex flex-col w-full">
                    {navItems.map((item, index) => (
                        <Link to={item.path} key={index} className="flex items-center transition-all ease-in gap-2 p-2 hover:bg-red-700 rounded-md">
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </div>
                <div className="mt-8 gap-2 flex flex-col w-full">
                    <Link to="/settings" className="flex items-center transition-all ease-in gap-2 p-2 hover:bg-red-700 rounded-md">
                        <span>Settings</span>
                    </Link>
                    <Link to="/profile" className="flex items-center transition-all ease-in gap-2 p-2 hover:bg-red-700 rounded-md">
                        <span>Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Sidebar