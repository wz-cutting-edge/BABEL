import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Spinner = styled.div`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid ${props => props.theme.background};
  border-top: 2px solid ${props => props.theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  color: ${props => props.theme.text};
  font-size: 0.875rem;
`;

const Loading = ({ size, text }) => (
  <LoadingWrapper>
    <Spinner size={size} />
    {text && <LoadingText>{text}</LoadingText>}
  </LoadingWrapper>
);

export default Loading;
