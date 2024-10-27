import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider } from 'styled-components';
import { useTheme } from './hooks/useTheme';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import Loading from './components/Loading';
import { AuthProvider } from './contexts/AuthContext';
import { ProfiledComponent } from './utils/Profiler';
import AppRoutes from './routes/AppRoutes';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserHome = lazy(() => import('./pages/UserHome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Search = lazy(() => import('./pages/Search'));
const Collections = lazy(() => import('./pages/Collections'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <ProfiledComponent id="App">
            <Header toggleTheme={toggleTheme} />
            <Suspense fallback={<Loading />}>
              <AppRoutes />
            </Suspense>
            <Footer />
          </ProfiledComponent>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
