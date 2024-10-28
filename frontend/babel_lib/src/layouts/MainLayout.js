import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AdminHeader from '../components/headers/AdminHeader';
import SignedHeader from '../components/headers/SignedHeader';
import UnsignedHeader from '../components/headers/UnsignedHeader';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const renderHeader = () => {
    if (isAdmin) {
      return <AdminHeader user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
    if (user) {
      return <SignedHeader user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
    return <UnsignedHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  };

  return (
    <>
      {renderHeader()}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
