import React, { useState } from 'react';
import styled from 'styled-components';
import { storage, db } from '../../services/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Image, X } from 'lucide-react';
import { ErrorMessage } from '../common/common';

const CreatePostWrapper = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const PostForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  resize: vertical;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const ImagePreview = styled.div`
  position: relative;
  max-width: 200px;
  
  img {
    width: 100%;
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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubmitButton = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryHover};
  }
`;

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Current user:', user);
    
    if (!content.trim() || !user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.error('User document not found');
        return;
      }
      
      const userData = userDoc.data();
      console.log('User data:', userData);
      console.log('User ban status:', {
        banned: userData.banned,
        banEndDate: userData.banEndDate,
        role: userData.role
      });
      console.log('Post data being sent:', {
        content: content.trim(),
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      const postData = {
        content: content.trim(),
        userId: user.uid,
        createdAt: serverTimestamp()
      };

      if (selectedImage) {
        const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.name}`);
        const uploadResult = await uploadBytes(imageRef, selectedImage);
        const imageUrl = await getDownloadURL(uploadResult.ref);
        postData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, 'posts'), postData);
      
      setContent('');
      setSelectedImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.code, error.message);
      setError(error.message);
    }
  };

  return (
    <CreatePostWrapper>
      <PostForm onSubmit={handleSubmit}>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        {previewUrl && (
          <ImagePreview>
            <img src={previewUrl} alt="Preview" />
            <button type="button" onClick={removeImage}>
              <X size={16} />
            </button>
          </ImagePreview>
        )}
        <ActionBar>
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <Image style={{ cursor: 'pointer' }} />
          </label>
          <SubmitButton type="submit" disabled={loading || (!content.trim() && !selectedImage)}>
            {loading ? 'Posting...' : 'Post'}
          </SubmitButton>
        </ActionBar>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PostForm>
    </CreatePostWrapper>
  );
};

export default CreatePost;
