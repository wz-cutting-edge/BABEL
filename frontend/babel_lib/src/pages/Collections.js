import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useOptimisticUpdate } from '../hooks/useOptimisticUpdate';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Loading, ErrorMessage, Button } from '../components/common';
import { Plus, Trash2 } from 'lucide-react';

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
  transition: transform 0.2s;

  &:hover {
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

const Collections = () => {
  const { user } = useAuth();
  const [newCollectionName, setNewCollectionName] = useState('');
  const { updateDocument } = useOptimisticUpdate('collections');

  const { data: collections, loading, error } = useRealtimeUpdates(
    'collections',
    [{ field: 'userId', operator: '==', value: user?.uid }],
    { enabled: !!user }
  );

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      await addDoc(collection(db, 'collections'), {
        name: newCollectionName,
        userId: user.uid,
        createdAt: new Date(),
        itemCount: 0
      });
      setNewCollectionName('');
    } catch (err) {
      console.error('Error creating collection:', err);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteDoc(doc(db, 'collections', collectionId));
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
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
        <CollectionGrid>
          {collections.map((collection) => (
            <CollectionCard key={collection.id}>
              <DeleteButton onClick={() => handleDeleteCollection(collection.id)}>
                <Trash2 size={20} />
              </DeleteButton>
              <h3>{collection.name}</h3>
              <p>Items: {collection.itemCount || 0}</p>
            </CollectionCard>
          ))}
        </CollectionGrid>
      )}
    </CollectionsWrapper>
  );
};

export default Collections;
