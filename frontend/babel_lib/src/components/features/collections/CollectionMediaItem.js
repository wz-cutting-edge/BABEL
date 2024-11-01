import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { Book, Video, Trash2 } from 'lucide-react';
import { Button } from '../../common/common';

const MediaItemWrapper = styled.div`
  position: relative;
  background: ${props => props.theme.background};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MediaTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

const MediaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.875rem;
`;

const ViewButton = styled(Button)`
  margin-top: auto;
  width: 100%;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.error};
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 0.5rem;
  border-radius: 50%;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
  }

  ${MediaItemWrapper}:hover & {
    opacity: 1;
  }
`;

const CollectionMediaItem = ({ mediaId, collectionId, onDelete }) => {
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const mediaDoc = await getDoc(doc(db, 'media', mediaId));
        if (mediaDoc.exists()) {
          setMedia({ id: mediaDoc.id, ...mediaDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    fetchMedia();
  }, [mediaId]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const collectionRef = doc(db, 'collections', collectionId);
      await updateDoc(collectionRef, {
        items: arrayRemove(mediaId)
      });
      if (onDelete) onDelete(mediaId);
    } catch (error) {
      console.error('Error removing media from collection:', error);
    }
  };

  if (!media) return null;

  return (
    <MediaItemWrapper>
      <DeleteButton onClick={handleDelete}>
        <Trash2 size={16} />
      </DeleteButton>
      <MediaTitle>{media.title}</MediaTitle>
      <MediaMeta>
        {media.type === 'book' ? <Book size={16} /> : <Video size={16} />}
        <span>{media.author}</span>
        {media.year && <span>• {media.year}</span>}
      </MediaMeta>
      <ViewButton onClick={() => navigate(`/media/${media.id}`)}>
        View
      </ViewButton>
    </MediaItemWrapper>
  );
};

export default CollectionMediaItem;
