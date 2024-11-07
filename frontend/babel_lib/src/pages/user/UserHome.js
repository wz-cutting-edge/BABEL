import React, { useState, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import RecommendedMedia from '../../components/features/media/RecommendedMedia';
import PostFeed from '../../components/posts/PostFeed';

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${props => props.theme.background};
  position: relative;
  z-index: 1;
  overflow-y: auto;
  overscroll-behavior: none;
  scroll-behavior: smooth;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.borderLight};
    border-radius: 4px;
  }
`;

const UserHome = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <PageWrapper>
      <PostFeed userId={user.uid} />
      <RecommendedMedia userId={user.uid} />
    </PageWrapper>
  );
};

export default React.memo(UserHome);
