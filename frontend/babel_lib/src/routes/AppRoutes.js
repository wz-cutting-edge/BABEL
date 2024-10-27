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

const ProtectedRoute = ({ children, isAllowed, redirectPath = '/' }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user ? (
            isAdmin ? <Navigate to="/admin-dashboard" /> : <UserHome />
          ) : (
            <Home />
          )
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute isAllowed={isAdmin}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/search" element={<Search />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/collections" element={user ? <Collections /> : <Navigate to="/login" />} />
      <Route path="/media-uploader" element={isAdmin ? <MediaUploader /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
