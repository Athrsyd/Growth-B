import React from 'react'

const Home = () => {
  return (
    <div className="container flex flex-col w-full h-full">
      <div className='bg-green-300 pb-16 h-40 flex items-center justify-center'>
        <h1 className='text-xl font-bold text-white'>Welcome to the Home Page</h1>
      </div>
      <div className="relative bottom-16 ">

        <div className="mx-auto shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]
          border-t-4 border-green-100 border-solid bg-white rounded-t-2xl
          w-4/5 h-full flex items-center justify-center p-4">
          <p className='text-gray-700'>
            This is the home page content. You can add more elements here as needed.
          </p>
        </div>
        <div className=" card mx-auto bg-gray-200 w-9/10 py-2 px-4 rounded-lg shadow-md mt-4">
          <h2 className='text-lg font-bold text-gray-800'>Card Title</h2>
          <p className='text-gray-600'>
            This is a simple card component. You can add any content you like inside it.
          </p>
        </div>

        <div className="container w-9/10 mx-auto flex flex-row gap-4">
          <div className=" card bg-gray-200 w-1/2 py-2 px-4 rounded-lg shadow-md mt-4">
            <h2 className='text-lg font-bold text-gray-800'>Card Title</h2>
            <p className='text-gray-600'>
              This is a simple card component. You can add any content you like inside it.
            </p>
          </div>
          <div className=" card bg-gray-200 w-1/2 py-2 px-4 rounded-lg shadow-md mt-4">
            <h2 className='text-lg font-bold text-gray-800'>Card Title</h2>
            <p className='text-gray-600'>
              This is a simple card component. You can add any content you like inside it.
            </p>
          </div>
        </div>

        <div className=" card mx-auto bg-gray-200 w-9/10 py-2 px-4 rounded-lg shadow-md mt-4">
          <h2 className='text-lg font-bold text-gray-800'>Chart</h2>
          <p className='text-gray-600'>
            This is a simple card component. You can add any content you like inside it. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum iste ratione repudiandae dolore illo ex quos, non quasi voluptatibus error suscipit assumenda aliquam, blanditiis ipsa explicabo earum accusantium minus quis.
          </p>
        </div>

        <div className=" card mx-auto bg-gray-200 w-9/10 py-2 px-4 rounded-lg shadow-md mt-4">
          <h2 className='text-lg font-bold text-gray-800'>Chart</h2>
          <p className='text-gray-600'>
            This is a simple card component. You can add any content you like inside it. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum iste ratione repudiandae dolore illo ex quos, non quasi voluptatibus error suscipit assumenda aliquam, blanditiis ipsa explicabo earum accusantium minus quis.
          </p>
        </div>
        
        <div className=" card mx-auto bg-gray-200 w-9/10 py-2 px-4 rounded-lg shadow-md mt-4">
          <h2 className='text-lg font-bold text-gray-800'>Chart</h2>
          <p className='text-gray-600'>
            This is a simple card component. You can add any content you like inside it. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum iste ratione repudiandae dolore illo ex quos, non quasi voluptatibus error suscipit assumenda aliquam, blanditiis ipsa explicabo earum accusantium minus quis.
          </p>
        </div>

        <div className=" card mx-auto bg-gray-200 w-9/10 py-2 px-4 rounded-lg shadow-md mt-4">
          <h2 className='text-lg font-bold text-gray-800'>Analisis AI</h2>
          <p className='text-gray-600'>
            This is a simple card component. You can add any content you like inside it. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum iste ratione repudiandae dolore illo ex quos, non quasi voluptatibus error suscipit assumenda aliquam, blanditiis ipsa explicabo earum accusantium minus quis.
          </p>
        </div>

        <br />

      </div>
    </div>
  )
}

export default Home