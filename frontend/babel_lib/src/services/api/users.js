import { db } from '../firebase/config';
import { collection, doc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

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

export const syncDisplayNameWithUsername = async (userId, username) => {
  await updateDoc(doc(db, 'users', userId), {
    displayName: username
  });
};

export const syncAllUsersDisplayNames = async () => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const updates = snapshot.docs.map(doc => {
    const userData = doc.data();
    if (userData.username && !userData.displayName) {
      return updateDoc(doc.ref, {
        displayName: userData.username
      });
    }
    return Promise.resolve();
  });
  
  await Promise.all(updates);
};

