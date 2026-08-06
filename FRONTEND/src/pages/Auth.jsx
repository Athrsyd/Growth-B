import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  return (
    <div className='container flex justify-center items-center h-screen'>
      <div className='w-9/10 md:w-7/10 bg-gray-200 shadow-md rounded-2xl '>
        <div className="w-full flex h-2/10 justify-end rounded-t-2xl bg-gray-300">
          <button className={`w-1/2 h-12 bg-amber-200 rounded-tl-2xl ${!isLogin ? 'bg-amber-400' : ''}`} onClick={() => setIsLogin(false)}>
            Sign Up
          </button>
          <button className={`w-1/2 h-12 bg-amber-200 rounded-tr-2xl ${isLogin ? 'bg-amber-400' : ''}`} onClick={() => setIsLogin(true)}>
            Login
          </button>
        </div>
        <div className="p-4">
          <h2 className='text-2xl font-bold mb-6'>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <form>
            {isLogin ? null : (

              <div className='mb-4'>
                <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='username'>
                  Username
                </label>
                <input
                  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                  id='username'
                  type='text'
                  placeholder='Enter your username'
                  autoComplete='false'
                />
              </div>

            )}
            <div className='mb-6'>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                Email
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
                id='Email'
                type='Email'
                autoComplete='false'
                placeholder='Enter your Email'
              />
            </div>

            <div className='mb-6'>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                Password
              </label>
              <input
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
                id='password'
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder='Enter your password'
                autoComplete='false'

              />
              <button
                type='button'
                className='absolute right-12 top-101 text-gray-600'
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            <div className='flex items-center justify-between'>
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                type='button'
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Auth