import { useState, useCallback } from 'react';

export const useOptimisticUpdate = (updateFn, rollbackFn) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (optimisticData, finalData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Apply optimistic update
      updateFn(optimisticData);
      
      // Perform actual update
      await finalData();
    } catch (err) {
      console.error('Optimistic update failed:', err);
      setError(err.message);
      
      // Rollback on error
      if (rollbackFn) {
        try {
          rollbackFn();
        } catch (rollbackErr) {
          console.error('Rollback failed:', rollbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [updateFn, rollbackFn]);

  return {
    execute,
    loading,
    error
  };
};
