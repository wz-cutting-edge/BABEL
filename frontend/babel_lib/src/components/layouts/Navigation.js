import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AdminHeader from '../headers/AdminHeader';
import SignedHeader from '../headers/SignedHeader';
import UnsignedHeader from '../headers/UnsignedHeader';

const Navigation = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Only render AdminHeader for admin users
  if (user?.role === 'admin') {
    return <AdminHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
  }

  // For non-admin authenticated users
  if (user && user.role !== 'admin') {
    return <SignedHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} user={user} />;
  }

  // For unauthenticated users
  return <UnsignedHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
};

export default Navigation;
