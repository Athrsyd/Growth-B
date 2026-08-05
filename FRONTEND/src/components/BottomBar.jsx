import React from 'react'
import {Link} from 'react-router-dom'
import { IoMdHome,IoIosAnalytics  } from "react-icons/io";
import { LuGoal } from "react-icons/lu";
import { RiVipCrown2Fill } from "react-icons/ri";
import { FaRegQuestionCircle } from "react-icons/fa";


const BottomBar = () => {

    const navItems = [
        { name: 'Home', path: '/', icon: <IoMdHome size={24} /> },
        { name: 'Roadmap', path: '/roadmap', icon: <LuGoal size={24} /> },
        { name: 'Analisis', path: '/analisis', icon: <IoIosAnalytics size={24} /> },
        { name: 'Member', path: '/member', icon: <RiVipCrown2Fill size={24} /> },
        { name: 'Simulation', path: '/simulation', icon: <FaRegQuestionCircle size={24} /> },
    ];
  return (
    <div className="fixed bottom-0 left-0 right-0">
        <div className="bg-white shadow-md flex flex-row justify-between items-center px-4 py-2">
            {navItems.map((item) => (
                <Link to={item.path} key={item.name} className="flex flex-col items-center">
                    {item.icon}
                    <span className="text-xs mt-1">{item.name}</span>
                </Link>
            ))}
        </div>
    </div>
  )
}

export default BottomBar