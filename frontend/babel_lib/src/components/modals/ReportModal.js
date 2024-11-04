import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.background};
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ReportForm = styled.form`
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
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const ReportModal = ({ isOpen, onClose, contentId, contentType, reportedUserId }) => {
  const [reason, setReason] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'reports'), {
        contentId,
        contentType, // 'post' or 'comment'
        reportedUserId,
        reporterId: user.uid,
        reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Report {contentType}</h3>
        <ReportForm onSubmit={handleSubmit}>
          <TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this content?"
            required
          />
          <button type="submit">Submit Report</button>
        </ReportForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ReportModal; 