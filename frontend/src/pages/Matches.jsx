import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';

const Matches = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      const matchDoc = await getDoc(doc(db, 'posts', matchId));
      if (matchDoc.exists()) {
        setMatch({ id: matchDoc.id, ...matchDoc.data() });
      }
    };
    fetchMatch();
  }, [matchId]);

  if (!match)
    return (
      <div className='flex justify-center items-center h-64'>
        <ClipLoader color='#4CAF50' size={50} />
      </div>
    );

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
