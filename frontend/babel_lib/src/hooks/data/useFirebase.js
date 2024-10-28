import { useCallback } from 'react';
import { db } from '../../services/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../../services/auth';

export const useFirebase = () => {
  const { user } = useAuth();

  const queryDocuments = useCallback(async (collectionName, constraints = []) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const collectionRef = collection(db, collectionName);
      const queryRef = query(collectionRef, ...constraints);
      const snapshot = await getDocs(queryRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }, [user]);

  const addDocument = useCallback(async (collectionName, data) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }, [user]);

  const updateDocument = useCallback(async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  const queryBuilder = useCallback((collectionName, options = {}) => {
    const {
      whereConditions = [],
      orderByField,
      orderDirection = 'desc',
      limitCount,
      startAfterDoc
    } = options;

    const collectionRef = collection(db, collectionName);
    let queryConstraints = [];

    // Add where conditions
    whereConditions.forEach(condition => {
      queryConstraints.push(where(condition.field, condition.operator, condition.value));
    });

    // Add orderBy
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection));
    }

    // Add pagination
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }

    // Add limit
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }

    return query(collectionRef, ...queryConstraints);
  }, []);

  return {
    queryDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    queryBuilder
  };
};
