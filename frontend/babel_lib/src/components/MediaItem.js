import React from 'react';
import styled from 'styled-components';
import { Book, Film, FileText } from 'lucide-react';

const Item = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  margin-right: 1rem;
  color: ${props => props.theme.accent};
`;

const Details = styled.div`
  flex-grow: 1;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
`;

const Author = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${props => props.theme.text}aa;
`;

const MediaItem = ({ type, title, author }) => {
  const getIcon = () => {
    switch (type) {
      case 'book':
        return <Book size={24} />;
      case 'movie':
        return <Film size={24} />;
      case 'textbook':
        return <FileText size={24} />;
      default:
        return <Book size={24} />;
    }
  };

  return (
    <Item>
      <IconWrapper>{getIcon()}</IconWrapper>
      <Details>
        <Title>{title}</Title>
        <Author>{author}</Author>
      </Details>
    </Item>
  );
};

export default MediaItem;