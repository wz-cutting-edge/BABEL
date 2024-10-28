import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, title, message, duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (!toast) return prev;

      // Mark the toast as exiting to trigger animation
      return prev.map(t => 
        t.id === id ? { ...t, isExiting: true } : t
      );
    });

    // Actually remove the toast after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Warning') => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Info') => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast 
        toasts={toasts} 
        removeToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};
