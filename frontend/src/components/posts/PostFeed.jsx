import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { calculateDistance } from '../../services/locationServices';
import { usePosts } from '../../context/PostsContext';
import PostCard from './PostCard'; // Assuming this import path is correct

const EmptyState = ({ userLocation, activeFilter, contentFilter }) => (
  <div className='bg-white p-8 rounded-lg shadow-md text-center'>
    <p className='text-medium-gray'>
      {contentFilter === 'forYou'
        ? "No personalized games found. Try the 'All Games' tab."
        : userLocation && activeFilter
        ? `No games found within ${activeFilter} miles of your location`
        : userLocation
        ? 'No games found nearby'
        : 'No games available'}
    </p>
    {activeFilter && (
      <p className='text-sm text-gray-500 mt-2'>
        Try increasing your distance filter or checking back later
      </p>
    )}
  </div>
);

const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-64'>
    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickle-green'></div>
  </div>
);

const LocationPrompt = ({ onRequestLocation }) => (
  <div className='bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-4'>
    <p className='font-medium'>Enable location to see nearby games</p>
    <p className='text-sm mb-2'>
      See distances to games and get better recommendations.
    </p>
    <button
      onClick={onRequestLocation}
      className='bg-pickle-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors'
    >
      Enable Location
    </button>
  </div>
);

const DistanceFilter = ({ onChange, value, userLocation }) => {
  // Distance filter options in miles
  const distanceOptions = [
    { value: null, label: 'Any distance' },
    { value: 5, label: 'Within 5 miles' },
    { value: 10, label: 'Within 10 miles' },
    { value: 25, label: 'Within 25 miles' },
    { value: 50, label: 'Within 50 miles' },
  ];

  return (
    <div className='flex items-center space-x-2'>
      <label htmlFor='distanceFilter' className='text-sm text-medium-gray'>
        Distance:
      </label>
      <select
        id='distanceFilter'
        className='text-sm border border-light-gray rounded p-1 focus:outline-none focus:ring-1 focus:ring-pickle-green'
        onChange={(e) =>
          onChange(e.target.value === 'null' ? null : parseInt(e.target.value))
        }
        value={value === null ? 'null' : value}
        disabled={!userLocation}
      >
        {distanceOptions.map((option) => (
          <option
            key={option.label}
            value={option.value === null ? 'null' : option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Updated PostFeed component with contentFilter parameter
const PostFeed = ({ contentFilter = 'all' }) => {
  const {
    posts,
    loading,
    error,
    userLocation,
    requestLocationAccess,
    getFilteredPosts, // NEW: Using the filter function from context
  } = usePosts();

  const [sortBy, setSortBy] = useState('soonest');
  const [expandedPost, setExpandedPost] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(null);

  // NEW: Get posts filtered by the selected tab (For You/All)
  const filteredByTabPosts = useMemo(() => {
    return getFilteredPosts(contentFilter);
  }, [getFilteredPosts, contentFilter]);

  // Calculate distances for all posts if user location is available
  const postsWithDistance = useMemo(() => {
    if (!filteredByTabPosts.length) return []; // Use filtered posts instead of all posts

    return filteredByTabPosts.map((post) => {
      // If user location is available and post has coordinates, calculate distance
      if (
        userLocation &&
        post.hasExactLocation &&
        post.latitude &&
        post.longitude
      ) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          post.latitude,
          post.longitude
        );

        return {
          ...post,
          distance,
          // NEW: Add isRecommended flag for "For You" tab
          isRecommended: contentFilter === 'forYou',
        };
      }

      // Otherwise return post with null distance
      return {
        ...post,
        distance: null,
        // NEW: Add isRecommended flag for "For You" tab
        isRecommended: contentFilter === 'forYou',
      };
    });
  }, [filteredByTabPosts, userLocation, contentFilter]);

  // Apply distance filter if active
  const filteredPosts = useMemo(() => {
    if (!distanceFilter) return postsWithDistance;

    return postsWithDistance.filter((post) => {
      // Keep posts with null distance (no coordinates) regardless of filter
      if (post.distance === null) return true;

      // Filter based on distance
      return post.distance <= distanceFilter;
    });
  }, [postsWithDistance, distanceFilter]);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const toggleExpand = useCallback((postId) => {
    setExpandedPost((prevId) => (prevId === postId ? null : postId));
  }, []);

  const sortedPosts = useMemo(() => {
    if (!filteredPosts.length) return [];

    const postsToSort = [...filteredPosts];

    switch (sortBy) {
      case 'newest':
        return postsToSort.sort((a, b) => {
          // Make sure we're comparing date objects
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB - dateA;
        });
      case 'soonest':
        return postsToSort.sort((a, b) => {
          // Parse dates correctly for comparison
          let dateA, dateB;

          // Safely parse dates in local timezone
          if (a.date && a.date.includes('-')) {
            const [yearA, monthA, dayA] = a.date
              .split('-')
              .map((num) => parseInt(num));
            dateA = new Date(yearA, monthA - 1, dayA);
          } else {
            dateA = new Date(a.date);
          }

          if (b.date && b.date.includes('-')) {
            const [yearB, monthB, dayB] = b.date
              .split('-')
              .map((num) => parseInt(num));
            dateB = new Date(yearB, monthB - 1, dayB);
          } else {
            dateB = new Date(b.date);
          }

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }

          // If same date, sort by start time
          const getTimeValue = (time) => {
            const [timePart, period] = time.split(' ');
            const [hour, minute] = timePart.split(':');
            let hourVal = parseInt(hour);
            if (period === 'PM' && hourVal !== 12) hourVal += 12;
            if (period === 'AM' && hourVal === 12) hourVal = 0;
            return hourVal * 60 + parseInt(minute);
          };

          return getTimeValue(a.startTime) - getTimeValue(b.startTime);
        });
      case 'closest':
        return postsToSort.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      default:
        return postsToSort;
    }
  }, [filteredPosts, sortBy]);

  const nearbyPostsCount = useMemo(() => {
    return filteredPosts.filter((post) => post.distance !== null).length;
  }, [filteredPosts]);

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

  // Special message for empty "For You" tab but with content in "All" tab
  const showEmptyForYouMessage =
    contentFilter === 'forYou' &&
    filteredPosts.length === 0 &&
    posts.length > 0;

  return (
    <div className='space-y-4'>
      {!userLocation && (
        <LocationPrompt onRequestLocation={requestLocationAccess} />
      )}

      {showEmptyForYouMessage ? (
        <div className='bg-white p-6 rounded-lg shadow-md text-center'>
          <p className='text-medium-gray mb-2'>
            No personalized games found yet.
          </p>
          <p className='text-sm text-gray-500'>
            We'll suggest games based on your location, skill level, and
            activity.
          </p>
          <Link
            to='/profile'
            className='mt-3 inline-block bg-pickle-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors'
          >
            Update Preferences
          </Link>
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2'>
            <div className='text-sm text-medium-gray flex flex-wrap items-center gap-2'>
              {userLocation ? (
                <span>
                  {contentFilter === 'forYou'
                    ? 'Personalized games'
                    : 'Showing all games'}
                  {nearbyPostsCount > 0 ? ` (${nearbyPostsCount} nearby)` : ''}
                </span>
              ) : (
                <span>Showing all games</span>
              )}
            </div>
            <div className='flex items-center space-x-4'>
              {/* Distance filter */}
              {userLocation && (
                <DistanceFilter
                  onChange={setDistanceFilter}
                  value={distanceFilter}
                  userLocation={userLocation}
                />
              )}

              {/* Sort option */}
              <div className='flex items-center'>
                <label
                  htmlFor='sortBy'
                  className='mr-2 text-sm text-medium-gray'
                >
                  Sort by:
                </label>
                <select
                  id='sortBy'
                  className='text-sm border border-light-gray rounded p-1 focus:outline-none focus:ring-1 focus:ring-pickle-green'
                  onChange={handleSortChange}
                  value={sortBy}
                  aria-label='Sort games by'
                >
                  <option value='soonest'>Soonest</option>
                  <option value='newest'>Newest</option>
                  {userLocation && <option value='closest'>Nearest</option>}
                </select>
              </div>
            </div>
          </div>

          {sortedPosts.length > 0 ? (
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
          ) : (
            <EmptyState
              userLocation={userLocation}
              activeFilter={distanceFilter}
              contentFilter={contentFilter}
            />
          )}
        </>
      ) : (
        <EmptyState userLocation={userLocation} contentFilter={contentFilter} />
      )}
    </div>
  );
};

export default PostFeed;
