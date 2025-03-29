import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { calculateDistance } from '../../services/locationServices';
import { usePosts } from '../../context/PostsContext'; // Added import

const PostCard = ({ post, isExpanded, onToggleExpand }) => {
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };

    // Correctly parse YYYY-MM-DD date strings in local timezone
    if (dateString && dateString.includes('-')) {
      const [year, month, day] = dateString
        .split('-')
        .map((num) => parseInt(num));
      // Create date in local timezone (month is 0-indexed in JS)
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', options);
    }

    // Fallback to original method for other date formats
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format the distance with the appropriate unit
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return null;
    if (distance < 0.1) return 'Less than 0.1 mi';
    return `${distance} mi`;
  };

  // Determine badge color based on distance
  const getDistanceBadgeColor = (distance) => {
    if (distance === null || distance === undefined) {
      return 'bg-approximate-bg text-approximate-text';
    } else if (distance < 5) {
      return 'bg-green-100 text-green-800';
    } else if (distance < 10) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-distance-bg text-distance-text';
    }
  };

  // Get event type emoji
  const getEventTypeEmoji = (eventType) => {
    switch (eventType) {
      case 'League Event':
        return '🏢';
      case 'Tournament':
        return '🏆';
      case 'Drop-in Session':
        return '🚪';
      case 'Club Night':
        return '🌙';
      case 'Charity Event':
        return '❤️';
      case 'Training Camp':
        return '🏕️';
      default:
        return '🎮';
    }
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
          <div className='flex items-center space-x-1 text-sm text-medium-gray'>
            <span>{formatDate(post.date)}</span>
            {post.eventType && post.eventType !== 'Regular Game' && (
              <span title={post.eventType}>
                {getEventTypeEmoji(post.eventType)}
              </span>
            )}
          </div>
        </div>
        {post.distance !== null ? (
          <span
            className={`${getDistanceBadgeColor(
              post.distance
            )} text-xs px-2 py-1 rounded-full`}
          >
            {formatDistance(post.distance)}
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
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Show less details' : 'Show more details'}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};

const EmptyState = ({ userLocation, activeFilter }) => (
  <div className='bg-white p-8 rounded-lg shadow-md text-center'>
    <p className='text-medium-gray'>
      {userLocation && activeFilter
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

const PostFeed = () => {
  const { posts, loading, error, userLocation, requestLocationAccess } =
    usePosts();
  const [sortBy, setSortBy] = useState('soonest');
  const [expandedPost, setExpandedPost] = useState(null);
  // New state for distance filtering
  const [distanceFilter, setDistanceFilter] = useState(null);

  // Calculate distances for all posts if user location is available
  const postsWithDistance = useMemo(() => {
    if (!posts.length) return [];

    return posts.map((post) => {
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
        };
      }

      // Otherwise return post with null distance
      return {
        ...post,
        distance: null,
      };
    });
  }, [posts, userLocation]);

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

  return (
    <div className='space-y-4'>
      {!userLocation && (
        <LocationPrompt onRequestLocation={requestLocationAccess} />
      )}

      {posts.length > 0 ? (
        <>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2'>
            <div className='text-sm text-medium-gray flex flex-wrap items-center gap-2'>
              {userLocation ? (
                <span>Showing {nearbyPostsCount} nearby games</span>
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
            />
          )}
        </>
      ) : (
        <EmptyState userLocation={userLocation} />
      )}
    </div>
  );
};

export default PostFeed;
