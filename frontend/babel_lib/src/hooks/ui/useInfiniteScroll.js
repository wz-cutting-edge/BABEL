import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchCallback, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();
  
  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, options);
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, options]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchCallback(page);
        setHasMore(result.hasMore);
      } catch (err) {
        setError('Error loading more items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, fetchCallback]);

  return {
    lastElementRef,
    loading,
    error,
    hasMore
  };
};
