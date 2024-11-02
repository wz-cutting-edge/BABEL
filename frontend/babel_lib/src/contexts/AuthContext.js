import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUser(user);
        setIsAdmin(userData?.role === 'admin');
        
        // Handle automatic redirects
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/') {
          if (userData?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/home');
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        
        // Redirect to home if on protected routes
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/user') || currentPath.startsWith('/admin')) {
          navigate('/home');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const value = {
    user,
    isAdmin,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
