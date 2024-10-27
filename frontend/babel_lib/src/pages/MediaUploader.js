import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const UploaderWrapper = styled.div`
  padding: 2rem;
`;

const BackButton = styled.button`
  margin-bottom: 1rem;
`;

const MediaUploader = () => {
  const navigate = useNavigate();

  return (
    <UploaderWrapper>
      <BackButton onClick={() => navigate('/admin-dashboard')}>
        Back to Dashboard
      </BackButton>
      <h2>Media Uploader</h2>
      {/* Add your uploader form here */}
    </UploaderWrapper>
  );
};

export default MediaUploader;
