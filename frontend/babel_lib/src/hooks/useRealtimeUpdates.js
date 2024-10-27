import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';

export const useRealtimeUpdates = (collectionName, queryConstraints = [], options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  const { 
    enabled = true,
    onDataUpdate,
    onError 
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const setupRealtimeListener = async () => {
      try {
        const collectionRef = collection(db, collectionName);
        const queryRef = query(collectionRef, ...queryConstraints);

        unsubscribeRef.current = onSnapshot(
          queryRef,
          (snapshot) => {
            const updatedData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setData(updatedData);
            setLoading(false);
            onDataUpdate?.(updatedData);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            onError?.(err);
          }
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
        onError?.(err);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, enabled, ...queryConstraints]);

  return { data, loading, error };
};
