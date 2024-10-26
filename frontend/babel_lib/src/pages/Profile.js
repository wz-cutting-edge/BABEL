import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../firebase';
import { Navigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';

const ProfileWrapper = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProfileForm = styled.form`
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

const Textarea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
  resize: vertical;
`;

const Profile = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(auth.currentUser, { displayName: username });
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        username,
        bio,
        email: user.email,
        updatedAt: serverTimestamp()
      });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <ProfileWrapper>
      <ProfileImage src={user.photoURL || "/placeholder.svg?height=150&width=150"} alt="Profile" />
      <ProfileInfo>
        <h2>{user.displayName}</h2>
        <p>{user.email}</p>
      </ProfileInfo>
      <h3>Edit Profile</h3>
      <ProfileForm onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          disabled
        />
        <Textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />
        <button type="submit">Update Profile</button>
      </ProfileForm>
    </ProfileWrapper>
  );
};

export default Profile;
