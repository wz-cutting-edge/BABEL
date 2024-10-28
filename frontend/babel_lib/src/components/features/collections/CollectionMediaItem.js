import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { Book, Video } from 'lucide-react';
import { Button } from '../../common/common';

const MediaItemWrapper = styled.div`
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

const CollectionMediaItem = ({ mediaId }) => {
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

  if (!media) return null;

  return (
    <MediaItemWrapper>
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
