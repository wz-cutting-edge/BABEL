import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, arrayRemove, arrayUnion, getDoc, runTransaction } from 'firebase/firestore';
import { MessageCircle, Book, Heart } from 'lucide-react';
import Comments from './Comments';

const PostWrapper = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const PostAvatar = styled.img`
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

const ProfileLink = styled.div`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const Post = React.forwardRef(({ post }, ref) => {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const hasLiked = post.likedBy?.includes(user?.uid);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    
    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        likes: increment(hasLiked ? -1 : 1),
        likedBy: hasLiked 
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleMediaClick = () => {
    if (post.mediaId) {
      navigate(`/media/${post.mediaId}`);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', post.userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (post.userId) {
      fetchUserData();
    }
  }, [post.userId]);

  return (
    <PostWrapper ref={ref}>
      <PostHeader>
        <ProfileLink onClick={() => navigate(`/profile/${post.userId}`)}>
          <PostAvatar 
            src={userData?.photoURL || '/default-avatar.png'} 
            alt={userData?.displayName || 'User'} 
          />
        </ProfileLink>
        <div>
          <strong onClick={() => navigate(`/profile/${post.userId}`)} style={{ cursor: 'pointer' }}>
            {userData?.displayName || 'Anonymous'}
          </strong>
          <span>{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
        </div>
      </PostHeader>
      <p>{post.content}</p>
      {post.imageUrl && <PostImage src={post.imageUrl} alt="Post content" />}
      <ActionBar>
        <ActionButton onClick={handleLike} active={hasLiked}>
          <Heart fill={hasLiked ? "currentColor" : "none"} /> {post.likes || 0}
        </ActionButton>
        <ActionButton onClick={() => setShowComments(!showComments)}>
          <MessageCircle /> {post.comments || 0}
        </ActionButton>
        {post.mediaId && (
          <ActionButton onClick={handleMediaClick}>
            <Book /> View Content
          </ActionButton>
        )}
      </ActionBar>
      {showComments && <Comments postId={post.id} />}
    </PostWrapper>
  );
});

export default Post;
