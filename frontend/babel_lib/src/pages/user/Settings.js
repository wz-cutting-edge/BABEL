import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../services/firebase/config';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Button, ErrorMessage } from '../../components/common';
import { User, Mail, Lock, Bell, Eye, EyeOff } from 'lucide-react';

const SettingsWrapper = styled.div`
  padding: 2rem;
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

const ToggleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
`;

const Toggle = styled.button`
  width: 48px;
  height: 24px;
  background: ${props => props.active ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false
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
      if (formData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: formData.displayName
        });
      }

      if (formData.email !== user.email) {
        await updateEmail(auth.currentUser, formData.email);
        await updateDoc(doc(db, 'users', user.uid), {
          email: formData.email
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePassword(auth.currentUser, formData.newPassword);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
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
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            Save Changes
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>
          <Lock size={20} />
          Security
        </SectionTitle>
        <Form onSubmit={updateUserPassword}>
          <FormGroup>
            <Label>Current Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </FormGroup>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            {showPassword ? 'Hide' : 'Show'} Password
          </Button>
          <Button type="submit" disabled={loading}>
            Update Password
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>
          <Bell size={20} />
          Notifications
        </SectionTitle>
        <FormGroup>
          <ToggleWrapper>
            <Label>Email Notifications</Label>
            <Toggle
              active={notifications.email}
              onClick={() => toggleNotification('email')}
            />
          </ToggleWrapper>
          <ToggleWrapper>
            <Label>Push Notifications</Label>
            <Toggle
              active={notifications.push}
              onClick={() => toggleNotification('push')}
            />
          </ToggleWrapper>
          <ToggleWrapper>
            <Label>Newsletter</Label>
            <Toggle
              active={notifications.newsletter}
              onClick={() => toggleNotification('newsletter')}
            />
          </ToggleWrapper>
        </FormGroup>
      </Section>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SettingsWrapper>
  );
};

export default Settings;
