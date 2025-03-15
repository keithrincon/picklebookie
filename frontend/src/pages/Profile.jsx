import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import FollowButton from '../components/profile/FollowButton';
import PostFeed from '../components/posts/PostFeed';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch user data (you may need to store user data in Firestore)
      const userQuery = query(
        collection(db, 'users'),
        where('userId', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        setUser(userSnapshot.docs[0].data());
      }

      // Fetch user posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      setPosts(
        postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch followers
      const followersQuery = query(
        collection(db, 'followers'),
        where('followingId', '==', userId)
      );
      const followersSnapshot = await getDocs(followersQuery);
      setFollowers(followersSnapshot.docs.map((doc) => doc.data().followerId));
    };
    fetchUserData();
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>{user.displayName}'s Profile</h1>
      <FollowButton userId={userId} />
      <div className='mt-4'>
        <h2 className='text-lg font-bold'>Posts</h2>
        <PostFeed posts={posts} />
      </div>
      <div className='mt-4'>
        <h2 className='text-lg font-bold'>Followers</h2>
        <p>{followers.length} followers</p>
      </div>
    </div>
  );
};

export default Profile;
