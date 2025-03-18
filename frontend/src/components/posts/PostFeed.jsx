import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const { user } = useAuth();

  // Get today's date and format it for the date input
  const today = new Date().toISOString().split('T')[0];

  // Get future date (3 months from now) for max date selection
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const maxDate = threeMonthsFromNow.toISOString().split('T')[0];

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
      if (!user) {
        setError('You must be logged in to view posts.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        let postsQuery;

        if (selectedDate) {
          // Use the ISO format directly
          const formattedDate = selectedDate;

          console.log('Querying for date:', formattedDate);

          postsQuery = query(
            collection(db, 'posts'),
            where('date', '==', formattedDate)
          );
        } else {
          // Simplified query - just sort by date and then createdAt
          // This avoids needing a composite index if one isn't set up
          postsQuery = query(collection(db, 'posts'), orderBy('date', 'asc'));
        }

        const querySnapshot = await getDocs(postsQuery);
        console.log('Posts query results:', querySnapshot.size);

        let postsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
          };
        });

        // Sort results client-side if needed
        postsList.sort((a, b) => {
          // First by date (ascending)
          const dateComparison = a.date.localeCompare(b.date);
          if (dateComparison !== 0) return dateComparison;

          // Then by createdAt (descending)
          return b.createdAt - a.createdAt;
        });

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

        if (
          postsList.length === 0 &&
          showFollowingOnly &&
          followingList.length > 0
        ) {
          setError('None of the people you follow have posted games.');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'posts', postId));
      // Remove the post from the state
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Toggle following filter (improved)
  const toggleFollowingFilter = () => {
    if (showFollowingOnly) {
      // Just turn off the filter
      setShowFollowingOnly(false);
      setError('');
    } else {
      // Check if we have any people to follow before turning it on
      if (followingList.length === 0) {
        setError('You are not following anyone yet.');
      }
      setShowFollowingOnly(true);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
      </div>
    );
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
            min={today}
            max={maxDate}
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
              onChange={toggleFollowingFilter}
              className='form-checkbox h-5 w-5 text-green-600'
            />
            <span>Show only following</span>
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4'>
          {error}
          {showFollowingOnly && error.includes('not following anyone') && (
            <button
              onClick={() => setShowFollowingOnly(false)}
              className='ml-2 underline text-pickle-green'
            >
              Show all games
            </button>
          )}
        </div>
      )}

      {/* Posts List with count */}
      {selectedDate && !error && (
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
                  Posted by{' '}
                  <Link
                    to={`/profile/${post.userId}`}
                    className='text-pickle-green hover:underline'
                  >
                    {post.userName || 'Unknown User'}
                  </Link>
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

                {/* Show description if it exists */}
                {post.description && (
                  <div className='mt-3'>
                    <p className='text-gray-600 text-sm'>Description</p>
                    <p className='text-sm'>{post.description}</p>
                  </div>
                )}
              </div>

              <div className='mt-4 pt-3 border-t flex justify-between items-center'>
                <span className='text-xs text-gray-500'>
                  Created {post.createdAt.toLocaleString()}
                </span>

                {/* Show delete button if current user is the post creator */}
                {user && post.userId === user.uid && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className='text-xs text-red-600 hover:text-red-800'
                    aria-label='Delete post'
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <p className='text-gray-500 mb-2'>
            No games available{selectedDate ? ' for the selected date' : ''}.
            {showFollowingOnly &&
              !error &&
              ' Try disabling the "Show only following" filter.'}
          </p>
          {selectedDate && (
            <button
              onClick={clearDateFilter}
              className='text-green-600 hover:text-green-700 underline text-sm'
            >
              View all games
            </button>
          )}
          {showFollowingOnly && !error && (
            <button
              onClick={() => setShowFollowingOnly(false)}
              className='text-green-600 hover:text-green-700 underline text-sm ml-2'
            >
              Show all users' games
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
