import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AdminHeader from '../headers/AdminHeader';
import SignedHeader from '../headers/SignedHeader';
import UnsignedHeader from '../headers/UnsignedHeader';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const renderHeader = () => {
    if (isAdmin) {
      return <AdminHeader user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
    if (user) {
      return <SignedHeader user={user} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
    }
    return <UnsignedHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  };

  const shouldShowFooter = !location.pathname.includes('/home');

  return (
    <>
      {renderHeader()}
      <main>{children}</main>
      {shouldShowFooter && <Footer />}
    </>
  );
};

export default MainLayout;
