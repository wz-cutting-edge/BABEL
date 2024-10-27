import { useState, useCallback } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const useOptimisticUpdate = (collectionName) => {
  const [optimisticData, setOptimisticData] = useState(null);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateDocument = useCallback(async (documentId, updates) => {
    setIsUpdating(true);
    setError(null);

    // Store original data for rollback
    const originalData = optimisticData;

    try {
      // Apply optimistic update
      setOptimisticData(current => ({
        ...current,
        ...updates
      }));

      // Perform actual update
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, updates);
    } catch (err) {
      // Rollback on error
      setOptimisticData(originalData);
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [collectionName, optimisticData]);

  return {
    optimisticData,
    isUpdating,
    error,
    updateDocument
  };
};
