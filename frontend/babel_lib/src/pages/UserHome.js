import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const UserHomeWrapper = styled.div`
  padding: 2rem;
`;

const FeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Post = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 5px;
`;

const UserHome = () => {
  const [user, loading] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    
    // Fetch posts from Firebase
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [user, loading]);

  if (loading || isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <UserHomeWrapper>
      <h2>Welcome, {user.displayName || 'User'}!</h2>
      <nav>
        <Link to="/profile">Profile</Link> |
        <Link to="/search">Search</Link> |
        <Link to="/collections">My Collections</Link>
      </nav>
      <h3>Recent Activity</h3>
      <FeedWrapper>
        {posts.map(post => (
          <Post key={post.id}>
            <strong>{post.user}</strong>
            <p>{post.content}</p>
          </Post>
        ))}
      </FeedWrapper>
    </UserHomeWrapper>
  );
};

export default UserHome;
