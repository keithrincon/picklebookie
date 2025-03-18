import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';

const Matches = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'posts', matchId));
        if (matchDoc.exists()) {
          setMatch({ id: matchDoc.id, ...matchDoc.data() });
        } else {
          setError('Match not found.');
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        setError('Failed to load match details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <ClipLoader color='#4CAF50' size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6'>
        <Link to='/' className='text-pickle-green hover:underline mb-4 block'>
          &larr; Back to Home
        </Link>
        <h1 className='font-poppins text-3xl font-bold text-pickle-green mb-4'>
          Error
        </h1>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6'>
      <Link to='/' className='text-pickle-green hover:underline mb-4 block'>
        &larr; Back to Home
      </Link>
      <h1 className='font-poppins text-3xl font-bold text-pickle-green mb-4'>
        Match Details
      </h1>
      <div className='space-y-4'>
        <p>
          <strong className='text-pickle-green'>Time:</strong> {match.time}
        </p>
        <p>
          <strong className='text-pickle-green'>Location:</strong>{' '}
          {match.location}
        </p>
        <p>
          <strong className='text-pickle-green'>Game Type:</strong> {match.type}
        </p>
      </div>
    </div>
  );
};

export default Matches;
