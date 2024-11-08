import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import Post from './Post';
import { Loading } from '../../components/common/common';
import styled from 'styled-components';

const FeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 64px auto 0;
  padding: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 48px;
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const PostFeed = React.memo(({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!userId) return;
      
      try {
        const followingRef = collection(db, `users/${userId}/following`);
        const followingSnapshot = await getDocs(followingRef);
        const followingIds = followingSnapshot.docs.map(doc => doc.id);
        setFollowing(followingIds);
      } catch (error) {
        console.error('Error fetching following list:', error);
        setError('Failed to fetch following list');
      }
    };
    
    fetchFollowing();
  }, [userId]);

  const fetchPostsWithUserData = useCallback(async () => {
    if (following.length === 0) {
      setPosts([]);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('authorId', 'in', following),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      
      const postsWithUserData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const postData = { id: docSnapshot.id, ...docSnapshot.data() };
          const userDocRef = doc(db, 'users', postData.authorId);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log('User document does not exist for post:', postData.id);
            return null;
          }

          return {
            ...postData,
            userData: {
              id: userDoc.id,
              ...userDoc.data()
            }
          };
        })
      );

      const validPosts = postsWithUserData.filter(post => post !== null);
      console.log('Fetched posts:', validPosts.length);
      
      setPosts(validPosts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [following]);

  useEffect(() => {
    if (following.length > 0) {
      fetchPostsWithUserData();
    }
  }, [following, fetchPostsWithUserData]);

  const memoizedPosts = useMemo(() => posts, [posts]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <FeedWrapper>
      {following.length === 0 ? (
        <div>Follow some users to see their posts in your feed!</div>
      ) : (
        <>
          {memoizedPosts.map(post => (
            <Post
              key={post.id}
              post={post}
              userData={post.userData}
            />
          ))}
          {loading && <Loading />}
        </>
      )}
    </FeedWrapper>
  );
});

export default PostFeed;
