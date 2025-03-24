import React, { useState } from 'react';
import { usePosts } from '../../context/PostsContext';
import { Link } from 'react-router-dom';

const PostFeed = () => {
  const { posts, loading, error, userLocation } = usePosts();
  const [sortBy, setSortBy] = useState('soonest');
  const [expandedPost, setExpandedPost] = useState(null);

  const sortPosts = (postsToSort) => {
    switch (sortBy) {
      case 'newest':
        return [...postsToSort].sort((a, b) => b.createdAt - a.createdAt);
      case 'soonest':
        return [...postsToSort].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      case 'closest':
        return userLocation
          ? [...postsToSort].sort((a, b) => a.distance - b.distance)
          : postsToSort;
      default:
        return postsToSort;
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4'>
        {error}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {posts.length > 0 ? (
        <>
          <div className='flex justify-between items-center mb-4'>
            <div className='text-sm text-gray-600'>
              {userLocation
                ? `Showing games within 10 miles of you`
                : `Showing all games (enable location for nearby games)`}
            </div>
            <div className='flex items-center'>
              <label htmlFor='sortBy' className='mr-2 text-sm text-gray-600'>
                Sort by:
              </label>
              <select
                id='sortBy'
                className='text-sm border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-pickle-green'
                onChange={(e) => setSortBy(e.target.value)}
                value={sortBy}
              >
                <option value='soonest'>Soonest</option>
                <option value='newest'>Newest</option>
                {userLocation && <option value='closest'>Closest</option>}
              </select>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {sortPosts(posts).map((post) => (
              <div
                key={post.id}
                className={`bg-white p-4 rounded-lg shadow-md transition-all duration-200 border ${
                  expandedPost === post.id
                    ? 'border-pickle-green-light'
                    : 'border-transparent'
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium text-pickle-green'>{post.type}</p>
                    <p className='text-sm text-gray-500'>
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                  {post.distance && (
                    <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'>
                      {post.distance} mi
                    </span>
                  )}
                </div>

                <div className='mt-3 space-y-2'>
                  <div className='flex justify-between'>
                    <div>
                      <p className='text-gray-600 text-sm'>Time</p>
                      <p className='font-medium'>
                        {post.startTime} - {post.endTime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className='text-gray-600 text-sm'>Location</p>
                    <p className='font-medium'>{post.location}</p>
                  </div>

                  {expandedPost === post.id && (
                    <div className='mt-3'>
                      {post.description && (
                        <div className='mb-3'>
                          <p className='text-gray-600 text-sm'>Description</p>
                          <p className='text-sm'>{post.description}</p>
                        </div>
                      )}
                      <Link
                        to={`/matches/${post.id}`}
                        className='text-pickle-green text-sm font-medium hover:underline'
                      >
                        View details & join →
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setExpandedPost(expandedPost === post.id ? null : post.id)
                  }
                  className='mt-3 text-sm text-pickle-green hover:underline'
                >
                  {expandedPost === post.id ? 'Show less' : 'Show more'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <p className='text-gray-500'>
            {userLocation
              ? 'No games found within 10 miles'
              : 'No games available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
