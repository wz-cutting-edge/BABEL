import React, { useState } from 'react';
import styled from 'styled-components';

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
  const [username, setUsername] = useState('JohnDoe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [bio, setBio] = useState('I love reading and watching movies!');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile updated', { username, email, bio });
  };

  return (
    <ProfileWrapper>
      <ProfileImage src="/placeholder.svg?height=150&width=150" alt="Profile" />
      <ProfileInfo>
        <h2>{username}</h2>
        <p>{email}</p>
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
          onChange={(e) => setEmail(e.target.value)}
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