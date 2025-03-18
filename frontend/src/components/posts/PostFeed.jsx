import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const { user } = useAuth();

  // Fetch the current user's following list
  useEffect(() => {
    const fetchFollowingList = async () => {
      if (!user) {
        console.log('User is not authenticated.');
        setFollowingList([]);
        return;
      }

      try {
        const q = query(
          collection(db, 'followers'),
          where('followerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);

        console.log('Query Snapshot:', querySnapshot);

        if (querySnapshot.empty) {
          console.log('No followers found for the current user.');
          setFollowingList([]);
          return;
        }

        const followingIds = querySnapshot.docs.map(
          (doc) => doc.data().followingId
        );

        console.log('Following IDs:', followingIds);

        setFollowingList(followingIds);
      } catch (error) {
        console.error('Error fetching following list:', error);
        setError('Failed to load following list. Please try again later.');
      }
    };

    fetchFollowingList();
  }, [user]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');

        let postsQuery;

        if (selectedDate) {
          const selectedDateObj = new Date(selectedDate);
          const formattedDate = selectedDateObj.toISOString().split('T')[0];

          postsQuery = query(
            collection(db, 'posts'),
            where('date', '==', formattedDate),
            orderBy('createdAt', 'desc')
          );
        } else {
          postsQuery = query(
            collection(db, 'posts'),
            orderBy('date', 'asc'),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(postsQuery);
        let postsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt instanceof Timestamp
              ? doc.data().createdAt.toDate()
              : new Date(doc.data().createdAt),
        }));

        // Filter posts by following list if enabled
        if (showFollowingOnly) {
          if (followingList.length > 0) {
            postsList = postsList.filter((post) =>
              followingList.includes(post.userId)
            );
          } else {
            setError('You are not following anyone yet.');
            setPosts([]);
            return;
          }
        }

        setPosts(postsList);
      } catch (error) {
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    } else {
      setError('You must be logged in to view posts.');
      setLoading(false);
    }
  }, [selectedDate, showFollowingOnly, followingList, user]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Reset date filter
  const clearDateFilter = () => {
    setSelectedDate('');
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
      </div>
    );
  }

  if (error) {
    return <p className='text-center text-red-600 py-4'>{error}</p>;
  }

  return (
    <div className='space-y-4'>
      {/* Date Filter */}
      <div className='flex flex-wrap items-center justify-between mb-4 gap-2'>
        <h2 className='text-xl font-semibold text-pickle-green'>
          Available Games
        </h2>
        <div className='flex items-center space-x-2'>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
            aria-label='Filter by date'
          />
          {selectedDate && (
            <button
              onClick={clearDateFilter}
              className='px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md'
              aria-label='Clear date filter'
            >
              Clear
            </button>
          )}
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={showFollowingOnly}
              onChange={() => setShowFollowingOnly(!showFollowingOnly)}
              className='form-checkbox h-5 w-5 text-green-600'
            />
            <span>Show only following</span>
          </label>
        </div>
      </div>

      {/* Posts List with count */}
      {selectedDate && (
        <p className='text-gray-600 mb-2'>
          Showing {posts.length} game{posts.length !== 1 ? 's' : ''} for{' '}
          {formatDate(selectedDate)}
        </p>
      )}

      {posts.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post) => (
            <div
              key={post.id}
              className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow'
            >
              <div className='border-b pb-2 mb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <p className='text-lg font-medium text-pickle-green'>
                    {post.type}
                  </p>
                  <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <p className='text-sm text-gray-500'>
                  Posted by {post.userName || 'Unknown User'}
                </p>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Start</p>
                    <p className='font-medium'>{post.startTime}</p>
                  </div>
                  <div>
                    <p className='text-gray-600 text-sm'>End</p>
                    <p className='font-medium'>{post.endTime}</p>
                  </div>
                </div>

                <div className='mt-3'>
                  <p className='text-gray-600 text-sm'>Location</p>
                  <p className='font-medium'>{post.location}</p>
                </div>
              </div>

              <div className='mt-4 pt-3 border-t text-xs text-gray-500'>
                Created {post.createdAt.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <p className='text-gray-500 mb-2'>
            No games available{selectedDate ? ' for the selected date' : ''}.
          </p>
          {selectedDate && (
            <button
              onClick={clearDateFilter}
              className='text-green-600 hover:text-green-700 underline text-sm'
            >
              View all games
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
