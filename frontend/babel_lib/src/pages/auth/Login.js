import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { 
  PageWrapper, 
  ContentContainer, 
  Title, 
  StyledButton, 
  Input 
} from '../../styles/shared';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const LoginContainer = styled(ContentContainer)`
  max-width: 400px;
  margin-top: 4rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
  width: 100%;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.textSecondary};
    z-index: 10;
  }
`;

const StyledInput = styled(Input)`
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  width: 100%;
  box-sizing: border-box;
  
  &::placeholder {
    color: ${props => props.theme.textSecondary};
    opacity: 0.8;
  }
`;

const ErrorText = styled.p`
  color: ${props => props.theme.error};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: ${props => props.theme.textSecondary};
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <LoginContainer>
        <Title>Welcome Back</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Mail size={18} />
            <StyledInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Lock size={18} />
            <StyledInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          {error && <ErrorText>{error}</ErrorText>}
          <StyledButton type="submit">
            <LogIn size={16} />
            Login
          </StyledButton>
        </Form>
        <LinkText>
          Don't have an account? <Link to="/register">Register here</Link>
        </LinkText>
      </LoginContainer>
    </PageWrapper>
  );
};

export default Login;
