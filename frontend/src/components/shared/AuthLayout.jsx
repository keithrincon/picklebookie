// src/components/shared/AuthLayout.jsx
import React from 'react';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className='flex items-center justify-center px-4 py-12 font-sans'>
      <div className='w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden'>
        <div className='p-8'>
          <h2 className='text-3xl font-bold text-center text-pickle-green mb-4'>
            {title}
          </h2>
          <p className='text-center text-gray-600 mb-8'>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
