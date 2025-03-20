import React from 'react';
import { usePosts } from '../../context/PostsContext';

const PostFeed = () => {
  const { posts, loading, error } = usePosts();

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
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Add sorting logic here */}
          {[...posts]
            .sort((a, b) => b.createdAt - a.createdAt) // Sort posts by createdAt in descending order
            .map((post) => (
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
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className='bg-white p-8 rounded-lg shadow-md text-center'>
          <p className='text-gray-500'>No games available.</p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
