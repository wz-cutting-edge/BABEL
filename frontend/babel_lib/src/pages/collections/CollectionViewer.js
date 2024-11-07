import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { db } from '../../services/firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Book, Video, ExternalLink } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/common';

const ViewerWrapper = styled.div`
  padding: 6rem 2rem 2rem;
`;

const CollectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const MediaList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const MediaCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const MediaThumbnail = styled.div`
  height: 150px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.background};
`;

const MediaInfo = styled.div`
  padding: 1rem;
`;

const MediaTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const MediaMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.875rem;
`;

const CollectionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.textSecondary};
  grid-column: 1 / -1;
  
  p {
    font-size: 1.1rem;
  }
`;

const CollectionViewer = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionOwner, setCollectionOwner] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const collectionDoc = await getDoc(doc(db, 'collections', collectionId));
        if (!collectionDoc.exists()) {
          setError('Collection not found');
          return;
        }

        const collectionData = { id: collectionDoc.id, ...collectionDoc.data() };
        setCollection(collectionData);

        // Fetch collection owner's data
        const ownerDoc = await getDoc(doc(db, 'users', collectionData.userId));
        if (ownerDoc.exists()) {
          setCollectionOwner(ownerDoc.data());
        }

        // Fetch media items only if the collection has items
        if (collectionData.items && collectionData.items.length > 0) {
          const mediaPromises = collectionData.items.map(mediaId => 
            getDoc(doc(db, 'media', mediaId))
          );
          
          const mediaResults = await Promise.all(mediaPromises);
          const mediaData = mediaResults
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() }));
          
          setMediaItems(mediaData);
        }
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!collection) return null;

  return (
    <ViewerWrapper>
      <CollectionHeader>
        <div>
          <h2>{collection.name}</h2>
          <CollectionMeta>
            <span>Created by {collectionOwner?.username || 'Unknown User'}</span>
            <span>•</span>
            <span>{mediaItems.length} items</span>
          </CollectionMeta>
        </div>
      </CollectionHeader>

      <MediaList>
        {mediaItems.map(item => (
          <MediaCard 
            key={item.id}
            onClick={() => navigate(`/media/${item.id}`)}
          >
            <MediaThumbnail image={item.coverUrl}>
              {!item.coverUrl && (
                item.type === 'book' ? <Book size={32} /> : <Video size={32} />
              )}
            </MediaThumbnail>
            <MediaInfo>
              <MediaTitle>{item.title}</MediaTitle>
              <MediaMeta>
                {item.type === 'book' ? <Book size={16} /> : <Video size={16} />}
                <span>{item.author}</span>
                {item.year && (
                  <>
                    <span>•</span>
                    <span>{item.year}</span>
                  </>
                )}
              </MediaMeta>
            </MediaInfo>
          </MediaCard>
        ))}
        {mediaItems.length === 0 && (
          <EmptyState>
            <p>This collection is empty</p>
          </EmptyState>
        )}
      </MediaList>
    </ViewerWrapper>
  );
};

export default CollectionViewer;
