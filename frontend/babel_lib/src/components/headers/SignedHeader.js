import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogOut, User, BookMarked, MessageSquare, Moon, Sun, Settings } from 'lucide-react';
import { auth, db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink,
  IconButton,
  Dropdown,
  DropdownContent,
  DropdownItem
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

const SignedHeader = ({ toggleTheme, isDarkMode }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const scrollDirection = useScrollDirection();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleProfileClick = () => {
    if (user?.uid) {
      navigate(`/profile/${user.uid}`);
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <HeaderWrapper isScrolled={isScrolled} hide={scrollDirection === 'down'}>
      <Container>
        <NavGroup className="logo-group">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="#7289DA" />
            <span style={{ fontWeight: 'bold' }}>BABEL</span>
          </Link>
        </NavGroup>
        
        <NavGroup className="nav-links">
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/forums">Forums</NavLink>
          </nav>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <IconButton>
            <Search size={20} />
          </IconButton>
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
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div>{profileData?.displayName || user?.displayName || 'User'}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
              </div>
              <DropdownItem onClick={handleProfileClick}>
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem as={Link} to="/settings">
                <Settings size={16} /> Settings
              </DropdownItem>
              <DropdownItem as={Link} to="/collections">
                <BookMarked size={16} /> Collections
              </DropdownItem>
              <DropdownItem as={Link} to="/forums">
                <MessageSquare size={16} /> Forums
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

export default SignedHeader;
