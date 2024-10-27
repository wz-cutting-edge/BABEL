import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, LogIn, UserPlus, Moon, Sun } from 'lucide-react';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink,
  IconButton
} from './styles';

const UnsignedHeader = ({ toggleTheme, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HeaderWrapper isScrolled={isScrolled}>
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
          </nav>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <IconButton>
            <Search size={20} />
          </IconButton>
          <Link to="/login">
            <IconButton>
              <LogIn size={16} />
              <span>Login</span>
            </IconButton>
          </Link>
          <Link to="/register">
            <IconButton 
              style={{ 
                backgroundColor: '#7289DA', 
                color: 'white', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px' 
              }}
            >
              <UserPlus size={16} />
              <span>Register</span>
            </IconButton>
          </Link>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default UnsignedHeader;
