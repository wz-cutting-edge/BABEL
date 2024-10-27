import React, { useCallback } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useFirebase } from '../hooks/useFirebase';
import { collection, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';

const POSTS_PER_PAGE = 10;

const Posts = () => {
  const { queryDocuments } = useFirebase();
  
  const fetchMorePosts = useCallback(async (page) => {
    const lastDoc = page > 1 ? /* get last doc reference */ null : null;
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(POSTS_PER_PAGE)
    );
    
    const newPosts = await queryDocuments(q);
    return {
      items: newPosts,
      hasMore: newPosts.length === POSTS_PER_PAGE
    };
  }, [queryDocuments]);

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
        >
          <strong>{post.user}</strong>
          <p>{post.content}</p>
        </Post>
      ))}
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!hasMore && <EndMessage>No more posts to load</EndMessage>}
    </FeedWrapper>
  );
};

export default React.memo(Posts);
