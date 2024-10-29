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
  onSnapshot
} from 'firebase/firestore';
import { Loading, ErrorMessage, Button } from '../../components/common/common';
import { Plus, Trash2 } from 'lucide-react';
import CollectionMediaItem from '../../components/features/collections/CollectionMediaItem';

const CollectionsWrapper = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CollectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const CollectionCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    border: 2px solid ${props => props.theme.primary};
    transform: translateY(-2px);
  }
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

  ${CollectionCard}:hover & {
    opacity: 1;
  }
`;

const CreateCollectionForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.accent};
  border-radius: 5px;
  flex: 1;
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
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
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
    } catch (err) {
      console.error('Error deleting collection:', err);
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
