import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import RecommendedMedia from '../../components/features/media/RecommendedMedia';

const PageWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: ${props => props.theme.background};
  overflow: hidden;
`;

const UserHome = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <PageWrapper>
      <RecommendedMedia userId={user.uid} />
    </PageWrapper>
  );
};

export default React.memo(UserHome);
