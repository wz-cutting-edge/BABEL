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

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user || !isAdmin) return <Navigate to="/" />;
  
  return children;
};

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <UserHome /> : <Navigate to="/login" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/customer-support" element={
        <AdminRoute>
          <CustomerSupport />
        </AdminRoute>
      } />
      <Route path="/user-reports" element={
        <AdminRoute>
          <UserReports />
        </AdminRoute>
      } />
      <Route path="/analytics" element={
        <AdminRoute>
          <Analytics />
        </AdminRoute>
      } />
      <Route path="/media-uploader" element={
        <AdminRoute>
          <MediaUploader />
        </AdminRoute>
      } />

      {/* Protected Routes */}
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
