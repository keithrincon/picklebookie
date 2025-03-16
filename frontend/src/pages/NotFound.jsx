import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = ({
  statusCode = 404,
  message = "The page you're looking for doesn't exist or has been moved.",
}) => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-off-white p-4 text-center'>
      {/* Status Code */}
      <h1 className='text-6xl font-bold text-pickle-green mb-4'>
        {statusCode}
      </h1>

      {/* Error Message */}
      <p className='text-lg text-dark-gray mb-6 max-w-md'>{message}</p>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Go Back Button */}
        <button
          onClick={() => navigate(-1)} // Go back to the previous page
          className='bg-pickle-green text-white px-6 py-2 rounded-md hover:bg-pickle-green-dark transition-colors'
        >
          Go Back
        </button>

        {/* Reload Button */}
        <button
          onClick={() => window.location.reload()} // Reload the page
          className='bg-court-blue text-white px-6 py-2 rounded-md hover:bg-court-blue-dark transition-colors'
        >
          Reload Page
        </button>

        {/* Home Button */}
        <Link
          to='/'
          className='bg-ball-yellow text-dark-gray px-6 py-2 rounded-md hover:bg-ball-yellow-light transition-colors'
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
