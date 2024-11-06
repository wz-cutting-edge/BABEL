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
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme.shadowSm};
  transition: all 0.2s ease;
  
  * {
    color: ${props => props.theme.text};
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;

  .username {
    color: ${props => props.theme.text};
    font-weight: 600;
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
  padding: 0.75rem 0;
  border-top: 1px solid ${props => props.theme.borderLight};
  border-bottom: 1px solid ${props => props.theme.borderLight};
  margin: 1rem 0;
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
  color: ${props => props.theme.textSecondary};
`;

const PostContent = styled.div`
  color: ${props => props.theme.text};
  line-height: 1.5;
  margin: 1rem 0;
  white-space: pre-wrap;
  font-size: 1rem;
`;

const TimeStamp = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.textSecondary};
`;

const Post = React.forwardRef(({ post, onDelete, isAdmin, authorData }, ref) => {
  const [postData, setPostData] = useState(post);
  const [userData, setUserData] = useState(authorData || null);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authorData && postData.userId) {
      // Only fetch user data if not provided through props
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
  }, [postData.userId, authorData]);

  // Listen to post updates
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'posts', post.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPostData({ 
          id: doc.id, 
          ...data,
          commentCount: data.commentCount || 0
        });
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  // Check if user has liked the post
  useEffect(() => {
    const checkLike = async () => {
      if (!user) {
        setHasLiked(false);
        return;
      }

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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      console.log('Please log in to like posts');
      return;
    }

    const likeId = `${post.id}_${user.uid}`;
    const likeRef = doc(db, 'likes', likeId);
    const postRef = doc(db, 'posts', post.id);
    
    try {
      // Optimistically update UI
      setHasLiked(prev => !prev);
      
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
      console.error('Error updating like:', error);
    }
  };

  const handleMediaClick = () => {
    if (postData.mediaId) {
      navigate(`/media/${postData.mediaId}`);
    }
  };

  return (
    <PostWrapper ref={ref}>
      <PostHeader>
        <img 
          src={userData?.photoURL || '/default-avatar.png'} 
          alt={userData?.username} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <UserInfo>
          <span className="username">{userData?.username || 'Anonymous'}</span>
          <span className="timestamp">
            {new Date(postData.createdAt?.toDate()).toLocaleString()}
          </span>
        </UserInfo>
        {isAdmin && (
          <ActionButton onClick={() => onDelete(post.id)} style={{ color: props => props.theme.error }}>
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
            contentId={postData.id}
            contentType="post"
            reportedUserId={postData.userId}
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
      {showComments && <Comments postId={postData.id} isAdmin={isAdmin} />}
    </PostWrapper>
  );
});

export default Post;
