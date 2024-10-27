import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useFirebase } from '../hooks/useFirebase';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Button, ErrorMessage } from '../components/common';

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
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [error, setError] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      setPhotoURL(url);
    } catch (error) {
      setError('Failed to upload photo');
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user.uid), { bio });
      setError(null);
    } catch (error) {
      setError('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <ProfileWrapper>
      <ProfileImage src={photoURL || user?.photoURL || '/default-avatar.png'} alt="Profile" />
      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      
      <ProfileInfo>
        <h2>{user?.displayName}</h2>
        <p>{user?.email}</p>
      </ProfileInfo>

      <ProfileForm onSubmit={handleUpdateProfile}>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
        />
        <Button type="submit">Update Profile</Button>
      </ProfileForm>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </ProfileWrapper>
  );
};

export default Profile;
