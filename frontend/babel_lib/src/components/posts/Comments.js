import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../services/firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, increment, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

const CommentWrapper = styled.div`
  padding: 1rem 0;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

const Comments = ({ postId, isAdmin }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const fetchComments = async () => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    setComments(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Add the comment
      await addDoc(collection(db, 'comments'), {
        postId,
        userId: user.uid,
        content: newComment,
        createdAt: serverTimestamp()
      });

      // Update post's comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAdmin) return;
    
    try {
      // Delete the comment
      await deleteDoc(doc(db, 'comments', commentId));
      
      // Update post's comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(-1)
      });
      
      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <CommentWrapper>
      <CommentForm onSubmit={handleSubmit}>
        <CommentInput
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </CommentForm>
      {comments.map(comment => (
        <CommentItem key={comment.id}>
          <CommentAvatar src={comment.userAvatar || '/default-avatar.png'} alt="User avatar" />
          <CommentContent>
            <CommentHeader>
              <div>
                <CommentAuthor>{comment.userName || 'Anonymous'}</CommentAuthor>
                <CommentTimestamp>
                  {new Date(comment.createdAt?.toDate()).toLocaleString()}
                </CommentTimestamp>
              </div>
              {isAdmin && (
                <ActionButton onClick={() => handleDeleteComment(comment.id)}>
                  <Trash2 size={16} />
                </ActionButton>
              )}
            </CommentHeader>
            <p>{comment.content}</p>
          </CommentContent>
        </CommentItem>
      ))}
    </CommentWrapper>
  );
};

export default Comments;
