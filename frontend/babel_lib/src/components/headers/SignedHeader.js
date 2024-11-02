import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, LogOut, User, BookMarked, MessageSquare, Moon, Sun } from 'lucide-react';
import { auth } from '../../services/firebase/config';
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

const SignedHeader = ({ toggleTheme, isDarkMode, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                src={user?.photoURL || '/default-avatar.png'} 
                alt="avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            </IconButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div>{user?.displayName || 'User'}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
              </div>
              <DropdownItem as={Link} to="/profile">
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem as={Link} to="/collections">
                <BookMarked size={16} /> Collections
              </DropdownItem>
              <DropdownItem as={Link} to="/forums">
                <MessageSquare size={16} /> Forums
              </DropdownItem>
              <DropdownItem onClick={() => auth.signOut()}>
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
