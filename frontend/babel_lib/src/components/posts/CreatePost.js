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
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (image) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        content,
        imageUrl,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp()
      });

      setContent('');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
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
        {imagePreview && (
          <ImagePreview>
            <img src={imagePreview} alt="Preview" />
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
          <button type="submit" disabled={loading || (!content.trim() && !image)}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </ActionBar>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PostForm>
    </CreatePostWrapper>
  );
};

export default CreatePost;
