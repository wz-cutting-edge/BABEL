import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Book, Film, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Item = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  height: 220px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const Cover = styled.div`
  height: 160px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-color: ${props => props.theme.background};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: ${props => props.theme.textSecondary};
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    height: 130px;
  }
`;

const Details = styled.div`
  padding: 0.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  color: ${props => props.theme.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Author = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: ${props => props.theme.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MediaItem = React.memo(({ type, title, author, coverUrl, id }) => {
  const navigate = useNavigate();
  
  const getIcon = useCallback(() => {
    switch (type) {
      case 'book':
        return <Book size={24} />;
      case 'movie':
      case 'video':
        return <Film size={24} />;
      case 'textbook':
        return <FileText size={24} />;
      default:
        return <Book size={24} />;
    }
  }, [type]);

  const handleClick = () => {
    navigate(`/media/${id}`);
  };

  return (
    <Item onClick={handleClick}>
      <Cover image={coverUrl}>
        {!coverUrl && getIcon()}
      </Cover>
      <Details>
        <Title>{title}</Title>
        <Author>{author}</Author>
      </Details>
    </Item>
  );
});

export default MediaItem;
