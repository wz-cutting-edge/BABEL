import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, arrayRemove, arrayUnion, getDoc, runTransaction, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { MessageCircle, Book, Heart, Trash2, MoreVertical } from 'lucide-react';
import Comments from './Comments';
import ReportModal from '../modals/ReportModal';

const PostWrapper = styled.div`
  background-color: ${props => props.theme.surfaceColor};
  border: 1px solid ${props => props.theme.borderLight};
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadowSm};
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
    margin: 0 0.5rem;
    width: calc(100% - 1rem);
  }
  
  * {
    color: ${props => props.theme.text};
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;

  .username {
    color: ${props => props.theme.text};
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .timestamp {
    color: ${props => props.theme.textSecondary};
    font-size: 0.8rem;
  }
`;

const PostAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
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
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.theme.borderLight};
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.primary : props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.active ? props.theme.primaryHover : props.theme.text};
    background: ${props => props.theme.backgroundAlt};
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

const MoreOptions = styled.div`
  position: relative;
  margin-left: auto;
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.primary};
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.primaryAlpha};
  }
  
  &:active {
    background: ${props => props.theme.primaryAlpha}40;
  }
`;

const PostContent = styled.div`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0;
  }
`;

const TimeStamp = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
`;

const Post = React.memo(React.forwardRef(({ post, onDelete, isAdmin, authorData }, ref) => {
  console.log('Rendering post:', post.id);
  const [postData, setPostData] = useState(post);
  const [userData, setUserData] = useState(authorData || post.userData || null);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Combine the two user data effects into one
  useEffect(() => {
    if (!userData && postData.userId) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', postData.userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [postData.userId, userData]);

  // Check likes only when user changes
  useEffect(() => {
    if (!user) {
      setHasLiked(false);
      return;
    }

    const checkLike = async () => {
      try {
        const likeId = `${post.id}_${user.uid}`;
        const likeDoc = await getDoc(doc(db, 'likes', likeId));
        setHasLiked(likeDoc.exists());
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLike();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const likeId = `${post.id}_${user.uid}`;
      const likeRef = doc(db, 'likes', likeId);
      const postRef = doc(db, 'posts', post.id);

      // Optimistic update
      setHasLiked(prev => !prev);
      setPostData(prev => ({
        ...prev,
        likes: prev.likes + (hasLiked ? -1 : 1)
      }));

      if (hasLiked) {
        // Remove like
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
      } else {
        // Add like
        await setDoc(likeRef, {
          userId: user.uid,
          postId: post.id,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          likes: increment(1)
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(prev => !prev);
      setPostData(prev => ({
        ...prev,
        likes: prev.likes + (hasLiked ? 1 : -1)
      }));
      console.error('Error updating like:', error);
    }
  };

  const handleMediaClick = () => {
    if (postData.mediaId) {
      navigate(`/media/${postData.mediaId}`);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <PostWrapper ref={ref}>
      <PostHeader>
        <ProfileImage 
          src={userData?.photoURL || '/default-avatar.png'} 
          alt={userData?.username || 'User'} 
          onClick={() => handleUserClick(post.authorId)}
        />
        <UserInfo>
          <span 
            className="username" 
            onClick={() => handleUserClick(post.authorId)}
          >
            {userData?.username || 'Anonymous'}
          </span>
          <span className="timestamp">
            {new Date(post.createdAt?.toDate()).toLocaleString()}
          </span>
        </UserInfo>
        {isAdmin && (
          <ActionButton onClick={() => onDelete(post.id)}>
            <Trash2 size={16} />
          </ActionButton>
        )}
        <MoreOptions>
          <OptionsButton onClick={() => setShowReportModal(true)}>
            <MoreVertical size={16} />
          </OptionsButton>
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            contentId={post.id}
            contentType="post"
            reportedUserId={post.userId || post.authorId}
          />
        </MoreOptions>
      </PostHeader>
      <PostContent>{postData.content}</PostContent>
      {postData.imageUrl && <PostImage src={postData.imageUrl} alt="Post content" />}
      <ActionBar>
        <ActionButton onClick={handleLike} active={hasLiked}>
          <Heart fill={hasLiked ? "currentColor" : "none"} /> {postData.likes || 0}
        </ActionButton>
        <ActionButton onClick={() => setShowComments(!showComments)}>
          <MessageCircle /> {postData.commentCount || 0}
        </ActionButton>
        {postData.mediaId && (
          <ActionButton onClick={handleMediaClick}>
            <Book /> View Content
          </ActionButton>
        )}
      </ActionBar>
      {showComments && (
        <Comments 
          postId={postData.id} 
          isAdmin={isAdmin} 
          onCommentCountChange={(change) => {
            setPostData(prev => ({
              ...prev,
              commentCount: (prev.commentCount || 0) + change
            }));
          }}
        />
      )}
    </PostWrapper>
  );
}));

export default Post;
