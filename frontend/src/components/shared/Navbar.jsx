import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';

const Navbar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className='bg-pickle-green text-white p-4 shadow-md'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        {/* Logo */}
        <Link to='/' className='mb-4 md:mb-0'>
          <div className='font-poppins font-bold text-2xl text-white bg-pickle-green px-5 py-2 rounded-lg shadow-md inline-block uppercase'>
            PICKLEBOOKIE
          </div>
        </Link>

        {/* Search Bar */}
        <div className='w-full md:w-1/3 mb-4 md:mb-0'>
          <SearchBar />
        </div>

        {/* User Actions */}
        <div className='flex space-x-4 items-center'>
          {user ? (
            <>
              {/* User Dropdown */}
              <div className='relative'>
                <button
                  onClick={toggleDropdown}
                  className='flex items-center space-x-2 focus:outline-none'
                >
                  <span className='mr-4'>
                    Welcome, {user.displayName || user.email}
                  </span>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50'>
                    <Link
                      to={`/profile/${user.uid}`}
                      className='block px-4 py-2 text-pickle-green hover:bg-gray-100'
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-pickle-green hover:bg-gray-100'
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Log In and Sign Up Buttons */}
              <Link
                to='/login'
                className='bg-white text-pickle-green px-4 py-2 rounded hover:bg-gray-100 transition-colors'
              >
                Log In
              </Link>
              <Link
                to='/signup'
                className='border border-white px-4 py-2 rounded hover:bg-pickle-green-dark transition-colors'
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
