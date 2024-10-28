import { db } from '../firebase/config';
import { collection, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export const getUser = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return { id: userDoc.id, ...userDoc.data() };
};

export const updateUser = async (userId, data) => {
  await updateDoc(doc(db, 'users', userId), data);
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
};

