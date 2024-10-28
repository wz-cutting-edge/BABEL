import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../services/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { 
  PageWrapper, 
  ContentContainer, 
  Title, 
  StyledButton, 
  Input 
} from '../../styles/shared';

const RegisterContainer = styled(ContentContainer)`
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

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      const userCredential = await register(email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDoc, {
        username,
        email,
        createdAt: serverTimestamp(),
        role: 'user',
        bio: '',
        collectionIds: [],
        following: [],
        followers: []
      });

      navigate('/user/home');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    }
  };

  return (
    <PageWrapper>
      <RegisterContainer>
        <Title>Create Account</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <User size={16} />
            <StyledInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Mail size={16} />
            <StyledInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Lock size={16} />
            <StyledInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Lock size={16} />
            <StyledInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormGroup>
          {error && <ErrorText>{error}</ErrorText>}
          <StyledButton type="submit">
            <UserPlus size={16} />
            Register
          </StyledButton>
        </Form>
        <LinkText>
          Already have an account? <Link to="/login">Login here</Link>
        </LinkText>
      </RegisterContainer>
    </PageWrapper>
  );
};

export default Register;
