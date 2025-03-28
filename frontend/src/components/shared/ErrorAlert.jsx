// src/components/shared/ErrorAlert.jsx
import React from 'react';

const ErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-center'>
      {message}
    </div>
  );
};

export default ErrorAlert;
