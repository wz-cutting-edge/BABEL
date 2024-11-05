import React, { useState, useCallback, useRef, useEffect } from 'react';
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
`;

const PostItem = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const PostDate = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
`;

const PostFeed = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [following, setFollowing] = useState([]);
  const observer = useRef(null);
  
  // Fetch following list first
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const followingRef = collection(db, `users/${userId}/following`);
        const followingSnapshot = await getDocs(followingRef);
        const followingIds = followingSnapshot.docs.map(doc => doc.id);
        setFollowing(followingIds);
      } catch (error) {
        console.error('Error fetching following list:', error);
      }
    };
    
    if (userId) {
      fetchFollowing();
    }
  }, [userId]);
  
  const fetchPostsWithUserData = async (lastVisible = null) => {
    if (!following.length) return;
    
    try {
      setLoading(true);
      const postsRef = collection(db, 'posts');
      let q = query(
        postsRef,
        where('userId', 'in', following),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      
      const postsWithUserData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const postData = { id: docSnapshot.id, ...docSnapshot.data() };
          const userDocRef = doc(db, 'users', postData.userId);
          const userDoc = await getDoc(userDocRef);
          return {
            ...postData,
            user: userDoc.data()
          };
        })
      );

      setPosts(prev => [...prev, ...postsWithUserData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch posts when following list is loaded
  useEffect(() => {
    if (following.length > 0) {
      fetchPostsWithUserData();
    }
  }, [following]);

  const lastPostRef = useCallback(node => {
    if (loading) return;
    
    // Cleanup previous observer
    if (observer.current instanceof IntersectionObserver) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPostsWithUserData(lastDoc);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, lastDoc]);

  return (
    <FeedWrapper>
      {posts.map((post, index) => (
        <Post
          key={post.id}
          post={post}
          userData={post.user}
          ref={index === posts.length - 1 ? lastPostRef : null}
        />
      ))}
      {loading && <Loading />}
      <div ref={observer} style={{ height: '10px' }} />
    </FeedWrapper>
  );
};

export default PostFeed;
