import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { uploadMedia } from '../../services/api/media';
import { Button, ErrorMessage } from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const UploaderWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    margin-bottom: 2rem;
    text-align: center;
  }
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.theme.border};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
  
  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.secondaryBackground};
  color: ${props => props.theme.text};
  min-height: 100px;
  resize: vertical;
`;

const Preview = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
  img {
    max-width: 200px;
    border-radius: 4px;
  }
  
  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    padding: 0.25rem;
    cursor: pointer;
    color: white;
  }
`;

const MediaUploader = () => {
  const { user, isAdmin } = useAuth();
  
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Is admin?", isAdmin);
    if (user) {
      // Fetch and log the user's Firestore document
      const fetchUserDoc = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log("User Firestore data:", userDoc.data());
      };
      fetchUserDoc();
    }
  }, [user, isAdmin]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    type: 'book',
    genre: '',
    description: '',
    author: '',
    year: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      // Only create preview for images
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false,
    validator: (file) => {
      if (!file.type.match(/(application\/pdf|video\/.*)/)) {
        return {
          code: 'wrong-file-type',
          message: 'Only PDF and video files are allowed'
        };
      }
      return null;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadMedia(file, {
        ...metadata,
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }, user, isAdmin);

      // Reset form
      setFile(null);
      setPreview(null);
      setMetadata({
        title: '',
        type: 'book',
        genre: '',
        description: '',
        author: '',
        year: '',
        tags: ''
      });

      // Show success message
      alert('Media uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload media. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UploaderWrapper>
      <h2>Upload Media</h2>
      
      <DropZone {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <div>
            <Upload size={48} />
            <p>Drag and drop a file here, or click to select</p>
            <small>Supported formats: PDF, MP4, MOV, JPG, PNG</small>
          </div>
        )}
      </DropZone>

      {preview && (
        <Preview>
          <img src={preview} alt="Preview" />
          <button onClick={() => {
            setFile(null);
            setPreview(null);
          }}>
            <X size={16} />
          </button>
        </Preview>
      )}

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Title"
          value={metadata.title}
          onChange={e => setMetadata({ ...metadata, title: e.target.value })}
          required
        />
        
        <Select
          value={metadata.type}
          onChange={e => setMetadata({ ...metadata, type: e.target.value })}
          required
        >
          <option value="book">Book</option>
          <option value="video">Video</option>
          <option value="article">Article</option>
        </Select>
        
        <Input
          type="text"
          placeholder="Genre"
          value={metadata.genre}
          onChange={e => setMetadata({ ...metadata, genre: e.target.value })}
          required
        />
        
        <TextArea
          placeholder="Description"
          value={metadata.description}
          onChange={e => setMetadata({ ...metadata, description: e.target.value })}
          required
        />
        
        <Input
          type="text"
          placeholder="Author"
          value={metadata.author}
          onChange={e => setMetadata({ ...metadata, author: e.target.value })}
          required
        />
        
        <Input
          type="number"
          placeholder="Year"
          value={metadata.year}
          onChange={e => setMetadata({ ...metadata, year: e.target.value })}
          required
        />
        
        <Input
          type="text"
          placeholder="Tags (comma-separated)"
          value={metadata.tags}
          onChange={e => setMetadata({ ...metadata, tags: e.target.value })}
        />
        
        <Button type="submit" disabled={!file || loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </UploaderWrapper>
  );
};

export default MediaUploader;
