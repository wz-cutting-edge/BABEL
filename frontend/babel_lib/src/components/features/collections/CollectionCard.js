import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../services/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Book, Film, Lock, Globe } from 'lucide-react';

const Card = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MediaList = styled.div`
  max-height: ${props => props.isExpanded ? 'none' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`;

const MediaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.hover};
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
`;

const CollectionCard = ({ collection }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    const fetchMediaItems = async () => {
      if (isExpanded && collection.mediaIds?.length > 0) {
        const items = await Promise.all(
          collection.mediaIds.map(async (id) => {
            const mediaDoc = await getDoc(doc(db, 'media', id));
            return { id, ...mediaDoc.data() };
          })
        );
        setMediaItems(items);
      }
    };

    fetchMediaItems();
  }, [isExpanded, collection.mediaIds]);

  const handleMediaClick = (mediaId, type) => {
    navigate(`/media/${mediaId}`);
  };

  return (
    <Card onClick={() => setIsExpanded(!isExpanded)}>
      <Header>
        <Title>
          {collection.name}
          {collection.isPublic ? <Globe size={16} /> : <Lock size={16} />}
        </Title>
      </Header>

      <Stats>
        <span>{collection.itemCount} items</span>
        <span>Created {new Date(collection.createdAt?.toDate()).toLocaleDateString()}</span>
      </Stats>

      <MediaList isExpanded={isExpanded}>
        {mediaItems.map(item => (
          <MediaItem 
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              handleMediaClick(item.id, item.type);
            }}
          >
            {item.type === 'book' ? <Book size={16} /> : <Film size={16} />}
            <span>{item.title}</span>
          </MediaItem>
        ))}
      </MediaList>
    </Card>
  );
};

export default CollectionCard;
