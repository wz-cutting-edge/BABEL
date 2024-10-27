import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/common';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserHome from '../pages/UserHome';
import AdminDashboard from '../pages/AdminDashboard';
import Search from '../pages/Search';
import Collections from '../pages/Collections';
import Profile from '../pages/Profile';
import MediaUploader from '../pages/MediaUploader';
import CustomerSupport from '../pages/CustomerSupport';
import UserReports from '../pages/UserReports';
import Analytics from '../pages/Analytics';

const ProtectedRoute = ({ children, isAllowed, redirectPath = '/' }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <UserHome /> : <Navigate to="/login" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Admin Routes */}
      {isAdmin && (
        <>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/media-upload" element={<MediaUploader />} />
          <Route path="/analytics" element={<Analytics />} />
        </>
      )}

      {/* Protected Routes */}
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
