import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const createCollection = async (userId, data) => {
  return await addDoc(collection(db, 'collections'), {
    userId,
    items: [],
    isPublic: false,
    createdAt: new Date(),
    ...data
  });
};

export const addToCollection = async (collectionId, mediaId) => {
  const collectionRef = doc(db, 'collections', collectionId);
  await updateDoc(collectionRef, {
    items: arrayUnion(mediaId)
  });
};

export const removeFromCollection = async (collectionId, mediaId) => {
  const collectionRef = doc(db, 'collections', collectionId);
  await updateDoc(collectionRef, {
    items: arrayRemove(mediaId)
  });
};

