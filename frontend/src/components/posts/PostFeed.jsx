import { useState, useEffect } from 'react'; // Only import what you need
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let postsQuery;
        if (selectedDate) {
          // Fetch posts for the selected date
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);

          postsQuery = query(
            collection(db, 'posts'),
            where('date', '>=', startOfDay.toISOString()),
            where('date', '<=', endOfDay.toISOString()),
            orderBy('date', 'asc')
          );
        } else {
          // Fetch all posts
          postsQuery = query(collection(db, 'posts'), orderBy('date', 'asc'));
        }

        const querySnapshot = await getDocs(postsQuery);
        const postsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedDate]);

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
      {/* Date Picker */}
      <div className='flex justify-end mb-4'>
        <input
          type='date'
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
        />
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className='bg-white p-6 rounded-lg shadow-md'>
            <div className='flex items-center space-x-4 mb-4'>
              <p className='text-green-600 font-medium'>
                {post.userName || 'Unknown User'}
              </p>
              <span className='text-sm text-gray-500'>
                Posted: {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <div className='space-y-2'>
              <p>
                <strong className='text-green-600'>Date:</strong>{' '}
                {new Date(post.date).toLocaleDateString()}
              </p>
              <p>
                <strong className='text-green-600'>Start Time:</strong>{' '}
                {post.startTime}
              </p>
              <p>
                <strong className='text-green-600'>End Time:</strong>{' '}
                {post.endTime}
              </p>
              <p>
                <strong className='text-green-600'>Location:</strong>{' '}
                {post.location}
              </p>
              <p>
                <strong className='text-green-600'>Game Type:</strong>{' '}
                {post.type}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className='text-center text-gray-500 py-6'>
          <p>No posts available.</p>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
