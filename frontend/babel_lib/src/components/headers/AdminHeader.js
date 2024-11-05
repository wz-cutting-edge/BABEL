import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun, LogOut, Users, Flag, Upload, User, Layout, MessageSquare, Settings } from 'lucide-react';
import { auth } from '../../services/firebase/config';
import { signOut } from 'firebase/auth';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink as StyledNavLink,
  IconButton,
  Dropdown,
  DropdownContent,
  DropdownItem,
  ThemeToggleButton,
  NavContainer
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, getDoc, onSnapshot, query, collection, where } from 'firebase/firestore';

const AdminHeader = ({ toggleTheme, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfileData(doc.data());
      }
    });

    return () => unsubscribe();
  }, [user]);

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
        <NavGroup className="logo-group">
          <Link 
            to="/admin" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              textDecoration: 'none', 
              color: props => props.theme.text 
            }}
          >
            <BookOpen size={24} color={props => props.theme.primary} />
            <span style={{ fontWeight: 'bold' }}>BABEL ADMIN</span>
          </Link>
        </NavGroup>

        <NavGroup className="nav-links">
          <NavContainer>
            <StyledNavLink to="/admin">
              <Layout size={20} />
              <span>Dashboard</span>
            </StyledNavLink>
            <StyledNavLink to="/forums">
              <MessageSquare size={20} />
              <span>Forums</span>
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
          </NavContainer>
        </NavGroup>

        <NavGroup className="actions-group">
          <ThemeToggleButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </ThemeToggleButton>
          <Dropdown>
            <IconButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img 
                src={profileData?.photoURL || user?.photoURL || '/default-avatar.png'} 
                alt="avatar" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </IconButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <div style={{ padding: '0.5rem 1rem', borderBottom: `1px solid ${props => props.theme.border}` }}>
                <div>{user?.displayName || 'Admin'}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
              </div>
              <DropdownItem onClick={() => {
                navigate(`/profile/${user?.uid}`);
                setIsDropdownOpen(false);
              }}>
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem as={Link} to="/settings">
                <Settings size={16} /> Settings
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default AdminHeader;
