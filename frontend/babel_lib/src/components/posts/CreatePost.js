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

    try {
      let imageUrl = '';
      if (selectedImage) {
        const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        content,
        imageUrl,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });

      setContent('');
      setSelectedImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
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
          <button type="submit" disabled={loading || (!content.trim() && !selectedImage)}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </ActionBar>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PostForm>
    </CreatePostWrapper>
  );
};

export default CreatePost;
