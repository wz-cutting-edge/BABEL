import React, { useState } from 'react';
import styled from 'styled-components';
import { storage, db } from '../../services/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    if (!content.trim() && !selectedImage) return;
    
    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      
      if (selectedImage) {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create post with image URL if exists
      await addDoc(collection(db, 'posts'), {
        content,
        userId: user.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        commentCount: 0,
        imageUrl, // Add the image URL to the post data
      });
      
      setContent('');
      setSelectedImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setLoading(false);
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
