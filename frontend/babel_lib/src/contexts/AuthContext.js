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
          navigate('/');
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      // Check if user is admin and redirect accordingly
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    isAdmin,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
