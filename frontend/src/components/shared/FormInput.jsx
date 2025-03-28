// src/components/shared/FormInput.jsx
import React from 'react';

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className='w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickle-green focus:border-transparent transition duration-300'
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default FormInput;
