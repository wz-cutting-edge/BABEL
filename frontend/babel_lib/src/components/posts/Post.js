import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Heart, MessageCircle, Book } from 'lucide-react';
import Comments from './Comments';

const PostWrapper = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
  margin: 1rem 0;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid ${props => props.theme.border};
  border-bottom: 1px solid ${props => props.theme.border};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: ${props => props.theme.hover};
  }
`;

const CommentSection = styled.div`
  margin-top: 1rem;
`;

const Post = React.forwardRef(({ post }, ref) => {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, {
      likes: increment(1)
    });
  };

  const handleMediaClick = () => {
    if (post.mediaId) {
      navigate(`/media/${post.mediaId}`);
    }
  };

  return (
    <PostWrapper ref={ref}>
      <PostHeader>
        <ProfilePic src={post.userAvatar} alt="Profile" />
        <div>
          <strong>{post.userName}</strong>
          <span>{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
        </div>
      </PostHeader>
      <p>{post.content}</p>
      {post.imageUrl && <PostImage src={post.imageUrl} alt="Post content" />}
      <ActionBar>
        <button onClick={handleLike}>
          <Heart /> {post.likes || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          <MessageCircle /> {post.comments || 0}
        </button>
        {post.mediaId && (
          <button onClick={handleMediaClick}>
            <Book /> View Content
          </button>
        )}
      </ActionBar>
      {showComments && <Comments postId={post.id} />}
    </PostWrapper>
  );
});

export default Post;
