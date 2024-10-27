import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        setIsAdmin(userSnap.exists() && userSnap.data().role === 'admin');
      } catch (err) {
        setError(err.message);
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    isAdmin,
    error
  }), [user, loading, isAdmin, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
