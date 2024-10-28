import React, { useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useClickOutside } from '../../hooks/ui/useClickOutside';
import { createPortal } from 'react-dom';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${props => props.theme.background};
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  width: ${props => props.width || '500px'};
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.text};
  }
`;

const Header = styled.div`
  margin-bottom: 1rem;
  padding-right: 2rem;
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.text};
`;

const Content = styled.div`
  color: ${props => props.theme.text};
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width,
  closeOnClickOutside = true
}) => {
  const modalRef = useClickOutside(() => {
    if (closeOnClickOutside) {
      onClose();
    }
  });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay>
      <ModalContainer ref={modalRef} width={width}>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
        
        {title && (
          <Header>
            <Title>{title}</Title>
          </Header>
        )}
        
        <Content>{children}</Content>
        
        {footer && <Footer>{footer}</Footer>}
      </ModalContainer>
    </Overlay>,
    document.body
  );
};

export default Modal;
