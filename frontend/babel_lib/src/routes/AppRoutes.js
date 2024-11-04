import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import UserHome from '../pages/user/UserHome';
import Profile from '../pages/user/Profile';
import Collections from '../pages/user/Collections';
import CollectionViewer from '../pages/collections/CollectionViewer';
import Search from '../pages/Search';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CustomerSupport from '../pages/admin/CustomerSupport';
import UserReports from '../pages/admin/UserReports';
import NotFound from '../pages/NotFound';
import Forums from '../pages/user/Forums';
import MediaViewer from '../pages/media/MediaViewer';
import PrivateRoute from '../components/common/PrivateRoute';
import MediaUploader from '../pages/admin/MediaUploader';
import Settings from '../pages/user/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/user/home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
      <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
      <Route path="/collections/:collectionId" element={<PrivateRoute><CollectionViewer /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
      <Route path="/forums" element={<PrivateRoute><Forums /></PrivateRoute>} />
      <Route path="/media/:mediaId" element={<PrivateRoute><MediaViewer /></PrivateRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute requireAdmin><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/support" element={<PrivateRoute requireAdmin><CustomerSupport /></PrivateRoute>} />
      <Route path="/admin/reports" element={<PrivateRoute requireAdmin><UserReports /></PrivateRoute>} />
      <Route path="/admin/upload" element={<PrivateRoute requireAdmin><MediaUploader /></PrivateRoute>} />
      
      {/* Settings Route */}
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
