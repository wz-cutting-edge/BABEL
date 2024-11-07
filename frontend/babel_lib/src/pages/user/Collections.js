import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy, 
  serverTimestamp,
  writeBatch,
  increment,
  onSnapshot,
  arrayRemove,
  updateDoc
} from 'firebase/firestore';
import { Loading, ErrorMessage, Button } from '../../components/common/common';
import { Plus, Trash2 } from 'lucide-react';
import CollectionMediaItem from '../../components/features/collections/CollectionMediaItem';

const CollectionsWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 600;
    background: linear-gradient(135deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CollectionCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 2rem;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid ${props => props.theme.borderLight};
  box-shadow: ${props => props.theme.shadowSm};

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.text};
  }

  p {
    color: ${props => props.theme.textSecondary};
    font-size: 0.9rem;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.theme.primary}50;
    box-shadow: ${props => props.theme.shadowLg};
  }

  &.selected {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.primary}10;
    box-shadow: 0 0 0 2px ${props => props.theme.primary}30;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${props => props.theme.error}20;
  border: none;
  color: ${props => props.theme.error};
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.error};
    color: white;
  }

  ${CollectionCard}:hover & {
    opacity: 1;
  }
`;

const CreateCollectionForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadowMd};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.borderLight};
  border-radius: 8px;
  flex: 1;
  font-size: 1rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.primary}30;
  }
`;

const CollectionItems = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ItemCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 8px;
  position: relative;
`;

const CollectionMetadata = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
`;

const OfflineMessage = styled.div`
  background-color: ${props => props.theme.warning}20;
  color: ${props => props.theme.warning};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const CollectionContent = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadowMd};

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.text};
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const MediaItem = styled.div`
  background: ${props => props.theme.background};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ViewButton = styled(Button)`
  margin-top: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.textSecondary};
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
`;

const Collections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!user) return;

    const collectionRef = collection(db, 'collections');
    const q = query(
      collectionRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const collectionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCollections(collectionsData);
        setLoading(false);
      },
      (err) => {
        handleError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCreateCollection = async (e) => {
    e?.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = {
        name: newCollectionName,
        description: '',
        userId: user.uid,
        items: [],
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'collections'), newCollection);
      setNewCollectionName('');
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteDoc(doc(db, 'collections', collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError('Failed to delete collection');
    }
  };

  const handleCollectionClick = (collection) => {
    setSelectedCollection(selectedCollection?.id === collection.id ? null : collection);
  };

  const handleError = (err) => {
    if (err.message.includes('requires an index')) {
      setError('Database index is being built. Please try again in a few minutes.');
    } else {
      setError('Failed to load collections');
    }
    console.error('Error fetching collections:', err);
  };

  return (
    <CollectionsWrapper>
      <Header>
        <h2>My Collections</h2>
      </Header>

      <CreateCollectionForm onSubmit={handleCreateCollection}>
        <Input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="New collection name..."
        />
        <Button type="submit">
          <Plus size={20} />
          Create Collection
        </Button>
      </CreateCollectionForm>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <>
          <CollectionGrid>
            {collections.map(collection => (
              <CollectionCard
                key={collection.id}
                onClick={() => handleCollectionClick(collection)}
                className={selectedCollection?.id === collection.id ? 'selected' : ''}
              >
                <DeleteButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollection(collection.id);
                  }}
                >
                  <Trash2 size={20} />
                </DeleteButton>
                <h3>{collection.name}</h3>
                <p>{collection.items?.length || 0} items</p>
              </CollectionCard>
            ))}
          </CollectionGrid>

          {selectedCollection && (
            <CollectionContent>
              <h3>{selectedCollection.name} Contents</h3>
              <MediaGrid>
                {selectedCollection.items?.map(mediaId => (
                  <CollectionMediaItem 
                    key={mediaId} 
                    mediaId={mediaId}
                    collectionId={selectedCollection.id}
                    onDelete={(deletedMediaId) => {
                      setSelectedCollection(prev => ({
                        ...prev,
                        items: prev.items.filter(id => id !== deletedMediaId)
                      }));
                    }}
                  />
                ))}
              </MediaGrid>
            </CollectionContent>
          )}
        </>
      )}
    </CollectionsWrapper>
  );
};

export default Collections;
