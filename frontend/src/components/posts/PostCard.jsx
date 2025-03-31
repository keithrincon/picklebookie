import React from 'react';
import { Link } from 'react-router-dom';
// Removed the unused import: import { calculateDistance } from '../../services/locationServices';
import { usePosts } from '../../context/PostsContext';

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

  // Check if this is a recommended post (for personalization)
  const isRecommended = post.isRecommended || false;

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
          <div className='flex items-center space-x-2'>
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

            {/* Show "Recommended" badge for personalized content */}
            {isRecommended && (
              <span className='ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full'>
                Recommended
              </span>
            )}
          </div>

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

export default PostCard;
