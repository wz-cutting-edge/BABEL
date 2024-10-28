import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminHeader, SignedHeader, UnsignedHeader } from '../components/headers';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const renderHeader = () => {
    if (isAdmin) {
      return <AdminHeader user={user} />;
    }
    if (user) {
      return <SignedHeader user={user} />;
    }
    return <UnsignedHeader />;
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
