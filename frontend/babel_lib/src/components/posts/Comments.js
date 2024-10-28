import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../services/firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

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

const Comments = ({ postId }) => {
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

    await addDoc(collection(db, 'comments'), {
      postId,
      userId: user.uid,
      content: newComment,
      createdAt: serverTimestamp()
    });

    setNewComment('');
    fetchComments();
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
          <CommentAvatar src={comment.userAvatar} alt="User avatar" />
          <CommentContent>
            <CommentHeader>
              <CommentAuthor>{comment.userName}</CommentAuthor>
              <CommentTimestamp>
                {new Date(comment.createdAt?.toDate()).toLocaleString()}
              </CommentTimestamp>
            </CommentHeader>
            <p>{comment.content}</p>
          </CommentContent>
        </CommentItem>
      ))}
    </CommentWrapper>
  );
};

export default Comments;
