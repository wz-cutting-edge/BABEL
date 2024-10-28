import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useInfiniteScroll } from '../../hooks/ui/useInfiniteScroll';
import { useFirebase } from '../../hooks/data/useFirebase';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import Post from './Post';
import { Loading, ErrorMessage } from '../common/common';

const POSTS_PER_PAGE = 10;

const FeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme.textSecondary};
`;

const LoadingSpinner = styled(Loading)`
  margin: 1rem auto;
`;

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const { queryDocuments } = useFirebase();

  const loadInitialPosts = useCallback(async () => {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(POSTS_PER_PAGE)
    );
    
    const snapshot = await getDocs(q);
    const initialPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setPosts(initialPosts);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
  }, []);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);
  
  const fetchMorePosts = useCallback(async () => {
    if (!lastDoc) return { items: [], hasMore: false };

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(POSTS_PER_PAGE)
    );
    
    const snapshot = await getDocs(q);
    const newPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (newPosts.length > 0) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setPosts(prev => [...prev, ...newPosts]);
    }
    
    return {
      items: newPosts,
      hasMore: newPosts.length === POSTS_PER_PAGE
    };
  }, [lastDoc]);

  const {
    lastElementRef,
    loading,
    error,
    hasMore
  } = useInfiniteScroll(fetchMorePosts);

  return (
    <FeedWrapper>
      {posts.map((post, index) => (
        <Post
          ref={index === posts.length - 1 ? lastElementRef : null}
          key={post.id}
          post={post}
        />
      ))}
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!hasMore && posts.length > 0 && <EndMessage>No more posts to load</EndMessage>}
    </FeedWrapper>
  );
};

export default Posts;
