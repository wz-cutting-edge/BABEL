import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminHeader, SignedHeader, UnsignedHeader } from '../components/headers';
import Footer from '../components/Footer';

const MainLayout = ({ children, toggleTheme, isDarkMode }) => {
  const { user, isAdmin } = useAuth();

  const renderHeader = () => {
    if (isAdmin) {
      return <AdminHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} user={user} />;
    }
    if (user) {
      return <SignedHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} user={user} />;
    }
    return <UnsignedHeader toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
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
