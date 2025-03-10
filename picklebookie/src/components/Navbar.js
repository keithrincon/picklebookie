import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logOut } = useAuth();

  return (
    <nav className='bg-blue-600 p-4 text-white'>
      <div className='container mx-auto max-w-7xl flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold'>
          Picklebookie
        </Link>
        <div className='space-x-4'>
          {user ? (
            <button onClick={logOut} className='bg-red-600 px-4 py-2 rounded'>
              Log Out
            </button>
          ) : (
            <>
              <Link to='/login' className='mr-4 hover:text-yellow-400'>
                Log In
              </Link>
              <Link to='/signup' className='hover:text-yellow-400'>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
