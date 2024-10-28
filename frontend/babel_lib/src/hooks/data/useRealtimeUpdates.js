import { useState, useEffect } from 'react';
import { db } from '../../services/firebase/config';
import { collection, onSnapshot, query } from 'firebase/firestore';

export const useRealtimeUpdates = (collectionPath, queryConstraints = [], options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!collectionPath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionPath);
      const queryRef = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      const unsubscribe = onSnapshot(
        queryRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            _isFromCache: snapshot.metadata.fromCache
          }));
          
          setData(options.transform ? options.transform(items) : items);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime update error:', err);
          setError(err);
          setLoading(false);
        }
      );

      return () => {
        unsubscribe();
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (err) {
      console.error('Error setting up realtime updates:', err);
      setError(err);
      setLoading(false);
    }
  }, [collectionPath, queryConstraints, options.transform]);

  return { data, loading, error, isOffline };
};
