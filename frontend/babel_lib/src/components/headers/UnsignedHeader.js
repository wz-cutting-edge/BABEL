import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, LogIn, UserPlus, Sun, Moon, Menu, X, Film } from 'lucide-react';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink,
  IconButton,
  ThemeToggleButton,
  LogoLink,
  NavContainer,
  RegisterButton,
  MobileMenuButton
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';

const UnsignedHeader = ({ toggleTheme, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <HeaderWrapper isScrolled={isScrolled} hide={scrollDirection === 'down'}>
      <Container>
        <NavGroup className="logo-group">
          <LogoLink to="/">
            <BookOpen size={24} />
            <span>BABEL</span>
          </LogoLink>
        </NavGroup>
        
        <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
        
        <NavGroup className="nav-links">
          <NavContainer>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="https://cinesage.com" target="_blank">
              <Film size={20} />
              <span>CINESAGE</span>
            </NavLink>
          </NavContainer>
        </NavGroup>
        
        <NavGroup className="mobile-nav" isOpen={isMobileMenuOpen}>
          <NavContainer>
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <BookOpen size={20} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/search" onClick={() => setIsMobileMenuOpen(false)}>
              <Search size={20} />
              <span>Search</span>
            </NavLink>
            <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <LogIn size={20} />
              <span>Login</span>
            </NavLink>
            <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <UserPlus size={20} />
              <span>Register</span>
            </NavLink>
          </NavContainer>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <ThemeToggleButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </ThemeToggleButton>
          <Link to="/login">
            <IconButton>
              <LogIn size={16} />
              <span>Login</span>
            </IconButton>
          </Link>
          <Link to="/register">
            <RegisterButton>
              <UserPlus size={16} />
              <span>Register</span>
            </RegisterButton>
          </Link>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default UnsignedHeader;
