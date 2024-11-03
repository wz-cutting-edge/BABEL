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

const AdminHeader = ({ toggleTheme, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <HeaderWrapper isScrolled={isScrolled} hide={scrollDirection === 'down'}>
      <Container>
        <NavGroup>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
            <BookOpen size={24} />
            <span style={{ fontWeight: 'bold' }}>BABEL ADMIN</span>
          </Link>
        </NavGroup>

        <NavGroup>
          <StyledNavLink to="/admin">
            <Layout size={20} />
            <span>Dashboard</span>
          </StyledNavLink>
          <StyledNavLink to="/admin/support">
            <Users size={20} />
            <span>Customer Support</span>
          </StyledNavLink>
          <StyledNavLink to="/admin/reports">
            <Flag size={20} />
            <span>User Reports</span>
          </StyledNavLink>
          <StyledNavLink to="/admin/upload">
            <Upload size={20} />
            <span>Media Uploader</span>
          </StyledNavLink>
          <StyledNavLink to={`/profile/${user?.uid}`}>
            <User size={20} />
            <span>Profile</span>
          </StyledNavLink>
        </NavGroup>

        <NavGroup>
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <IconButton onClick={handleLogout}>
            <LogOut size={20} />
          </IconButton>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default AdminHeader;
