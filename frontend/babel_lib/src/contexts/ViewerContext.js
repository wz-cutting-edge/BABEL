import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ViewerContext = createContext();

export const ViewerProvider = ({ children }) => {
  const [isViewerRetracted, setIsViewerRetracted] = useState(false);
  const location = useLocation();

  // Reset header state on route change
  useEffect(() => {
    setIsViewerRetracted(false);
  }, [location.pathname]);

  return (
    <ViewerContext.Provider value={{ isViewerRetracted, setIsViewerRetracted }}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewer = () => {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
}; 