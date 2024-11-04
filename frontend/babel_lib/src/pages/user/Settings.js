import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../services/firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Button, ErrorMessage } from '../../components/common';
import { User } from 'lucide-react';

const SettingsWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.section`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.textSecondary};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfileInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName
      });
      
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        username: formData.displayName,
        bio: formData.bio
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsWrapper>
      <h2>Settings</h2>

      <Section>
        <SectionTitle>
          <User size={20} />
          Profile Information
        </SectionTitle>
        <Form onSubmit={updateProfileInfo}>
          <FormGroup>
            <Label>Display Name</Label>
            <Input
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Bio</Label>
            <TextArea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            Save Changes
          </Button>
        </Form>
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SettingsWrapper>
  );
};

export default Settings;
