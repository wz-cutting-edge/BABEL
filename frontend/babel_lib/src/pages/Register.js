import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

const RegisterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const ErrorMessage = styled.p`
  color: red;
  margin: 5px 0;
  font-size: 14px;
`;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDebugInfo('');
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      const batch = writeBatch(db);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      if (!userCredential.user.uid) {
        throw new Error('User ID is undefined');
      }
      
      const userDoc = doc(db, 'users', userCredential.user.uid);
      const userData = {
        username,
        email,
        createdAt: serverTimestamp(),
        role: 'user',
        bio: '',
        collectionIds: [],
        following: [],
        followers: []
      };
      
      batch.set(userDoc, userData);
      await batch.commit();
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(`Registration failed: ${error.message}`);
    }
  };

  return (
    <RegisterWrapper>
      <h2>Register for BABEL</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {debugInfo && <p style={{ fontSize: '12px', color: 'gray' }}>{debugInfo}</p>}
      </Form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </RegisterWrapper>
  );
};

export default Register;
