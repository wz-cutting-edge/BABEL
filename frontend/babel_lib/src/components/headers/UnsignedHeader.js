import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink,
  IconButton,
  ThemeToggleButton,
  LogoLink,
  NavContainer,
  RegisterButton
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';

const UnsignedHeader = ({ toggleTheme, isDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
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
          <LogoLink to="/">
            <BookOpen size={24} />
            <span>BABEL</span>
          </LogoLink>
        </NavGroup>
        
        <NavGroup className="nav-links">
          <NavContainer>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
          </NavContainer>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <ThemeToggleButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </ThemeToggleButton>
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
