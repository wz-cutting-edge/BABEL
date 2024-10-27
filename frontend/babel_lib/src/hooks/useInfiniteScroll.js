import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchMore, options = {}) => {
  const {
    threshold = 100,
    initialPage = 1,
    enabled = true
  } = options;

  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading || !enabled) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, threshold, enabled]);

  useEffect(() => {
    const loadMore = async () => {
      if (!enabled || loading || !hasMore) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { items, hasMore: more } = await fetchMore(page);
        setHasMore(more);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMore();
  }, [page, fetchMore, enabled]);

  return {
    lastElementRef,
    loading,
    error,
    hasMore,
    page,
    resetPage: () => setPage(initialPage)
  };
};
