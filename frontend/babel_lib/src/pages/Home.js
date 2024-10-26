import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.accent};
`;

const Description = styled.p`
  max-width: 600px;
  text-align: center;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Home = () => {
  return (
    <HomeWrapper>
      <Title>Welcome to BABEL</Title>
      <Description>
        BABEL is a digital library archive and social platform for books, textbooks, movies, videos, and more. Join our community to discover, share, and discuss your favorite content.
      </Description>
      <ButtonGroup>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
        <Link to="/search">
          <button>Search</button>
        </Link>
      </ButtonGroup>
    </HomeWrapper>
  );
};

export default Home;