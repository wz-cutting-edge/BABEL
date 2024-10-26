import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { ThemeProvider } from 'styled-components';
import { useTheme } from './hooks/useTheme';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import Collections from './pages/Collections';
import Profile from './pages/Profile';

function App() {
  const [user, loading] = useAuthState(auth);
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Header toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/user-home" element={user ? <UserHome /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={user ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/collections" element={user ? <Collections /> : <Navigate to="/login" />} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
