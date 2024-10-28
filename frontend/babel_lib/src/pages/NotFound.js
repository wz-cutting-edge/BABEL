import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Home } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '../components/common';
import { auth } from '../services/firebase/config';
import { useAuth } from '../contexts/AuthContext';

const NotFoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 6rem;
  color: ${props => props.theme.primary};
  margin-bottom: 1rem;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 2rem;
`;

const Message = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const NotFound = () => {
  return (
    <NotFoundWrapper>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <Message>
        The page you're looking for doesn't exist or has been moved.
      </Message>
      <Link to="/">
        <Button variant="primary">
          <Home size={20} />
          Back to Home
        </Button>
      </Link>
    </NotFoundWrapper>
  );
};

export default NotFound;
