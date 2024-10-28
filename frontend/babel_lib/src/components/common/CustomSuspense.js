import React, { Suspense } from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${props => props.theme.background};
  border-top: 5px solid ${props => props.theme.accent};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 20px auto;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const CustomSuspense = ({ children, fallback }) => (
  <Suspense
    fallback={
      fallback || (
        <LoadingWrapper>
          <LoadingSpinner />
          <p>Loading...</p>
        </LoadingWrapper>
      )
    }
  >
    {children}
  </Suspense>
);

export default CustomSuspense;
