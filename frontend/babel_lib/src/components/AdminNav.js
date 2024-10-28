import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const AdminNavWrapper = styled.nav`
  background: ${props => props.theme.primary};
  padding: 1rem;
  margin-bottom: 2rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: white;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const AdminNav = () => {
  return (
    <AdminNavWrapper>
      <NavLinks>
        <Link to="/admin-dashboard">Dashboard</Link>
        <Link to="/media-upload">Upload Media</Link>
        <Link to="/analytics">Analytics</Link>
      </NavLinks>
    </AdminNavWrapper>
  );
};

export default AdminNav;
