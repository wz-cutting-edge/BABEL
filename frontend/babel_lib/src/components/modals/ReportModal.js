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
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.textSecondary};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.backgroundAlt};
    color: ${props => props.theme.text};
  }
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

const SubmitButton = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ReportModal = ({ isOpen, onClose, contentId, contentType, reportedUserId }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!contentId || !contentType || !reportedUserId || !user) {
      console.error('Missing required fields:', { contentId, contentType, reportedUserId, userId: user?.uid });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await addDoc(collection(db, 'reports'), {
        contentId,
        contentType,
        reportedUserId,
        reporterId: user.uid,
        reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay 
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <ModalContent>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
        <h3>Report Content</h3>
        <ReportForm onSubmit={handleSubmit}>
          <TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please describe why you are reporting this content..."
            required
          />
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </SubmitButton>
        </ReportForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ReportModal; 