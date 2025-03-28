import React, { useState, useCallback, useMemo } from 'react';
import { usePosts } from '../../context/PostsContext';
import { Link } from 'react-router-dom';

const PostCard = ({ post, isExpanded, onToggleExpand }) => {
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md transition-all duration-200 border ${
        isExpanded
          ? 'border-pickle-green-light'
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div className='flex justify-between items-start'>
        <div>
          <p
            className={`font-medium ${
              post.type === 'Practice'
                ? 'text-practice-text'
                : post.type === 'Singles'
                ? 'text-singles-text'
                : 'text-doubles-text'
            }`}
          >
            {post.type}
          </p>
          <p className='text-sm text-medium-gray'>{formatDate(post.date)}</p>
        </div>
        {post.distance !== null ? (
          <span className='bg-distance-bg text-distance-text text-xs px-2 py-1 rounded-full'>
            {post.distance} mi
          </span>
        ) : (
          <span className='bg-approximate-bg text-approximate-text text-xs px-2 py-1 rounded-full'>
            Approx
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

        {isExpanded && (
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
        onClick={onToggleExpand}
        className='mt-3 text-sm text-pickle-green hover:underline'
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};

const EmptyState = ({ userLocation }) => (
  <div className='bg-white p-8 rounded-lg shadow-md text-center'>
    <p className='text-medium-gray'>
      {userLocation ? 'No games found nearby' : 'No games available'}
    </p>
  </div>
);

const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-64'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
  </div>
);

const PostFeed = () => {
  const { posts, loading, error, userLocation, requestLocationAccess } =
    usePosts();
  const [sortBy, setSortBy] = useState('soonest');
  const [expandedPost, setExpandedPost] = useState(null);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const toggleExpand = useCallback((postId) => {
    setExpandedPost((prevId) => (prevId === postId ? null : postId));
  }, []);

  const sortedPosts = useMemo(() => {
    if (!posts.length) return [];

    const postsToSort = [...posts];

    switch (sortBy) {
      case 'newest':
        return postsToSort.sort((a, b) => b.createdAt - a.createdAt);
      case 'soonest':
        return postsToSort.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'closest':
        return postsToSort.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      default:
        return postsToSort;
    }
  }, [posts, sortBy]);

  const nearbyPostsCount = useMemo(() => {
    return posts.filter((post) => post.distance !== null).length;
  }, [posts]);

  if (loading) {
    return <LoadingSpinner />;
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
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2'>
            <div className='text-sm text-medium-gray flex flex-wrap items-center gap-2'>
              {userLocation ? (
                <span>Showing {nearbyPostsCount} nearby games</span>
              ) : (
                <>
                  <span>Showing all games</span>
                  <button
                    onClick={requestLocationAccess}
                    className='text-pickle-green underline hover:text-green-700'
                  >
                    Enable location
                  </button>
                </>
              )}
            </div>
            <div className='flex items-center'>
              <label htmlFor='sortBy' className='mr-2 text-sm text-medium-gray'>
                Sort by:
              </label>
              <select
                id='sortBy'
                className='text-sm border border-light-gray rounded p-1 focus:outline-none focus:ring-1 focus:ring-pickle-green'
                onChange={handleSortChange}
                value={sortBy}
              >
                <option value='soonest'>Soonest</option>
                <option value='newest'>Newest</option>
                {userLocation && <option value='closest'>Nearest</option>}
              </select>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isExpanded={expandedPost === post.id}
                onToggleExpand={() => toggleExpand(post.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState userLocation={userLocation} />
      )}
    </div>
  );
};

export default PostFeed;
