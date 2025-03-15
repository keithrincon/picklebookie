import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';

const Navbar = () => {
  const { user, logOut } = useAuth();

  return (
    <nav className='bg-green-600 text-white p-4 shadow-md'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        <Link to='/' className='text-2xl font-bold mb-4 md:mb-0'>
          Picklebookie
        </Link>

        <div className='w-full md:w-1/3 mb-4 md:mb-0'>
          <SearchBar />
        </div>

        <div className='flex space-x-4'>
          {user ? (
            <>
              <span className='mr-4'>
                Welcome, {user.displayName || user.email}
              </span>
              <button
                onClick={logOut}
                className='bg-white text-green-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors'
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='bg-white text-green-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors'
              >
                Log In
              </Link>
              <Link
                to='/signup'
                className='border border-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
              >
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
