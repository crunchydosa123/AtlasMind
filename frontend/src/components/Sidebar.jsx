import React from 'react'
import { useUser } from '../contexts/UserContext'
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/');
  }

  return (
    <div className="w-1/5 h-full flex flex-col justify-between bg-gradient-to-b from-indigo-600 to-indigo-800 text-white">
      <div>
        <div className="text-2xl font-bold py-4 px-6">MindGrid</div>
        <div className="flex flex-col px-4 py-6 space-y-3">
          <button className="text-left px-4 py-2 rounded-md hover:bg-indigo-500 transition">
            Projects
          </button>
          <button className="text-left px-4 py-2 rounded-md hover:bg-indigo-500 transition">
            Resources
          </button>
          <button className="text-left px-4 py-2 rounded-md hover:bg-indigo-500 transition">
            Chat
          </button>
        </div>
      </div>
      <div className='px-4 py-6'>
        <button className='text-left bg-purple-600 p-3 w-full rounded-md' onClick={() => onLogout()}>Log out</button>
      </div>
    </div>

  )
}

export default Sidebar