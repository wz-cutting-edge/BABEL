import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../firebase';

const HeaderWrapper = styled.header`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  color: ${props => props.theme.text};
  margin: 0;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const Header = ({ user, toggleTheme }) => {
  return (
    <HeaderWrapper>
      <Logo>BABEL</Logo>
      <Nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/collections">Collections</Link>
            <button onClick={() => auth.signOut()}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button onClick={toggleTheme}>Toggle Theme</button>
      </Nav>
    </HeaderWrapper>
  );
};

export default Header;
