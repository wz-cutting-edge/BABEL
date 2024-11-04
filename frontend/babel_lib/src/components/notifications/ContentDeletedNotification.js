import React from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Alert } from '../common/Alert';

const NotificationWrapper = styled(Alert)`
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
`;

const ContentDeletedNotification = ({ notification, onClose }) => {
  return (
    <NotificationWrapper variant="warning">
      <AlertTitle>Content Removed</AlertTitle>
      <AlertDescription>
        Your {notification.contentType} has been removed for violating our community guidelines.
      </AlertDescription>
      <CloseButton onClick={() => onClose(notification.id)}>
        <X size={16} />
      </CloseButton>
    </NotificationWrapper>
  );
};

export default ContentDeletedNotification; 