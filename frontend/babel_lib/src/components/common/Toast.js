import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: ${props => props.position.includes('top') ? '1rem' : 'auto'};
  bottom: ${props => props.position.includes('bottom') ? '1rem' : 'auto'};
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${props => props.theme.background};
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return props.theme.success;
      case 'error': return props.theme.error;
      case 'warning': return props.theme.warning;
      default: return props.theme.info;
    }
  }};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  max-width: 500px;
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-in-out;
`;

const IconWrapper = styled.div`
  color: ${props => {
    switch (props.type) {
      case 'success': return props.theme.success;
      case 'error': return props.theme.error;
      case 'warning': return props.theme.warning;
      default: return props.theme.info;
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0;
  color: ${props => props.theme.text};
`;

const Message = styled.p`
  margin: 0.25rem 0 0;
  color: ${props => props.theme.textSecondary};
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.theme.text};
  }
`;

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} />;
    case 'error':
      return <XCircle size={20} />;
    case 'warning':
      return <AlertCircle size={20} />;
    default:
      return <Info size={20} />;
  }
};

const Toast = ({ 
  toasts, 
  removeToast, 
  position = 'top-right' 
}) => {
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return createPortal(
    <ToastContainer position={position}>
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          type={toast.type}
          isExiting={toast.isExiting}
        >
          <IconWrapper type={toast.type}>
            {getIcon(toast.type)}
          </IconWrapper>
          
          <Content>
            {toast.title && <Title>{toast.title}</Title>}
            {toast.message && <Message>{toast.message}</Message>}
          </Content>
          
          <CloseButton onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>,
    document.body
  );
};

export default Toast;
