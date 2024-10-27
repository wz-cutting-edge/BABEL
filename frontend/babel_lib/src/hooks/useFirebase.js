import { useCallback, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const batchWrite = useCallback(async (operations) => {
    const batch = writeBatch(db);
    setLoading(true);
    try {
      operations.forEach(op => {
        const { type, ref, data } = op;
        switch (type) {
          case 'set':
            batch.set(ref, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'update':
            batch.update(ref, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(ref);
            break;
        }
      });
      await batch.commit();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const queryDocuments = useCallback(async (collectionName, constraints = [], options = {}) => {
    setLoading(true);
    try {
      const collectionRef = collection(db, collectionName);
      const queryConstraints = constraints.map(({ field, operator, value }) => 
        where(field, operator, value)
      );
      const q = query(collectionRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    batchWrite,
    queryDocuments,
    loading,
    error
  };
};
