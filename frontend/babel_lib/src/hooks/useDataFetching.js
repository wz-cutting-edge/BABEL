import { useState, useCallback, useRef } from 'react';

const cache = new Map();

export const useDataFetching = (key, fetchFn, options = {}) => {
  const { 
    ttl = 5 * 60 * 1000, // 5 minutes cache
    deps = [] 
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef();

  const fetchData = useCallback(async (force = false) => {
    const cacheKey = Array.isArray(key) ? key.join('-') : key;
    
    if (!force && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (cachedData.timestamp > Date.now() - ttl) {
        setData(cachedData.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Clear cache after TTL
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        cache.delete(cacheKey);
      }, ttl);
    } catch (err) {
      setError(err.message);
      cache.delete(cacheKey);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttl, ...deps]);

  return { data, loading, error, refetch: fetchData };
};
