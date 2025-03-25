import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import axios from 'axios';

const Matches = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Get user location (browser or IP-based)
  useEffect(() => {
    const getLocation = async () => {
      // Try browser geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          async () => {
            // Fallback to IP-based location
            try {
              const response = await axios.get('https://ipapi.co/json/');
              setUserLocation({
                lat: response.data.latitude,
                lng: response.data.longitude,
                city: response.data.city,
              });
            } catch (ipError) {
              console.error("Couldn't determine location", ipError);
            }
          }
        );
      }
    };
    getLocation();
  }, []);

  // Fetch match data
  // Update the useEffect dependency array in Matches.jsx
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchDoc = await getDoc(doc(db, 'posts', matchId));
        if (matchDoc.exists()) {
          const matchData = matchDoc.data();
          setMatch({
            id: matchDoc.id,
            ...matchData,
            distance:
              userLocation && matchData.latitude
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    matchData.latitude,
                    matchData.longitude
                  ).toFixed(1)
                : null,
          });
        } else {
          setError('Match not found');
          navigate('/');
        }
      } catch (error) {
        setError('Failed to load match details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, userLocation, navigate]); // Added navigate to dependencies

  // Haversine distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // Convert to miles
  };

  // Join/Leave game
  const handleJoinLeave = async () => {
    if (!user) {
      toast.error('Please log in to join games');
      return;
    }

    try {
      const matchRef = doc(db, 'posts', matchId);
      if (match.joinedPlayers?.includes(user.uid)) {
        await updateDoc(matchRef, {
          joinedPlayers: arrayRemove(user.uid),
        });
        toast.success('You left the game');
      } else {
        await updateDoc(matchRef, {
          joinedPlayers: arrayUnion(user.uid),
        });
        toast.success('You joined the game!');
      }
      // Refresh match data
      const updatedDoc = await getDoc(matchRef);
      setMatch({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      toast.error('Failed to update game');
      console.error(error);
    }
  };

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
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6'>
      <Link to='/' className='text-pickle-green hover:underline mb-4 block'>
        &larr; Back to Home
      </Link>

      <div className='flex justify-between items-start mb-6'>
        <h1 className='font-poppins text-3xl font-bold text-pickle-green'>
          {match.type} Game
        </h1>
        {match.distance && (
          <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full'>
            {match.distance} miles away
          </span>
        )}
      </div>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium text-gray-600'>Date & Time</h3>
            <p className='text-lg'>
              {new Date(match.date).toLocaleDateString()} • {match.startTime} -{' '}
              {match.endTime}
            </p>
          </div>
          <div>
            <h3 className='font-medium text-gray-600'>Location</h3>
            <p className='text-lg'>{match.location}</p>
          </div>
        </div>

        {match.description && (
          <div>
            <h3 className='font-medium text-gray-600'>Description</h3>
            <p className='text-gray-700'>{match.description}</p>
          </div>
        )}

        <div>
          <h3 className='font-medium text-gray-600'>Players</h3>
          <div className='flex items-center mt-2'>
            <div className='flex -space-x-2 mr-4'>
              {match.joinedPlayers?.slice(0, 5).map((playerId) => (
                <div
                  key={playerId}
                  className='w-8 h-8 rounded-full bg-gray-200 border-2 border-white'
                />
              ))}
              {match.joinedPlayers?.length > 5 && (
                <div className='w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs'>
                  +{match.joinedPlayers.length - 5}
                </div>
              )}
            </div>
            <span className='text-gray-600'>
              {match.joinedPlayers?.length || 0} joined
            </span>
          </div>
        </div>

        <div className='pt-4 border-t'>
          <button
            onClick={handleJoinLeave}
            disabled={!user}
            className={`w-full py-3 px-6 rounded-lg font-medium ${
              match.joinedPlayers?.includes(user?.uid)
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-pickle-green text-white hover:bg-pickle-green-dark'
            }`}
          >
            {match.joinedPlayers?.includes(user?.uid)
              ? 'Leave Game'
              : 'Join Game'}
          </button>
          {!user && (
            <p className='text-sm text-gray-500 mt-2 text-center'>
              <Link to='/login' className='text-pickle-green hover:underline'>
                Log in
              </Link>{' '}
              to join this game
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
