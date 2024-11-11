import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../services/firebase/config';
import { collection, query, where, orderBy, addDoc, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportModal from '../modals/ReportModal';

const CommentWrapper = styled.div`
  padding: 1rem 0;
  
  @media (max-width: 768px) {
    padding: 0.75rem 0;
  }
`;

const CommentForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.primaryAlpha};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }

  @media (max-width: 768px) {
    padding: 0.625rem;
    font-size: 16px; // Prevents zoom on iOS
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const CommentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
`;

const CommentTimestamp = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 0.8rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
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

const CommentButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.theme.primary};
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Comments = ({ postId, isAdmin, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [usersData, setUsersData] = useState({});
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    };
    
    fetchUserData();
  }, [user]);

  const isBanned = userData?.banned && (
    userData.banEndDate === 'permanent' || 
    new Date() < userData.banEndDate?.toDate()
  );

  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch user data for all commenters
      const userIds = [...new Set(commentsData.map(comment => comment.userId))];
      const usersSnapshot = await Promise.all(
        userIds.map(userId => getDoc(doc(db, 'users', userId)))
      );
      
      const userData = {};
      usersSnapshot.forEach(doc => {
        if (doc.exists()) {
          userData[doc.id] = doc.data();
        }
      });
      
      setUsersData(userData);
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const batch = writeBatch(db);
      const postRef = doc(db, 'posts', postId);
      const commentRef = doc(collection(db, 'comments'));
      
      batch.set(commentRef, {
        postId,
        userId: user.uid,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      batch.update(postRef, {
        commentCount: increment(1)
      });

      await batch.commit();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAdmin) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      
      if (!postSnap.exists()) {
        console.error('Post not found');
        return;
      }

      await deleteDoc(doc(db, 'comments', commentId));
      
      const currentCount = postSnap.data().commentCount || 0;
      await updateDoc(postRef, {
        commentCount: Math.max(0, currentCount - 1)
      });
      
      onCommentCountChange(-1);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <CommentWrapper>
      {user && !isBanned ? (
        <CommentForm onSubmit={handleSubmit}>
          <CommentInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <CommentButton type="submit" disabled={!newComment.trim()}>
            Post
          </CommentButton>
        </CommentForm>
      ) : isBanned ? (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          You are currently banned and cannot comment.
        </div>
      ) : null}
      {comments.map(comment => (
        <CommentItem key={comment.id}>
          <CommentAvatar 
            src={usersData[comment.userId]?.photoURL || '/default-avatar.png'} 
            alt={usersData[comment.userId]?.username || 'Anonymous'} 
            onClick={() => handleUserClick(comment.userId)}
            style={{ cursor: 'pointer' }}
          />
          <CommentContent>
            <CommentHeader>
              <div>
                <CommentAuthor 
                  onClick={() => handleUserClick(comment.userId)}
                  style={{ cursor: 'pointer' }}
                >
                  {usersData[comment.userId]?.username || 'Anonymous'}
                </CommentAuthor>
                <CommentTimestamp>
                  {comment.createdAt?.toDate().toLocaleString()}
                </CommentTimestamp>
              </div>
              <MoreOptions>
                <OptionsButton onClick={() => setShowReportModal(comment.id)}>
                  <MoreVertical size={16} />
                </OptionsButton>
              </MoreOptions>
            </CommentHeader>
            <p>{comment.content}</p>
          </CommentContent>
          {showReportModal === comment.id && (
            <ReportModal
              isOpen={true}
              onClose={() => setShowReportModal(null)}
              contentId={comment.id}
              contentType="comment"
              reportedUserId={comment.userId}
            />
          )}
        </CommentItem>
      ))}
    </CommentWrapper>
  );
};

export default Comments;
