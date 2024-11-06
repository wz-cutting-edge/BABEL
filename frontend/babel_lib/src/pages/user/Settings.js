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

  h2 {
    font-size: 2rem;
    color: ${props => props.theme.text};
    margin-bottom: 2rem;
    font-weight: 600;
  }
`;

const Section = styled.section`
  background: ${props => props.theme.surfaceColor};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme.borderLight};
  box-shadow: ${props => props.theme.shadowSm};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${props => props.theme.shadowMd};
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.text};
  font-size: 1.25rem;
  font-weight: 600;

  svg {
    color: ${props => props.theme.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryAlpha};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-height: 120px;
  resize: vertical;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryAlpha};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const SaveButton = styled(Button)`
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  margin-top: 0.5rem;
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
          <SaveButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </Form>
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SettingsWrapper>
  );
};

export default Settings;
