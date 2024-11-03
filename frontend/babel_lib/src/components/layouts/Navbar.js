import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun, LogOut, Users, Flag, Upload, User, Layout } from 'lucide-react';
import { auth } from '../../services/firebase/config';
import { signOut } from 'firebase/auth';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink as StyledNavLink,
  IconButton
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';
import { useAuth } from '../../contexts/AuthContext';
// ... other imports

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav>
      {/* ... existing nav items */}
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
