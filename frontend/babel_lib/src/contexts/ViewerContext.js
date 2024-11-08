import React, { createContext, useContext, useState } from 'react';

const ViewerContext = createContext();

export const ViewerProvider = ({ children }) => {
  const [isViewerRetracted, setIsViewerRetracted] = useState(false);

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