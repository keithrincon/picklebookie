import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';

const UserAvatar = ({ user }) => {
  return user?.photoURL ? (
    <img
      src={user.photoURL}
      alt='Profile'
      className='w-8 h-8 rounded-full border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'
      onError={(e) => {
        e.target.src = '/default-avatar.png'; // Updated fallback path
      }}
    />
  ) : (
    <div className='w-8 h-8 rounded-full bg-white text-pickle-green flex items-center justify-center font-semibold border-2 border-white shadow-sm hover:border-ball-yellow transition-all duration-200'>
      {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
    </div>
  );
};

const Navbar = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Handle clicking outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the hamburger button itself
      if (hamburgerRef.current && hamburgerRef.current.contains(event.target)) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!mobileMenuRef.current ||
          !mobileMenuRef.current.contains(event.target))
      ) {
        setIsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown and mobile menu when changing routes
  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default to avoid unexpected behavior
    e.stopPropagation(); // Stop event propagation

    try {
      await logOut();
      navigate('/');
      setMobileMenuOpen(false); // Close menu after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault(); // Prevent default
    e.stopPropagation(); // Stop propagation
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = (e) => {
    e.preventDefault(); // Prevent default
    e.stopPropagation(); // Stop propagation
    setMobileMenuOpen(!mobileMenuOpen);
    console.log('Toggle mobile menu:', !mobileMenuOpen); // Debug log
  };

  const handleLogoClick = (e) => {
    navigate('/');
  };

  return (
    <nav className='bg-pickle-green text-white shadow-md sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo - explicitly using onClick for more reliability */}
          <div
            onClick={handleLogoClick}
            className='flex items-center space-x-2 hover:opacity-90 transition-opacity cursor-pointer'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                clipRule='evenodd'
              />
            </svg>
            <div className='font-poppins font-bold text-2xl text-white'>
              PICKLEBOOKIE
            </div>
          </div>

          {/* Search Bar (centered) */}
          <div className='hidden sm:block flex-1 max-w-xs mx-auto px-4'>
            <SearchBar id='desktop-search' />
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center'>
            {user ? (
              <div className='relative' ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-pickle-green-dark transition-colors'
                  aria-expanded={isDropdownOpen}
                  aria-haspopup='true'
                  aria-label='User menu'
                >
                  <UserAvatar user={user} />
                  <span className='hidden lg:inline'>
                    {user.displayName || user.email?.split('@')[0]}
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

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50'>
                    <Link
                      to={`/profile/${user.uid}`}
                      className='block px-4 py-2 text-gray-800 hover:bg-gray-100'
                    >
                      Profile
                    </Link>
                    <div className='border-t border-gray-200 my-1'></div>
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100'
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link
                  to='/login'
                  className='bg-white text-pickle-green px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium whitespace-nowrap'
                >
                  Log In
                </Link>
                <Link
                  to='/signup'
                  className='border border-white px-4 py-2 rounded-lg hover:bg-pickle-green-dark transition-colors font-medium whitespace-nowrap'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className='flex md:hidden items-center space-x-2'>
            {!user && (
              <div className='sm:flex hidden items-center space-x-2'>
                <Link
                  to='/login'
                  className='bg-white text-pickle-green px-3 py-1 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium whitespace-nowrap'
                >
                  Log In
                </Link>
                <Link
                  to='/signup'
                  className='border border-white px-3 py-1 rounded-lg text-sm hover:bg-pickle-green-dark transition-colors font-medium whitespace-nowrap'
                >
                  Sign Up
                </Link>
              </div>
            )}
            {user && (
              <div className='mr-2'>
                <UserAvatar user={user} />
              </div>
            )}
            <button
              ref={hamburgerRef}
              onClick={toggleMobileMenu}
              className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-pickle-green-dark focus:outline-none touch-manipulation'
              aria-expanded={mobileMenuOpen}
              aria-label='Toggle mobile menu'
              type='button'
              role='button'
            >
              <span className='sr-only'>Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              ) : (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - changed position to fixed for better mobile behavior */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden bg-pickle-green-dark fixed top-16 w-full left-0 shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? 'max-h-screen opacity-100 visible'
            : 'max-h-0 opacity-0 invisible overflow-hidden'
        }`}
        style={{
          zIndex: 40,
          // Using hardcoded max-height for animation
          maxHeight: mobileMenuOpen ? '100vh' : '0',
        }}
      >
        <div className='px-2 pt-2 pb-3 space-y-3'>
          {/* Mobile Search */}
          <div className='px-3 py-2 sm:hidden'>
            <SearchBar id='mobile-search' />
          </div>

          {user ? (
            <>
              <Link
                to={`/profile/${user.uid}`}
                className='block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-pickle-green-light'
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-pickle-green-light'
              >
                Log Out
              </button>
            </>
          ) : (
            <div className='sm:hidden flex flex-col space-y-2 px-3 py-2'>
              <Link
                to='/login'
                className='bg-white text-pickle-green px-4 py-2 rounded-lg text-center font-medium'
              >
                Log In
              </Link>
              <Link
                to='/signup'
                className='border border-white px-4 py-2 rounded-lg text-center font-medium'
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
