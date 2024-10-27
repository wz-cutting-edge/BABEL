import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

const Navigation = () => (
  <Nav>
    <Link to="/search">Search</Link>
    <Link to="/collections">Collections</Link>
    <Link to="/profile">Profile</Link>
  </Nav>
);

export default Navigation;
