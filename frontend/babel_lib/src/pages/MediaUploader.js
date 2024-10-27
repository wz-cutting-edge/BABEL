import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button, ErrorMessage } from '../components/common';
import { useAuth } from '../contexts/AuthContext';

const UploaderWrapper = styled.div`
  padding: 2rem;
`;

const BackButton = styled(Button)`
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
`;

const MediaUploader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState('book');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `media/${type}/${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // Add media info to Firestore
      await addDoc(collection(db, 'library database'), {
        title,
        author,
        type,
        fileUrl: downloadURL,
        uploadedAt: serverTimestamp(),
        uploadedBy: user.uid,
      });

      // Reset form
      setTitle('');
      setAuthor('');
      setType('book');
      setFile(null);
      alert('Media uploaded successfully!');
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploaderWrapper>
      <BackButton onClick={() => navigate('/admin-dashboard')}>
        Back to Dashboard
      </BackButton>
      <h2>Media Uploader</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="book">Book</option>
          <option value="movie">Movie</option>
          <option value="textbook">Textbook</option>
        </Select>
        <Input type="file" onChange={handleFileChange} required />
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Media'}
        </Button>
      </Form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploaderWrapper>
  );
};

export default MediaUploader;
