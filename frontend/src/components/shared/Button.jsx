// src/components/shared/Button.jsx
import React from 'react';

const Button = ({
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  isPrimary = true,
  className = '',
  children,
}) => {
  const baseClasses =
    'py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:ring-offset-2 transition duration-300 flex items-center justify-center';
  const primaryClasses = 'bg-pickle-green text-white hover:bg-green-700';
  const secondaryClasses =
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${isPrimary ? primaryClasses : secondaryClasses} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
