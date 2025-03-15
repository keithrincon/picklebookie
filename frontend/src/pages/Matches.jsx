import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  if (!match) return <p>Loading...</p>;

  return (
    <div className='bg-white p-4 rounded shadow'>
      <h1 className='text-2xl font-bold mb-4'>Match Details</h1>
      <p>
        <strong>Time:</strong> {match.time}
      </p>
      <p>
        <strong>Location:</strong> {match.location}
      </p>
      <p>
        <strong>Game Type:</strong> {match.type}
      </p>
    </div>
  );
};

export default Matches;
