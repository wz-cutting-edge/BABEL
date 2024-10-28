import { useState, useCallback } from 'react';

export const useDataFetching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async (fetchFn, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      if (options.transform) {
        setData(options.transform(result));
      } else {
        setData(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = options.errorMessage || 'An error occurred while fetching data';
      setError(errorMessage);
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    fetchData,
    clearError,
    clearData
  };
};
